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
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { useNavigationContext } from '../contexts/NavigationContext';
import { KYCVerificationScreen } from './KYCVerificationScreen';
import { HelpScreen } from './HelpScreen';
import { ContactScreen } from './ContactScreen';
import { TermsScreen } from './TermsScreen';
import { PrivacyScreen } from './PrivacyScreen';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [activeSupportScreen, setActiveSupportScreen] = useState<string | null>(null);
  const { switchTab } = useNavigationContext();

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
    setShowKYC(true);
  };

  const handleTransactionHistory = () => {
    switchTab('wallet');
  };

  const handleSupport = (type: string) => {
    // Map support types to screen names
    const screenMap: { [key: string]: string } = {
      'help': 'help',
      'contact': 'contact',
      'terms': 'terms',
      'privacy': 'privacy',
    };
    setActiveSupportScreen(screenMap[type] || null);
  };

  const closeSupportScreen = () => {
    setActiveSupportScreen(null);
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

  const renderQuickAccess = () => (
    <View style={styles.quickAccessSection}>
      <Text style={styles.quickAccessTitle}>Quick Access</Text>
      <View style={styles.quickAccessGrid}>
        <TouchableOpacity
          style={styles.quickAccessItem}
          onPress={() => switchTab('social')}
        >
          <Text style={styles.quickAccessIcon}>👥</Text>
          <Text style={styles.quickAccessText}>Social</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAccessItem}
          onPress={() => switchTab('learning')}
        >
          <Text style={styles.quickAccessIcon}>📚</Text>
          <Text style={styles.quickAccessText}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAccessItem}
          onPress={() => switchTab('notifications')}
        >
          <Text style={styles.quickAccessIcon}>🔔</Text>
          <Text style={styles.quickAccessText}>Alerts</Text>
        </TouchableOpacity>
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
      type: 'help',
      onPress: () => handleSupport('help'),
    },
    {
      icon: '📧',
      title: 'Contact Us',
      type: 'contact',
      onPress: () => handleSupport('contact'),
    },
    {
      icon: '📋',
      title: 'Terms & Conditions',
      type: 'terms',
      onPress: () => handleSupport('terms'),
    },
    {
      icon: '🔒',
      title: 'Privacy Policy',
      type: 'privacy',
      onPress: () => handleSupport('privacy'),
    },
  ];

  if (showKYC) {
    return <KYCVerificationScreen onClose={() => setShowKYC(false)} />;
  }

  // Render support screens
  if (activeSupportScreen === 'help') {
    return <HelpScreen onClose={closeSupportScreen} />;
  }
  if (activeSupportScreen === 'contact') {
    return <ContactScreen onClose={closeSupportScreen} />;
  }
  if (activeSupportScreen === 'terms') {
    return <TermsScreen onClose={closeSupportScreen} />;
  }
  if (activeSupportScreen === 'privacy') {
    return <PrivacyScreen onClose={closeSupportScreen} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile Header */}
      {renderProfileHeader()}

      {/* Quick Access */}
      {renderQuickAccess()}

      {/* Account Section */}
      {renderMenuSection('Account', accountItems)}

      {/* Settings Section */}
      {renderMenuSection('Settings', settingsItems)}

      {/* Trading & Learning Section */}
      {renderMenuSection('Trading & Learning', [
        {
          icon: '👥',
          title: 'Social Trading',
          subtitle: 'Connect with other traders',
          onPress: () => switchTab('social'),
        },
        {
          icon: '📚',
          title: 'Learning Center',
          subtitle: 'Educational content & courses',
          onPress: () => switchTab('learning'),
        },
        {
          icon: '🔔',
          title: 'Notifications',
          subtitle: 'Price alerts & notifications',
          onPress: () => switchTab('notifications'),
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

const createStyles = (colors: any) => StyleSheet.create({
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
  quickAccessSection: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  quickAccessTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAccessItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickAccessIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  quickAccessText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});