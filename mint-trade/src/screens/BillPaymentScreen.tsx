import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { BillPaymentService } from '../services/billPaymentService';
import { BillProvider, BillAccount, BillPayment, BillCategory } from '../types/payments';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const BillPaymentScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pay' | 'accounts' | 'history'>('pay');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<BillProvider | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<BillAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [categories, setCategories] = useState<BillCategory[]>([]);
  const [providers, setProviders] = useState<BillProvider[]>([]);
  const [accounts, setAccounts] = useState<BillAccount[]>([]);
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const billService = BillPaymentService.getInstance();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProvidersByCategory();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (activeTab === 'accounts') {
      loadAccounts();
    } else if (activeTab === 'history') {
      loadPaymentHistory();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const billCategories = billService.getBillCategories();
      setCategories(billCategories);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProvidersByCategory = () => {
    const categoryProviders = billService.getBillProvidersByCategory(selectedCategory);
    setProviders(categoryProviders);
  };

  const loadAccounts = async () => {
    try {
      // Mock user ID
      const userId = 'current_user_id';
      const userAccounts = await billService.getBillAccounts(userId);
      setAccounts(userAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      // Mock user ID
      const userId = 'current_user_id';
      const userPayments = await billService.getBillPaymentHistory(userId, 20);
      setPayments(userPayments);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handleValidateAccount = async () => {
    if (!selectedProvider || !accountNumber) {
      Alert.alert('Error', 'Please select a provider and enter account number');
      return;
    }

    setLoading(true);
    try {
      const validation = await billService.validateAccountNumber(
        selectedProvider.id,
        accountNumber
      );

      if (validation.isValid) {
        setCustomerName(validation.customerName || '');
        if (validation.amount) {
          setAmount(validation.amount.toString());
        }
        Alert.alert('Success', 'Account validated successfully!');
      } else {
        Alert.alert('Error', validation.error || 'Invalid account number');
      }
    } catch (error) {
      console.error('Error validating account:', error);
      Alert.alert('Error', 'Failed to validate account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async () => {
    const amountValue = parseFloat(amount);
    
    if (!amountValue || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedProvider || !paymentMethod) {
      Alert.alert('Error', 'Please select a provider and payment method');
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        userId: 'current_user_id',
        providerId: selectedProvider.id,
        accountId: selectedAccount?.id || '',
        amount: amountValue,
        currency: 'GHS' as const,
        description: `Payment to ${selectedProvider.name}`,
        paymentMethod: paymentMethod as any,
        transactionFee: billService.calculatePaymentFees(
          selectedProvider.id,
          paymentMethod,
          amountValue
        ),
      };

      const paymentId = await billService.payBill(paymentData);
      
      Alert.alert(
        'Success',
        `Bill paid successfully! Reference: ${paymentId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setAccountNumber('');
              setCustomerName('');
              setSelectedProvider(null);
              setSelectedAccount(null);
              setPaymentMethod('');
              loadPaymentHistory();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error paying bill:', error);
      Alert.alert('Error', 'Failed to pay bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    setShowAccountModal(true);
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'pay', label: 'Pay Bill', icon: '💳' },
        { id: 'accounts', label: 'Accounts', icon: '📋' },
        { id: 'history', label: 'History', icon: '📊' },
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

  const renderPayTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pay Bills</Text>
        
        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Provider Selection */}
        {selectedCategory && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Provider</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerButton,
                    selectedProvider?.id === provider.id && styles.providerButtonActive
                  ]}
                  onPress={() => setSelectedProvider(provider)}
                >
                  <Text style={styles.providerIcon}>{provider.logo}</Text>
                  <Text style={[
                    styles.providerText,
                    selectedProvider?.id === provider.id && styles.providerTextActive
                  ]}>
                    {provider.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Account Number */}
        {selectedProvider && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Number</Text>
            <View style={styles.accountInputContainer}>
              <TextInput
                style={styles.accountInput}
                placeholder="Enter account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
              <TouchableOpacity
                style={styles.validateButton}
                onPress={handleValidateAccount}
                disabled={loading}
              >
                <Text style={styles.validateButtonText}>
                  {loading ? '...' : 'Validate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Customer Name */}
        {customerName && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Customer Name</Text>
            <Text style={styles.customerName}>{customerName}</Text>
          </View>
        )}

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount (₵)</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Payment Method */}
        {selectedProvider && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.paymentMethodsContainer}>
              {selectedProvider.supportedMethods.map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === method && styles.paymentMethodButtonActive
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={styles.paymentMethodIcon}>
                    {method === 'mobile_money' ? '📱' : 
                     method === 'card' ? '💳' : '🏦'}
                  </Text>
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === method && styles.paymentMethodTextActive
                  ]}>
                    {method.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payButton, (!selectedProvider || !paymentMethod) && styles.payButtonDisabled]}
          onPress={handlePayBill}
          disabled={!selectedProvider || !paymentMethod || loading}
        >
          <Text style={styles.payButtonText}>
            {loading ? 'Processing...' : 'Pay Bill'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderAccountsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.accountsHeader}>
          <Text style={styles.sectionTitle}>Saved Accounts</Text>
          <TouchableOpacity style={styles.addAccountButton} onPress={handleAddAccount}>
            <Text style={styles.addAccountButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        
        {accounts.map((account) => (
          <View key={account.id} style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.accountName}</Text>
              <Text style={styles.accountNumber}>{account.accountNumber}</Text>
              <Text style={styles.accountProvider}>{account.providerId}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.payFromAccountButton}
              onPress={() => {
                setSelectedAccount(account);
                setActiveTab('pay');
              }}
            >
              <Text style={styles.payFromAccountButtonText}>Pay</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        
        {payments.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentAmount}>₵{payment.amount.toFixed(2)}</Text>
              <Text style={[
                styles.paymentStatus,
                { color: getPaymentStatusColor(payment.status) }
              ]}>
                {payment.status.toUpperCase()}
              </Text>
            </View>
            
            <Text style={styles.paymentDescription}>{payment.description}</Text>
            <Text style={styles.paymentReference}>Ref: {payment.reference}</Text>
            
            <View style={styles.paymentFooter}>
              <Text style={styles.paymentDate}>
                {payment.createdAt.toLocaleDateString()}
              </Text>
              <Text style={styles.paymentMethod}>
                {payment.paymentMethod.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAddAccountModal = () => (
    <Modal
      visible={showAccountModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAccountModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowAccountModal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Bill Account</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.comingSoonText}>Add account feature coming soon!</Text>
        </ScrollView>
      </View>
    </Modal>
  );

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return colors.success;
      case 'failed': return colors.error;
      case 'pending': return colors.warning;
      case 'processing': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bill Payments</Text>
        <Text style={styles.subtitle}>Pay your bills instantly</Text>
      </View>

      {/* Tab Selector */}
      {renderTabSelector()}

      {/* Content */}
      {activeTab === 'pay' && renderPayTab()}
      {activeTab === 'accounts' && renderAccountsTab()}
      {activeTab === 'history' && renderHistoryTab()}

      {/* Add Account Modal */}
      {renderAddAccountModal()}
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
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  categoryButton: {
    alignItems: 'center',
    padding: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.textWhite,
  },
  providerButton: {
    alignItems: 'center',
    padding: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
  },
  providerButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  providerIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  providerText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  providerTextActive: {
    color: colors.textWhite,
  },
  accountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountInput: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  validateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  validateButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  customerName: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountInput: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  paymentMethodButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },
  paymentMethodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  paymentMethodText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  paymentMethodTextActive: {
    color: colors.textWhite,
  },
  payButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  payButtonDisabled: {
    backgroundColor: colors.border,
  },
  payButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontSize: 18,
  },
  accountsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addAccountButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addAccountButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  accountCard: {
    flexDirection: 'row',
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
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  accountProvider: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  payFromAccountButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  payFromAccountButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  paymentAmount: {
    ...typography.h5,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  paymentStatus: {
    ...typography.caption,
    fontWeight: '600',
  },
  paymentDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  paymentReference: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  paymentMethod: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  comingSoonText: {
    ...typography.h4,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});