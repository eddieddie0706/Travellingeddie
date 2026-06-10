import { useState } from 'react';
import { Plane } from 'lucide-react';

const SESSION_KEY = 'te_auth';
const PASSWORD = '138863';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
      setShaking(true);
      setInput('');
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-surface-dim)' }}>
      <div className="w-full max-w-xs text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <Plane size={22} className="text-primary" />
          <span className="font-display text-xl tracking-wide">Travelling Eddie</span>
        </div>

        {/* Lock icon */}
        <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: 'var(--shadow-card)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
            className="text-on-surface-secondary">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <p className="text-on-surface-secondary text-sm mb-6">Enter password to continue</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="••••••"
            autoFocus
            className={`w-full px-4 py-3 bg-white border rounded-xl text-center text-lg tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
              error ? 'border-danger bg-red-50/50' : 'border-border'
            } ${shaking ? 'animate-[shake_0.4s_ease]' : ''}`}
            style={shaking ? { animation: 'shake 0.4s ease' } : {}}
          />
          {error && <p className="text-danger text-xs">Incorrect password</p>}
          <button
            type="submit"
            disabled={!input}
            className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-40"
          >
            Enter
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
