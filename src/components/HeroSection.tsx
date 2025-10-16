import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface HeroSectionProps {
  userName: string;
  portfolioValue: number;
  dayGain: number;
  dayGainPercent: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  userName,
  portfolioValue,
  dayGain,
  dayGainPercent,
}) => {
  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const isPositive = dayGain >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {userName} 👋</Text>
          <Text style={styles.subtitle}>
            Your Portfolio is {isPositive ? 'up' : 'down'} {formatPercent(dayGainPercent)} this week!
          </Text>
        </View>
        <View style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </View>
      </View>

      <View style={styles.portfolioCard}>
        <View style={styles.portfolioHeader}>
          <Text style={styles.portfolioLabel}>Portfolio Value</Text>
          <View style={[
            styles.changeIndicator,
            { backgroundColor: isPositive ? colors.successLight : 'rgba(255, 59, 48, 0.1)' }
          ]}>
            <Text style={[
              styles.changeText,
              { color: isPositive ? colors.success : colors.error }
            ]}>
              {formatPercent(dayGainPercent)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.portfolioValue}>{formatCurrency(portfolioValue)}</Text>
        
        <View style={styles.portfolioDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Today's Change</Text>
            <Text style={[
              styles.detailValue,
              { color: isPositive ? colors.success : colors.error }
            ]}>
              {isPositive ? '+' : ''}{formatCurrency(dayGain)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Cash Available</Text>
            <Text style={styles.detailValue}>₵10,000.00</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  notificationIcon: {
    fontSize: 20,
  },
  portfolioCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: spacing.xl,
    ...shadows.card,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  portfolioLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  changeIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  changeText: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
  portfolioValue: {
    ...typography.priceXLarge,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  portfolioDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});