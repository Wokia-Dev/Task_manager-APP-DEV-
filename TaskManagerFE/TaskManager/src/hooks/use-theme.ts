/**
 * useThemeColor hook — returns colors for the current color scheme.
 */
import { useColorScheme } from 'react-native';
import { Colors, type ThemeColor } from '@/constants/theme';

function resolveScheme(scheme: ReturnType<typeof useColorScheme>): 'light' | 'dark' {
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useThemeColor(colorName: ThemeColor): string {
  const scheme = resolveScheme(useColorScheme());
  return Colors[scheme][colorName];
}

export function useColors() {
  const scheme = resolveScheme(useColorScheme());
  return Colors[scheme];
}

/** Alias used by legacy Expo template components (themed-text, themed-view, collapsible). */
export const useTheme = useColors;
