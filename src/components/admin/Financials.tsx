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

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
}

export const Financials: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'pending'>('all');

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      type: 'deposit',
      amount: 5000,
      paymentMethod: 'Mobile Money',
      status: 'success',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      type: 'withdrawal',
      amount: 10000,
      paymentMethod: 'Bank Transfer',
      status: 'pending',
      timestamp: '1 hour ago',
    },
  ];

  const filteredTransactions = mockTransactions.filter((tx) => 
    filter === 'all' || tx.type === filter || (filter === 'pending' && tx.status === 'pending')
  );

  const handleApprove = (tx: Transaction) => {
    Alert.alert('Approve Transaction', `Approve ${tx.type} of ₵${tx.amount.toLocaleString()}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => Alert.alert('Success', 'Transaction approved') },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.filterTabs}>
          {(['all', 'deposit', 'withdrawal', 'pending'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterTab,
                filter === f && { backgroundColor: colors.primary },
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

        <View style={styles.transactionsList}>
          {filteredTransactions.map((tx) => (
            <View key={tx.id} style={[styles.transactionCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionType}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: tx.type === 'deposit' ? colors.successLight : colors.errorLight },
                    ]}
                  >
                    <SFSymbol
                      name={tx.type === 'deposit' ? 'arrow.down.circle.fill' : 'arrow.up.circle.fill'}
                      size={20}
                      color={tx.type === 'deposit' ? colors.success : colors.error}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        { color: tx.type === 'deposit' ? colors.success : colors.error },
                      ]}
                    >
                      {tx.type.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(tx.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(tx.status) }]}>
                    {tx.status}
                  </Text>
                </View>
              </View>

              <View style={styles.transactionDetails}>
                <View style={styles.amountRow}>
                  <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount:</Text>
                  <Text
                    style={[
                      styles.amountValue,
                      {
                        color: tx.type === 'deposit' ? colors.success : colors.error,
                      },
                    ]}
                  >
                    {tx.type === 'deposit' ? '+' : '-'}₵{tx.amount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.transactionDetailRow}>
                  <Text style={[styles.transactionDetailLabel, { color: colors.textSecondary }]}>User:</Text>
                  <Text style={[styles.transactionDetailValue, { color: colors.textPrimary }]}>
                    {tx.userName}
                  </Text>
                </View>
                <View style={styles.transactionDetailRow}>
                  <Text style={[styles.transactionDetailLabel, { color: colors.textSecondary }]}>Method:</Text>
                  <Text style={[styles.transactionDetailValue, { color: colors.textPrimary }]}>
                    {tx.paymentMethod}
                  </Text>
                </View>
                <View style={styles.transactionDetailRow}>
                  <Text style={[styles.transactionDetailLabel, { color: colors.textSecondary }]}>Time:</Text>
                  <Text style={[styles.transactionDetailValue, { color: colors.textPrimary }]}>
                    {tx.timestamp}
                  </Text>
                </View>
              </View>

              {tx.status === 'pending' && tx.type === 'withdrawal' && (
                <TouchableOpacity
                  style={[styles.approveButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleApprove(tx)}
                >
                  <Text style={[styles.approveButtonText, { color: colors.textWhite }]}>
                    Approve Withdrawal
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={[styles.actionsCard, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.actionsTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => Alert.alert('Generate Report', 'Daily financial report generated')}
            >
              <SFSymbol name="doc.text.fill" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Generate Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.warningLight }]}
              onPress={() => Alert.alert('Detect Chargebacks', 'Scanning for chargebacks...')}
            >
              <SFSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
              <Text style={[styles.actionButtonText, { color: colors.warning }]}>
                Detect Chargebacks
              </Text>
            </TouchableOpacity>
          </View>
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
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterTabText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  transactionsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  transactionCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  transactionType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  typeText: {
    ...typography.bodySmall,
    fontWeight: '600',
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
  transactionDetails: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  amountLabel: {
    ...typography.body,
  },
  amountValue: {
    ...typography.h5,
    fontWeight: '700',
  },
  transactionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  transactionDetailLabel: {
    ...typography.bodySmall,
  },
  transactionDetailValue: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  approveButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  actionsCard: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  actionsTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  actionButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});

