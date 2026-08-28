import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { PlayerRoster } from './PlayerRoster';
import { SaboteurEngine } from './SaboteurEngine';
import { BingoGrid } from './BingoGrid';
import { VoteModal } from './VoteModal';
import { useRoomContext } from '../contexts/RoomContext';
import { useSaboteur } from '../hooks/useSaboteur';
import { useBingo } from '../hooks/useBingo';

export function GameRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const {
    playerId,
    room,
    players,
    gameState,
    presenceList,
    isConnected,
    error,
    joinRoom,
    leaveRoom,
    broadcastEvent,
    sendPrivateRole,
    updateGameState,
    updatePlayerVote,
    updateGamertag,
  } = useRoomContext();

  const [copiedCode, setCopiedCode] = useState(false);
  const [storedGamertag] = useState(() => localStorage.getItem('vr:lastGamertag'));
  const [askGamertag, setAskGamertag] = useState(() => !localStorage.getItem('vr:lastGamertag'));
  const [inputTag, setInputTag] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // If already have stored gamertag and not in room yet, reconnect automatically
  useEffect(() => {
    if (!room && code && storedGamertag) {
      joinRoom(code, storedGamertag).catch(() => navigate('/'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDirectJoin() {
    const trimmed = inputTag.trim();
    if (!trimmed || !code) return;
    setIsJoining(true);
    try {
      localStorage.setItem('vr:lastGamertag', trimmed);
      await joinRoom(code, trimmed);
      setAskGamertag(false);
    } catch (_) {
      // error handled by useRoom
    } finally {
      setIsJoining(false);
    }
  }

  const me = players.find((p) => p.id === playerId);
  const isHost = me?.is_host ?? false;

  const {
    myRole,
    isSpinning,
    revealedSaboteur,
    showVoteModal,
    setShowVoteModal,
    selectSaboteur,
    revealSaboteur,
    resetRound,
  } = useSaboteur({
    playerId,
    players,
    gameState,
    isHost,
    broadcastEvent,
    sendPrivateRole,
    updateGameState,
  });

  const { cells, marked, bingos, hasBingo, toggleCell, shuffleBoard } = useBingo(
    code ?? 'default',
    playerId
  );

  function copyCode() {
    navigator.clipboard.writeText(code ?? '').catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function handleLeave() {
    leaveRoom();
    navigate('/');
  }

  // Direct join prompt if opened via shared link without previous gamertag
  if (!room && askGamertag && !error) {
    return (
      <div className="min-h-screen bg-vg-bg flex items-center justify-center p-4">
        <GlassCard className="p-6 max-w-md w-full animate-scale-in border border-vg-cyan/30">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-vg-text mb-1">Join Fireteam</h2>
            <p className="text-xs text-vg-muted">
              Entering room <span className="font-mono text-vg-cyan font-bold tracking-widest">{code}</span>
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-vg-muted uppercase tracking-wider mb-2">
                Your Gamertag / Bungie Name
              </label>
              <input
                className="input-field"
                placeholder="e.g. Cayde#7777"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDirectJoin()}
                maxLength={32}
                autoFocus
              />
            </div>
            <Button
              variant="cyan"
              size="lg"
              loading={isJoining}
              onClick={handleDirectJoin}
              disabled={!inputTag.trim()}
              className="w-full"
            >
              Join Fireteam
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!room && !error) {
    return (
      <div className="min-h-screen bg-vg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-vg-muted">
          <div className="w-8 h-8 border-2 border-vg-cyan/30 border-t-vg-cyan rounded-full animate-spin" />
          <p className="text-sm">Connecting to fireteam…</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-vg-bg flex items-center justify-center p-4">
        <GlassCard className="p-6 text-center max-w-sm">
          <p className="text-vg-red mb-4">{error}</p>
          <Button variant="cyan" onClick={() => navigate('/')}>Back to Lobby</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-vg-border/50 bg-vg-bg/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeave}
              className="text-vg-muted hover:text-vg-text transition-colors p-1.5 rounded-lg hover:bg-white/[0.05]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-black text-lg neon-text-cyan">VR</span>
            <span className="text-vg-border">·</span>
            <span className="text-vg-muted text-sm hidden sm:block">Vanguard Roulette</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Room code */}
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vg-surface border border-vg-border hover:border-vg-cyan/40 transition-colors group"
            >
              <span className="font-mono font-bold text-vg-cyan text-sm tracking-widest">{code}</span>
              {copiedCode
                ? <Check className="w-3.5 h-3.5 text-vg-green" />
                : <Copy className="w-3.5 h-3.5 text-vg-muted group-hover:text-vg-cyan transition-colors" />
              }
            </button>

            {/* Connection status */}
            <Badge
              variant={isConnected ? 'green' : 'muted'}
              dot={isConnected}
            >
              {isConnected
                ? <><Wifi className="w-3 h-3" /><span className="hidden sm:inline">Live</span></>
                : <><WifiOff className="w-3 h-3" /><span className="hidden sm:inline">Offline</span></>
              }
            </Badge>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

        {/* ── Left Sidebar ─────────────────────────────────────── */}
        <aside className="flex flex-col gap-4">
          {/* Player Roster */}
          <GlassCard className="p-4">
            <PlayerRoster
              players={players}
              presenceList={presenceList}
              currentPlayerId={playerId}
              onUpdateGamertag={updateGamertag}
            />
          </GlassCard>

          {/* Saboteur Engine */}
          <GlassCard className="p-4">
            <SaboteurEngine
              isHost={isHost}
              players={players}
              gameState={gameState}
              myRole={myRole}
              isSpinning={isSpinning}
              onSelectSaboteur={selectSaboteur}
              onReveal={revealSaboteur}
              onReset={resetRound}
            />
          </GlassCard>
        </aside>

        {/* ── Main Content ──────────────────────────────────────── */}
        <main className="flex flex-col gap-6">
          <GlassCard className="p-5">
            <BingoGrid
              cells={cells}
              marked={marked}
              bingos={bingos}
              hasBingo={hasBingo}
              onToggle={toggleCell}
              onShuffle={shuffleBoard}
            />
          </GlassCard>

          {/* Info card */}
          <GlassCard className="p-4">
            <div className="flex flex-wrap gap-3 text-xs text-vg-muted">
              <span>🛡 Round <strong className="text-vg-text">{gameState?.round ?? 1}</strong></span>
              <span className="text-vg-border">·</span>
              <span>👥 <strong className="text-vg-text">{players.length}</strong>/6 Guardians</span>
              <span className="text-vg-border">·</span>
              <span>🎯 Phase: <strong className="text-vg-text capitalize">{gameState?.phase ?? 'idle'}</strong></span>
              {me && (
                <>
                  <span className="text-vg-border">·</span>
                  <span>👤 <strong className="text-vg-cyan">{me.gamertag}</strong>
                    {isHost && <span className="ml-1 text-vg-amber">👑</span>}
                  </span>
                </>
              )}
            </div>
          </GlassCard>
        </main>
      </div>

      {/* Vote Modal */}
      <VoteModal
        isOpen={showVoteModal}
        players={players}
        revealedSaboteur={revealedSaboteur}
        currentPlayerId={playerId}
        isHost={isHost}
        onVote={updatePlayerVote}
        onClose={() => setShowVoteModal(false)}
        onReset={resetRound}
      />
    </div>
  );
}
