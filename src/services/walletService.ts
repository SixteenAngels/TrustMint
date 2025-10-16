import firestore, { type FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import { Wallet, WalletTransaction, VirtualAccount, WalletSettings, P2PTransfer, BillPayment, AutoSaveRule } from '../types/wallet';

const db = firestore();

export class WalletService {
  private static instance: WalletService;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Create new wallet for user
  async createWallet(userId: string, userInfo: { name: string; phone: string }): Promise<Wallet> {
    try {
      const createWalletFunction = functions().httpsCallable('createWallet');
      const result = await createWalletFunction({
        userId,
        userInfo
      });
      
      return result.data as Wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  // Get user's wallet
  async getWallet(userId: string): Promise<Wallet | null> {
    try {
      const walletRef = db.collection('wallets').doc(userId);
      const walletDoc = await walletRef.get();
      
      if (walletDoc.exists) {
        const data = walletDoc.data();
        return {
          ...data,
          id: walletDoc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastTransactionAt: data.lastTransactionAt?.toDate(),
        } as Wallet;
      }
      return null;
    } catch (error) {
      console.error('Error getting wallet:', error);
      return null;
    }
  }

  // Update wallet balance
  async updateBalance(walletId: string, amount: number, type: 'add' | 'subtract'): Promise<void> {
    try {
      const walletRef = db.collection('wallets').doc(walletId);
      const walletDoc = await walletRef.get();
      
      if (!walletDoc.exists) {
        throw new Error('Wallet not found');
      }

      const currentBalance = walletDoc.data()?.balance || 0;
      const newBalance = type === 'add' ? currentBalance + amount : currentBalance - amount;
      
      if (newBalance < 0) {
        throw new Error('Insufficient funds');
      }

      await walletRef.update({
        balance: newBalance,
        totalBalance: newBalance + (walletDoc.data()?.lockedBalance || 0),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  // Create transaction
  async createTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction> {
    try {
      const transactionRef = await db.collection('walletTransactions').add({
        ...transaction,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      const newTransaction: WalletTransaction = {
        ...transaction,
        id: transactionRef.id,
        createdAt: new Date(),
      };

      // Update wallet balance
      await this.updateBalance(
        transaction.walletId,
        transaction.amount,
        transaction.type.includes('deposit') || transaction.type.includes('transfer_in') || transaction.type.includes('refund') ? 'add' : 'subtract'
      );

      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Get wallet transactions
  async getTransactions(userId: string, limit: number = 50): Promise<WalletTransaction[]> {
    try {
      const transactionsRef = db.collection('walletTransactions');
      const q = transactionsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');
      const snapshot = await q.get();
      
      return snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): WalletTransaction => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        } as WalletTransaction;
      }).slice(0, limit);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  // Get transaction by ID
  async getTransaction(transactionId: string): Promise<WalletTransaction | null> {
    try {
      const transactionRef = db.collection('walletTransactions').doc(transactionId);
      const transactionDoc = await transactionRef.get();
      
      if (transactionDoc.exists) {
        const data = transactionDoc.data();
        return {
          ...data,
          id: transactionDoc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        } as WalletTransaction;
      }
      return null;
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }

  // P2P Transfer
  async sendMoney(senderId: string, recipientPhone: string, amount: number, description: string): Promise<P2PTransfer> {
    try {
      const sendMoneyFunction = functions().httpsCallable('sendMoney');
      const result = await sendMoneyFunction({
        senderId,
        recipientPhone,
        amount,
        description
      });
      
      return result.data as P2PTransfer;
    } catch (error) {
      console.error('Error sending money:', error);
      throw error;
    }
  }

  // Request money
  async requestMoney(requesterId: string, senderPhone: string, amount: number, description: string): Promise<void> {
    try {
      const requestMoneyFunction = functions().httpsCallable('requestMoney');
      await requestMoneyFunction({
        requesterId,
        senderPhone,
        amount,
        description
      });
    } catch (error) {
      console.error('Error requesting money:', error);
      throw error;
    }
  }

  // Bill payment
  async payBill(userId: string, billType: string, provider: string, accountNumber: string, amount: number): Promise<BillPayment> {
    try {
      const payBillFunction = functions().httpsCallable('payBill');
      const result = await payBillFunction({
        userId,
        billType,
        provider,
        accountNumber,
        amount
      });
      
      return result.data as BillPayment;
    } catch (error) {
      console.error('Error paying bill:', error);
      throw error;
    }
  }

  // Get wallet settings
  async getWalletSettings(userId: string): Promise<WalletSettings | null> {
    try {
      const settingsRef = db.collection('walletSettings').doc(userId);
      const settingsDoc = await settingsRef.get();
      
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as WalletSettings;
      }
      return null;
    } catch (error) {
      console.error('Error getting wallet settings:', error);
      return null;
    }
  }

  // Update wallet settings
  async updateWalletSettings(userId: string, settings: Partial<WalletSettings>): Promise<void> {
    try {
      const settingsRef = db.collection('walletSettings').doc(userId);
      await settingsRef.set({
        ...settings,
        userId,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating wallet settings:', error);
      throw error;
    }
  }

  // Create auto-save rule
  async createAutoSaveRule(userId: string, rule: Omit<AutoSaveRule, 'id' | 'userId' | 'totalSaved' | 'createdAt' | 'updatedAt'>): Promise<AutoSaveRule> {
    try {
      const ruleRef = await db.collection('autoSaveRules').add({
        ...rule,
        userId,
        totalSaved: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return {
        ...rule,
        id: ruleRef.id,
        userId,
        totalSaved: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating auto-save rule:', error);
      throw error;
    }
  }

  // Get auto-save rules
  async getAutoSaveRules(userId: string): Promise<AutoSaveRule[]> {
    try {
      const rulesRef = db.collection('autoSaveRules');
      const q = rulesRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');
      const snapshot = await q.get();
      
      return snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): AutoSaveRule => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as AutoSaveRule;
      });
    } catch (error) {
      console.error('Error getting auto-save rules:', error);
      return [];
    }
  }

  // Generate virtual account number
  async generateVirtualAccount(userId: string, userInfo: { name: string; phone: string }): Promise<VirtualAccount> {
    try {
      const generateAccountFunction = functions().httpsCallable('generateVirtualAccount');
      const result = await generateAccountFunction({
        userId,
        userInfo
      });
      
      return result.data as VirtualAccount;
    } catch (error) {
      console.error('Error generating virtual account:', error);
      throw error;
    }
  }

  // Get wallet analytics
  async getWalletAnalytics(userId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
    try {
      const analyticsFunction = functions().httpsCallable('getWalletAnalytics');
      const result = await analyticsFunction({
        userId,
        period
      });
      
      return result.data;
    } catch (error) {
      console.error('Error getting wallet analytics:', error);
      throw error;
    }
  }
}
