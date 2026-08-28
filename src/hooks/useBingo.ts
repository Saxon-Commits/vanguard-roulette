import { useState, useEffect, useCallback } from 'react';
import { getShuffledBingoCells } from '../lib/bingoPool';
import { playBingoChime } from '../lib/audio';
import confetti from 'canvas-confetti';

const GRID_SIZE = 4;

interface BingoState {
  cells: string[];
  marked: boolean[];
  bingos: number[]; // flat indices of winning lines (for highlight)
}

function storageKey(roomCode: string, playerId: string): string {
  return `vr:bingo:${roomCode}:${playerId}`;
}

function checkBingos(marked: boolean[]): Set<number> {
  const winners = new Set<number>();
  const g = GRID_SIZE;

  // Rows
  for (let r = 0; r < g; r++) {
    const row = Array.from({ length: g }, (_, c) => r * g + c);
    if (row.every((i) => marked[i])) row.forEach((i) => winners.add(i));
  }
  // Columns
  for (let c = 0; c < g; c++) {
    const col = Array.from({ length: g }, (_, r) => r * g + c);
    if (col.every((i) => marked[i])) col.forEach((i) => winners.add(i));
  }
  // Diagonals
  const diag1 = Array.from({ length: g }, (_, i) => i * g + i);
  if (diag1.every((i) => marked[i])) diag1.forEach((i) => winners.add(i));
  const diag2 = Array.from({ length: g }, (_, i) => i * g + (g - 1 - i));
  if (diag2.every((i) => marked[i])) diag2.forEach((i) => winners.add(i));

  return winners;
}

export function useBingo(roomCode: string, playerId: string) {
  const key = storageKey(roomCode, playerId);

  const [state, setState] = useState<BingoState>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved) as BingoState;
    } catch (_) { /* ignore */ }
    return { cells: getShuffledBingoCells(), marked: Array(16).fill(false), bingos: [] };
  });

  const [hasBingo, setHasBingo] = useState(false);
  const [prevBingoCount, setPrevBingoCount] = useState(0);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  // Detect new bingos and celebrate
  useEffect(() => {
    const winners = checkBingos(state.marked);
    const winnerIndices = [...winners];

    // Recalculate full line count for celebration
    const lineCount = [
      ...Array.from({ length: GRID_SIZE }, (_, r) =>
        Array.from({ length: GRID_SIZE }, (_, c) => r * GRID_SIZE + c).every((i) => state.marked[i])
      ),
      ...Array.from({ length: GRID_SIZE }, (_, c) =>
        Array.from({ length: GRID_SIZE }, (_, r) => r * GRID_SIZE + c).every((i) => state.marked[i])
      ),
      Array.from({ length: GRID_SIZE }, (_, i) => i * GRID_SIZE + i).every((i) => state.marked[i]),
      Array.from({ length: GRID_SIZE }, (_, i) => i * GRID_SIZE + (GRID_SIZE - 1 - i)).every((i) => state.marked[i]),
    ].filter(Boolean).length;

    if (lineCount > prevBingoCount) {
      setHasBingo(true);
      playBingoChime();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00d4ff', '#f5a623', '#a855f7', '#39d353', '#ffffff'],
      });
      setPrevBingoCount(lineCount);
    }

    setState((prev) => ({ ...prev, bingos: winnerIndices }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.marked]);

  const toggleCell = useCallback((index: number) => {
    setState((prev) => {
      const marked = [...prev.marked];
      marked[index] = !marked[index];
      return { ...prev, marked };
    });
  }, []);

  const shuffleBoard = useCallback(() => {
    const anyMarked = state.marked.some(Boolean);
    if (anyMarked) {
      if (!confirm('Shuffle the board? Your marked cells will be cleared.')) return;
    }
    const newState: BingoState = {
      cells: getShuffledBingoCells(),
      marked: Array(16).fill(false),
      bingos: [],
    };
    setState(newState);
    setHasBingo(false);
    setPrevBingoCount(0);
  }, [state.marked]);

  return { cells: state.cells, marked: state.marked, bingos: state.bingos, hasBingo, toggleCell, shuffleBoard };
}
