import { useState } from 'react';
import { Plane, Lock } from 'lucide-react';

const SESSION_KEY = 'te_auth';
const PASSWORD = '138863';

export function useAuth() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Plane size={28} className="text-primary" />
          <span className="text-xl font-bold">Travelling Eddie</span>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4">
          <Lock size={22} className="text-primary" />
        </div>
        <p className="text-on-surface-secondary text-sm mb-6">Enter password to continue</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className={`w-full px-4 py-2.5 border rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${error ? 'border-danger bg-danger/5' : 'border-border'}`}
          />
          {error && <p className="text-danger text-sm">Incorrect password</p>}
          <button
            type="submit"
            disabled={!input}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-40"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
