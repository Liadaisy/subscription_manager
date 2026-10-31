import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { apiClient } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);

  // Restore an existing backend session when the app opens
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('brightloop_access_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiClient.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        apiClient.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Authenticate using the backend
  const login = async (email, password) => {
    setAuthError('');

    try {
      const loggedUser = await apiClient.login({
        email: email.trim().toLowerCase(),
        password,
      });

      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      setAuthError(error.message || 'Login failed.');
      return null;
    }
  };

  // Logout
  const logout = () => {
    apiClient.logout();
    setUser(null);
    setAuthError('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        authError,
        setAuthError,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}