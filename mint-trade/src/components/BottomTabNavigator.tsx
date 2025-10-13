import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface TabItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
}

interface BottomTabNavigatorProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

const tabs: TabItem[] = [
  { id: 'dashboard', title: 'Home', icon: '🏠', screen: 'DashboardScreen' },
  { id: 'trading', title: 'Markets', icon: '📈', screen: 'TradingScreen' },
  { id: 'portfolio', title: 'Portfolio', icon: '💼', screen: 'PortfolioScreen' },
  { id: 'learning', title: 'Learn', icon: '📚', screen: 'LearningScreen' },
  { id: 'notifications', title: 'Alerts', icon: '🔔', screen: 'NotificationsScreen' },
  { id: 'admin', title: 'Profile', icon: '👤', screen: 'ProfileScreen' },
];

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.activeTabText
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    ...shadows.header,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginHorizontal: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
});