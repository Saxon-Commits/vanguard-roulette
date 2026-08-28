export type RoomStatus = 'lobby' | 'active' | 'revealing';
export type GamePhase = 'idle' | 'spinning' | 'active' | 'voting' | 'revealed';
export type PlayerRole = 'saboteur' | 'innocent' | null;

export interface Room {
  id: string;
  code: string;
  host_player_id: string | null;
  status: RoomStatus;
  created_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  gamertag: string;
  is_host: boolean;
  vote_target_id: string | null;
  joined_at: string;
}

export interface GameState {
  id: string;
  room_id: string;
  round: number;
  saboteur_id: string | null;
  phase: GamePhase;
  revealed_at: string | null;
}

export interface PresenceUser {
  playerId: string;
  gamertag: string;
  isHost: boolean;
}

export interface RoomContextValue {
  playerId: string;
  room: Room | null;
  players: Player[];
  gameState: GameState | null;
  presenceList: PresenceUser[];
  isConnected: boolean;
  error: string | null;
  createRoom: (gamertag: string) => Promise<string>;
  joinRoom: (code: string, gamertag: string) => Promise<void>;
  leaveRoom: () => void;
  broadcastEvent: (event: string, payload?: Record<string, unknown>) => void;
  sendPrivateRole: (targetPlayerId: string, role: PlayerRole) => void;
  updateGameState: (update: Partial<GameState>) => Promise<void>;
  updatePlayerVote: (targetId: string) => Promise<void>;
  clearError: () => void;
}
