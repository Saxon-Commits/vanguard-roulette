import { useState } from 'react';
import { Plus, LogIn, Zap, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { useRoomContext } from '../contexts/RoomContext';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';

type Tab = 'create' | 'join';

export function LobbyScreen() {
  const navigate = useNavigate();
  const { createRoom, joinRoom, error, clearError } = useRoomContext();

  const [tab, setTab] = useState<Tab>('create');
  const [gamertag, setGamertag] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!gamertag.trim()) return;
    setLoading(true);
    clearError();
    try {
      const code = await createRoom(gamertag.trim());
      localStorage.setItem('vr:lastGamertag', gamertag.trim());
      navigate(`/room/${code}`);
    } catch (_) {
      // error state set by hook
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!gamertag.trim() || !roomCode.trim()) return;
    setLoading(true);
    clearError();
    try {
      await joinRoom(roomCode.trim(), gamertag.trim());
      localStorage.setItem('vr:lastGamertag', gamertag.trim());
      navigate(`/room/${roomCode.toUpperCase().trim()}`);
    } catch (_) {
      // error state set by hook
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.06) 0%, #0e1117 60%)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" stroke=\"%2330363d\" stroke-width=\"0.5\"%3E%3Cpath d=\"M0 0h50v50H0z\" fill=\"none\"/%3E%3Cpath d=\"M0 50L50 0M0 0l50 50\"/%3E%3C/g%3E%3C/svg%3E')",
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Zap className="w-7 h-7 text-vg-cyan animate-float" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            <span className="neon-text-cyan">Vanguard</span>
            <span className="text-vg-text"> Roulette</span>
          </h1>
          <p className="text-vg-muted text-sm">
            Destiny 2 Raid Companion · Saboteur Engine · Raid Bingo
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-xl bg-vg-amber/10 border border-vg-amber/30 text-xs text-vg-text">
            <div className="flex items-center gap-2 text-vg-amber font-semibold mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>Supabase Credentials Required</span>
            </div>
            <p className="text-vg-muted leading-relaxed">
              Create a <code className="text-vg-cyan">.env</code> file with <code className="text-vg-cyan">VITE_SUPABASE_URL</code> and <code className="text-vg-cyan">VITE_SUPABASE_ANON_KEY</code> to enable realtime multiplayer. Run <code className="text-vg-cyan">supabase/schema.sql</code> in your Supabase SQL editor.
            </p>
          </div>
        )}

        {/* Main Card */}
        <GlassCard className="p-6">
          {/* Tabs */}
          <div className="flex bg-vg-bg rounded-xl p-1 mb-6 gap-1">
            {(['create', 'join'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); clearError(); }}
                className={[
                  'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                  tab === t
                    ? 'bg-vg-surface text-vg-text shadow-sm'
                    : 'text-vg-muted hover:text-vg-text',
                ].join(' ')}
              >
                {t === 'create' ? '⚡ Create Room' : '🚪 Join Room'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {/* Gamertag input (shared) */}
            <div>
              <label className="block text-xs font-medium text-vg-muted mb-2 uppercase tracking-wider">
                Your Gamertag
              </label>
              <input
                className="input-field"
                placeholder="e.g. Ikora#1234"
                value={gamertag}
                onChange={(e) => setGamertag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
                maxLength={32}
                autoFocus
              />
            </div>

            {/* Room code input (join only) */}
            {tab === 'join' && (
              <div>
                <label className="block text-xs font-medium text-vg-muted mb-2 uppercase tracking-wider">
                  Room Code
                </label>
                <input
                  className="input-field font-mono text-lg tracking-[0.2em] uppercase"
                  placeholder="ABCD12"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  maxLength={6}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-vg-red text-sm bg-vg-red/10 border border-vg-red/25 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              variant="cyan"
              size="lg"
              loading={loading}
              icon={tab === 'create' ? <Plus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              onClick={tab === 'create' ? handleCreate : handleJoin}
              disabled={!gamertag.trim() || (tab === 'join' && roomCode.length < 6)}
              className="w-full mt-1"
            >
              {tab === 'create' ? 'Create Fireteam' : 'Join Fireteam'}
            </Button>
          </div>
        </GlassCard>

        <p className="text-center text-vg-subtle text-xs mt-6">
          Up to 6 Guardians per fireteam · No account required
        </p>
      </div>
    </div>
  );
}
