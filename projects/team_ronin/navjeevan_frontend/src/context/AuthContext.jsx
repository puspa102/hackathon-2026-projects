import { createContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialAuthState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
};

const getStoredAuth = () => {
  const token = localStorage.getItem('vaxnepal_token');
  const role = localStorage.getItem('vaxnepal_role');
  const userRaw = localStorage.getItem('vaxnepal_user');

  if (!token || !role) {
    return initialAuthState;
  }

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch (_error) {
      user = null;
    }
  }

  return {
    user,
    token,
    role,
    isAuthenticated: true,
  };
};

export const AuthContext = createContext({
  ...initialAuthState,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState(getStoredAuth);

  const login = (token, role, userData) => {
    localStorage.setItem('vaxnepal_token', token);
    localStorage.setItem('vaxnepal_role', role);
    localStorage.setItem('vaxnepal_user', JSON.stringify(userData || {}));

    setAuthState({
      user: userData || null,
      token,
      role,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    const currentRole = authState.role || localStorage.getItem('vaxnepal_role');

    localStorage.removeItem('vaxnepal_token');
    localStorage.removeItem('vaxnepal_role');
    localStorage.removeItem('vaxnepal_user');

    setAuthState(initialAuthState);

    if (currentRole === 'healthcare') {
      navigate('/healthcare/login');
      return;
    }

    navigate('/login');
  };

  const value = useMemo(
    () => ({
      ...authState,
      login,
      logout,
    }),
    [authState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
