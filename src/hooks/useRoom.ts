import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Room, Player, GameState, PresenceUser, PlayerRole } from '../types';

const PLAYER_ID_KEY = 'vr:playerId';

export function getOrCreatePlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

function makeRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export function useRoom() {
  const playerId = getOrCreatePlayerId();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [presenceList, setPresenceList] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const privateRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchPlayers = useCallback(async (roomId: string) => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at');
    if (data) setPlayers(data);
  }, []);

  const fetchGameState = useCallback(async (roomId: string) => {
    const { data } = await supabase
      .from('game_state')
      .select('*')
      .eq('room_id', roomId)
      .maybeSingle();
    if (data) setGameState(data);
  }, []);

  const subscribeToRoom = useCallback(
    (code: string, currentRoom: Room, myGamertag: string, myIsHost: boolean) => {
      // Clean up previous subscriptions
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (privateRef.current) supabase.removeChannel(privateRef.current);

      // ── Main game channel ──────────────────────────────────────
      const ch = supabase.channel(`room:${code}`, {
        config: { presence: { key: playerId } },
      });

      ch.on('presence', { event: 'sync' }, () => {
          const raw = ch.presenceState<PresenceUser>();
          const list = Object.values(raw).flatMap((arr) => arr);
          setPresenceList(list);
        })
        .on('broadcast', { event: '*' }, ({ event, payload }) => {
          window.dispatchEvent(
            new CustomEvent('vr:broadcast', { detail: { event, payload } })
          );
        })
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${currentRoom.id}` },
          () => fetchPlayers(currentRoom.id)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${currentRoom.id}` },
          ({ new: rec }) => setGameState(rec as GameState)
        )
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            await ch.track({ playerId, gamertag: myGamertag, isHost: myIsHost } satisfies PresenceUser);
          }
        });

      channelRef.current = ch;

      // ── Private role channel ───────────────────────────────────
      const priv = supabase.channel(`vr-private:${playerId}`);
      priv.on('broadcast', { event: 'ROLE_ASSIGNED' }, ({ payload }) => {
        window.dispatchEvent(new CustomEvent('vr:role', { detail: payload }));
      }).subscribe();

      privateRef.current = priv;
    },
    [playerId, fetchPlayers]
  );

  const createRoom = useCallback(
    async (gamertag: string): Promise<string> => {
      setError(null);

      // Unique room code
      let code = makeRoomCode();
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.from('rooms').select('id').eq('code', code).maybeSingle();
        if (!data) break;
        code = makeRoomCode();
      }

      const { data: roomData, error: rErr } = await supabase
        .from('rooms')
        .insert({ code, host_player_id: playerId, status: 'lobby' })
        .select()
        .single();
      if (rErr || !roomData) { 
        console.error('Room create error:', rErr);
        setError(rErr?.message ?? 'Failed to create room.'); 
        throw rErr; 
      }

      const { data: playerData, error: pErr } = await supabase
        .from('players')
        .insert({ id: playerId, room_id: roomData.id, gamertag, is_host: true })
        .select()
        .single();
      if (pErr || !playerData) { 
        console.error('Player insert error:', pErr);
        setError(pErr?.message ?? 'Failed to add you to the room.'); 
        throw pErr; 
      }

      await supabase.from('game_state').insert({ room_id: roomData.id, round: 1, phase: 'idle' });

      setRoom(roomData);
      setPlayers([playerData]);
      subscribeToRoom(code, roomData, gamertag, true);
      return code;
    },
    [playerId, subscribeToRoom]
  );

  const joinRoom = useCallback(
    async (code: string, gamertag: string): Promise<void> => {
      setError(null);
      const upper = code.toUpperCase().trim();

      const { data: roomData, error: rErr } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', upper)
        .maybeSingle();
      if (rErr || !roomData) { setError('Room not found. Check the code and try again.'); throw new Error('Room not found'); }

      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', roomData.id);
      if (existing && existing.length >= 6) {
        setError('Room is full — max 6 Guardians per fireteam.');
        throw new Error('Room full');
      }

      // Insert or ignore if already present
      const { data: myRecord } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .eq('room_id', roomData.id)
        .maybeSingle();

      if (!myRecord) {
        const { error: pErr } = await supabase
          .from('players')
          .insert({ id: playerId, room_id: roomData.id, gamertag, is_host: false });
        if (pErr) { setError('Failed to join room.'); throw pErr; }
      }

      await fetchPlayers(roomData.id);
      await fetchGameState(roomData.id);
      setRoom(roomData);
      subscribeToRoom(upper, roomData, myRecord?.gamertag ?? gamertag, myRecord?.is_host ?? false);
    },
    [playerId, fetchPlayers, fetchGameState, subscribeToRoom]
  );

  const leaveRoom = useCallback(() => {
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    if (privateRef.current) { supabase.removeChannel(privateRef.current); privateRef.current = null; }
    setRoom(null); setPlayers([]); setGameState(null); setPresenceList([]); setIsConnected(false);
  }, []);

  const broadcastEvent = useCallback((event: string, payload?: Record<string, unknown>) => {
    channelRef.current?.send({ type: 'broadcast', event, payload: payload ?? {} });
  }, []);

  // Send a role privately to one player via their personal channel
  const sendPrivateRole = useCallback((targetPlayerId: string, role: PlayerRole) => {
    if (targetPlayerId === playerId) {
      window.dispatchEvent(new CustomEvent('vr:role', { detail: { role } }));
      return;
    }
    const ch = supabase.channel(`vr-private:${targetPlayerId}`);
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        ch.send({
          type: 'broadcast',
          event: 'ROLE_ASSIGNED',
          payload: { role },
        });
        setTimeout(() => {
          supabase.removeChannel(ch);
        }, 3000);
      }
    });
  }, [playerId]);

  const updateGameState = useCallback(
    async (update: Partial<GameState>) => {
      if (!room) return;
      await supabase.from('game_state').update(update).eq('room_id', room.id);
    },
    [room]
  );

  const updatePlayerVote = useCallback(
    async (targetId: string) => {
      await supabase.from('players').update({ vote_target_id: targetId }).eq('id', playerId);
    },
    [playerId]
  );

  const clearError = useCallback(() => setError(null), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (privateRef.current) supabase.removeChannel(privateRef.current);
    };
  }, []);

  return {
    playerId,
    room,
    players,
    gameState,
    presenceList,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastEvent,
    sendPrivateRole,
    updateGameState,
    updatePlayerVote,
    clearError,
  };
}
