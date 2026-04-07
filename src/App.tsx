import { Routes, Route, Navigate } from 'react-router-dom';
import { Signup } from './Components/Signup';
import { Login } from './Components/Login';
import { GoogleSignIn } from './Components/GoogleSignIn';
import { Dashboard } from './Components/Dashboard';
import { Applications } from './Components/Application';
import { JobTrackingSystem } from './Components/JobTrackingSystem';
import { UpcomingInterviews } from './Components/UpcomingInterviews';
import { FollowUpRequired } from './Components/FollowUpRequired';
import { SuccessRate } from './Components/SuccessRate';
import { Analytics } from './Components/Analytics';
import { Settings } from './Components/Setting';
import { Layout } from './Components/Layout';
import { ProtectedRoute } from './Components/ProtectRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, isLoading } = useAuth();

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

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/google-signin" element={user ? <Navigate to="/dashboard" replace /> : <GoogleSignIn />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/tracking" element={<JobTrackingSystem />} />
        <Route path="/interviews" element={<UpcomingInterviews />} />
        <Route path="/followup" element={<FollowUpRequired />} />
        <Route path="/success" element={<SuccessRate />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/signup'} replace />} />
    </Routes>
  );
}

export default App;
