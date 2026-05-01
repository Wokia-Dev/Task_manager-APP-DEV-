/**
 * Avatar Component — Displays user initials with a colored background.
 */
import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { FontWeights } from '@/constants/theme';

interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ initials, color, size = 40, style }: AvatarProps) {
  const fontSize = size * 0.4;
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  },
});
