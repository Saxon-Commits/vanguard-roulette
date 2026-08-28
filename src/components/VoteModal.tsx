import { useState } from 'react';
import { X, ThumbsUp, Crown, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import type { Player } from '../types';

interface VoteModalProps {
  isOpen: boolean;
  players: Player[];
  revealedSaboteur: Player | null;
  currentPlayerId: string;
  isHost: boolean;
  onVote: (targetId: string) => void;
  onClose: () => void;
  onReset: () => void;
}

export function VoteModal({
  isOpen,
  players,
  revealedSaboteur,
  currentPlayerId,
  isHost,
  onVote,
  onClose,
  onReset,
}: VoteModalProps) {
  const [myVote, setMyVote] = useState<string | null>(null);

  if (!isOpen) return null;

  // Tally votes
  const voteTally: Record<string, number> = {};
  players.forEach((p) => {
    if (p.vote_target_id) {
      voteTally[p.vote_target_id] = (voteTally[p.vote_target_id] ?? 0) + 1;
    }
  });

  function handleVote(targetId: string) {
    setMyVote(targetId);
    onVote(targetId);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(14,17,23,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <GlassCard className="w-full max-w-md p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-vg-text">⚖️ Tribunal</h2>
            <p className="text-vg-muted text-sm mt-0.5">Who do you suspect?</p>
          </div>
          <button
            onClick={onClose}
            className="text-vg-muted hover:text-vg-text transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Revealed saboteur (if in revealed phase) */}
        {revealedSaboteur && (
          <div className="mb-5 p-4 rounded-xl bg-vg-red/10 border border-vg-red/30 animate-pulse-red">
            <p className="text-vg-muted text-xs mb-1 uppercase tracking-wider">The Saboteur Was</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔴</span>
              <span className="text-vg-red font-bold text-lg">{revealedSaboteur.gamertag}</span>
              {revealedSaboteur.id === currentPlayerId && (
                <span className="text-xs text-vg-muted">(that's you!)</span>
              )}
            </div>
          </div>
        )}

        {/* Player vote list */}
        <div className="flex flex-col gap-2 mb-5">
          {players.map((player) => {
            const voteCount = voteTally[player.id] ?? 0;
            const isMyVoteTarget = myVote === player.id;
            const isActualSaboteur = revealedSaboteur?.id === player.id;
            const isMe = player.id === currentPlayerId;

            return (
              <button
                key={player.id}
                onClick={() => !myVote && !isMe && handleVote(player.id)}
                disabled={!!myVote || isMe}
                className={[
                  'flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all duration-200',
                  isMyVoteTarget
                    ? 'bg-vg-amber/15 border-vg-amber/40'
                    : isActualSaboteur && revealedSaboteur
                    ? 'bg-vg-red/10 border-vg-red/30'
                    : 'bg-white/[0.03] border-vg-border hover:border-vg-amber/30 hover:bg-white/[0.06]',
                  myVote || isMe ? 'cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/[0.07] flex items-center justify-center text-sm font-bold text-vg-muted">
                    {player.gamertag.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className={[
                      'font-medium text-sm',
                      isActualSaboteur && revealedSaboteur ? 'text-vg-red' : 'text-vg-text',
                    ].join(' ')}>
                      {player.gamertag}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {player.is_host && <Crown className="w-3 h-3 text-vg-amber" />}
                      {isMe && <span className="text-vg-muted text-xs">you</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {voteCount > 0 && (
                    <span className="text-xs text-vg-muted bg-white/[0.07] px-2 py-0.5 rounded-full">
                      {voteCount} vote{voteCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {isMyVoteTarget && <ThumbsUp className="w-4 h-4 text-vg-amber" />}
                </div>
              </button>
            );
          })}
        </div>

        {myVote && !revealedSaboteur && (
          <p className="text-center text-vg-muted text-xs mb-4">
            ✓ Vote cast. Waiting for the Host to reveal…
          </p>
        )}

        {isHost && (
          <Button variant="ghost" size="sm" onClick={onReset} className="w-full">
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Round
          </Button>
        )}
      </GlassCard>
    </div>
  );
}
