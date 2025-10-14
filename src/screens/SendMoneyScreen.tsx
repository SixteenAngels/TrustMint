import React, { useState } from 'react';
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
import { useWallet } from '../contexts/WalletContext';
import { WalletService } from '../services/walletService';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface SendMoneyScreenProps {
  onClose: () => void;
}

export const SendMoneyScreen: React.FC<SendMoneyScreenProps> = ({ onClose }) => {
  const { wallet, refreshWallet } = useWallet();
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const walletService = WalletService.getInstance();

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
  };

  const handlePhoneChange = (text: string) => {
    // Format phone number
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '+233' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+233')) {
      cleaned = '+233' + cleaned;
    }
    setRecipientPhone(cleaned);
  };

  const handleSendMoney = async () => {
    const amountValue = parseFloat(amount);
    
    if (!recipientPhone || recipientPhone.length < 13) {
      Alert.alert('Error', 'Please enter a valid Ghana phone number');
      return;
    }

    if (!amountValue || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountValue < 1) {
      Alert.alert('Error', 'Minimum amount is ₵1.00');
      return;
    }

    if (!wallet || wallet.balance < amountValue) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (amountValue > wallet.balance) {
      Alert.alert('Error', 'Amount exceeds available balance');
      return;
    }

    setSending(true);

    try {
      const result = await walletService.sendMoney(
        wallet.userId,
        recipientPhone,
        amountValue,
        description || 'Money transfer via Mint Trade'
      );

      Alert.alert(
        'Money Sent!',
        `₵${amountValue.toFixed(2)} has been sent to ${recipientPhone}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and refresh wallet
              setRecipientPhone('');
              setAmount('');
              setDescription('');
              refreshWallet();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error sending money:', error);
      Alert.alert('Error', 'Failed to send money. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getAvailableBalance = () => {
    return wallet ? wallet.balance : 0;
  };

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
          <Text style={styles.title}>Send Money</Text>
          <Text style={styles.subtitle}>Transfer to any Mint Trade user</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(getAvailableBalance())}</Text>
        </View>

        {/* Recipient Phone */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Recipient Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>🇬🇭 +233</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="XXXXXXXXX"
              value={recipientPhone.replace('+233', '')}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              autoFocus
            />
          </View>
          <Text style={styles.inputHelper}>
            Enter the recipient's Ghana phone number
          </Text>
        </View>

        {/* Amount */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₵</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.inputHelper}>
            Minimum: ₵1.00 • Maximum: ₵{formatCurrency(getAvailableBalance())}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="What's this for?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountsSection}>
          <Text style={styles.sectionTitle}>Quick Amounts</Text>
          <View style={styles.quickAmountsGrid}>
            {[10, 25, 50, 100, 200, 500].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  amount === quickAmount.toString() && styles.quickAmountButtonSelected
                ]}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={[
                  styles.quickAmountText,
                  amount === quickAmount.toString() && styles.quickAmountTextSelected
                ]}>
                  ₵{quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!recipientPhone || !amount || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMoney}
          disabled={!recipientPhone || !amount || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? 'Sending...' : `Send ${formatCurrency(parseFloat(amount) || 0)}`}
          </Text>
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            All transfers are secure and instant. Recipients will receive a notification.
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
  balanceCard: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.card,
  },
  balanceLabel: {
    ...typography.body,
    color: colors.textWhite,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    ...typography.h3,
    color: colors.textWhite,
    fontWeight: '700',
  },
  inputSection: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  inputLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryCode: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  phoneInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencySymbol: {
    ...typography.h4,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    ...typography.h4,
    color: colors.textPrimary,
    fontSize: 24,
  },
  descriptionInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  inputHelper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  quickAmountsSection: {
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
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '30%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickAmountText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  quickAmountTextSelected: {
    color: colors.textWhite,
  },
  sendButton: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.button,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  sendButtonText: {
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