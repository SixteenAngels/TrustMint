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

interface AdminDashboardProps {
  onOpenAIControl?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenAIControl }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    verifiedUsers: 1103,
    unverifiedUsers: 144,
    dailyActiveUsers: 456,
    totalTradesToday: 234,
    totalTradesWeek: 1847,
    totalTradesAllTime: 45678,
    tradeVolumeGHS: 2345678,
    tradeVolumeUSD: 456789,
    revenue: 123456,
    depositsToday: 123456,
    withdrawalsToday: 89012,
    pendingKYC: 23,
    riskAlerts: 5,
  });

  const [systemStatus, setSystemStatus] = useState({
    stockAPI: 'online',
    cryptoAPI: 'online',
    firebase: 'online',
    brokerAPI: 'online',
    kycAPI: 'online',
    paymentAPI: 'online',
  });

  const [marketStatus, setMarketStatus] = useState({
    ghana: 'open',
    usa: 'open',
    nigeria: 'closed',
    india: 'closed',
  });

  const riskAlerts = [
    { id: '1', type: 'high', message: 'Unusual trading pattern detected', user: 'John Doe', time: '5 min ago' },
    { id: '2', type: 'medium', message: 'Large withdrawal request pending', user: 'Jane Smith', time: '15 min ago' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'online' || status === 'open') return colors.success;
    if (status === 'warning' || status === 'closed') return colors.warning;
    return colors.error;
  };

  const formatCurrency = (amount: number, currency: 'GHS' | 'USD' = 'GHS') => {
    const symbol = currency === 'GHS' ? '₵' : '$';
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(2)}K`;
    }
    return `${symbol}${amount.toFixed(2)}`;
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
              <SFSymbol name="arrow.up.arrow.down" size={24} color={colors.primary} />
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {stats.totalTradesToday}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Trades Today</Text>
              <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>
                {stats.totalTradesWeek} this week
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="dollarsign.circle" size={24} color={colors.success} />
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {formatCurrency(stats.revenue)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Revenue</Text>
              <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>
                Today
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="checkmark.shield" size={24} color={colors.warning} />
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {stats.pendingKYC}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Pending KYC</Text>
              <Text style={[styles.metricSubtext, { color: colors.warning }]}>
                Requires review
              </Text>
            </View>
          </View>
        </View>

        {/* API Health */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>API Health</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {Object.entries(systemStatus).map(([key, status]) => (
              <View key={key} style={styles.statusRow}>
                <View style={styles.statusLeft}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                  <Text style={[styles.statusLabel, { color: colors.textPrimary }]}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </Text>
                </View>
                <Text style={[styles.statusValue, { color: getStatusColor(status) }]}>
                  {status.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Risk Alerts Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Risk Alerts</Text>
            <View style={[styles.alertBadge, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.alertBadgeText, { color: colors.error }]}>
                {stats.riskAlerts} Active
              </Text>
            </View>
          </View>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {riskAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertRow}>
                <View style={[styles.alertIcon, { backgroundColor: `${colors.error}20` }]}>
                  <SFSymbol name="exclamationmark.triangle.fill" size={16} color={colors.error} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertMessage, { color: colors.textPrimary }]}>
                    {alert.message}
                  </Text>
                  <Text style={[styles.alertDetails, { color: colors.textSecondary }]}>
                    {alert.user} • {alert.time}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.viewButton, { backgroundColor: colors.primaryLight }]}
                  onPress={() => {}}
                >
                  <Text style={[styles.viewButtonText, { color: colors.primary }]}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Market Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Market Status</Text>
          <View style={styles.marketGrid}>
            {Object.entries(marketStatus).map(([market, status]) => (
              <View key={market} style={[styles.marketCard, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.marketName, { color: colors.textPrimary }]}>
                  {market.charAt(0).toUpperCase() + market.slice(1)}
                </Text>
                <View style={[styles.marketStatus, { backgroundColor: `${getStatusColor(status)}20` }]}>
                  <View style={[styles.marketStatusDot, { backgroundColor: getStatusColor(status) }]} />
                  <Text style={[styles.marketStatusText, { color: getStatusColor(status) }]}>
                    {status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* AI Control Center Button */}
        {onOpenAIControl && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.aiControlButton, { backgroundColor: colors.primary }]}
              onPress={onOpenAIControl}
            >
              <View style={styles.aiControlButtonContent}>
                <Text style={styles.aiControlEmoji}>🤖</Text>
                <View style={styles.aiControlButtonText}>
                  <Text style={[styles.aiControlButtonTitle, { color: colors.textWhite }]}>
                    AI Control Center
                  </Text>
                  <Text style={[styles.aiControlButtonSubtitle, { color: colors.textWhite }]}>
                    Manage AI features, settings, and performance
                  </Text>
                </View>
                <SFSymbol name="chevron.right" size={20} color={colors.textWhite} />
              </View>
            </TouchableOpacity>
          </View>
        )}
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    ...typography.body,
  },
  statusValue: {
    ...typography.bodySmall,
    fontWeight: '600',
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
  viewButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  viewButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  marketCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.card,
  },
  marketName: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  marketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  marketStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  marketStatusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  aiControlButton: {
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  aiControlButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aiControlEmoji: {
    fontSize: 32,
  },
  aiControlButtonText: {
    flex: 1,
  },
  aiControlButtonTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  aiControlButtonSubtitle: {
    ...typography.bodySmall,
    opacity: 0.9,
  },
});

