import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

const { width: screenWidth } = Dimensions.get('window');

export const BankingDashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'cards' | 'loans' | 'investments'>('overview');
  const [loading, setLoading] = useState(false);

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'accounts', label: 'Accounts', icon: '🏦' },
        { id: 'cards', label: 'Cards', icon: '💳' },
        { id: 'loans', label: 'Loans', icon: '💰' },
        { id: 'investments', label: 'Investments', icon: '📈' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab(tab.id as any)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.tabTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Net Worth Card */}
      <View style={styles.section}>
        <View style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Total Net Worth</Text>
          <Text style={styles.netWorthAmount}>₵125,450.00</Text>
          <Text style={styles.netWorthChange}>+₵2,340.50 (1.9%) this month</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₵45,230.00</Text>
            <Text style={styles.statLabel}>Total Assets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₵12,450.00</Text>
            <Text style={styles.statLabel}>Total Liabilities</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₵8,920.00</Text>
            <Text style={styles.statLabel}>Monthly Income</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₵5,680.00</Text>
            <Text style={styles.statLabel}>Monthly Expenses</Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {[
          { id: '1', description: 'Salary Deposit', amount: '+₵8,920.00', date: 'Today', type: 'credit' },
          { id: '2', description: 'Grocery Shopping', amount: '-₵450.00', date: 'Yesterday', type: 'debit' },
          { id: '3', description: 'Investment Return', amount: '+₵1,250.00', date: '2 days ago', type: 'credit' },
          { id: '4', description: 'Utility Bill', amount: '-₵320.00', date: '3 days ago', type: 'debit' },
        ].map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: transaction.type === 'credit' ? colors.success : colors.error }
            ]}>
              {transaction.amount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAccountsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bank Accounts</Text>
        {[
          { id: '1', name: 'Mint Trade Savings', accountNumber: '****1234', balance: '₵25,450.00', type: 'savings' },
          { id: '2', name: 'Mint Trade Checking', accountNumber: '****5678', balance: '₵12,340.00', type: 'checking' },
          { id: '3', name: 'GCB Bank Account', accountNumber: '****9012', balance: '₵7,660.00', type: 'external' },
        ].map((account) => (
          <View key={account.id} style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountNumber}>{account.accountNumber}</Text>
            </View>
            <View style={styles.accountBalance}>
              <Text style={styles.balanceAmount}>{account.balance}</Text>
              <Text style={styles.accountType}>{account.type.toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderCardsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credit Cards</Text>
        {[
          { id: '1', name: 'Mint Trade Visa', cardNumber: '****1234', limit: '₵15,000', used: '₵3,450', type: 'visa' },
          { id: '2', name: 'Mint Trade Mastercard', cardNumber: '****5678', limit: '₵25,000', used: '₵8,920', type: 'mastercard' },
        ].map((card) => (
          <View key={card.id} style={styles.cardCard}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={styles.cardNumber}>{card.cardNumber}</Text>
            </View>
            <View style={styles.cardLimit}>
              <Text style={styles.limitAmount}>₵{card.used} / ₵{card.limit}</Text>
              <View style={styles.limitBar}>
                <View style={[styles.limitFill, { width: `${(parseInt(card.used.replace(/[₵,]/g, '')) / parseInt(card.limit.replace(/[₵,]/g, ''))) * 100}%` }]} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderLoansTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Loans</Text>
        {[
          { id: '1', name: 'Personal Loan', amount: '₵25,000', remaining: '₵18,500', monthly: '₵1,250', type: 'personal' },
          { id: '2', name: 'Auto Loan', amount: '₵45,000', remaining: '₵32,000', monthly: '₵2,100', type: 'auto' },
        ].map((loan) => (
          <View key={loan.id} style={styles.loanCard}>
            <View style={styles.loanInfo}>
              <Text style={styles.loanName}>{loan.name}</Text>
              <Text style={styles.loanAmount}>Original: {loan.amount}</Text>
            </View>
            <View style={styles.loanDetails}>
              <Text style={styles.loanRemaining}>Remaining: {loan.remaining}</Text>
              <Text style={styles.loanMonthly}>Monthly: {loan.monthly}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderInvestmentsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investment Portfolio</Text>
        {[
          { id: '1', name: 'Ghana Growth Fund', value: '₵15,230.00', gain: '+₵1,450.00', gainPercent: '+10.5%', type: 'mutual_fund' },
          { id: '2', name: 'Tech Innovation Vault', value: '₵8,920.00', gain: '+₵890.00', gainPercent: '+11.1%', type: 'vault' },
          { id: '3', name: 'MTN Stock', value: '₵5,450.00', gain: '-₵230.00', gainPercent: '-4.2%', type: 'stock' },
        ].map((investment) => (
          <View key={investment.id} style={styles.investmentCard}>
            <View style={styles.investmentInfo}>
              <Text style={styles.investmentName}>{investment.name}</Text>
              <Text style={styles.investmentType}>{investment.type.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={styles.investmentValue}>
              <Text style={styles.investmentAmount}>{investment.value}</Text>
              <Text style={[
                styles.investmentGain,
                { color: investment.gain.startsWith('+') ? colors.success : colors.error }
              ]}>
                {investment.gain} ({investment.gainPercent})
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Banking Dashboard</Text>
        <Text style={styles.subtitle}>Your complete financial overview</Text>
      </View>

      {/* Tab Selector */}
      {renderTabSelector()}

      {/* Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'accounts' && renderAccountsTab()}
      {activeTab === 'cards' && renderCardsTab()}
      {activeTab === 'loans' && renderLoansTab()}
      {activeTab === 'investments' && renderInvestmentsTab()}
    </View>
  );
};

const styles = StyleSheet.create({
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
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
  section: {
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
  netWorthCard: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  netWorthLabel: {
    ...typography.body,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  netWorthAmount: {
    ...typography.h1,
    color: colors.textWhite,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  netWorthChange: {
    ...typography.body,
    color: colors.textWhite,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h5,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  transactionDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  transactionAmount: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  accountNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  accountType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  cardNumber: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardLimit: {
    flex: 1,
  },
  limitAmount: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  limitBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  limitFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  loanCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  loanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  loanName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  loanAmount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  loanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loanRemaining: {
    ...typography.body,
    color: colors.textPrimary,
  },
  loanMonthly: {
    ...typography.body,
    color: colors.textSecondary,
  },
  investmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  investmentType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  investmentValue: {
    alignItems: 'flex-end',
  },
  investmentAmount: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  investmentGain: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});