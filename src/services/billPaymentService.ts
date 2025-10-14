import { 
  BillProvider, 
  BillAccount, 
  BillPayment, 
  BillCategory,
  BillHistory,
  BILL_PROVIDERS,
  BILL_CATEGORIES,
  BILL_PAYMENT_LIMITS
} from '../types/payments';
import { db } from '../../firebase.config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';

export class BillPaymentService {
  private static instance: BillPaymentService;

  static getInstance(): BillPaymentService {
    if (!BillPaymentService.instance) {
      BillPaymentService.instance = new BillPaymentService();
    }
    return BillPaymentService.instance;
  }

  // Get bill categories
  getBillCategories(): BillCategory[] {
    return BILL_CATEGORIES.filter(category => category.isActive);
  }

  // Get bill providers by category
  getBillProvidersByCategory(categoryId: string): BillProvider[] {
    return BILL_PROVIDERS.filter(provider => 
      provider.category === categoryId && provider.isActive
    );
  }

  // Get all bill providers
  getAllBillProviders(): BillProvider[] {
    return BILL_PROVIDERS.filter(provider => provider.isActive);
  }

  // Add bill account
  async addBillAccount(accountData: Omit<BillAccount, 'id' | 'createdAt' | 'totalPaid'>): Promise<string> {
    try {
      const accountRef = await addDoc(collection(db, 'billAccounts'), {
        ...accountData,
        totalPaid: 0,
        createdAt: serverTimestamp(),
      });

      return accountRef.id;
    } catch (error) {
      console.error('Error adding bill account:', error);
      throw error;
    }
  }

  // Get user's bill accounts
  async getBillAccounts(userId: string): Promise<BillAccount[]> {
    try {
      const accountsQuery = query(
        collection(db, 'billAccounts'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('isDefault', 'desc'),
        orderBy('lastPaid', 'desc')
      );

      const snapshot = await getDocs(accountsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastPaid: data.lastPaid?.toDate(),
        } as BillAccount;
      });
    } catch (error) {
      console.error('Error getting bill accounts:', error);
      throw error;
    }
  }

  // Update bill account
  async updateBillAccount(accountId: string, updates: Partial<BillAccount>): Promise<void> {
    try {
      await updateDoc(doc(db, 'billAccounts', accountId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating bill account:', error);
      throw error;
    }
  }

  // Delete bill account
  async deleteBillAccount(accountId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'billAccounts', accountId), {
        isActive: false,
        deletedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error deleting bill account:', error);
      throw error;
    }
  }

  // Pay bill
  async payBill(paymentData: Omit<BillPayment, 'id' | 'createdAt' | 'status' | 'reference'>): Promise<string> {
    try {
      // Validate payment limits
      await this.validatePaymentLimits(paymentData.userId, paymentData.amount);

      // Calculate total amount including fees
      const provider = this.getBillProvider(paymentData.providerId);
      const transactionFee = provider.fees[paymentData.paymentMethod];
      const totalAmount = paymentData.amount + transactionFee;

      // Check user balance
      await this.checkUserBalance(paymentData.userId, totalAmount);

      // Generate payment reference
      const reference = this.generatePaymentReference();

      // Create payment record
      const paymentRef = await addDoc(collection(db, 'billPayments'), {
        ...paymentData,
        totalAmount,
        reference,
        status: 'processing',
        createdAt: serverTimestamp(),
      });

      // Process payment
      await this.processBillPayment(paymentRef.id, paymentData, provider);

      return paymentRef.id;
    } catch (error) {
      console.error('Error paying bill:', error);
      throw error;
    }
  }

  // Process bill payment
  private async processBillPayment(
    paymentId: string, 
    paymentData: Omit<BillPayment, 'id' | 'createdAt' | 'status' | 'reference'>,
    provider: BillProvider
  ): Promise<void> {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update user balance
      await this.updateUserBalance(paymentData.userId, -paymentData.totalAmount);

      // Update payment status
      await updateDoc(doc(db, 'billPayments', paymentId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        providerReference: this.generateProviderReference(),
        receipt: this.generateReceipt(paymentId),
      });

      // Update bill account
      await this.updateBillAccountAfterPayment(paymentData.accountId, paymentData.amount);

      // Create bill history record
      await this.createBillHistoryRecord(paymentData, paymentId);
    } catch (error) {
      // Mark payment as failed
      await updateDoc(doc(db, 'billPayments', paymentId), {
        status: 'failed',
      });
      throw error;
    }
  }

  // Get bill payment history
  async getBillPaymentHistory(userId: string, limitCount: number = 20): Promise<BillPayment[]> {
    try {
      const paymentsQuery = query(
        collection(db, 'billPayments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(paymentsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        } as BillPayment;
      });
    } catch (error) {
      console.error('Error getting bill payment history:', error);
      throw error;
    }
  }

  // Get bill payment by ID
  async getBillPayment(paymentId: string): Promise<BillPayment | null> {
    try {
      const paymentDoc = await getDoc(doc(db, 'billPayments', paymentId));
      
      if (!paymentDoc.exists()) {
        return null;
      }

      const data = paymentDoc.data();
      return {
        id: paymentDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
      } as BillPayment;
    } catch (error) {
      console.error('Error getting bill payment:', error);
      throw error;
    }
  }

  // Get bill history for account
  async getBillHistory(accountId: string, limitCount: number = 20): Promise<BillHistory[]> {
    try {
      const historyQuery = query(
        collection(db, 'billHistory'),
        where('accountId', '==', accountId),
        orderBy('paidAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(historyQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          paidAt: data.paidAt?.toDate() || new Date(),
        } as BillHistory;
      });
    } catch (error) {
      console.error('Error getting bill history:', error);
      throw error;
    }
  }

  // Validate account number
  async validateAccountNumber(providerId: string, accountNumber: string): Promise<{
    isValid: boolean;
    customerName?: string;
    amount?: number;
    error?: string;
  }> {
    try {
      const provider = this.getBillProvider(providerId);
      
      // Mock validation - in real app, this would call provider API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate validation results
      if (accountNumber.length < 8) {
        return {
          isValid: false,
          error: 'Invalid account number format',
        };
      }

      return {
        isValid: true,
        customerName: 'John Doe',
        amount: Math.random() * 500 + 50, // Random amount between 50-550
      };
    } catch (error) {
      console.error('Error validating account number:', error);
      return {
        isValid: false,
        error: 'Unable to validate account number',
      };
    }
  }

  // Get payment methods for provider
  getPaymentMethodsForProvider(providerId: string): string[] {
    const provider = this.getBillProvider(providerId);
    return provider.supportedMethods;
  }

  // Calculate payment fees
  calculatePaymentFees(providerId: string, paymentMethod: string, amount: number): number {
    const provider = this.getBillProvider(providerId);
    const feeRate = provider.fees[paymentMethod as keyof typeof provider.fees];
    return amount * (feeRate / 100);
  }

  // Get provider by ID
  getBillProvider(providerId: string): BillProvider {
    const provider = BILL_PROVIDERS.find(p => p.id === providerId);
    if (!provider) {
      throw new Error('Bill provider not found');
    }
    return provider;
  }

  // Get category by ID
  getBillCategory(categoryId: string): BillCategory {
    const category = BILL_CATEGORIES.find(c => c.id === categoryId);
    if (!category) {
      throw new Error('Bill category not found');
    }
    return category;
  }

  // Helper methods
  private async validatePaymentLimits(userId: string, amount: number): Promise<void> {
    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyPaymentsQuery = query(
      collection(db, 'billPayments'),
      where('userId', '==', userId),
      where('createdAt', '>=', today),
      where('status', '==', 'completed')
    );

    const dailySnapshot = await getDocs(dailyPaymentsQuery);
    const dailyTotal = dailySnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

    if (dailyTotal + amount > BILL_PAYMENT_LIMITS.daily) {
      throw new Error(`Daily bill payment limit exceeded. Maximum: ₵${BILL_PAYMENT_LIMITS.daily}`);
    }

    if (amount > BILL_PAYMENT_LIMITS.perTransaction) {
      throw new Error(`Per transaction limit exceeded. Maximum: ₵${BILL_PAYMENT_LIMITS.perTransaction}`);
    }
  }

  private async checkUserBalance(userId: string, amount: number): Promise<void> {
    // This would check the user's wallet balance
    console.log(`Checking balance for user ${userId}: ${amount}`);
  }

  private async updateUserBalance(userId: string, amount: number): Promise<void> {
    // This would update the user's wallet balance
    console.log(`Updating balance for user ${userId}: ${amount}`);
  }

  private generatePaymentReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BP${timestamp.slice(-8)}${random}`;
  }

  private generateProviderReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PRV${timestamp.slice(-6)}${random}`;
  }

  private generateReceipt(paymentId: string): string {
    return `https://minttrade.gh/receipts/${paymentId}`;
  }

  private async updateBillAccountAfterPayment(accountId: string, amount: number): Promise<void> {
    try {
      const accountDoc = await getDoc(doc(db, 'billAccounts', accountId));
      if (accountDoc.exists()) {
        const currentData = accountDoc.data();
        await updateDoc(doc(db, 'billAccounts', accountId), {
          lastPaid: serverTimestamp(),
          totalPaid: (currentData.totalPaid || 0) + amount,
        });
      }
    } catch (error) {
      console.error('Error updating bill account after payment:', error);
    }
  }

  private async createBillHistoryRecord(
    paymentData: Omit<BillPayment, 'id' | 'createdAt' | 'status' | 'reference'>,
    paymentId: string
  ): Promise<void> {
    try {
      const accountDoc = await getDoc(doc(db, 'billAccounts', paymentData.accountId));
      if (accountDoc.exists()) {
        const accountData = accountDoc.data();
        
        await addDoc(collection(db, 'billHistory'), {
          userId: paymentData.userId,
          providerId: paymentData.providerId,
          accountNumber: accountData.accountNumber,
          amount: paymentData.amount,
          paidAt: serverTimestamp(),
          reference: paymentId,
          status: 'success',
        });
      }
    } catch (error) {
      console.error('Error creating bill history record:', error);
    }
  }
}