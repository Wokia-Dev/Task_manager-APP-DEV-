/**
 * TaskFlow Design System — Extended Theme
 */
import '@/global.css';

import { Platform } from 'react-native';

// ─── Color Palette ───────────────────────────────────
export const Colors = {
  light: {
    // Core
    text: '#1A1B2E',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    background: '#F5F6FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',

    // Brand
    primary: '#6C63FF',
    primaryLight: '#EAE8FF',
    primaryDark: '#5A52E0',

    // Semantic
    accent: '#00C9A7',
    accentLight: '#E0FFF8',
    warning: '#FFB347',
    warningLight: '#FFF3E0',
    danger: '#FF6B6B',
    dangerLight: '#FFE8E8',
    info: '#45B7D1',
    infoLight: '#E3F5FA',

    // Status
    statusTodo: '#6B7280',
    statusInProgress: '#6C63FF',
    statusCompleted: '#00C9A7',

    // Priority
    priorityLow: '#9CA3AF',
    priorityMedium: '#FFB347',
    priorityHigh: '#FF6B6B',
    priorityUrgent: '#DC2626',

    // UI
    border: '#E5E7EB',
    divider: '#F3F4F6',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.08)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    inputBackground: '#F8F9FE',
  },
  dark: {
    // Core
    text: '#F0F0F8',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    background: '#0F1019',
    surface: '#1A1B2E',
    surfaceElevated: '#252742',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',

    // Brand
    primary: '#8B83FF',
    primaryLight: '#2D2A5E',
    primaryDark: '#6C63FF',

    // Semantic
    accent: '#00E4BF',
    accentLight: '#0D3D32',
    warning: '#FFCF70',
    warningLight: '#3D3020',
    danger: '#FF8E8E',
    dangerLight: '#3D2020',
    info: '#5CC8E0',
    infoLight: '#1A3340',

    // Status
    statusTodo: '#9CA3AF',
    statusInProgress: '#8B83FF',
    statusCompleted: '#00E4BF',

    // Priority
    priorityLow: '#6B7280',
    priorityMedium: '#FFCF70',
    priorityHigh: '#FF8E8E',
    priorityUrgent: '#FF4444',

    // UI
    border: '#2E3135',
    divider: '#252742',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    tabBar: '#1A1B2E',
    tabBarBorder: '#252742',
    inputBackground: '#252742',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ─── Typography ──────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ─── Spacing ─────────────────────────────────────────
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ─── Border Radius ───────────────────────────────────
export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

// ─── Shadows ─────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// ─── Layout ──────────────────────────────────────────
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// ─── Priority & Status Helpers ───────────────────────
export const PriorityConfig = {
  low: { label: 'Low', icon: 'arrow-down' as const },
  medium: { label: 'Medium', icon: 'remove' as const },
  high: { label: 'High', icon: 'arrow-up' as const },
  urgent: { label: 'Urgent', icon: 'priority-high' as const },
} as const;

export const StatusConfig = {
  todo: { label: 'To Do', icon: 'radio-button-unchecked' as const },
  in_progress: { label: 'In Progress', icon: 'timelapse' as const },
  completed: { label: 'Completed', icon: 'check-circle' as const },
} as const;
