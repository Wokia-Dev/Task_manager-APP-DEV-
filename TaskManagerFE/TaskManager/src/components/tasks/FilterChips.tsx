/**
 * Task Filter Chips — Horizontal scrollable filter bar.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-theme';
import type { TaskStatus } from '@/types';

interface FilterChipsProps {
  selected: TaskStatus | 'all';
  onSelect: (status: TaskStatus | 'all') => void;
}

const FILTERS: { key: TaskStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

export function FilterChips({ selected, onSelect }: FilterChipsProps) {
  const colors = useColors();

  return (
    <View style={{ flexGrow: 0, flexShrink: 0 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
      {FILTERS.map((filter) => {
        const isActive = selected === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onSelect(filter.key)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderWidth: isActive ? 0 : 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isActive ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chip: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: Radius.full,
    marginRight: 8,
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
});
