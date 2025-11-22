import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { SFSymbol } from '../components/SFSymbols';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { ManagerDashboard } from '../components/manager/ManagerDashboard';
import { UserMonitoring } from '../components/manager/UserMonitoring';
import { SupportTickets } from '../components/manager/SupportTickets';
import { Analytics } from '../components/manager/Analytics';
import { TradeMonitoring } from '../components/manager/TradeMonitoring';
import { ContentModeration } from '../components/manager/ContentModeration';
import { Announcements } from '../components/manager/Announcements';

type ManagerSection = 
  | 'dashboard' 
  | 'users' 
  | 'trades'
  | 'support' 
  | 'content'
  | 'announcements'
  | 'analytics';

export const ManagerScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [activeSection, setActiveSection] = useState<ManagerSection>('dashboard');

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

  const sections: { id: ManagerSection; label: string; emoji: string }[] = [
    { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
    { id: 'users', label: 'Users', emoji: '👥' },
    { id: 'trades', label: 'Trades', emoji: '📈' },
    { id: 'support', label: 'Support', emoji: '💬' },
    { id: 'content', label: 'Content', emoji: '📝' },
    { id: 'announcements', label: 'Announce', emoji: '📢' },
    { id: 'analytics', label: 'Analytics', emoji: '📊' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ManagerDashboard />;
      case 'users':
        return <UserMonitoring />;
      case 'trades':
        return <TradeMonitoring />;
      case 'support':
        return <SupportTickets />;
      case 'content':
        return <ContentModeration />;
      case 'announcements':
        return <Announcements />;
      case 'analytics':
        return <Analytics />;
      default:
        return <ManagerDashboard />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>👔 Manager Panel</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {user?.name || 'Manager'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.success }]}>Online</Text>
            </View>
            <TouchableOpacity
              style={[styles.signOutButton, { backgroundColor: colors.errorLight }]}
              onPress={handleSignOut}
            >
              <SFSymbol name="arrow.right.square" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {renderSection()}
      </View>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomNavContainer} edges={['bottom']}>
        <View style={[styles.bottomNav, { backgroundColor: colors.backgroundSecondary, borderTopColor: colors.border }]}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={styles.navItem}
              onPress={() => setActiveSection(section.id)}
            >
              <View style={[
                styles.navIconContainer,
                activeSection === section.id && { backgroundColor: colors.primaryLight },
              ]}>
                <Text style={styles.navEmoji}>{section.emoji}</Text>
              </View>
              <Text
                style={[
                  styles.navLabel,
                  { color: activeSection === section.id ? colors.primary : colors.textSecondary },
                  activeSection === section.id && styles.navLabelActive,
                ]}
              >
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodySmall,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomNavContainer: {
    backgroundColor: colors.backgroundSecondary,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderTopWidth: 1,
    ...shadows.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  navEmoji: {
    fontSize: 22,
  },
  navLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  navLabelActive: {
    fontWeight: '600',
  },
});

