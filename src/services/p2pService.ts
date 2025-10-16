import { 
  P2PTransfer, 
  QRCodeData, 
  WalletAddress, 
  P2PContact,
  P2P_TRANSFER_LIMITS 
} from '../types/payments';
import firestore, { type FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

const db = firestore();

export class P2PService {
  private static instance: P2PService;

  static getInstance(): P2PService {
    if (!P2PService.instance) {
      P2PService.instance = new P2PService();
    }
    return P2PService.instance;
  }

  // Generate QR Code for payment request
  async generatePaymentQRCode(
    userId: string,
    amount: number,
    description?: string
  ): Promise<QRCodeData> {
    try {
      const qrData: QRCodeData = {
        type: 'payment_request',
        data: {
          amount,
          currency: 'GHS',
          description,
          walletAddress: await this.getUserWalletAddress(userId),
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true,
      };

      // Store QR code data
      const qrRef = await db.collection('qrCodes').add({
        ...qrData,
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // QRCodeData type does not include id; return same shape
      return qrData;
    } catch (error) {
      console.error('Error generating payment QR code:', error);
      throw error;
    }
  }

  // Generate QR Code for wallet address
  async generateWalletQRCode(userId: string): Promise<QRCodeData> {
    try {
      const walletAddress = await this.getUserWalletAddress(userId);
      
      const qrData: QRCodeData = {
        type: 'wallet_address',
        data: {
          walletAddress,
          displayName: await this.getUserDisplayName(userId),
        },
        isActive: true,
      };

      return qrData;
    } catch (error) {
      console.error('Error generating wallet QR code:', error);
      throw error;
    }
  }

  // Scan QR Code and process payment
  async scanQRCode(qrCodeData: string, recipientId: string): Promise<P2PTransfer | null> {
    try {
      // Parse QR code data
      const qrData = JSON.parse(qrCodeData) as QRCodeData;
      
      if (qrData.type === 'payment_request') {
        return this.processPaymentRequest(qrData, recipientId);
      } else if (qrData.type === 'wallet_address') {
        return this.processWalletAddressPayment(qrData, recipientId);
      }
      
      return null;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      throw error;
    }
  }

  // Process payment request from QR code
  private async processPaymentRequest(
    qrData: QRCodeData, 
    recipientId: string
  ): Promise<P2PTransfer | null> {
    try {
      if (!qrData.data.amount) {
        throw new Error('Amount not specified in QR code');
      }

      const transfer: Omit<P2PTransfer, 'id'> = {
        senderId: recipientId,
        recipientId: qrData.data.walletAddress || '',
        amount: qrData.data.amount,
        currency: 'GHS',
        description: qrData.data.description,
        status: 'pending',
        method: 'qr_code',
        recipientInfo: {
          walletAddress: qrData.data.walletAddress,
        },
        qrCode: JSON.stringify(qrData),
        transactionFee: this.calculateTransactionFee(qrData.data.amount),
        createdAt: new Date(),
        expiresAt: qrData.expiresAt,
      };

      const transferRef = await db.collection('p2pTransfers').add({
        ...transfer,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return {
        id: transferRef.id,
        ...transfer,
      };
    } catch (error) {
      console.error('Error processing payment request:', error);
      throw error;
    }
  }

  // Process wallet address payment
  private async processWalletAddressPayment(
    qrData: QRCodeData,
    recipientId: string
  ): Promise<P2PTransfer | null> {
    try {
      const transfer: Omit<P2PTransfer, 'id'> = {
        senderId: recipientId,
        recipientId: qrData.data.walletAddress || '',
        amount: 0, // Amount to be specified by user
        currency: 'GHS',
        description: 'Payment to wallet address',
        status: 'pending',
        method: 'wallet_address',
        recipientInfo: {
          walletAddress: qrData.data.walletAddress,
          displayName: qrData.data.displayName,
        },
        qrCode: JSON.stringify(qrData),
        transactionFee: 0,
        createdAt: new Date(),
      };

      const transferRef = await db.collection('p2pTransfers').add({
        ...transfer,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return {
        id: transferRef.id,
        ...transfer,
      };
    } catch (error) {
      console.error('Error processing wallet address payment:', error);
      throw error;
    }
  }

  // Send P2P transfer
  async sendP2PTransfer(transferData: Omit<P2PTransfer, 'id' | 'createdAt' | 'status'>): Promise<string> {
    try {
      // Validate transfer limits
      await this.validateTransferLimits(transferData.senderId, transferData.amount);

      // Calculate transaction fee
      const transactionFee = this.calculateTransactionFee(transferData.amount);
      const totalAmount = transferData.amount + transactionFee;

      // Check sender balance
      await this.checkSenderBalance(transferData.senderId, totalAmount);

      // Create transfer record
      const transferRef = await db.collection('p2pTransfers').add({
        ...transferData,
        transactionFee,
        status: 'processing',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Process transfer
      await this.processTransfer(transferRef.id, transferData);

      return transferRef.id;
    } catch (error) {
      console.error('Error sending P2P transfer:', error);
      throw error;
    }
  }

  // Process transfer
  private async processTransfer(transferId: string, transferData: Omit<P2PTransfer, 'id' | 'createdAt' | 'status'>): Promise<void> {
    try {
      // Update sender balance
      await this.updateWalletBalance(transferData.senderId, -(transferData.amount + transferData.transactionFee));

      // Update recipient balance
      await this.updateWalletBalance(transferData.recipientId, transferData.amount);

      // Update transfer status
      await db.collection('p2pTransfers').doc(transferId).update({
        status: 'completed',
        completedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Create transaction records
      await this.createTransactionRecords(transferId, transferData);
    } catch (error) {
      // Mark transfer as failed
      await db.collection('p2pTransfers').doc(transferId).update({
        status: 'failed',
      });
      throw error;
    }
  }

  // Get P2P transfers for user
  async getP2PTransfers(userId: string, limitCount: number = 20): Promise<P2PTransfer[]> {
    try {
      const transfersQuery = db.collection('p2pTransfers')
        .where('senderId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limitCount);

      const snapshot = await transfersQuery.get();
      
      return snapshot.docs.map((doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
        } as P2PTransfer;
      });
    } catch (error) {
      console.error('Error getting P2P transfers:', error);
      throw error;
    }
  }

  // Get received transfers for user
  async getReceivedTransfers(userId: string, limitCount: number = 20): Promise<P2PTransfer[]> {
    try {
      const transfersQuery = db.collection('p2pTransfers')
        .where('recipientId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limitCount);

      const snapshot = await transfersQuery.get();
      
      return snapshot.docs.map((doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
        } as P2PTransfer;
      });
    } catch (error) {
      console.error('Error getting received transfers:', error);
      throw error;
    }
  }

  // Add contact
  async addContact(contactData: Omit<P2PContact, 'id' | 'createdAt' | 'totalTransactions' | 'totalAmount'>): Promise<string> {
    try {
      const contactRef = await db.collection('p2pContacts').add({
        ...contactData,
        totalTransactions: 0,
        totalAmount: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return contactRef.id;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  }

  // Get contacts
  async getContacts(userId: string): Promise<P2PContact[]> {
    try {
      const contactsQuery = db.collection('p2pContacts')
        .where('userId', '==', userId)
        .orderBy('isFavorite', 'desc')
        .orderBy('lastTransaction', 'desc');

      const snapshot = await contactsQuery.get();
      
      return snapshot.docs.map((doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastTransaction: data.lastTransaction?.toDate(),
        } as P2PContact;
      });
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  // Search users by phone or username
  async searchUsers(searchQuery: string): Promise<{ id: string; displayName: string; phoneNumber?: string; username?: string }[]> {
    try {
      // TODO: Implement actual user search from database
      // This should query the users collection in Firestore
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          displayName: data.displayName || data.name || 'Unknown User',
          phoneNumber: data.phone,
          username: data.username,
        };
      });
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Generate wallet address
  async generateWalletAddress(userId: string): Promise<WalletAddress> {
    try {
      const address = this.generateUniqueAddress();
      
      const walletAddress: Omit<WalletAddress, 'id'> = {
        userId,
        address,
        type: 'primary',
        isActive: true,
        createdAt: new Date(),
        usageCount: 0,
      };

      const addressRef = await db.collection('walletAddresses').add({
        ...walletAddress,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return {
        id: addressRef.id,
        ...walletAddress,
      };
    } catch (error) {
      console.error('Error generating wallet address:', error);
      throw error;
    }
  }

  // Get user wallet address
  async getUserWalletAddress(userId: string): Promise<string> {
    try {
      const addressQuery = db.collection('walletAddresses')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .limit(1);

      const snapshot = await addressQuery.get();
      
      if (snapshot.empty) {
        // Generate new address if none exists
        const newAddress = await this.generateWalletAddress(userId);
        return newAddress.address;
      }

      const addressDoc = snapshot.docs[0];
      return addressDoc.data().address;
    } catch (error) {
      console.error('Error getting user wallet address:', error);
      throw error;
    }
  }

  // Helper methods
  private calculateTransactionFee(amount: number): number {
    // Free for P2P transfers under GHS 100, 0.5% for higher amounts
    return amount > 100 ? amount * 0.005 : 0;
  }

  private async validateTransferLimits(userId: string, amount: number): Promise<void> {
    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyTransfersQuery = db.collection('p2pTransfers')
      .where('senderId', '==', userId)
      .where('createdAt', '>=', today)
      .where('status', '==', 'completed');

    const dailySnapshot = await dailyTransfersQuery.get();
    const dailyTotal = dailySnapshot.docs.reduce((sum: number, doc: { data: () => { amount: any; }; }) => sum + doc.data().amount, 0);

    if (dailyTotal + amount > P2P_TRANSFER_LIMITS.daily) {
      throw new Error(`Daily transfer limit exceeded. Maximum: ₵${P2P_TRANSFER_LIMITS.daily}`);
    }

    if (amount > P2P_TRANSFER_LIMITS.perTransaction) {
      throw new Error(`Per transaction limit exceeded. Maximum: ₵${P2P_TRANSFER_LIMITS.perTransaction}`);
    }
  }

  private async checkSenderBalance(userId: string, amount: number): Promise<void> {
    // This would check the user's wallet balance
    // For now, we'll assume sufficient balance
    // Check user balance
  }

  private async updateWalletBalance(userId: string, amount: number): Promise<void> {
    // This would update the user's wallet balance
    // Update user balance
  }

  private async createTransactionRecords(transferId: string, transferData: Omit<P2PTransfer, 'id' | 'createdAt' | 'status'>): Promise<void> {
    // Create transaction records for both sender and recipient
    // Create transaction records
  }

  private generateUniqueAddress(): string {
    // Generate a unique wallet address
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MT${timestamp}${random}`.toUpperCase();
  }

  private async getUserDisplayName(userId: string): Promise<string> {
    // Get user display name from user profile
    return 'Mint Trade User';
  }
}
