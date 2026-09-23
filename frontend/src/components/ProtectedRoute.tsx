import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) {
    return <div className="min-h-screen grid place-items-center text-muted text-sm">Checking your session…</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
