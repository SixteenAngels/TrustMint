import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wallet } from '../types/wallet';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface WalletCardProps {
  wallet: Wallet;
  onPress?: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, onPress }) => {
  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Mint Wallet</Text>
            <Text style={styles.accountNumber}>•••• {wallet.accountNumber.slice(-4)}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {wallet.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(wallet.balance)}</Text>
          {wallet.lockedBalance > 0 && (
            <Text style={styles.lockedText}>
              ₵{wallet.lockedBalance.toFixed(2)} locked
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Total Balance</Text>
            <Text style={styles.footerValue}>{formatCurrency(wallet.totalBalance)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Currency</Text>
            <Text style={styles.footerValue}>{wallet.currency}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.xl,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    ...typography.bodyMedium,
    color: colors.textWhite,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  accountNumber: {
    ...typography.h6,
    color: colors.textWhite,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: colors.textWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    ...typography.body,
    color: colors.textWhite,
    opacity: 0.8,
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    ...typography.priceXLarge,
    color: colors.textWhite,
    fontWeight: '700',
  },
  lockedText: {
    ...typography.caption,
    color: colors.textWhite,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
  },
  footerLabel: {
    ...typography.caption,
    color: colors.textWhite,
    opacity: 0.7,
    marginBottom: spacing.xs,
  },
  footerValue: {
    ...typography.bodyMedium,
    color: colors.textWhite,
    fontWeight: '600',
  },
});