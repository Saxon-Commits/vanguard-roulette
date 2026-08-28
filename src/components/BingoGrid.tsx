import { Check, Shuffle, Trophy } from 'lucide-react';
import { Button } from './ui/Button';

interface BingoGridProps {
  cells: string[];
  marked: boolean[];
  bingos: number[];
  hasBingo: boolean;
  onToggle: (index: number) => void;
  onShuffle: () => void;
}

export function BingoGrid({ cells, marked, bingos, hasBingo, onToggle, onShuffle }: BingoGridProps) {
  const winnerSet = new Set(bingos);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-vg-text">Raid Bingo</h3>
          {hasBingo && (
            <div className="flex items-center gap-1 text-vg-amber animate-float">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-bold">BINGO!</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Shuffle className="w-3.5 h-3.5" />}
          onClick={onShuffle}
        >
          Shuffle
        </Button>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-4 gap-1.5 px-0.5">
        {['B', 'I', 'N', 'G'].map((letter) => (
          <div key={letter} className="text-center text-xs font-bold text-vg-cyan/70 tracking-widest py-1">
            {letter}
          </div>
        ))}
      </div>

      {/* 4×4 Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {cells.map((cell, i) => {
          const isMarked = marked[i];
          const isWinner = winnerSet.has(i);

          return (
            <button
              key={i}
              onClick={() => onToggle(i)}
              className={[
                'relative aspect-square flex flex-col items-center justify-center p-1.5',
                'rounded-xl border text-center transition-all duration-200',
                'hover:scale-105 active:scale-95 cursor-pointer',
                'text-[10px] sm:text-xs leading-tight font-medium',
                isWinner
                  ? 'bg-vg-amber/20 border-vg-amber/50 text-vg-amber shadow-amber-glow'
                  : isMarked
                  ? 'bg-vg-cyan/15 border-vg-cyan/40 text-vg-cyan'
                  : 'bg-white/[0.03] border-vg-border text-vg-muted hover:border-vg-border/70 hover:bg-white/[0.05] hover:text-vg-text',
              ].join(' ')}
              title={cell}
            >
              {isMarked && (
                <div className={[
                  'absolute inset-0 flex items-center justify-center rounded-xl',
                  isWinner ? 'bg-vg-amber/10' : 'bg-vg-cyan/10',
                ].join(' ')}>
                  <Check className={[
                    'w-5 h-5 opacity-80',
                    isWinner ? 'text-vg-amber' : 'text-vg-cyan',
                  ].join(' ')} />
                </div>
              )}
              <span className={isMarked ? 'opacity-40 line-through' : ''}>
                {cell}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-vg-subtle pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-vg-cyan/20 border border-vg-cyan/40" />
          <span>Marked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-vg-amber/20 border border-vg-amber/40" />
          <span>Bingo!</span>
        </div>
        <span className="ml-auto text-vg-subtle/60">Tap to mark</span>
      </div>
    </div>
  );
}
