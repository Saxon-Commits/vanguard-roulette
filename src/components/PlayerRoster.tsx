import { useState } from 'react';
import { Crown, Wifi, WifiOff, Edit2, Check, X } from 'lucide-react';
import { Badge } from './ui/Badge';
import type { Player, PresenceUser } from '../types';

interface PlayerRosterProps {
  players: Player[];
  presenceList: PresenceUser[];
  currentPlayerId: string;
  onUpdateGamertag?: (newGamertag: string) => void;
}

export function PlayerRoster({ players, presenceList, currentPlayerId, onUpdateGamertag }: PlayerRosterProps) {
  const onlineIds = new Set(presenceList.map((p) => p.playerId));
  const [editingMe, setEditingMe] = useState(false);
  const [newGamertag, setNewGamertag] = useState('');

  function startEditing(currentName: string) {
    setNewGamertag(currentName);
    setEditingMe(true);
  }

  function saveEditing() {
    if (newGamertag.trim() && onUpdateGamertag) {
      onUpdateGamertag(newGamertag.trim());
    }
    setEditingMe(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-vg-muted">
          Fireteam
        </h3>
        <Badge variant="cyan" dot>
          {onlineIds.size}/{Math.max(players.length, 1)} online
        </Badge>
      </div>

      {players.length === 0 && (
        <p className="text-vg-subtle text-xs text-center py-4">Waiting for Guardians to join…</p>
      )}

      {players.map((player) => {
        const isOnline = onlineIds.has(player.id);
        const isMe = player.id === currentPlayerId;

        return (
          <div
            key={player.id}
            className={[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
              isMe ? 'bg-vg-cyan/[0.07] border border-vg-cyan/20' : 'bg-white/[0.03] border border-transparent',
            ].join(' ')}
          >
            {/* Online indicator */}
            <div className="relative flex-shrink-0">
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                isMe ? 'bg-vg-cyan/20 text-vg-cyan' : 'bg-white/[0.07] text-vg-muted',
              ].join(' ')}>
                {player.gamertag.charAt(0).toUpperCase()}
              </div>
              <span className={[
                'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-vg-surface',
                isOnline ? 'bg-vg-green' : 'bg-vg-subtle',
              ].join(' ')} />
            </div>

            <div className="flex-1 min-w-0">
              {isMe && editingMe ? (
                <div className="flex items-center gap-1.5">
                  <input
                    className="bg-vg-surface border border-vg-cyan/50 rounded-lg px-2 py-0.5 text-xs text-vg-text w-full focus:outline-none"
                    value={newGamertag}
                    onChange={(e) => setNewGamertag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                    maxLength={32}
                    autoFocus
                  />
                  <button onClick={saveEditing} className="text-vg-green p-1 hover:brightness-125">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingMe(false)} className="text-vg-muted p-1 hover:text-vg-text">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className={[
                    'text-sm font-medium truncate',
                    isMe ? 'text-vg-cyan' : 'text-vg-text',
                  ].join(' ')}>
                    {player.gamertag}
                  </span>
                  {isMe && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-vg-muted">(you)</span>
                      <button
                        onClick={() => startEditing(player.gamertag)}
                        className="text-vg-subtle hover:text-vg-cyan transition-colors p-0.5"
                        title="Change Gamertag"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {player.is_host && (
                <span title="Host">
                  <Crown className="w-3.5 h-3.5 text-vg-amber" />
                </span>
              )}
              {isOnline
                ? <Wifi className="w-3 h-3 text-vg-green/60" />
                : <WifiOff className="w-3 h-3 text-vg-subtle" />
              }
            </div>
          </div>
        );
      })}

      {players.length < 6 && (
        <div className="mt-1 flex flex-col gap-1">
          {Array.from({ length: 6 - players.length }).map((_, i) => (
            <div
              key={i}
              className="h-[46px] rounded-xl border border-dashed border-vg-border/50 flex items-center justify-center"
            >
              <span className="text-xs text-vg-subtle">Empty slot</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
