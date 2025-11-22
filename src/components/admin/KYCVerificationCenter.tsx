import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

interface KYCSubmission {
  id: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  name: string;
  dob: string;
  nationality: string;
  matchingScore: number;
}

export const KYCVerificationCenter: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);

  const mockKYCs: KYCSubmission[] = [
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
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      status: 'pending',
      submittedAt: '1 day ago',
      name: 'Jane Smith',
      dob: '1985-05-20',
      nationality: 'Ghanaian',
      matchingScore: 87,
    },
  ];

  const filteredKYCs = mockKYCs.filter((kyc) => 
    filter === 'all' || kyc.status === filter
  );

  const handleApprove = (kyc: KYCSubmission) => {
    Alert.alert('Approve KYC', `Approve verification for ${kyc.userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => Alert.alert('Success', 'KYC approved') },
    ]);
  };

  const handleReject = (kyc: KYCSubmission) => {
    Alert.prompt(
      'Reject KYC',
      `Enter reason for rejecting ${kyc.userName}'s verification:`,
      (reason) => {
        if (reason) {
          Alert.alert('Success', 'KYC rejected');
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'pending': return colors.warning;
      case 'rejected': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterTab,
                filter === f && { backgroundColor: colors.primary, borderColor: colors.primary },
                { borderColor: colors.border },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: filter === f ? colors.textWhite : colors.textSecondary },
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KYC List */}
        <View style={styles.kycList}>
          {filteredKYCs.map((kyc) => (
            <View key={kyc.id} style={[styles.kycCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.kycHeader}>
                <View style={styles.kycInfo}>
                  <Text style={[styles.kycUserName, { color: colors.textPrimary }]}>
                    {kyc.userName}
                  </Text>
                  <Text style={[styles.kycSubmitted, { color: colors.textSecondary }]}>
                    Submitted {kyc.submittedAt}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(kyc.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(kyc.status) }]}>
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
                  <Text style={[styles.kycDetailValue, { color: colors.primary }]}>
                    {kyc.matchingScore}%
                  </Text>
                </View>
              </View>

              {kyc.status === 'pending' && (
                <View style={styles.kycActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton, { backgroundColor: colors.success }]}
                    onPress={() => handleApprove(kyc)}
                  >
                    <SFSymbol name="checkmark.circle.fill" size={18} color={colors.textWhite} />
                    <Text style={[styles.actionButtonText, { color: colors.textWhite }]}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton, { backgroundColor: colors.error }]}
                    onPress={() => handleReject(kyc)}
                  >
                    <SFSymbol name="xmark.circle.fill" size={18} color={colors.textWhite} />
                    <Text style={[styles.actionButtonText, { color: colors.textWhite }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.viewDocumentsButton}
                onPress={() => setSelectedKYC(kyc)}
              >
                <Text style={[styles.viewDocumentsText, { color: colors.primary }]}>
                  View Documents & Selfie
                </Text>
              </TouchableOpacity>
            </View>
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
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterTabText: {
    ...typography.bodySmall,
    fontWeight: '500',
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
    alignItems: 'center',
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
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  approveButton: {},
  rejectButton: {},
  actionButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
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
});

