import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/Easy Tech solution logo.png'; 
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await login();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
       
          <img 
            src={logo} 
            alt="Easy Tech Solution Logo" 
            className="h-12 w-12 rounded-xl object-contain bg-brand p-1" 
          />
          <div>
            <p className="text-white font-extrabold text-lg leading-tight">Easy Tech Solution</p>
            <p className="text-white/55 text-sm">Admin sign in</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-lift space-y-4">
          {error && <p className="text-sm font-semibold text-bad">{error}</p>}
          <button type="button" onClick={submit} disabled={busy} className="w-full py-3 rounded-xl bg-brand text-white font-bold disabled:opacity-60">
            {busy ? 'Signing in…' : 'Sign in with Google'}
          </button>
          <p className="text-xs text-muted">Only authorised Google admin accounts can open this ledger.</p>
        </div>
      </div>
    </div>
  );
}