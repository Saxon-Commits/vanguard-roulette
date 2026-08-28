import { useEffect, useState, useRef } from 'react';
import type { Player } from '../types';

interface RouletteSpinnerProps {
  players: Player[];
  isSpinning: boolean;
}

// Duplicate player list for seamless loop effect
function buildSlotItems(players: Player[]): string[] {
  const names = players.map((p) => p.gamertag);
  // Create a long looping array for the slot animation
  const repeated = Array.from({ length: 12 }, () => names).flat();
  return repeated;
}

export function RouletteSpinner({ players, isSpinning }: RouletteSpinnerProps) {
  const items = buildSlotItems(players.length > 0 ? players : [{ gamertag: '???', id: '', room_id: '', is_host: false, vote_target_id: null, joined_at: '' }]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayIdx, setDisplayIdx] = useState(0);

  // Fast cycling animation
  useEffect(() => {
    if (!isSpinning) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % items.length;
      setDisplayIdx(idx);
    }, 80);
    return () => clearInterval(interval);
  }, [isSpinning, items.length]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Slot machine window */}
      <div className="relative w-64 rounded-2xl overflow-hidden border border-vg-border bg-vg-bg">
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />

        {/* Gradient masks */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-vg-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-vg-bg to-transparent z-10 pointer-events-none" />

        {/* Center highlight */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 border-y border-vg-cyan/40 bg-vg-cyan/5 z-10 pointer-events-none" />

        <div ref={containerRef} className="py-4">
          {/* Show a sliding window of items */}
          {items.slice(Math.max(0, displayIdx - 2), displayIdx + 3).map((name, i) => {
            const isCurrent = i === 2;
            return (
              <div
                key={`${name}-${displayIdx}-${i}`}
                className={[
                  'h-12 flex items-center justify-center text-sm font-semibold transition-all px-4 truncate',
                  isCurrent
                    ? 'text-vg-cyan scale-105 text-base'
                    : 'text-vg-muted scale-95 opacity-60',
                  isSpinning && isCurrent ? 'animate-pulse' : '',
                ].join(' ')}
              >
                {name}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isSpinning ? (
          <>
            <div className="w-2 h-2 bg-vg-cyan rounded-full animate-ping" />
            <span className="text-vg-cyan text-sm font-medium tracking-wide animate-pulse">
              Selecting Guardian…
            </span>
          </>
        ) : (
          <span className="text-vg-muted text-sm">Awaiting selection</span>
        )}
      </div>
    </div>
  );
}
