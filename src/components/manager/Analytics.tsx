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

export const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');

  const analytics = {
    userGrowth: { value: 12.5, change: 5.2 },
    tradeVolume: { value: 2345678, change: 8.3 },
    activeUsers: { value: 892, change: 3.1 },
    revenue: { value: 123456, change: 12.7 },
  };

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Time Range Selector */}
        <View style={styles.section}>
          <View style={styles.filterRow}>
            {(['today', 'week', 'month', 'year'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.filterButton,
                  { backgroundColor: timeRange === range ? colors.primary : colors.backgroundSecondary },
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text style={[
                  styles.filterButtonText,
                  { color: timeRange === range ? colors.textWhite : colors.textSecondary },
                ]}>
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Analytics Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Key Metrics</Text>
          <View style={styles.analyticsGrid}>
            <View style={[styles.analyticsCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.primary} />
              <Text style={[styles.analyticsValue, { color: colors.textPrimary }]}>
                {analytics.userGrowth.value}%
              </Text>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>User Growth</Text>
              <View style={styles.changeIndicator}>
                <SFSymbol name="arrow.up" size={12} color={colors.success} />
                <Text style={[styles.changeText, { color: colors.success }]}>
                  {analytics.userGrowth.change}%
                </Text>
              </View>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="dollarsign.circle" size={24} color={colors.success} />
              <Text style={[styles.analyticsValue, { color: colors.textPrimary }]}>
                {formatCurrency(analytics.tradeVolume.value)}
              </Text>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Trade Volume</Text>
              <View style={styles.changeIndicator}>
                <SFSymbol name="arrow.up" size={12} color={colors.success} />
                <Text style={[styles.changeText, { color: colors.success }]}>
                  {analytics.tradeVolume.change}%
                </Text>
              </View>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="person.2" size={24} color={colors.primary} />
              <Text style={[styles.analyticsValue, { color: colors.textPrimary }]}>
                {analytics.activeUsers.value}
              </Text>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Active Users</Text>
              <View style={styles.changeIndicator}>
                <SFSymbol name="arrow.up" size={12} color={colors.success} />
                <Text style={[styles.changeText, { color: colors.success }]}>
                  {analytics.activeUsers.change}%
                </Text>
              </View>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.backgroundSecondary }]}>
              <SFSymbol name="banknote" size={24} color={colors.success} />
              <Text style={[styles.analyticsValue, { color: colors.textPrimary }]}>
                {formatCurrency(analytics.revenue.value)}
              </Text>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Revenue</Text>
              <View style={styles.changeIndicator}>
                <SFSymbol name="arrow.up" size={12} color={colors.success} />
                <Text style={[styles.changeText, { color: colors.success }]}>
                  {analytics.revenue.change}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={[styles.card, { backgroundColor: colors.warningLight }]}>
          <SFSymbol name="info.circle.fill" size={20} color={colors.warning} />
          <Text style={[styles.noteText, { color: colors.warning }]}>
            Analytics are read-only. Contact admin for detailed reports.
          </Text>
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  filterButtonText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.card,
  },
  analyticsValue: {
    ...typography.h4,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  analyticsLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  changeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    ...shadows.card,
  },
  noteText: {
    ...typography.bodySmall,
    flex: 1,
    fontWeight: '500',
  },
});

