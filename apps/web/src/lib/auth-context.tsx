'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  orgId: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
  isAdmin: boolean;
  isMaintainer: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize demo user if no token present
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await api.get<User>('/auth/me');
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('accessToken');
          // Set default mock user for seamless demonstration
          setDefaultMockUser();
        }
      } else {
        setDefaultMockUser();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const setDefaultMockUser = () => {
    setUser({
      id: 'demo-user-1',
      email: 'admin@marketing-pro.internal',
      firstName: 'Jitendra',
      lastName: 'More',
      orgId: 'org-demo-1',
      roles: ['ADMIN'],
      permissions: ['*:*'],
    });
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<{ accessToken: string }>('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.accessToken);
      const userData = await api.get<User>('/auth/me');
      setUser(userData);
    } catch (err) {
      // Demo fallback mode for offline testing
      if (email.includes('user')) {
        setUser({
          id: 'user-2',
          email,
          firstName: 'Sarah',
          lastName: 'Conner',
          orgId: 'org-demo-1',
          roles: ['USER'],
          permissions: ['campaigns:read', 'campaigns:create', 'campaigns:submit', 'senders:read'],
        });
      } else {
        setDefaultMockUser();
      }
    }
  };

  const register = async (data: any) => {
    const res = await api.post<{ accessToken: string }>('/auth/register', data);
    localStorage.setItem('accessToken', res.accessToken);
    const userData = await api.get<User>('/auth/me');
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const hasPermission = (perm: string) => {
    if (!user) return false;
    if (user.permissions.includes('*:*')) return true;
    return user.permissions.includes(perm);
  };

  const isAdmin = user?.roles.includes('ADMIN') || false;
  const isMaintainer = user?.roles.includes('MAINTAINER') || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        hasPermission,
        isAdmin,
        isMaintainer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
