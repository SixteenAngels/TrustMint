import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

type Tab = 'transactions' | 'fees' | 'refunds';

export const FinanceAndPayments: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'pending'>('all');

  const [fees, setFees] = useState({
    trading: 0.5,
    deposit: 0,
    withdrawal: 1.5,
  });

  const mockTransactions = [
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const handleApprove = (tx: any) => {
    Alert.alert('Approve Transaction', `Approve ${tx.type} of ₵${tx.amount.toLocaleString()}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => Alert.alert('Success', 'Transaction approved') },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabBar}>
          {(['transactions', 'fees', 'refunds'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.primary },
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

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <View>
            <View style={styles.filterRow}>
              {(['all', 'deposit', 'withdrawal', 'pending'] as const).map((f) => (
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
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.transactionsList}>
              {mockTransactions.map((tx) => (
                <View key={tx.id} style={[styles.transactionCard, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionType}>
                      <View style={[styles.typeBadge, { backgroundColor: tx.type === 'deposit' ? colors.successLight : colors.errorLight }]}>
                        <SFSymbol name={tx.type === 'deposit' ? 'arrow.down.circle.fill' : 'arrow.up.circle.fill'} size={20} color={tx.type === 'deposit' ? colors.success : colors.error} />
                        <Text style={[styles.typeText, { color: tx.type === 'deposit' ? colors.success : colors.error }]}>
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
                  <View style={styles.amountRow}>
                    <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount:</Text>
                    <Text style={[styles.amountValue, { color: tx.type === 'deposit' ? colors.success : colors.error }]}>
                      {tx.type === 'deposit' ? '+' : '-'}₵{tx.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.transactionDetails}>
                    <View style={styles.transactionDetailRow}>
                      <Text style={[styles.transactionDetailLabel, { color: colors.textSecondary }]}>User:</Text>
                      <Text style={[styles.transactionDetailValue, { color: colors.textPrimary }]}>{tx.userName}</Text>
                    </View>
                    <View style={styles.transactionDetailRow}>
                      <Text style={[styles.transactionDetailLabel, { color: colors.textSecondary }]}>Method:</Text>
                      <Text style={[styles.transactionDetailValue, { color: colors.textPrimary }]}>{tx.paymentMethod}</Text>
                    </View>
                    <View style={styles.transactionDetailRow}>
                      <Text style={[styles.transactionDetailLabel, { color: colors.textSecondary }]}>Time:</Text>
                      <Text style={[styles.transactionDetailValue, { color: colors.textPrimary }]}>{tx.timestamp}</Text>
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
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>Generate Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.warningLight }]}
                  onPress={() => Alert.alert('Detect Chargebacks', 'Scanning for chargebacks...')}
                >
                  <SFSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
                  <Text style={[styles.actionButtonText, { color: colors.warning }]}>Detect Chargebacks</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Fees Tab */}
        {activeTab === 'fees' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Trading Fee</Text>
              <View style={styles.feeRow}>
                <TextInput
                  style={[styles.feeInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                  value={fees.trading.toString()}
                  onChangeText={(text) => setFees({ ...fees, trading: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
                <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>%</Text>
              </View>
            </View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Deposit Fee</Text>
              <View style={styles.feeRow}>
                <TextInput
                  style={[styles.feeInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                  value={fees.deposit.toString()}
                  onChangeText={(text) => setFees({ ...fees, deposit: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
                <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>%</Text>
              </View>
            </View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Withdrawal Fee</Text>
              <View style={styles.feeRow}>
                <TextInput
                  style={[styles.feeInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                  value={fees.withdrawal.toString()}
                  onChangeText={(text) => setFees({ ...fees, withdrawal: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
                <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>%</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Success', 'Fees updated')}
            >
              <Text style={[styles.saveButtonText, { color: colors.textWhite }]}>Save Fees</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Process Refund</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Enter transaction ID to process a refund
              </Text>
              <TextInput
                style={[styles.refundInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Transaction ID"
                placeholderTextColor={colors.textLight}
              />
              <TouchableOpacity
                style={[styles.refundButton, { backgroundColor: colors.primary }]}
                onPress={() => Alert.alert('Refund', 'Refund processed')}
              >
                <Text style={[styles.refundButtonText, { color: colors.textWhite }]}>Process Refund</Text>
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonText: {
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
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountLabel: {
    ...typography.body,
  },
  amountValue: {
    ...typography.h5,
    fontWeight: '700',
  },
  transactionDetails: {
    marginBottom: spacing.md,
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
  card: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
  },
  feeLabel: {
    ...typography.h6,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  refundInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.body,
  },
  refundButton: {
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  refundButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
});

