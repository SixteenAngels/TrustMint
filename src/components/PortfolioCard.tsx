import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface PortfolioCardProps {
  totalValue: number;
  dayGain: number;
  dayGainPercent: number;
  balance: number;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  totalValue,
  dayGain,
  dayGainPercent,
  balance,
}) => {
  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio Value</Text>
        <Text style={styles.balance}>Cash: {formatCurrency(balance)}</Text>
      </View>
      
      <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
      
      <View style={styles.gainContainer}>
        <Text style={[
          styles.dayGain,
          { color: dayGain >= 0 ? colors.success : colors.error }
        ]}>
          {formatCurrency(dayGain)} ({formatPercent(dayGainPercent)})
        </Text>
        <Text style={styles.dayGainLabel}>Today</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.body,
    color: colors.textSecondary,
  },
  balance: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  gainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayGain: {
    ...typography.h5,
    marginRight: spacing.sm,
  },
  dayGainLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
