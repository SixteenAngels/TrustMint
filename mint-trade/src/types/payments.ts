// P2P Payment Types
export interface P2PTransfer {
  id: string;
  senderId: string;
  recipientId: string;
  amount: number;
  currency: 'GHS' | 'USD';
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  method: 'qr_code' | 'phone_number' | 'wallet_address' | 'username';
  recipientInfo: {
    phone?: string;
    username?: string;
    walletAddress?: string;
    displayName?: string;
  };
  qrCode?: string;
  transactionFee: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  metadata?: {
    location?: string;
    device?: string;
    ipAddress?: string;
  };
}

export interface QRCodeData {
  type: 'payment_request' | 'wallet_address' | 'contact_info';
  data: {
    amount?: number;
    currency?: string;
    description?: string;
    walletAddress?: string;
    phoneNumber?: string;
    username?: string;
    displayName?: string;
  };
  expiresAt?: Date;
  isActive: boolean;
}

export interface WalletAddress {
  id: string;
  userId: string;
  address: string;
  type: 'primary' | 'secondary' | 'temporary';
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface P2PContact {
  id: string;
  userId: string;
  contactUserId: string;
  displayName: string;
  phoneNumber?: string;
  username?: string;
  walletAddress?: string;
  isFavorite: boolean;
  lastTransaction?: Date;
  totalTransactions: number;
  totalAmount: number;
  createdAt: Date;
}

// Bill Payment Types
export interface BillProvider {
  id: string;
  name: string;
  category: 'electricity' | 'water' | 'internet' | 'tv' | 'mobile' | 'insurance' | 'other';
  logo: string;
  color: string;
  isActive: boolean;
  supportedMethods: ('mobile_money' | 'card' | 'bank_transfer')[];
  fees: {
    mobile_money: number;
    card: number;
    bank_transfer: number;
  };
  processingTime: string;
  description: string;
}

export interface BillAccount {
  id: string;
  userId: string;
  providerId: string;
  accountNumber: string;
  accountName: string;
  customerName: string;
  isActive: boolean;
  isDefault: boolean;
  lastPaid?: Date;
  totalPaid: number;
  createdAt: Date;
}

export interface BillPayment {
  id: string;
  userId: string;
  providerId: string;
  accountId: string;
  amount: number;
  currency: 'GHS';
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'mobile_money' | 'card' | 'bank_transfer';
  transactionFee: number;
  totalAmount: number;
  reference: string;
  providerReference?: string;
  receipt?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: {
    phoneNumber?: string;
    cardLast4?: string;
    bankAccount?: string;
  };
}

export interface BillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  providers: string[];
  isActive: boolean;
}

export interface BillHistory {
  id: string;
  userId: string;
  providerId: string;
  accountNumber: string;
  amount: number;
  paidAt: Date;
  reference: string;
  status: 'success' | 'failed';
}

// Payment Methods
export interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'card' | 'bank_transfer';
  name: string;
  details: {
    phoneNumber?: string;
    cardLast4?: string;
    bankName?: string;
    accountNumber?: string;
  };
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

// Payment Constants
export const BILL_CATEGORIES: BillCategory[] = [
  {
    id: 'electricity',
    name: 'Electricity',
    icon: '⚡',
    color: '#FFD700',
    providers: ['ecg', 'nedsco', 'prepaid'],
    isActive: true,
  },
  {
    id: 'water',
    name: 'Water',
    icon: '💧',
    color: '#00BFFF',
    providers: ['gwc', 'aqua_vitens'],
    isActive: true,
  },
  {
    id: 'internet',
    name: 'Internet',
    icon: '🌐',
    color: '#32CD32',
    providers: ['mtn', 'vodafone', 'airteltigo', 'surfline'],
    isActive: true,
  },
  {
    id: 'tv',
    name: 'TV',
    icon: '📺',
    color: '#FF6347',
    providers: ['dstv', 'gotv', 'startimes'],
    isActive: true,
  },
  {
    id: 'mobile',
    name: 'Mobile',
    icon: '📱',
    color: '#9370DB',
    providers: ['mtn', 'vodafone', 'airteltigo'],
    isActive: true,
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: '🛡️',
    color: '#20B2AA',
    providers: ['snic', 'enterprise', 'metlife'],
    isActive: true,
  },
  {
    id: 'other',
    name: 'Other',
    icon: '📄',
    color: '#696969',
    providers: ['government', 'education', 'healthcare'],
    isActive: true,
  },
];

export const BILL_PROVIDERS: BillProvider[] = [
  // Electricity
  {
    id: 'ecg',
    name: 'ECG',
    category: 'electricity',
    logo: '⚡',
    color: '#FFD700',
    isActive: true,
    supportedMethods: ['mobile_money', 'card', 'bank_transfer'],
    fees: { mobile_money: 0, card: 5, bank_transfer: 0 },
    processingTime: 'Instant',
    description: 'Electricity Company of Ghana',
  },
  {
    id: 'nedsco',
    name: 'NEDCo',
    category: 'electricity',
    logo: '⚡',
    color: '#FFD700',
    isActive: true,
    supportedMethods: ['mobile_money', 'card'],
    fees: { mobile_money: 0, card: 5, bank_transfer: 0 },
    processingTime: 'Instant',
    description: 'Northern Electricity Distribution Company',
  },
  // Water
  {
    id: 'gwc',
    name: 'GWC',
    category: 'water',
    logo: '💧',
    color: '#00BFFF',
    isActive: true,
    supportedMethods: ['mobile_money', 'card'],
    fees: { mobile_money: 0, card: 5, bank_transfer: 0 },
    processingTime: 'Instant',
    description: 'Ghana Water Company',
  },
  // Internet
  {
    id: 'mtn',
    name: 'MTN',
    category: 'internet',
    logo: '📱',
    color: '#FFD700',
    isActive: true,
    supportedMethods: ['mobile_money', 'card'],
    fees: { mobile_money: 0, card: 5, bank_transfer: 0 },
    processingTime: 'Instant',
    description: 'MTN Ghana',
  },
  {
    id: 'vodafone',
    name: 'Vodafone',
    category: 'internet',
    logo: '📱',
    color: '#E60012',
    isActive: true,
    supportedMethods: ['mobile_money', 'card'],
    fees: { mobile_money: 0, card: 5, bank_transfer: 0 },
    processingTime: 'Instant',
    description: 'Vodafone Ghana',
  },
  {
    id: 'surfline',
    name: 'Surfline',
    category: 'internet',
    logo: '🌐',
    color: '#00BFFF',
    isActive: true,
    supportedMethods: ['mobile_money', 'card'],
    fees: { mobile_money: 0, card: 5, bank_transfer: 0 },
    processingTime: 'Instant',
    description: 'Surfline Communications',
  },
  // TV
  {
    id: 'dstv',
    name: 'DStv',
    category: 'tv',
    logo: '📺',
    color: '#FF6347',
    isActive: true,
    supportedMethods: ['mobile_money', 'card'],
    fees: { mobile_money: 0, card: 5, bank_transfer: 0 },
    processingTime: 'Instant',
    description: 'DStv Ghana',
  },
  {
    id: 'gotv',
    name: 'GOtv',
    category: 'tv',
    logo: '📺',
    color: '#FF6347',
    isActive: true,
    supportedMethods: ['mobile_money', 'card'],
    fees: { mobile_money: 0, card: 5, bank_transfer: 0 },
    processingTime: 'Instant',
    description: 'GOtv Ghana',
  },
  {
    id: 'startimes',
    name: 'StarTimes',
    category: 'tv',
    logo: '📺',
    color: '#FF6347',
    isActive: true,
    supportedMethods: ['mobile_money', 'card'],
    fees: { mobile_money: 0, card: 5, bank_transfer: 0 },
    processingTime: 'Instant',
    description: 'StarTimes Ghana',
  },
];

export const P2P_TRANSFER_LIMITS = {
  daily: 10000, // GHS 10,000
  weekly: 50000, // GHS 50,000
  monthly: 200000, // GHS 200,000
  perTransaction: 5000, // GHS 5,000
};

export const BILL_PAYMENT_LIMITS = {
  daily: 5000, // GHS 5,000
  perTransaction: 2000, // GHS 2,000
};