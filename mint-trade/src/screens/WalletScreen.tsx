import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { WalletService } from '../services/walletService';
import { Wallet, WalletTransaction } from '../types/wallet';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const WalletScreen: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const walletService = WalletService.getInstance();

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get or create wallet
      let walletData = await walletService.getWallet(user.uid);
      if (!walletData) {
        walletData = await walletService.createWallet(user.uid, {
          name: user.name || 'User',
          phone: user.phone,
        });
      }

      // Get transactions
      const transactionsData = await walletService.getTransactions(user.uid, 20);

      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionIcon = (type: string, category: string) => {
    switch (category) {
      case 'mobile_money':
        return '📱';
      case 'bank_transfer':
        return '🏦';
      case 'card_payment':
        return '💳';
      case 'p2p':
        return '👤';
      case 'bill_payment':
        return '📄';
      case 'investment':
        return '📈';
      case 'auto_save':
        return '💰';
      default:
        return type.includes('deposit') ? '⬆️' : '⬇️';
    }
  };

  const getTransactionColor = (type: string) => {
    return type.includes('deposit') || type.includes('transfer_in') || type.includes('refund')
      ? colors.success
      : colors.error;
  };

  const renderWalletHeader = () => {
    if (!wallet) return null;

    return (
      <View style={styles.walletHeader}>
        <View style={styles.walletCard}>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Mint Wallet</Text>
            <Text style={styles.accountNumber}>{wallet.accountNumber}</Text>
            <Text style={styles.bankName}>{wallet.bankName}</Text>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(wallet.balance)}</Text>
            {wallet.lockedBalance > 0 && (
              <Text style={styles.lockedBalance}>
                ₵{wallet.lockedBalance.toFixed(2)} locked
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Add Money', 'Add money feature coming soon!')}
        >
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={styles.actionText}>Add Money</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Send Money', 'Send money feature coming soon!')}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Send Money</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Pay Bills', 'Pay bills feature coming soon!')}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>Pay Bills</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Withdraw', 'Withdraw feature coming soon!')}
        >
          <Text style={styles.actionIcon}>🏦</Text>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.transactionsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {transactions.length === 0 ? (
        <View style={styles.emptyTransactions}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Your transaction history will appear here
          </Text>
        </View>
      ) : (
        <View style={styles.transactionsList}>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionIcon}>
                  {getTransactionIcon(transaction.type, transaction.category)}
                </Text>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.createdAt)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  { color: getTransactionColor(transaction.type) }
                ]}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </Text>
                <Text style={[
                  styles.transactionStatus,
                  { color: transaction.status === 'completed' ? colors.success : colors.warning }
                ]}>
                  {transaction.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderWalletHeader()}
      {renderQuickActions()}
      {renderTransactions()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  walletHeader: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  walletCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.xl,
    ...shadows.card,
  },
  walletInfo: {
    marginBottom: spacing.lg,
  },
  walletLabel: {
    ...typography.h5,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  accountNumber: {
    ...typography.h4,
    color: colors.textWhite,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  bankName: {
    ...typography.body,
    color: colors.textWhite,
    opacity: 0.8,
  },
  balanceContainer: {
    alignItems: 'center',
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
  lockedBalance: {
    ...typography.caption,
    color: colors.textWhite,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  quickActions: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.button,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  transactionsSection: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  seeAllText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  transactionsList: {
    paddingHorizontal: spacing.lg,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  transactionStatus: {
    ...typography.caption,
    textTransform: 'capitalize',
  },
  emptyTransactions: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});