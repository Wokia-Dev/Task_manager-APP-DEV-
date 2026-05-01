/**
 * Tasks Screen — List all tasks with filters.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FilterChips } from '@/components/tasks/FilterChips';
import { TaskCard } from '@/components/tasks/TaskCard';
import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/use-theme';
import { api } from '@/services/api';
import type { Task, TaskStatus } from '@/types';

export default function TasksScreen() {
  const colors = useColors();
  const router = useRouter();
  const { activeTeam, user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'priority'>('created_at');

  const fetchTasks = useCallback(async () => {
    if (!activeTeam || !user) return;
    try {
      const params: Record<string, any> = {
        team_id: activeTeam.id,
        sort: sortBy,
        order: 'desc',
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { tasks: data } = await api.tasks.list(params);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTeam, statusFilter, sortBy]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const onRefresh = () => { setRefreshing(true); fetchTasks(); };

  const sortOptions: { key: typeof sortBy; label: string }[] = [
    { key: 'created_at', label: 'Recent' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'priority', label: 'Priority' },
  ];

  if (loading) return <LoadingSpinner message="Loading tasks..." />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
        <Pressable
          onPress={() => router.push('/create-task')}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <MaterialIcons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      {/* Filter Chips */}
      <FilterChips selected={statusFilter} onSelect={setStatusFilter} />

      {/* Sort Row */}
      <View style={styles.sortRow}>
        <Text style={[styles.sortLabel, { color: colors.textTertiary }]}>Sort by:</Text>
        {sortOptions.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setSortBy(opt.key)}
            style={[
              styles.sortChip,
              {
                backgroundColor: sortBy === opt.key ? colors.surface : 'transparent',
                borderWidth: sortBy === opt.key ? 1 : 0,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.sortText,
                { color: sortBy === opt.key ? colors.text : colors.textTertiary },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        style={{ flex: 1 }}
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={() => router.push(`/task/${item.id}`)} />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="assignment"
            title="No tasks found"
            message={
              statusFilter !== 'all'
                ? 'Try changing your filter to see more tasks'
                : 'Create your first task to get started'
            }
            actionLabel="Create Task"
            onAction={() => router.push('/create-task')}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  title: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.extrabold },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.three,
    paddingBottom: 8,
  },
  sortLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  sortChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  sortText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  listContent: {
    padding: Spacing.three,
    paddingBottom: 100, // Increased to ensure last task is not hidden by tab bar
  },
});
