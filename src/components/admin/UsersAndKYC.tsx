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

type Tab = 'users' | 'kyc' | 'risk';

export const UsersAndKYC: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'high-risk'>('all');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const mockUsers = [
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

  const mockKYCs = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      status: 'pending',
      submittedAt: '2 days ago',
      name: 'John Doe',
      dob: '1990-01-15',
      nationality: 'Ghanaian',
      matchingScore: 95,
    },
  ];

  const handleApproveKYC = (kyc: any) => {
    Alert.alert('Approve KYC', `Approve verification for ${kyc.userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => Alert.alert('Success', 'KYC approved') },
    ]);
  };

  const handleRejectKYC = (kyc: any) => {
    Alert.prompt('Reject KYC', `Enter reason for rejecting ${kyc.userName}'s verification:`, (reason) => {
      if (reason) Alert.alert('Success', 'KYC rejected');
    });
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
        {/* Tabs */}
        <View style={styles.tabBar}>
          {(['users', 'kyc', 'risk'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.primary, borderColor: colors.primary },
                { borderColor: colors.border },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.textWhite : colors.textSecondary },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <View>
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
            <View style={styles.usersList}>
              {mockUsers.map((user) => (
                <View key={user.id} style={[styles.userCard, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
                      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                    </View>
                    <View style={styles.userBadges}>
                      <View style={[styles.badge, { backgroundColor: `${getKYCStatusColor(user.kycStatus)}20` }]}>
                        <Text style={[styles.badgeText, { color: getKYCStatusColor(user.kycStatus) }]}>
                          {user.kycStatus}
                        </Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: `${getRiskColor(user.riskLevel)}20` }]}>
                        <Text style={[styles.badgeText, { color: getRiskColor(user.riskLevel) }]}>
                          {user.riskLevel} risk
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.userDetails}>
                    <View style={styles.userDetailItem}>
                      <Text style={[styles.userDetailLabel, { color: colors.textSecondary }]}>Country</Text>
                      <Text style={[styles.userDetailValue, { color: colors.textPrimary }]}>{user.country}</Text>
                    </View>
                    <View style={styles.userDetailItem}>
                      <Text style={[styles.userDetailLabel, { color: colors.textSecondary }]}>Portfolio</Text>
                      <Text style={[styles.userDetailValue, { color: colors.primary }]}>
                        ₵{user.portfolioValue.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.userDetailItem}>
                      <Text style={[styles.userDetailLabel, { color: colors.textSecondary }]}>Last Login</Text>
                      <Text style={[styles.userDetailValue, { color: colors.textPrimary }]}>{user.lastLogin}</Text>
                    </View>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                      onPress={() => {}}
                    >
                      <Text style={[styles.actionButtonText, { color: colors.primary }]}>View Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
                      onPress={() => Alert.alert('Suspend', `Suspend ${user.name}?`)}
                    >
                      <Text style={[styles.actionButtonText, { color: colors.error }]}>Suspend</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <View>
            <View style={styles.filterRow}>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterButton,
                    kycFilter === f && { backgroundColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setKycFilter(f)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      { color: kycFilter === f ? colors.textWhite : colors.textSecondary },
                    ]}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.kycList}>
              {mockKYCs.map((kyc) => (
                <View key={kyc.id} style={[styles.kycCard, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={styles.kycHeader}>
                    <View style={styles.kycInfo}>
                      <Text style={[styles.kycUserName, { color: colors.textPrimary }]}>{kyc.userName}</Text>
                      <Text style={[styles.kycSubmitted, { color: colors.textSecondary }]}>
                        Submitted {kyc.submittedAt}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getKYCStatusColor(kyc.status)}20` }]}>
                      <Text style={[styles.statusText, { color: getKYCStatusColor(kyc.status) }]}>
                        {kyc.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.kycDetails}>
                    <View style={styles.kycDetailRow}>
                      <Text style={[styles.kycDetailLabel, { color: colors.textSecondary }]}>Name:</Text>
                      <Text style={[styles.kycDetailValue, { color: colors.textPrimary }]}>{kyc.name}</Text>
                    </View>
                    <View style={styles.kycDetailRow}>
                      <Text style={[styles.kycDetailLabel, { color: colors.textSecondary }]}>DOB:</Text>
                      <Text style={[styles.kycDetailValue, { color: colors.textPrimary }]}>{kyc.dob}</Text>
                    </View>
                    <View style={styles.kycDetailRow}>
                      <Text style={[styles.kycDetailLabel, { color: colors.textSecondary }]}>Nationality:</Text>
                      <Text style={[styles.kycDetailValue, { color: colors.textPrimary }]}>{kyc.nationality}</Text>
                    </View>
                    <View style={styles.kycDetailRow}>
                      <Text style={[styles.kycDetailLabel, { color: colors.textSecondary }]}>Matching Score:</Text>
                      <Text style={[styles.kycDetailValue, { color: colors.primary }]}>{kyc.matchingScore}%</Text>
                    </View>
                  </View>
                  {kyc.status === 'pending' && (
                    <View style={styles.kycActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.success }]}
                        onPress={() => handleApproveKYC(kyc)}
                      >
                        <SFSymbol name="checkmark.circle.fill" size={18} color={colors.textWhite} />
                        <Text style={[styles.actionButtonText, { color: colors.textWhite }]}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.error }]}
                        onPress={() => handleRejectKYC(kyc)}
                      >
                        <SFSymbol name="xmark.circle.fill" size={18} color={colors.textWhite} />
                        <Text style={[styles.actionButtonText, { color: colors.textWhite }]}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity style={styles.viewDocumentsButton} onPress={() => {}}>
                    <Text style={[styles.viewDocumentsText, { color: colors.primary }]}>
                      View Documents & Selfie
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Risk Tab */}
        {activeTab === 'risk' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>AML & Sanctions Checks</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Automated risk scoring and compliance monitoring
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight, marginTop: spacing.md }]}
                onPress={() => Alert.alert('AML Check', 'Running AML scan...')}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Run AML Scan</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  tabBar: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    ...typography.bodyMedium,
    fontWeight: '500',
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
    marginBottom: spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  kycList: {
    gap: spacing.md,
  },
  kycCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  kycInfo: {
    flex: 1,
  },
  kycUserName: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  kycSubmitted: {
    ...typography.bodySmall,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  kycDetails: {
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  kycDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  kycDetailLabel: {
    ...typography.bodySmall,
  },
  kycDetailValue: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  kycActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  viewDocumentsButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  viewDocumentsText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
  },
});

