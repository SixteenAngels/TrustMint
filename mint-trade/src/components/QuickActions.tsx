import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface QuickActionsProps {
  onTradePress?: () => void;
  onLearnPress?: () => void;
  onPortfolioPress?: () => void;
  onAlertsPress?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onTradePress,
  onLearnPress,
  onPortfolioPress,
  onAlertsPress,
}) => {
  const actions = [
    {
      id: 'trade',
      title: 'Buy Stocks',
      icon: '📈',
      color: colors.primary,
      onPress: onTradePress,
    },
    {
      id: 'learn',
      title: 'Learn',
      icon: '📚',
      color: colors.accent,
      onPress: onLearnPress,
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      icon: '💼',
      color: colors.success,
      onPress: onPortfolioPress,
    },
    {
      id: 'alerts',
      title: 'Alerts',
      icon: '🔔',
      color: colors.warning,
      onPress: onAlertsPress,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={action.onPress}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  title: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.button,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.bodyMedium,
    color: colors.textWhite,
    fontWeight: '600',
    textAlign: 'center',
  },
});