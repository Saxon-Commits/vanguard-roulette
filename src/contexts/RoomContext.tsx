import { createContext, useContext } from 'react';
import type { RoomContextValue } from '../types';

export const RoomContext = createContext<RoomContextValue | null>(null);

export function useRoomContext(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoomContext must be used within a RoomProvider');
  return ctx;
}
