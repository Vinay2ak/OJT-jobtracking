import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { memo } from 'react';

function ProtectedRouteComponent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  // Allow disabling auth redirection during development or if not configured.
  const requireAuth = (() => {
    try {
      const v = localStorage.getItem('requireAuth');
      return v === 'true';
    } catch {
      return false;
    }
  })();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is not required, allow access even without a user.
  if (!user && requireAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const ProtectedRoute = memo(ProtectedRouteComponent);