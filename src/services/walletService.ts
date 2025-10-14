import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, orderBy, where, addDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase.config';
import { Wallet, WalletTransaction, VirtualAccount, WalletSettings, P2PTransfer, BillPayment, AutoSaveRule } from '../types/wallet';

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
      const createWalletFunction = httpsCallable(functions, 'createWallet');
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
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await getDoc(walletRef);
      
      if (walletDoc.exists()) {
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
      const walletRef = doc(db, 'wallets', walletId);
      const walletDoc = await getDoc(walletRef);
      
      if (!walletDoc.exists()) {
        throw new Error('Wallet not found');
      }

      const currentBalance = walletDoc.data().balance || 0;
      const newBalance = type === 'add' ? currentBalance + amount : currentBalance - amount;
      
      if (newBalance < 0) {
        throw new Error('Insufficient funds');
      }

      await updateDoc(walletRef, {
        balance: newBalance,
        totalBalance: newBalance + (walletDoc.data().lockedBalance || 0),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  // Create transaction
  async createTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction> {
    try {
      const transactionRef = await addDoc(collection(db, 'walletTransactions'), {
        ...transaction,
        createdAt: Timestamp.now(),
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
      const transactionsRef = collection(db, 'walletTransactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
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
      const transactionRef = doc(db, 'walletTransactions', transactionId);
      const transactionDoc = await getDoc(transactionRef);
      
      if (transactionDoc.exists()) {
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
      const sendMoneyFunction = httpsCallable(functions, 'sendMoney');
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
      const requestMoneyFunction = httpsCallable(functions, 'requestMoney');
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
      const payBillFunction = httpsCallable(functions, 'payBill');
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
      const settingsRef = doc(db, 'walletSettings', userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
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
      const settingsRef = doc(db, 'walletSettings', userId);
      await setDoc(settingsRef, {
        ...settings,
        userId,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating wallet settings:', error);
      throw error;
    }
  }

  // Create auto-save rule
  async createAutoSaveRule(userId: string, rule: Omit<AutoSaveRule, 'id' | 'userId' | 'totalSaved' | 'createdAt' | 'updatedAt'>): Promise<AutoSaveRule> {
    try {
      const ruleRef = await addDoc(collection(db, 'autoSaveRules'), {
        ...rule,
        userId,
        totalSaved: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
      const rulesRef = collection(db, 'autoSaveRules');
      const q = query(
        rulesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
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
      const generateAccountFunction = httpsCallable(functions, 'generateVirtualAccount');
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
      const analyticsFunction = httpsCallable(functions, 'getWalletAnalytics');
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