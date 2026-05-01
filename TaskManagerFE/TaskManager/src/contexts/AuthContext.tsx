/**
 * TaskFlow Auth Context
 * Manages authentication state, token persistence, and user session.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { api } from '@/services/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials, Team, User } from '@/types';

// Try to use SecureStore on native, fall back to AsyncStorage on web
let SecureStore: typeof import('expo-secure-store') | null = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

const TOKEN_KEY = 'taskflow_access_token';
const REFRESH_KEY = 'taskflow_refresh_token';
const USER_KEY = 'taskflow_user';
const TEAM_KEY = 'taskflow_active_team';

async function saveSecure(key: string, value: string) {
  try {
    if (SecureStore) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
}

async function getSecure(key: string): Promise<string | null> {
  try {
    if (SecureStore) {
      return await SecureStore.getItemAsync(key);
    }
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.error(`Failed to get ${key}`, e);
    return null;
  }
}

async function deleteSecure(key: string) {
  try {
    if (SecureStore) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (e) {
    console.error(`Failed to delete ${key}`, e);
  }
}

// ─── Context Types ───────────────────────────────────
interface AuthContextType {
  user: User | null;
  activeTeam: Team | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  setActiveTeam: (team: Team | null) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  activeTeam: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
  setActiveTeam: async () => {},
});

// ─── Provider ────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [accessToken, refreshToken, userJson, teamJson] = await Promise.all([
        getSecure(TOKEN_KEY),
        getSecure(REFRESH_KEY),
        getSecure(USER_KEY),
        getSecure(TEAM_KEY),
      ]);

      if (accessToken && refreshToken) {
        api.setTokens(accessToken, refreshToken);

        // Try to fetch fresh profile
        try {
          const { user: freshUser } = await api.auth.getProfile();
          setUser(freshUser);
          await saveSecure(USER_KEY, JSON.stringify(freshUser));
        } catch {
          // If profile fetch fails, use cached user
          if (userJson) {
            setUser(JSON.parse(userJson));
          } else {
            // Token is invalid and no cached user
            api.clearTokens();
          }
        }

        if (teamJson) {
          setActiveTeamState(JSON.parse(teamJson));
        } else {
          try {
            const { teams } = await api.teams.list();
            if (teams && teams.length > 0) {
              setActiveTeamState(teams[0]);
              await saveSecure(TEAM_KEY, JSON.stringify(teams[0]));
            }
          } catch (e) {
            console.error('Failed to fetch teams during restore', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthResponse = async (response: AuthResponse, fetchTeams = false) => {
    api.setTokens(response.access_token, response.refresh_token);

    let defaultTeam = null;
    if (fetchTeams) {
      try {
        const { teams } = await api.teams.list();
        if (teams && teams.length > 0) {
          defaultTeam = teams[0];
          setActiveTeamState(defaultTeam);
        }
      } catch (e) {
        console.error('Failed to fetch teams during auth', e);
      }
    }

    setUser(response.user);

    const promises: Promise<void>[] = [
      saveSecure(TOKEN_KEY, response.access_token),
      saveSecure(REFRESH_KEY, response.refresh_token),
      saveSecure(USER_KEY, JSON.stringify(response.user)),
    ];
    if (defaultTeam) {
      promises.push(saveSecure(TEAM_KEY, JSON.stringify(defaultTeam)));
    } else if (fetchTeams) {
      promises.push(deleteSecure(TEAM_KEY));
    }
    await Promise.all(promises);
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await api.auth.login(credentials);
    await handleAuthResponse(response, true);
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const response = await api.auth.register(credentials);
    await handleAuthResponse(response, false);
  }, []);

  const logout = useCallback(async () => {
    api.clearTokens();
    setUser(null);
    setActiveTeamState(null);
    await Promise.all([
      deleteSecure(TOKEN_KEY),
      deleteSecure(REFRESH_KEY),
      deleteSecure(USER_KEY),
      deleteSecure(TEAM_KEY),
    ]);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    saveSecure(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  const setActiveTeam = useCallback(async (team: Team | null) => {
    setActiveTeamState(team);
    if (team) {
      await saveSecure(TEAM_KEY, JSON.stringify(team));
    } else {
      await deleteSecure(TEAM_KEY);
    }
  }, []);

  // Register token refresh failure handler
  useEffect(() => {
    api.onTokenRefreshFailed(() => {
      logout();
    });
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      activeTeam,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUser,
      setActiveTeam,
    }),
    [user, activeTeam, isLoading, login, register, logout, updateUser, setActiveTeam],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
