import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { WalletService } from '../services/walletService';
import { Wallet, WalletTransaction } from '../types/wallet';
import { AddMoneyScreen } from './AddMoneyScreen';
import { SendMoneyScreen } from './SendMoneyScreen';
import { P2PPaymentScreen } from './P2PPaymentScreen';
import { BillPaymentScreen } from './BillPaymentScreen';
import { AutoSaveScreen } from './AutoSaveScreen';
import { InvestmentVaultsScreen } from './InvestmentVaultsScreen';
import { BankingDashboardScreen } from './BankingDashboardScreen';
import { StockService } from '../services/stockService';
import { Stock } from '../types';
import { useNavigationContext } from '../contexts/NavigationContext';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors } from '../styles/colors';

export const WalletScreen: React.FC = () => {
  const { theme } = useTheme();
  const palette = theme.colors;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { switchTab } = useNavigationContext();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showP2P, setShowP2P] = useState(false);
  const [showBillPayment, setShowBillPayment] = useState(false);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const [showInvestmentVaults, setShowInvestmentVaults] = useState(false);
  const [showBankingDashboard, setShowBankingDashboard] = useState(false);
  const [cryptoQuotes, setCryptoQuotes] = useState<Stock[]>([]);

  const walletService = WalletService.getInstance();
  const cryptoService = StockService.getInstance('Crypto');

  const loadWalletData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Wallet loading timeout')), 10000)
      );

      // Get or create wallet with timeout
      let walletData: Wallet | null = null;
      try {
        walletData = await Promise.race([
          walletService.getWallet(user.uid),
          timeoutPromise
        ]) as Wallet | null;
      } catch (getError) {
        console.warn('Could not get wallet:', getError);
        walletData = null;
      }

      if (!walletData) {
        // Try to create wallet, but don't wait forever
        try {
          walletData = await Promise.race([
            walletService.createWallet(user.uid, {
              name: user.name || 'User',
              phone: user.phone,
            }),
            timeoutPromise
          ]) as Wallet;
        } catch (createError) {
          console.warn('Could not create wallet via Cloud Function, creating local wallet:', createError);
          // Create a local wallet object as fallback
          walletData = {
            id: user.uid,
            userId: user.uid,
            balance: 0,
            totalBalance: 0,
            lockedBalance: 0,
            currency: 'GHS',
            accountNumber: `MT${user.uid.substring(0, 8).toUpperCase()}`,
            bankCode: 'MINT',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Wallet;
        }
      }

      // Get transactions (don't block on this)
      let transactionsData: WalletTransaction[] = [];
      try {
        transactionsData = await Promise.race([
          walletService.getTransactions(user.uid, 20),
          timeoutPromise
        ]) as WalletTransaction[];
      } catch (txError) {
        console.warn('Could not load transactions:', txError);
        transactionsData = [];
      }

      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error: any) {
      console.error('Error loading wallet data:', error);
      
      // Create a fallback wallet so user can still see the screen
      const fallbackWallet: Wallet = {
        id: user?.uid || 'unknown',
        userId: user?.uid || 'unknown',
        balance: 0,
        totalBalance: 0,
        lockedBalance: 0,
        currency: 'GHS',
        accountNumber: `MT${(user?.uid || 'USER').substring(0, 8).toUpperCase()}`,
        bankCode: 'MINT',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setWallet(fallbackWallet);
      setTransactions([]);
      
      // Only show alert if it's not a timeout (timeout is expected)
      if (!error.message?.includes('timeout')) {
        Alert.alert('Warning', 'Could not load wallet data. Showing offline mode.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, walletService]);

  const loadCryptoQuotes = useCallback(async () => {
    try {
      const quotes = await cryptoService.fetchLiveData();
      setCryptoQuotes(quotes);
    } catch (error) {
      console.error('Error loading crypto quotes:', error);
      // Don't show alert for crypto quotes - it's not critical
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user, loadWalletData]);

  useEffect(() => {
    // Load crypto quotes after wallet data is loaded, with delay to avoid blocking
    if (user && !loading) {
      const timer = setTimeout(() => {
        loadCryptoQuotes();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, loadCryptoQuotes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadWalletData(), loadCryptoQuotes()]);
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
      ? palette.success
      : palette.error;
  };

  const renderWalletHeader = () => {
    const balance = wallet?.balance || 0;
    const accountNumber = wallet?.accountNumber || 'Creating...';
    const bankCode = wallet?.bankCode || 'Mint Bank';
    const lockedBalance = wallet?.lockedBalance || 0;

    return (
      <View style={styles.walletHeader}>
        <View style={styles.walletCard}>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Mint Wallet</Text>
            <Text style={styles.accountNumber}>{accountNumber}</Text>
            <Text style={styles.bankName}>{bankCode}</Text>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            {lockedBalance > 0 && (
              <Text style={styles.lockedBalance}>
                ₵{lockedBalance.toFixed(2)} locked
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
      <Text style={styles.sectionText}>Multi-currency wallet with instant settlements.</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddMoney(true)}
        >
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={styles.actionText}>Add Money</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowSendMoney(true)}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Send Money</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowBillPayment(true)}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>Pay Bills</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowP2P(true)}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionText}>P2P Pay</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAutoSave(true)}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionText}>Auto-Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowInvestmentVaults(true)}
        >
          <Text style={styles.actionIcon}>🏦</Text>
          <Text style={styles.actionText}>Vaults</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowBankingDashboard(true)}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Banking</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Convert Currency', 'Multi-currency conversions launching soon.')}
        >
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionText}>Convert</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExperienceHighlights = () => (
    <View style={styles.highlightsSection}>
      {[
        {
          title: '⚡ Instant Deposits',
          body: 'MTN Momo, Vodafone Cash and bank transfers settle in seconds with instant notifications.',
        },
        {
          title: '🧠 Smart Safeguards',
          body: 'Auto-save rules, round ups and vaults help you grow idle cash without thinking about it.',
        },
      ].map((item, index, arr) => (
        <View
          key={item.title}
          style={[styles.highlightCard, index === arr.length - 1 && styles.lastHighlightCard]}
        >
          <Text style={styles.highlightTitle}>{item.title}</Text>
          <Text style={styles.highlightBody}>{item.body}</Text>
        </View>
      ))}
    </View>
  );

  const renderLinkedAccounts = () => (
    <View style={styles.linkedAccounts}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Linked Accounts</Text>
        <TouchableOpacity onPress={() => Alert.alert('Linked Accounts', 'Manage linked banks coming soon.')}>
          <Text style={styles.seeAllText}>Manage</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bankCardsContainer}>
        {['CalBank ••••9234', 'Stanbic ••••6881', 'Fidelity ••••1042'].map((label, index) => (
          <View
            key={label}
            style={[
              styles.bankCard,
              index === 0 && styles.primaryBankCard,
            ]}
          >
            <Text style={styles.bankCardLabel}>{label}</Text>
            <Text style={styles.bankCardBalance}>
              ₵{((wallet?.balance || 0) / (index + 1) + 2500).toFixed(2)}
            </Text>
            <Text style={styles.bankCardSubtitle}>Settlement-ready</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderCryptoMarkets = () => (
    <View style={styles.cryptoSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Crypto Markets</Text>
        <TouchableOpacity onPress={() => switchTab('trading')}>
          <Text style={styles.seeAllText}>View Markets</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cryptoCardsContainer}>
        {(cryptoQuotes.length ? cryptoQuotes : []).slice(0, 6).map((asset) => {
          const changePositive = (asset.changePercent ?? 0) >= 0;
          return (
            <View key={asset.id} style={styles.cryptoCard}>
              <View style={styles.cryptoHeader}>
                <Text style={styles.cryptoSymbol}>{asset.symbol}</Text>
                <Text style={[styles.cryptoChange, { color: changePositive ? palette.success : palette.error }]}>
                  {(changePositive ? '+' : '') + (asset.changePercent ?? 0).toFixed(2)}%
                </Text>
              </View>
              <Text style={styles.cryptoPrice}>₵{asset.price.toFixed(2)}</Text>
              <Text style={styles.cryptoSubtitle}>24h change</Text>
            </View>
          );
        })}
        {cryptoQuotes.length === 0 && (
          <View style={styles.cryptoCard}>
            <Text style={styles.cryptoSymbol}>Fetching...</Text>
            <Text style={styles.cryptoSubtitle}>Loading latest quotes</Text>
          </View>
        )}
      </ScrollView>
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
                  { color: transaction.status === 'completed' ? palette.success : palette.warning }
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

  if (showAddMoney) {
    return (
      <AddMoneyScreen onClose={() => setShowAddMoney(false)} />
    );
  }

  if (showSendMoney) {
    return (
      <SendMoneyScreen onClose={() => setShowSendMoney(false)} />
    );
  }

  if (showP2P) {
    return (
      <P2PPaymentScreen />
    );
  }

  if (showBillPayment) {
    return (
      <BillPaymentScreen />
    );
  }

  if (showAutoSave) {
    return (
      <AutoSaveScreen />
    );
  }

  if (showInvestmentVaults) {
    return (
      <InvestmentVaultsScreen />
    );
  }

  if (showBankingDashboard) {
    return (
      <BankingDashboardScreen />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingBanner}>
            <Text style={styles.loadingText}>Loading wallet...</Text>
          </View>
        )}
        {renderWalletHeader()}
        {renderQuickActions()}
        {renderExperienceHighlights()}
        {renderLinkedAccounts()}
        {renderCryptoMarkets()}
        {renderTransactions()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: typeof defaultColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    loadingBanner: {
      backgroundColor: colors.primaryLight,
      padding: spacing.md,
      margin: spacing.lg,
      borderRadius: 12,
      alignItems: 'center',
    },
    loadingText: {
      ...typography.body,
      color: colors.primary,
    },
    bottomSpacing: {
      height: 100,
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
    sectionText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
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
    highlightsSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    highlightCard: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: spacing.lg,
      marginRight: spacing.md,
      ...shadows.card,
    },
    lastHighlightCard: {
      marginRight: 0,
    },
    highlightTitle: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    highlightBody: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    linkedAccounts: {
      backgroundColor: colors.backgroundSecondary,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      borderRadius: 16,
      paddingVertical: spacing.lg,
      ...shadows.card,
    },
    bankCardsContainer: {
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      gap: spacing.md,
    },
    bankCard: {
      width: 200,
      borderRadius: 16,
      padding: spacing.lg,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryBankCard: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    bankCardLabel: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    bankCardBalance: {
      ...typography.h4,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    bankCardSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    cryptoSection: {
      backgroundColor: colors.backgroundSecondary,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      borderRadius: 16,
      paddingVertical: spacing.lg,
      ...shadows.card,
    },
    cryptoCardsContainer: {
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      gap: spacing.md,
    },
    cryptoCard: {
      width: 160,
      borderRadius: 16,
      padding: spacing.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cryptoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    cryptoSymbol: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    cryptoPrice: {
      ...typography.h4,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    cryptoChange: {
      ...typography.caption,
      fontWeight: '600',
    },
    cryptoSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
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