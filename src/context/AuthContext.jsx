import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/initialData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('brightloop_auth_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Failed to load user from localStorage', e);
    }
    // Default to admin for fast demo preview, or null if strict login preferred
    return INITIAL_USERS[0]; // Admin by default
  });

  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('brightloop_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('brightloop_auth_user');
    }
  }, [user]);

  const login = (email, password) => {
    setAuthError('');
    const foundUser = INITIAL_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!foundUser) {
      setAuthError('No user found with this email address.');
      return false;
    }

    if (foundUser.password !== password) {
      setAuthError('Invalid password. Please try again or use demo credentials.');
      return false;
    }

    setUser(foundUser);
    return foundUser;
  };

  const loginAsRole = (role) => {
    const roleUser = INITIAL_USERS.find(u => u.role === role);
    if (roleUser) {
      setUser(roleUser);
      setAuthError('');
      return roleUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('brightloop_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginAsRole,
        logout,
        authError,
        setAuthError,
        demoUsers: INITIAL_USERS
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
