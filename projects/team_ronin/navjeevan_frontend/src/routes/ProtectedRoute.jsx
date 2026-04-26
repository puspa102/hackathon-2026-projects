import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('vaxnepal_token');
  const storedRole = localStorage.getItem('vaxnepal_role');

  if (!token) {
    if (role === 'healthcare') {
      return <Navigate to="/healthcare/login" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  if (storedRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
