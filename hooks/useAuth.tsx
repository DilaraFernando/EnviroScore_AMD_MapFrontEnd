import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/index';

const ADMIN_EMAIL = 'admin@enviroscoremap.com';

const applyAdminOverride = (u: User): User => {
  if (u.email?.trim().toLowerCase() === ADMIN_EMAIL) {
    return { ...u, role: 'admin' };
  }
  return u;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          if (isMounted) setUser(applyAdminOverride(parsedUser));
        }
      } catch (e) {
        console.error('Error parsing user:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStoredUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateUser = useCallback(async (updatedData: Partial<User>) => {
    setUser((current) => {
      if (!current) return current;
      const newUser = { ...current, ...updatedData };
      AsyncStorage.setItem('user', JSON.stringify(newUser)).catch((e) =>
        console.error('Error saving updated user:', e)
      );
      return newUser;
    });
  }, []);

  const login = useCallback(async (userData: User, token: string) => {
    const adjustedUser = applyAdminOverride(userData);
    try {
      await AsyncStorage.multiSet([
        ['token', token],
        ['user', JSON.stringify(adjustedUser)],
      ]);
    } catch (e) {
      console.error('Error saving auth data:', e);
    }
    setUser(adjustedUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
    } catch (e) {
      console.error('Error clearing auth data:', e);
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};