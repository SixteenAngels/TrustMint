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
  Dimensions,
} from 'react-native';
import { P2PService } from '../services/p2pService';
import { P2PTransfer, P2PContact, QRCodeData } from '../types/payments';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

const { width: screenWidth } = Dimensions.get('window');

export const P2PPaymentScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'history' | 'contacts'>('send');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [contacts, setContacts] = useState<P2PContact[]>([]);
  const [transfers, setTransfers] = useState<P2PTransfer[]>([]);
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const p2pService = P2PService.getInstance();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'contacts') {
      loadContacts();
    } else if (activeTab === 'history') {
      loadTransfers();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadContacts(),
        loadTransfers(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      // Mock user ID
      const userId = 'current_user_id';
      const userContacts = await p2pService.getContacts(userId);
      setContacts(userContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadTransfers = async () => {
    try {
      // Mock user ID
      const userId = 'current_user_id';
      const userTransfers = await p2pService.getP2PTransfers(userId, 20);
      setTransfers(userTransfers);
    } catch (error) {
      console.error('Error loading transfers:', error);
    }
  };

  const handleSendMoney = async () => {
    const amountValue = parseFloat(amount);
    
    if (!amountValue || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!recipient) {
      Alert.alert('Error', 'Please enter recipient details');
      return;
    }

    setLoading(true);
    try {
      const transferData = {
        senderId: 'current_user_id',
        recipientId: recipient,
        amount: amountValue,
        currency: 'GHS' as const,
        description: description || 'P2P Transfer',
        method: 'phone_number' as const,
        recipientInfo: {
          phone: recipient,
        },
        transactionFee: 0,
        createdAt: new Date(),
      };

      const transferId = await p2pService.sendP2PTransfer(transferData);
      
      Alert.alert(
        'Success',
        `₵${amountValue.toFixed(2)} sent successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setDescription('');
              setRecipient('');
              loadTransfers();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error sending money:', error);
      Alert.alert('Error', 'Failed to send money. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    const amountValue = parseFloat(amount);
    
    if (!amountValue || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const qrData = await p2pService.generatePaymentQRCode(
        'current_user_id',
        amountValue,
        description
      );
      
      setQrCode(qrData);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    Alert.alert('Scan QR Code', 'QR code scanning feature coming soon!');
  };

  const handleAddContact = () => {
    Alert.alert('Add Contact', 'Add contact feature coming soon!');
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'send', label: 'Send', icon: '📤' },
        { id: 'receive', label: 'Receive', icon: '📥' },
        { id: 'history', label: 'History', icon: '📋' },
        { id: 'contacts', label: 'Contacts', icon: '👥' },
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

  const renderSendTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send Money</Text>
        
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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Recipient</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Phone number or username"
            value={recipient}
            onChangeText={setRecipient}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What's this for?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.sendButton]}
            onPress={handleSendMoney}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading ? 'Sending...' : 'Send Money'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleScanQR}>
            <Text style={styles.quickActionIcon}>📷</Text>
            <Text style={styles.quickActionText}>Scan QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleAddContact}>
            <Text style={styles.quickActionIcon}>👤</Text>
            <Text style={styles.quickActionText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderReceiveTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receive Money</Text>
        
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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What's this for?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.generateQRButton]}
          onPress={handleGenerateQR}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? 'Generating...' : 'Generate QR Code'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Wallet Address</Text>
        <View style={styles.walletAddressCard}>
          <Text style={styles.walletAddressLabel}>Wallet Address</Text>
          <Text style={styles.walletAddressValue}>MT1234567890ABCD</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {transfers.map((transfer) => (
          <View key={transfer.id} style={styles.transferCard}>
            <View style={styles.transferHeader}>
              <Text style={styles.transferAmount}>
                {transfer.senderId === 'current_user_id' ? '-' : '+'}₵{transfer.amount.toFixed(2)}
              </Text>
              <Text style={[
                styles.transferStatus,
                { color: getStatusColor(transfer.status) }
              ]}>
                {transfer.status.toUpperCase()}
              </Text>
            </View>
            
            <Text style={styles.transferDescription}>
              {transfer.description}
            </Text>
            
            <View style={styles.transferFooter}>
              <Text style={styles.transferDate}>
                {transfer.createdAt.toLocaleDateString()}
              </Text>
              <Text style={styles.transferMethod}>
                {transfer.method.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderContactsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.contactsHeader}>
          <Text style={styles.sectionTitle}>Contacts</Text>
          <TouchableOpacity style={styles.addContactButton} onPress={handleAddContact}>
            <Text style={styles.addContactButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.displayName}</Text>
              <Text style={styles.contactDetails}>
                {contact.phoneNumber || contact.username || contact.walletAddress}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.sendToContactButton}
              onPress={() => {
                setRecipient(contact.phoneNumber || contact.username || contact.walletAddress || '');
                setActiveTab('send');
              }}
            >
              <Text style={styles.sendToContactButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderQRModal = () => (
    <Modal
      visible={showQRModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowQRModal(false)}
    >
      <View style={styles.qrModalContainer}>
        <View style={styles.qrModalHeader}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowQRModal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.qrModalTitle}>Payment QR Code</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.qrContent}>
          <View style={styles.qrCodeContainer}>
            <Text style={styles.qrCodePlaceholder}>QR CODE</Text>
            <Text style={styles.qrCodeText}>📱</Text>
          </View>
          
          <Text style={styles.qrAmount}>₵{amount}</Text>
          <Text style={styles.qrDescription}>{description || 'Payment Request'}</Text>
          
          <View style={styles.qrActions}>
            <TouchableOpacity style={styles.qrActionButton}>
              <Text style={styles.qrActionButtonText}>Share QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qrActionButton}>
              <Text style={styles.qrActionButtonText}>Save Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return colors.success;
      case 'failed': return colors.error;
      case 'pending': return colors.warning;
      case 'processing': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  if (loading && activeTab === 'send') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>P2P Payments</Text>
        <Text style={styles.subtitle}>Send and receive money instantly</Text>
      </View>

      {/* Tab Selector */}
      {renderTabSelector()}

      {/* Content */}
      {activeTab === 'send' && renderSendTab()}
      {activeTab === 'receive' && renderReceiveTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'contacts' && renderContactsTab()}

      {/* QR Modal */}
      {renderQRModal()}
    </View>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
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
  textInput: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textPrimary,
  },
  actionButtons: {
    marginTop: spacing.lg,
  },
  actionButton: {
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: colors.primary,
  },
  generateQRButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontSize: 18,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  walletAddressCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  walletAddressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  walletAddressValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  copyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  transferCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  transferAmount: {
    ...typography.h5,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  transferStatus: {
    ...typography.caption,
    fontWeight: '600',
  },
  transferDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  transferFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transferDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  transferMethod: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addContactButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addContactButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  contactDetails: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sendToContactButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  sendToContactButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  qrModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  qrModalHeader: {
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
  qrModalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  qrContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  qrCodeContainer: {
    width: 200,
    height: 200,
    backgroundColor: colors.background,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  qrCodePlaceholder: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  qrCodeText: {
    fontSize: 48,
  },
  qrAmount: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  qrDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  qrActionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  qrActionButtonText: {
    ...typography.bodyMedium,
    color: colors.textWhite,
    fontWeight: '600',
  },
});