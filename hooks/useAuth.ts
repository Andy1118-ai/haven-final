import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (token && userStr) {
        setState({
          user: JSON.parse(userStr),
          token,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load authentication state',
      }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      await Promise.all([
        AsyncStorage.setItem('token', data.token),
        AsyncStorage.setItem('user', JSON.stringify(data.user)),
      ]);

      setState({
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });

      router.replace('/(tabs)');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  const register = async (name: string, email: string, password: string, phoneNumber?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          name,
          email,
          password,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      await Promise.all([
        AsyncStorage.setItem('token', data.token),
        AsyncStorage.setItem('user', JSON.stringify(data.user)),
      ]);

      setState({
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });

      router.replace('/(tabs)');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('user'),
      ]);

      setState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });

      router.replace('/');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to logout',
      }));
    }
  };

  const getAuthHeader = () => {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {};
  };

  return {
    ...state,
    login,
    register,
    logout,
    getAuthHeader,
  };
} 