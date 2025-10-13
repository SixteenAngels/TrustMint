import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PaymentService, PaymentMethod } from '../services/paymentService';
import { useWallet } from '../contexts/WalletContext';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface AddMoneyScreenProps {
  onClose: () => void;
}

export const AddMoneyScreen: React.FC<AddMoneyScreenProps> = ({ onClose }) => {
  const { wallet, refreshWallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const paymentService = PaymentService.getInstance();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = () => {
    const methods = paymentService.getPaymentMethods();
    setPaymentMethods(methods);
    setSelectedMethod(methods[0]); // Default to first method
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const calculateFees = () => {
    if (!selectedMethod || !amount) return 0;
    const amountValue = parseFloat(amount) || 0;
    return paymentService.calculateFees(amountValue, selectedMethod);
  };

  const getTotalAmount = () => {
    if (!selectedMethod || !amount) return 0;
    const amountValue = parseFloat(amount) || 0;
    return paymentService.getTotalAmount(amountValue, selectedMethod);
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
  };

  const handleAddMoney = async () => {
    const amountValue = parseFloat(amount);
    
    if (!amountValue || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountValue < 1) {
      Alert.alert('Error', 'Minimum amount is ₵1.00');
      return;
    }

    if (amountValue > 10000) {
      Alert.alert('Error', 'Maximum amount is ₵10,000.00');
      return;
    }

    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      let paymentResponse;

      switch (selectedMethod.type) {
        case 'mobile_money':
          // For demo, we'll use a mock phone number
          paymentResponse = await paymentService.processMobileMoneyPayment(
            amountValue,
            '+233XXXXXXXXX', // In real app, get from user profile
            selectedMethod.id.includes('mtn') ? 'MTN' : 
            selectedMethod.id.includes('vodafone') ? 'VODAFONE' : 'AIRTELTIGO',
            `Add money to Mint Wallet`
          );
          break;
        
        case 'card':
          // For demo, we'll show a card input form
          Alert.alert('Card Payment', 'Card payment integration coming soon!');
          setProcessing(false);
          return;
        
        case 'bank_transfer':
          // For demo, we'll show bank transfer details
          Alert.alert('Bank Transfer', 'Bank transfer integration coming soon!');
          setProcessing(false);
          return;
        
        default:
          throw new Error('Unsupported payment method');
      }

      if (paymentResponse.success) {
        Alert.alert(
          'Payment Initiated',
          'Please complete the payment on your mobile money app. You will be notified when the payment is confirmed.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back or refresh wallet
                refreshWallet();
              }
            }
          ]
        );
      } else {
        Alert.alert('Payment Failed', paymentResponse.message);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedMethod?.id === method.id && styles.selectedPaymentMethod
      ]}
      onPress={() => setSelectedMethod(method)}
    >
      <View style={styles.paymentMethodLeft}>
        <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodName}>{method.name}</Text>
          <Text style={styles.paymentMethodFees}>
            Fee: {method.fees.percentage}% + ₵{method.fees.fixed}
          </Text>
        </View>
      </View>
      <View style={styles.paymentMethodRight}>
        <View style={[
          styles.radioButton,
          selectedMethod?.id === method.id && styles.radioButtonSelected
        ]}>
          {selectedMethod?.id === method.id && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Money</Text>
          <Text style={styles.subtitle}>Fund your Mint Wallet</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₵</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          <Text style={styles.amountHelper}>
            Minimum: ₵1.00 • Maximum: ₵10,000.00
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Fee Breakdown */}
        {amount && selectedMethod && (
          <View style={styles.feeBreakdown}>
            <Text style={styles.sectionTitle}>Fee Breakdown</Text>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Amount</Text>
              <Text style={styles.feeValue}>{formatCurrency(parseFloat(amount) || 0)}</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Fee</Text>
              <Text style={styles.feeValue}>{formatCurrency(calculateFees())}</Text>
            </View>
            <View style={[styles.feeItem, styles.totalFeeItem]}>
              <Text style={styles.totalFeeLabel}>Total</Text>
              <Text style={styles.totalFeeValue}>{formatCurrency(getTotalAmount())}</Text>
            </View>
          </View>
        )}

        {/* Add Money Button */}
        <TouchableOpacity
          style={[
            styles.addMoneyButton,
            (!amount || !selectedMethod || processing) && styles.addMoneyButtonDisabled
          ]}
          onPress={handleAddMoney}
          disabled={!amount || !selectedMethod || processing}
        >
          <Text style={styles.addMoneyButtonText}>
            {processing ? 'Processing...' : `Add ${formatCurrency(getTotalAmount())}`}
          </Text>
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Your payment is secured by Zeepay and protected by Bank of Ghana regulations.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.xxxl,
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
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  amountSection: {
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
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencySymbol: {
    ...typography.h3,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 32,
  },
  amountHelper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  paymentMethodsSection: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedPaymentMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  paymentMethodFees: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  paymentMethodRight: {
    marginLeft: spacing.md,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  feeBreakdown: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  feeLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  feeValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalFeeItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  totalFeeLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalFeeValue: {
    ...typography.h5,
    color: colors.primary,
    fontWeight: '700',
  },
  addMoneyButton: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.button,
  },
  addMoneyButtonDisabled: {
    backgroundColor: colors.border,
  },
  addMoneyButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontSize: 18,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  securityText: {
    ...typography.caption,
    color: colors.success,
    flex: 1,
  },
});