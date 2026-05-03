/**
 * Dashboard Screen — Overview of team tasks and progress.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { StatCard } from '@/components/dashboard/StatCard';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/use-theme';
import { api } from '@/services/api';
import type { DashboardStats } from '@/types';

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, activeTeam } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!activeTeam || !user) return;
    try {
      const { stats: data } = await api.dashboard.getStats(activeTeam.id);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTeam]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const today = format(new Date(), 'EEEE, MMM d');
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <View>
            <Text style={[styles.greetText, { color: colors.textSecondary }]}>{greeting}</Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.full_name?.split(' ')[0] ?? 'User'} 👋
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textTertiary }]}>{today}</Text>
        </View>

        {/* Team name */}
        <View style={[styles.teamBanner, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="groups" size={18} color={colors.primary} />
          <Text style={[styles.teamName, { color: colors.primary }]}>
            {activeTeam?.name ?? 'My Team'}
          </Text>
          <Text style={[styles.memberCount, { color: colors.primary }]}>
            · {stats?.member_count ?? 0} members
          </Text>
        </View>

        {stats && stats.total > 0 ? (
          <>
            {/* Progress Ring */}
            <View style={styles.progressSection}>
              <ProgressRing progress={stats.progress} />
            </View>

            {/* Stat Cards */}
            <View style={styles.statsRow}>
              <StatCard
                title="To Do"
                value={stats.todo}
                icon="radio-button-unchecked"
                color={colors.statusTodo}
                bgColor={colors.divider}
              />
              <StatCard
                title="In Progress"
                value={stats.in_progress}
                icon="timelapse"
                color={colors.statusInProgress}
                bgColor={colors.primaryLight}
              />
              <StatCard
                title="Done"
                value={stats.completed}
                icon="check-circle"
                color={colors.statusCompleted}
                bgColor={colors.accentLight}
              />
            </View>

            {/* Overdue alert */}
            {stats.overdue > 0 && (
              <Card style={{ ...styles.overdueCard, backgroundColor: colors.dangerLight }}>
                <MaterialIcons name="warning" size={20} color={colors.danger} />
                <Text style={[styles.overdueText, { color: colors.danger }]}>
                  {stats.overdue} task{stats.overdue > 1 ? 's' : ''} overdue
                </Text>
              </Card>
            )}

            {/* My Tasks Summary */}
            <Card style={styles.myTasksCard}>
              <View style={styles.myTasksHeader}>
                <MaterialIcons name="person" size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>My Tasks</Text>
              </View>
              <View style={styles.myTasksStats}>
                <Text style={[styles.myTasksStat, { color: colors.text }]}>
                  {stats.my_tasks.completed}/{stats.my_tasks.total} completed
                </Text>
                <Text style={[styles.myTasksPercent, { color: colors.primary }]}>
                  {stats.my_tasks.progress}%
                </Text>
              </View>
              {stats.my_tasks.total > 0 && (
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${Math.min(stats.my_tasks.progress, 100)}%`,
                      },
                    ]}
                  />
                </View>
              )}
            </Card>

            {/* Recent Tasks */}
            {stats.recent_tasks.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Tasks</Text>
                <View style={styles.taskList}>
                  {stats.recent_tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPress={() => router.push(`/task/${task.id}`)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <EmptyState
            icon="assignment"
            title="No tasks yet"
            message="Create your first task to get started with your team"
            actionLabel="Create Task"
            onAction={() => router.push('/create-task')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, paddingBottom: 32, gap: 20 },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greetText: { fontSize: FontSizes.base, fontWeight: FontWeights.medium },
  userName: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.extrabold },
  dateText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  teamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
  },
  teamName: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  memberCount: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  progressSection: { alignItems: 'center', paddingVertical: 8 },
  statsRow: { flexDirection: 'row', gap: 10 },
  overdueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  overdueText: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },
  myTasksCard: { gap: 10 },
  myTasksHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  myTasksStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myTasksStat: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  myTasksPercent: { fontSize: FontSizes.md, fontWeight: FontWeights.bold },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  recentSection: { gap: 12 },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold },
  taskList: { gap: 10 },
});
