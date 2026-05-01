/**
 * Profile Screen — User info, statistics, and settings.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/ui/Card';
import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/use-theme';
import { api } from '@/services/api';
import type { DashboardStats, Team } from '@/types';

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, activeTeam, logout, setActiveTeam } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [teamData, statsData] = await Promise.all([
        api.teams.list(),
        activeTeam ? api.dashboard.getStats(activeTeam.id) : null,
      ]);
      setTeams(teamData.teams);
      if (statsData) setStats(statsData.stats);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [activeTeam]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const handleSwitchTeam = async (team: Team) => {
    await setActiveTeam(team);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar initials={user.initials} color={user.avatar_color} size={80} />
          <Text style={[styles.name, { color: colors.text }]}>{user.full_name}</Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>@{user.username}</Text>
          <Text style={[styles.email, { color: colors.textTertiary }]}>{user.email}</Text>
        </View>

        {/* My Statistics */}
        {stats && (
          <Card style={styles.statsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.my_tasks.total}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Assigned
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {stats.my_tasks.completed}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Completed
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {stats.my_tasks.progress}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Rate
                </Text>
              </View>
            </View>
            {stats.my_tasks.total > 0 && (
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: colors.accent, width: `${stats.my_tasks.progress}%` },
                  ]}
                />
              </View>
            )}
          </Card>
        )}

        {/* Teams */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Teams</Text>
            <Pressable
              onPress={() => router.push('/team-setup')}
              style={[styles.addTeamBtn, { backgroundColor: colors.primaryLight }]}
            >
              <MaterialIcons name="add" size={18} color={colors.primary} />
              <Text style={[styles.addTeamText, { color: colors.primary }]}>New</Text>
            </Pressable>
          </View>

          {teams.map((team) => (
            <Pressable
              key={team.id}
              onPress={() => handleSwitchTeam(team)}
              style={({ pressed }) => [
                styles.teamRow,
                {
                  backgroundColor: team.id === activeTeam?.id ? colors.primaryLight : colors.surface,
                  opacity: pressed ? 0.85 : 1,
                  borderColor: team.id === activeTeam?.id ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.teamIcon, { backgroundColor: team.id === activeTeam?.id ? colors.primary : colors.textTertiary }]}>
                <MaterialIcons name="groups" size={18} color="#FFF" />
              </View>
              <View style={styles.teamInfo}>
                <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                <Text style={[styles.teamMeta, { color: colors.textTertiary }]}>
                  {team.member_count} member{team.member_count !== 1 ? 's' : ''} · Code: {team.invite_code}
                </Text>
              </View>
              {team.id === activeTeam?.id && (
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable onPress={handleLogout} style={[styles.logoutBtn, { borderColor: colors.danger }]}>
          <MaterialIcons name="logout" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.three, paddingBottom: 40, gap: 20 },
  profileHeader: { alignItems: 'center', gap: 4, paddingVertical: 16 },
  name: { fontSize: FontSizes.xl, fontWeight: FontWeights.extrabold, marginTop: 12 },
  username: { fontSize: FontSizes.base, fontWeight: FontWeights.medium },
  email: { fontSize: FontSizes.sm },
  statsCard: { gap: 14 },
  statsGrid: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  statLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 40 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.bold },
  addTeamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  addTeamText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  teamIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  teamInfo: { flex: 1, gap: 2 },
  teamName: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },
  teamMeta: { fontSize: FontSizes.xs },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginTop: 8,
  },
  logoutText: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },
});
