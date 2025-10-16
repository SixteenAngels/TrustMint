import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { SFSymbol } from './SFSymbols';

interface TabItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
  accessibilityLabel: string;
}

interface BottomTabNavigatorProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

// Apple HIG compliant: Max 5 tabs, using SF Symbols
const tabs: TabItem[] = [
  { 
    id: 'dashboard', 
    title: 'Home', 
    icon: 'house', 
    screen: 'DashboardScreen',
    accessibilityLabel: 'Home tab'
  },
  { 
    id: 'wallet', 
    title: 'Wallet', 
    icon: 'creditcard', 
    screen: 'WalletScreen',
    accessibilityLabel: 'Wallet tab'
  },
  { 
    id: 'trading', 
    title: 'Markets', 
    icon: 'chart.line.uptrend.xyaxis', 
    screen: 'TradingScreen',
    accessibilityLabel: 'Markets tab'
  },
  { 
    id: 'portfolio', 
    title: 'Portfolio', 
    icon: 'briefcase', 
    screen: 'PortfolioScreen',
    accessibilityLabel: 'Portfolio tab'
  },
  { 
    id: 'profile', 
    title: 'Profile', 
    icon: 'person.circle', 
    screen: 'ProfileScreen',
    accessibilityLabel: 'Profile tab'
  },
];

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => onTabPress(tab.id)}
            accessibilityRole="button"
            accessibilityLabel={tab.accessibilityLabel}
            accessibilityState={{ selected: activeTab === tab.id }}
            accessibilityHint={`Navigate to ${tab.title}`}
          >
            <View style={styles.tabContent}>
              <SFSymbol
                name={activeTab === tab.id ? `${tab.icon}.fill` : tab.icon}
                size={Platform.OS === 'ios' ? 24 : 22}
                color={activeTab === tab.id ? colors.primary : colors.textSecondary}
                weight="medium"
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.95)' : colors.backgroundSecondary,
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderTopColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.1)' : colors.border,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : shadows.card),
  },
  tabBar: {
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Safe area for iOS
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 50, // Apple HIG minimum touch target
  },
  activeTab: {
    // iOS doesn't use background color for active tabs
    ...(Platform.OS === 'android' && {
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
    }),
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabText: {
    fontSize: Platform.OS === 'ios' ? 10 : 11, // Apple HIG font size
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
    marginTop: 1,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: Platform.OS === 'ios' ? '600' : '600',
  },
});