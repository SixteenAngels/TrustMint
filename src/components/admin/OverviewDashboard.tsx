import React, { useState, useEffect } from 'react';
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

export const OverviewDashboard: React.FC = () => {
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
    depositsToday: 123456,
    withdrawalsToday: 89012,
    depositsTotal: 12345678,
    withdrawalsTotal: 9876543,
    aiAutoTrades: 1234,
  });

  const [systemStatus, setSystemStatus] = useState({
    stockAPI: 'online',
    cryptoAPI: 'online',
    firebase: 'online',
    brokerAPI: 'online',
  });

  const topHoldings = [
    { symbol: 'MTN', count: 456, percentage: 23.4 },
    { symbol: 'GCB', count: 342, percentage: 18.2 },
    { symbol: 'CAL', count: 289, percentage: 15.1 },
    { symbol: 'EGH', count: 234, percentage: 12.3 },
    { symbol: 'FML', count: 198, percentage: 10.5 },
  ];

  const getStatusColor = (status: string) => {
    return status === 'online' ? colors.success : colors.error;
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
        {/* Key Metrics Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="person.2" size={24} color={colors.primary} />
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {stats.totalUsers.toLocaleString()}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Users</Text>
              <View style={styles.metricBreakdown}>
                <Text style={[styles.metricBreakdownText, { color: colors.success }]}>
                  {stats.verifiedUsers} verified
                </Text>
                <Text style={[styles.metricBreakdownText, { color: colors.warning }]}>
                  {stats.unverifiedUsers} pending
                </Text>
              </View>
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
              <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>
                {stats.totalTradesWeek} this week
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="dollarsign.circle" size={24} color={colors.success} />
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {formatCurrency(stats.tradeVolumeGHS)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Trade Volume</Text>
              <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>
                {formatCurrency(stats.tradeVolumeUSD, 'USD')} USD
              </Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Financial Summary</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Deposits Today</Text>
                <Text style={[styles.financialValue, { color: colors.success }]}>
                  {formatCurrency(stats.depositsToday)}
                </Text>
              </View>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Withdrawals Today</Text>
                <Text style={[styles.financialValue, { color: colors.error }]}>
                  {formatCurrency(stats.withdrawalsToday)}
                </Text>
              </View>
            </View>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Total Deposits</Text>
                <Text style={[styles.financialValue, { color: colors.textPrimary }]}>
                  {formatCurrency(stats.depositsTotal)}
                </Text>
              </View>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Total Withdrawals</Text>
                <Text style={[styles.financialValue, { color: colors.textPrimary }]}>
                  {formatCurrency(stats.withdrawalsTotal)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Auto-Trades */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.aiHeader}>
              <SFSymbol name="sparkles" size={24} color={colors.primary} />
              <View style={styles.aiHeaderText}>
                <Text style={[styles.aiTitle, { color: colors.textPrimary }]}>AI Auto-Trades</Text>
                <Text style={[styles.aiSubtitle, { color: colors.textSecondary }]}>
                  {stats.aiAutoTrades.toLocaleString()} executed today
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Holdings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Top 10 Holdings by Users</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {topHoldings.map((holding, index) => (
              <View key={index} style={styles.holdingRow}>
                <View style={styles.holdingLeft}>
                  <Text style={[styles.holdingRank, { color: colors.textSecondary }]}>
                    #{index + 1}
                  </Text>
                  <Text style={[styles.holdingSymbol, { color: colors.textPrimary }]}>
                    {holding.symbol}
                  </Text>
                </View>
                <View style={styles.holdingRight}>
                  <Text style={[styles.holdingCount, { color: colors.textPrimary }]}>
                    {holding.count} users
                  </Text>
                  <View style={[styles.holdingBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.holdingBarFill,
                        { backgroundColor: colors.primary, width: `${holding.percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={[styles.holdingPercentage, { color: colors.textSecondary }]}>
                    {holding.percentage}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>System Status</Text>
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
  metricBreakdown: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metricBreakdownText: {
    ...typography.caption,
    fontSize: 10,
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
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  financialItem: {
    flex: 1,
  },
  financialLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  financialValue: {
    ...typography.h5,
    fontWeight: '600',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aiHeaderText: {
    flex: 1,
  },
  aiTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  aiSubtitle: {
    ...typography.bodySmall,
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  holdingRank: {
    ...typography.bodySmall,
    width: 30,
  },
  holdingSymbol: {
    ...typography.body,
    fontWeight: '600',
  },
  holdingRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  holdingCount: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  holdingBar: {
    width: 100,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  holdingBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  holdingPercentage: {
    ...typography.caption,
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
});

