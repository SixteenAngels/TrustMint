import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  riskLevel: 'low' | 'medium' | 'high';
  portfolioValue: number;
  lastLogin: string;
}

export const UserManagement: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'high-risk'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      country: 'Ghana',
      kycStatus: 'approved',
      riskLevel: 'low',
      portfolioValue: 125000,
      lastLogin: '2 hours ago',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      country: 'Ghana',
      kycStatus: 'pending',
      riskLevel: 'medium',
      portfolioValue: 45000,
      lastLogin: '1 day ago',
    },
  ];

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'verified' && user.kycStatus === 'approved') ||
      (filter === 'unverified' && user.kycStatus !== 'approved') ||
      (filter === 'high-risk' && user.riskLevel === 'high');
    
    return matchesSearch && matchesFilter;
  });

  const handleUserAction = (user: User, action: string) => {
    Alert.alert(
      action,
      `Are you sure you want to ${action.toLowerCase()} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'destructive', onPress: () => {
          Alert.alert('Success', `${action} completed for ${user.name}`);
        }},
      ]
    );
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'pending': return colors.warning;
      case 'rejected': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return colors.success;
      case 'medium': return colors.warning;
      case 'high': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
            <SFSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search users..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.filterRow}>
            {(['all', 'verified', 'unverified', 'high-risk'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  filter === f && { backgroundColor: colors.primary },
                  { borderColor: colors.border },
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    { color: filter === f ? colors.textWhite : colors.textSecondary },
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersList}>
          {filteredUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[styles.userCard, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => setSelectedUser(user)}
            >
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.textPrimary }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                    {user.email}
                  </Text>
                </View>
                <View style={styles.userBadges}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: `${getKYCStatusColor(user.kycStatus)}20` },
                    ]}
                  >
                    <Text
                      style={[styles.badgeText, { color: getKYCStatusColor(user.kycStatus) }]}
                    >
                      {user.kycStatus}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: `${getRiskColor(user.riskLevel)}20` },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: getRiskColor(user.riskLevel) }]}>
                      {user.riskLevel} risk
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.userDetails}>
                <View style={styles.userDetailItem}>
                  <Text style={[styles.userDetailLabel, { color: colors.textSecondary }]}>
                    Country
                  </Text>
                  <Text style={[styles.userDetailValue, { color: colors.textPrimary }]}>
                    {user.country}
                  </Text>
                </View>
                <View style={styles.userDetailItem}>
                  <Text style={[styles.userDetailLabel, { color: colors.textSecondary }]}>
                    Portfolio
                  </Text>
                  <Text style={[styles.userDetailValue, { color: colors.primary }]}>
                    ₵{user.portfolioValue.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.userDetailItem}>
                  <Text style={[styles.userDetailLabel, { color: colors.textSecondary }]}>
                    Last Login
                  </Text>
                  <Text style={[styles.userDetailValue, { color: colors.textPrimary }]}>
                    {user.lastLogin}
                  </Text>
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                  onPress={() => setSelectedUser(user)}
                >
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    View Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
                  onPress={() => handleUserAction(user, 'Suspend')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.error }]}>
                    Suspend
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
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
  searchSection: {
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  usersList: {
    gap: spacing.md,
  },
  userCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.bodySmall,
  },
  userBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userDetailItem: {
    flex: 1,
  },
  userDetailLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  userDetailValue: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});

