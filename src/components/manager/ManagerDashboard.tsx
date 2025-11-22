import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

export const ManagerDashboard: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    dailyActiveUsers: 456,
    totalTradesToday: 234,
    tradeVolumeGHS: 2345678,
    newSignups: 23,
    supportTickets: 12,
    pendingReviews: 5,
  });

  const [activityAlerts, setActivityAlerts] = useState([
    { id: '1', type: 'warning', message: 'Unusual trading pattern detected', user: 'John Doe', time: '5 min ago' },
    { id: '2', type: 'info', message: 'New user signup', user: 'Jane Smith', time: '10 min ago' },
    { id: '3', type: 'error', message: 'API connection issue resolved', user: 'System', time: '15 min ago' },
  ]);

  const formatCurrency = (amount: number) => {
    const symbol = '₵';
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(2)}K`;
    }
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'info': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="person.2" size={24} color={colors.primary} />
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {stats.totalUsers.toLocaleString()}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Users</Text>
              <Text style={[styles.metricSubtext, { color: colors.success }]}>
                {stats.activeUsers} active
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.success} />
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {stats.dailyActiveUsers}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Daily Active</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="arrow.up.arrow.down" size={24} color={colors.primary} />
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {stats.totalTradesToday}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Trades Today</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="dollarsign.circle" size={24} color={colors.success} />
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {formatCurrency(stats.tradeVolumeGHS)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Trade Volume</Text>
            </View>
          </View>
        </View>

        {/* Activity Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Activity Alerts</Text>
            <View style={[styles.alertBadge, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.alertBadgeText, { color: colors.warning }]}>
                {activityAlerts.length} Active
              </Text>
            </View>
          </View>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {activityAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertRow}>
                <View style={[styles.alertIcon, { backgroundColor: `${getAlertColor(alert.type)}20` }]}>
                  <SFSymbol 
                    name={alert.type === 'error' ? 'exclamationmark.triangle.fill' : alert.type === 'warning' ? 'exclamationmark.circle.fill' : 'info.circle.fill'} 
                    size={16} 
                    color={getAlertColor(alert.type)} 
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertMessage, { color: colors.textPrimary }]}>
                    {alert.message}
                  </Text>
                  <Text style={[styles.alertDetails, { color: colors.textSecondary }]}>
                    {alert.user} • {alert.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="person.3" size={24} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>View Users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="message" size={24} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Support Tickets</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="chart.bar" size={24} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="bell" size={24} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Announcements</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.card,
  },
  metricValue: {
    ...typography.h3,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  metricSubtext: {
    ...typography.caption,
    fontSize: 10,
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  alertBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  alertBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  alertDetails: {
    ...typography.bodySmall,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.card,
  },
  actionLabel: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});

