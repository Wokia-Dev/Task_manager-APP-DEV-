/**
 * Tasks Screen — List all tasks with filters.
 * Includes a "My Tasks" / "Team Tasks" scope toggle for clear ownership separation.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

type TaskScope = 'mine' | 'team';

export default function TasksScreen() {
  const colors = useColors();
  const router = useRouter();
  const { activeTeam, user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scope, setScope] = useState<TaskScope>('mine');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'priority'>('created_at');

  const fetchTasks = useCallback(async () => {
    if (!activeTeam || !user) return;
    try {
      const params: {
        team_id: number;
        status?: string;
        assigned_to?: number;
        sort?: string;
        order?: string;
      } = {
        team_id: activeTeam.id,
        sort: sortBy,
        order: 'desc',
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (scope === 'mine') params.assigned_to = user.id;
      const { tasks: data } = await api.tasks.list(params);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTeam, statusFilter, sortBy, scope, user]);

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

  const emptyMessage = scope === 'mine'
    ? statusFilter !== 'all'
      ? 'You have no tasks with this status'
      : 'No tasks assigned to you yet'
    : statusFilter !== 'all'
      ? 'No team tasks with this status'
      : 'Create your first task to get started';

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

      {/* Scope Toggle: My Tasks / Team Tasks */}
      <View style={[styles.scopeContainer, { flexGrow: 0, flexShrink: 0 }]}>
        <View style={[styles.scopeTrack, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            onPress={() => setScope('mine')}
            style={[
              styles.scopeButton,
              scope === 'mine' && [styles.scopeButtonActive, { backgroundColor: colors.primary }],
            ]}
          >
            <MaterialIcons
              name="person"
              size={16}
              color={scope === 'mine' ? '#FFF' : colors.textTertiary}
            />
            <Text
              style={[
                styles.scopeText,
                { color: scope === 'mine' ? '#FFF' : colors.textSecondary },
              ]}
            >
              My Tasks
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setScope('team')}
            style={[
              styles.scopeButton,
              scope === 'team' && [styles.scopeButtonActive, { backgroundColor: colors.primary }],
            ]}
          >
            <MaterialIcons
              name="groups"
              size={16}
              color={scope === 'team' ? '#FFF' : colors.textTertiary}
            />
            <Text
              style={[
                styles.scopeText,
                { color: scope === 'team' ? '#FFF' : colors.textSecondary },
              ]}
            >
              Team Tasks
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Status Filter Chips */}
      <FilterChips selected={statusFilter} onSelect={setStatusFilter} />

      {/* Sort Row */}
      <View style={[styles.sortRow, { flexGrow: 0, flexShrink: 0 }]}>
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
          <TaskCard
            task={item}
            onPress={() => router.push(`/task/${item.id}`)}
            showAssignee={scope === 'team'}
          />
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
            message={emptyMessage}
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
    paddingBottom: Spacing.one,
  },
  title: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.extrabold },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Scope Toggle ──
  scopeContainer: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  scopeTrack: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 3,
  },
  scopeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  scopeButtonActive: {
    // backgroundColor set dynamically
  },
  scopeText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  // ── Sort ──
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
    paddingBottom: 100,
  },
});
