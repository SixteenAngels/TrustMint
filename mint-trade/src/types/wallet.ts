// Wallet and Banking Types
export interface Wallet {
  id: string;
  userId: string;
  accountNumber: string; // Virtual GHS account number
  bankCode: string; // Partner bank code (e.g., CALB)
  accountName: string; // "Mint Trade Account - John Doe"
  balance: number; // Available balance in GHS
  lockedBalance: number; // Funds locked in pending transactions
  totalBalance: number; // balance + lockedBalance
  currency: 'GHS' | 'USD';
  status: 'active' | 'suspended' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  lastTransactionAt?: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'investment' | 'refund' | 'fee';
  category: 'mobile_money' | 'bank_transfer' | 'card_payment' | 'p2p' | 'bill_payment' | 'investment' | 'auto_save';
  amount: number;
  currency: 'GHS' | 'USD';
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference: string; // External transaction reference
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: {
    senderName?: string;
    recipientName?: string;
    recipientPhone?: string;
    bankName?: string;
    accountNumber?: string;
    billType?: string;
    billReference?: string;
    stockSymbol?: string;
    shares?: number;
    [key: string]: any;
  };
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

export interface VirtualAccount {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  routingNumber?: string;
  swiftCode?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface WalletSettings {
  userId: string;
  autoSaveEnabled: boolean;
  autoSavePercentage: number; // 0-100
  roundUpEnabled: boolean;
  roundUpAmount: number; // Minimum amount to round up
  dailySpendLimit: number;
  monthlySpendLimit: number;
  transactionNotifications: boolean;
  lowBalanceAlert: boolean;
  lowBalanceThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface P2PTransfer {
  id: string;
  senderId: string;
  recipientId: string;
  recipientPhone: string;
  amount: number;
  currency: 'GHS' | 'USD';
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface BillPayment {
  id: string;
  userId: string;
  walletId: string;
  billType: 'electricity' | 'water' | 'internet' | 'dstv' | 'gotv' | 'data' | 'airtime';
  provider: string; // ECG, GWCL, MTN, Vodafone, etc.
  accountNumber: string;
  customerName: string;
  amount: number;
  currency: 'GHS';
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface AutoSaveRule {
  id: string;
  userId: string;
  walletId: string;
  name: string;
  description: string;
  type: 'round_up' | 'percentage' | 'fixed_amount';
  amount: number; // Amount or percentage
  trigger: 'every_transaction' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  totalSaved: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletAnalytics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  transactionCount: number;
  averageTransactionAmount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  createdAt: Date;
}