import { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { getCustomBingoPool, saveCustomBingoPool, resetCustomBingoPool, BINGO_POOL } from '../lib/bingoPool';

interface BingoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPoolSaved: (newPool: string[]) => void;
}

export function BingoEditorModal({ isOpen, onClose, onPoolSaved }: BingoEditorModalProps) {
  const [pool, setPool] = useState<string[]>(() => getCustomBingoPool());
  const [newCardText, setNewCardText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const filtered = pool.filter((item) =>
    item.toLowerCase().includes(searchFilter.toLowerCase())
  );

  function handleAdd() {
    const trimmed = newCardText.trim();
    if (!trimmed) return;
    if (pool.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      alert('This tile already exists in your pool!');
      return;
    }
    const updated = [trimmed, ...pool];
    setPool(updated);
    setNewCardText('');
  }

  function handleDelete(indexInFiltered: number) {
    const targetItem = filtered[indexInFiltered];
    const updated = pool.filter((item) => item !== targetItem);
    if (updated.length < 16) {
      alert('You need at least 16 cards in your pool to generate a 4x4 Bingo board!');
      return;
    }
    setPool(updated);
  }

  function handleResetDefault() {
    if (confirm('Reset your bingo pool back to the 60+ Destiny 2 preset tropes?')) {
      const def = resetCustomBingoPool();
      setPool(def);
    }
  }

  function handleSaveAndApply() {
    if (pool.length < 16) {
      alert('You need at least 16 cards in your pool!');
      return;
    }
    saveCustomBingoPool(pool);
    onPoolSaved(pool);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(14,17,23,0.88)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <GlassCard className="w-full max-w-xl max-h-[88vh] flex flex-col p-6 animate-scale-in border border-vg-cyan/20">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-vg-border/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-vg-cyan" />
              <h2 className="text-lg font-bold text-vg-text">Customize Bingo Pool</h2>
            </div>
            <p className="text-vg-muted text-xs mt-1">
              Add your own inside jokes, custom mechanics fails, and clan tropes ({pool.length} total)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-vg-muted hover:text-vg-text transition-colors p-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add custom item */}
        <div className="pt-4 pb-3 flex flex-col gap-2">
          <label className="text-xs font-semibold text-vg-muted uppercase tracking-wider">
            Add New Bingo Tile
          </label>
          <div className="flex gap-2">
            <input
              className="input-field flex-1 text-sm"
              placeholder="e.g. Someone shoots a rocket at a wall during DPS"
              value={newCardText}
              onChange={(e) => setNewCardText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              maxLength={80}
            />
            <Button
              variant="cyan"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAdd}
              disabled={!newCardText.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="pb-3">
          <input
            className="input-field text-xs py-2"
            placeholder="Search existing pool..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        {/* List of cards */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-[220px] max-h-[340px]">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-vg-border/60 hover:border-vg-cyan/30 transition-colors group"
            >
              <span className="text-xs font-medium text-vg-text leading-snug break-words flex-1">
                {item}
              </span>
              <button
                onClick={() => handleDelete(idx)}
                className="text-vg-subtle hover:text-vg-red p-1 rounded-lg transition-colors flex-shrink-0"
                title="Delete tile"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-vg-subtle text-xs text-center py-8">
              No bingo tiles match your search.
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 mt-2 border-t border-vg-border/50 flex items-center justify-between gap-3 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetDefault}
          >
            Reset Default Pool ({BINGO_POOL.length})
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="cyan"
              size="sm"
              icon={savedSuccess ? <Check className="w-4 h-4" /> : undefined}
              onClick={handleSaveAndApply}
            >
              {savedSuccess ? 'Saved!' : 'Save & Shuffle Board'}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
