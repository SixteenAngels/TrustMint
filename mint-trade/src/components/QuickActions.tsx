import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
      title: 'Trade',
      icon: '📈',
      color: '#007AFF',
      onPress: onTradePress,
    },
    {
      id: 'learn',
      title: 'Learn',
      icon: '📚',
      color: '#34C759',
      onPress: onLearnPress,
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      icon: '💼',
      color: '#FF9500',
      onPress: onPortfolioPress,
    },
    {
      id: 'alerts',
      title: 'Alerts',
      icon: '🔔',
      color: '#FF3B30',
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
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});