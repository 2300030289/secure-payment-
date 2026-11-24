import { useState, type FormEvent } from 'react';
import { ShieldCheck, Lock, Mail, UserPlus, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setBusy(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 bg-grid">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-96 rounded-full bg-brand-700/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 ring-1 ring-brand-400/30">
            <ShieldCheck className="h-7 w-7 text-brand-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            Sentinel<span className="text-gradient">Pay</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Secure online payment monitoring — detect suspicious transactions in real time.
          </p>
        </div>

        <div className="w-full animate-fade-up rounded-2xl glass p-6 shadow-card sm:p-8">
          <div className="mb-6 flex rounded-xl bg-ink-900/60 p-1">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                mode === 'signin' ? 'bg-brand-500 text-ink-950' : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                mode === 'signup' ? 'bg-brand-500 text-ink-950' : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'signin' ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {mode === 'signin' ? 'Sign In to Dashboard' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            {mode === 'signin'
              ? "Don't have an account? Switch to Create Account above."
              : 'Already registered? Switch to Sign In above.'}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Protected by row-level security. Each account sees only its own transactions.
        </p>
      </div>
    </div>
  );
}
