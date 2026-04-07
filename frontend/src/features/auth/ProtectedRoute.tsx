import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  if (!isReady) {
    return (
      <div className="auth-boot" aria-busy="true" aria-live="polite">
        <span className="visually-hidden">Loading session</span>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
