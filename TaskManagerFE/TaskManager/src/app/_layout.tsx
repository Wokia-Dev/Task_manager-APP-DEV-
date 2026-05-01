/**
 * TaskFlow Root Layout
 * Wraps the app with AuthProvider and handles auth-based routing.
 */
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, activeTeam } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTeamSetup = segments[0] === 'team-setup';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (!activeTeam) {
        router.replace('/team-setup');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isAuthenticated && !activeTeam && !inTeamSetup && !inAuthGroup) {
      router.replace('/team-setup');
    }
  }, [isAuthenticated, isLoading, activeTeam, segments]);

  if (isLoading) {
    return <LoadingSpinner message="Loading TaskFlow..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="team-setup" />
            <Stack.Screen
              name="task/[id]"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="create-task"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </Stack>
        </AuthGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}
