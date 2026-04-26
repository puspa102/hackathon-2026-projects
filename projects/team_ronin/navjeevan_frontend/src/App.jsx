import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/citizen/LoginPage';
import RegisterPage from './pages/citizen/RegisterPage';
import ActivatePage from './pages/citizen/ActivatePage';
import ForgotPasswordPage from './pages/citizen/ForgotPasswordPage';
import HCLoginPage from './pages/healthcare/HCLoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardPage from './placeholders/DashboardPage';
import HCDashboardPage from './placeholders/HCDashboardPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/activate" element={<ActivatePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/healthcare/login" element={<HCLoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="user">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hc-dashboard"
        element={
          <ProtectedRoute role="healthcare">
            <HCDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
