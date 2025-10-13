import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SFSymbol } from '../components/SFSymbols';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleKYC = () => {
    Alert.alert('KYC Verification', 'KYC verification feature coming soon!');
  };

  const handleTransactionHistory = () => {
    Alert.alert('Transaction History', 'Transaction history feature coming soon!');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact us at support@minttrade.gh');
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userPhone}>{user?.phone}</Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedIcon}>✓</Text>
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      </View>
    </View>
  );

  const renderMenuSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.menuItem,
            index === items.length - 1 && styles.lastMenuItem
          ]}
          onPress={item.onPress}
        >
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.menuSubtext}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          {item.rightComponent || (
            <Text style={styles.menuArrow}>›</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const accountItems = [
    {
      icon: '👤',
      title: 'Personal Information',
      onPress: () => Alert.alert('Personal Info', 'Edit personal information'),
    },
    {
      icon: '📄',
      title: 'KYC Documents',
      onPress: handleKYC,
    },
    {
      icon: '📊',
      title: 'Transaction History',
      onPress: handleTransactionHistory,
    },
  ];

  const settingsItems = [
    {
      icon: '🔔',
      title: 'Push Notifications',
      rightComponent: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={notificationsEnabled ? colors.textWhite : colors.textLight}
        />
      ),
    },
    {
      icon: '🔐',
      title: 'Biometric Login',
      rightComponent: (
        <Switch
          value={biometricEnabled}
          onValueChange={setBiometricEnabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={biometricEnabled ? colors.textWhite : colors.textLight}
        />
      ),
    },
    {
      icon: '🌙',
      title: 'Dark Mode',
      rightComponent: <Text style={styles.menuArrow}>›</Text>,
      onPress: () => Alert.alert('Dark Mode', 'Dark mode coming soon!'),
    },
  ];

  const supportItems = [
    {
      icon: '❓',
      title: 'Help & Support',
      onPress: handleSupport,
    },
    {
      icon: '📧',
      title: 'Contact Us',
      onPress: () => Alert.alert('Contact', 'Email: support@minttrade.gh'),
    },
    {
      icon: '📋',
      title: 'Terms & Conditions',
      onPress: () => Alert.alert('Terms', 'Terms and conditions'),
    },
    {
      icon: '🔒',
      title: 'Privacy Policy',
      onPress: () => Alert.alert('Privacy', 'Privacy policy'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile Header */}
      {renderProfileHeader()}

      {/* Account Section */}
      {renderMenuSection('Account', accountItems)}

      {/* Settings Section */}
      {renderMenuSection('Settings', settingsItems)}

      {/* More Features Section */}
      {renderMenuSection('More Features', [
        {
          icon: '👥',
          title: 'Social Trading',
          subtitle: 'Connect with other traders',
          onPress: () => Alert.alert('Social Trading', 'Navigate to social trading'),
        },
        {
          icon: '🤖',
          title: 'AI Insights',
          subtitle: 'Get smart investment advice',
          onPress: () => Alert.alert('AI Insights', 'Navigate to AI insights'),
        },
        {
          icon: '📚',
          title: 'Learning Center',
          subtitle: 'Educational content & courses',
          onPress: () => Alert.alert('Learning', 'Navigate to learning center'),
        },
        {
          icon: '🔔',
          title: 'Notifications',
          subtitle: 'Price alerts & notifications',
          onPress: () => Alert.alert('Notifications', 'Manage notifications'),
        },
      ])}

      {/* Support Section */}
      {renderMenuSection('Support', supportItems)}

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made in Ghana 🇬🇭 with ❤️ by Mint Trade</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    ...typography.h3,
    color: colors.textWhite,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userPhone: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedIcon: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  menuArrow: {
    ...typography.h4,
    color: colors.textLight,
  },
  signOutButton: {
    backgroundColor: colors.error,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.button,
  },
  signOutText: {
    ...typography.button,
    color: colors.textWhite,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  versionText: {
    ...typography.caption,
    color: colors.textLight,
  },
});