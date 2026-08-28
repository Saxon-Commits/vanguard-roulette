import { useState, useEffect, useCallback } from 'react';
import type { Player, PlayerRole, GameState } from '../types';
import { playSpinStart, playRevealSting } from '../lib/audio';

interface UseSaboteurOptions {
  playerId: string;
  players: Player[];
  gameState: GameState | null;
  isHost: boolean;
  broadcastEvent: (event: string, payload?: Record<string, unknown>) => void;
  sendPrivateRole: (targetPlayerId: string, role: PlayerRole) => void;
  updateGameState: (update: Partial<GameState>) => Promise<void>;
}

export function useSaboteur({
  playerId,
  players,
  gameState,
  isHost,
  broadcastEvent,
  sendPrivateRole,
  updateGameState,
}: UseSaboteurOptions) {
  const [myRole, setMyRole] = useState<PlayerRole>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [revealedSaboteur, setRevealedSaboteur] = useState<Player | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);

  // Listen for private role assignment
  useEffect(() => {
    const handler = (e: Event) => {
      const { role } = (e as CustomEvent<{ role: PlayerRole }>).detail;
      setMyRole(role);
    };
    window.addEventListener('vr:role', handler);
    return () => window.removeEventListener('vr:role', handler);
  }, []);

  // Listen for broadcast events from other clients
  useEffect(() => {
    const handler = (e: Event) => {
      const { event, payload } = (e as CustomEvent<{ event: string; payload: Record<string, unknown> }>).detail;

      if (event === 'SPIN_START') {
        setIsSpinning(true);
        playSpinStart();
      } else if (event === 'SPIN_END') {
        setIsSpinning(false);
      } else if (event === 'REVEAL') {
        const sabId = payload.saboteurId as string;
        const found = players.find((p) => p.id === sabId) ?? null;
        setRevealedSaboteur(found);
        setShowVoteModal(true);
        playRevealSting();
      } else if (event === 'ROUND_RESET') {
        setMyRole(null);
        setIsSpinning(false);
        setRevealedSaboteur(null);
        setShowVoteModal(false);
      }
    };
    window.addEventListener('vr:broadcast', handler);
    return () => window.removeEventListener('vr:broadcast', handler);
  }, [players]);

  // Host: pick saboteur and spin
  const selectSaboteur = useCallback(async () => {
    if (!isHost || players.length < 2) return;

    setIsSpinning(true);
    broadcastEvent('SPIN_START');
    playSpinStart();

    // Update phase in DB
    await updateGameState({ phase: 'spinning' });

    // Wait for the spin animation (3.5s)
    await new Promise((res) => setTimeout(res, 3500));

    // Pick a random player as saboteur
    const saboteur = players[Math.floor(Math.random() * players.length)];
    const myAssignedRole: PlayerRole = playerId === saboteur.id ? 'saboteur' : 'innocent';
    setMyRole(myAssignedRole);

    // Send private roles to each player
    players.forEach((p) => {
      sendPrivateRole(p.id, p.id === saboteur.id ? 'saboteur' : 'innocent');
    });

    // Store saboteur_id in DB (hidden until reveal)
    await updateGameState({ phase: 'active', saboteur_id: saboteur.id });

    setIsSpinning(false);
    broadcastEvent('SPIN_END');
  }, [isHost, players, playerId, broadcastEvent, sendPrivateRole, updateGameState]);

  // Host: reveal the saboteur
  const revealSaboteur = useCallback(async () => {
    if (!isHost || !gameState?.saboteur_id) return;

    const saboteur = players.find((p) => p.id === gameState.saboteur_id);
    if (!saboteur) return;

    await updateGameState({ phase: 'voting', revealed_at: new Date().toISOString() });
    broadcastEvent('REVEAL', { saboteurId: saboteur.id, gamertag: saboteur.gamertag });

    setRevealedSaboteur(saboteur);
    setShowVoteModal(true);
    playRevealSting();
  }, [isHost, gameState, players, broadcastEvent, updateGameState]);

  // Host: reset round
  const resetRound = useCallback(async () => {
    if (!isHost) return;
    const nextRound = (gameState?.round ?? 1) + 1;
    await updateGameState({
      phase: 'idle',
      saboteur_id: null,
      round: nextRound,
      revealed_at: null,
    });
    broadcastEvent('ROUND_RESET');
    setMyRole(null);
    setIsSpinning(false);
    setRevealedSaboteur(null);
    setShowVoteModal(false);
  }, [isHost, gameState, broadcastEvent, updateGameState]);

  return {
    myRole,
    isSpinning,
    revealedSaboteur,
    showVoteModal,
    setShowVoteModal,
    selectSaboteur,
    revealSaboteur,
    resetRound,
  };
}
