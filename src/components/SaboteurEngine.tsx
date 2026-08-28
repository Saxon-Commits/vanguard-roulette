import { Shield, Skull, Eye, RefreshCw, Swords, Users } from 'lucide-react';
import { RouletteSpinner } from './RouletteSpinner';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { Badge } from './ui/Badge';
import type { Player, GameState, PlayerRole } from '../types';

interface SaboteurEngineProps {
  isHost: boolean;
  players: Player[];
  gameState: GameState | null;
  myRole: PlayerRole;
  isSpinning: boolean;
  onSelectSaboteur: () => void;
  onReveal: () => void;
  onReset: () => void;
}

export function SaboteurEngine({
  isHost,
  players,
  gameState,
  myRole,
  isSpinning,
  onSelectSaboteur,
  onReveal,
  onReset,
}: SaboteurEngineProps) {
  const phase = gameState?.phase ?? 'idle';
  const round = gameState?.round ?? 1;
  const hasEnoughPlayers = players.length >= 2;

  return (
    <div className="flex flex-col gap-4">
      {/* Round badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-vg-muted">
          Saboteur Engine
        </h3>
        <Badge variant="amber">Round {round}</Badge>
      </div>

      {/* Spinner (shown during spin phase for all clients) */}
      {(phase === 'spinning' || isSpinning) && (
        <GlassCard className="p-6 animate-scale-in">
          <RouletteSpinner players={players} isSpinning={isSpinning || phase === 'spinning'} />
        </GlassCard>
      )}

      {/* Role card (shown after spin) */}
      {myRole && phase !== 'idle' && !isSpinning && (
        <div className={[
          'p-5 rounded-2xl border animate-scale-in',
          myRole === 'saboteur'
            ? 'bg-vg-red/10 border-vg-red/30 animate-pulse-red'
            : 'bg-vg-cyan/[0.06] border-vg-cyan/25 animate-pulse-cyan',
        ].join(' ')}>
          <div className="flex items-start gap-3">
            <div className={[
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              myRole === 'saboteur' ? 'bg-vg-red/20' : 'bg-vg-cyan/15',
            ].join(' ')}>
              {myRole === 'saboteur'
                ? <Skull className="w-5 h-5 text-vg-red" />
                : <Shield className="w-5 h-5 text-vg-cyan" />
              }
            </div>
            <div>
              <p className={[
                'font-bold text-base mb-1',
                myRole === 'saboteur' ? 'text-vg-red' : 'text-vg-cyan',
              ].join(' ')}>
                {myRole === 'saboteur' ? '🔴 YOU ARE THE SABOTEUR' : '🟢 YOU ARE INNOCENT'}
              </p>
              <p className="text-vg-muted text-xs leading-relaxed">
                {myRole === 'saboteur'
                  ? 'Wipe the fireteam with plausible deniability. Act natural.'
                  : 'Complete the encounter. Watch your teammates closely for suspicious behaviour.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Host controls */}
      {isHost && (
        <div className="flex flex-col gap-2.5">
          {phase === 'idle' && (
            <Button
              variant="amber"
              size="md"
              icon={<Swords className="w-4 h-4" />}
              onClick={onSelectSaboteur}
              disabled={!hasEnoughPlayers || isSpinning}
              className="w-full"
            >
              {!hasEnoughPlayers ? 'Need 2+ Guardians' : 'Select Saboteur for Encounter'}
            </Button>
          )}

          {(phase === 'active') && !isSpinning && (
            <Button
              variant="red"
              size="md"
              icon={<Eye className="w-4 h-4" />}
              onClick={onReveal}
              className="w-full"
            >
              Reveal / Open Voting
            </Button>
          )}

          {(phase === 'voting' || phase === 'revealed') && (
            <Button
              variant="ghost"
              size="md"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={onReset}
              className="w-full"
            >
              Reset Round
            </Button>
          )}

          {isSpinning && (
            <div className="text-center py-2">
              <p className="text-vg-amber text-xs animate-pulse">⚙ Selecting saboteur…</p>
            </div>
          )}
        </div>
      )}

      {/* Non-host status */}
      {!isHost && phase === 'idle' && (
        <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-white/[0.03] border border-dashed border-vg-border">
          <Users className="w-4 h-4 text-vg-muted" />
          <span className="text-vg-muted text-xs">Waiting for the Host to start the encounter…</span>
        </div>
      )}
    </div>
  );
}
