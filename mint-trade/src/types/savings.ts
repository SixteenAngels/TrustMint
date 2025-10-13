// Auto-Save Round-up Types
export interface AutoSaveRule {
  id: string;
  userId: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerType: 'round_up' | 'percentage' | 'fixed_amount' | 'smart_save';
  triggerSettings: {
    // Round-up settings
    roundUpAmount?: number; // Amount to round up to (e.g., 5 for nearest 5)
    minimumTransaction?: number; // Minimum transaction to trigger round-up
    
    // Percentage settings
    percentage?: number; // Percentage of transaction to save
    
    // Fixed amount settings
    fixedAmount?: number; // Fixed amount to save per transaction
    
    // Smart save settings
    smartSaveEnabled?: boolean;
    maxDailyAmount?: number; // Maximum amount to save per day
    spendingThreshold?: number; // Only save if spending above threshold
  };
  destinationType: 'savings_account' | 'investment_vault' | 'specific_stock';
  destinationId: string; // ID of savings account, vault, or stock
  priority: number; // Higher number = higher priority
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  totalSaved: number;
  transactionCount: number;
}

export interface RoundUpTransaction {
  id: string;
  userId: string;
  originalTransactionId: string;
  originalAmount: number;
  roundUpAmount: number;
  totalAmount: number;
  autoSaveRuleId: string;
  destinationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  metadata?: {
    transactionType: 'payment' | 'trade' | 'transfer';
    merchantName?: string;
    stockSymbol?: string;
  };
}

export interface SavingsAccount {
  id: string;
  userId: string;
  name: string;
  description: string;
  balance: number;
  currency: 'GHS' | 'USD';
  interestRate: number; // Annual interest rate
  isActive: boolean;
  createdAt: Date;
  lastActivity?: Date;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInterest: number;
  settings: {
    allowWithdrawals: boolean;
    minimumBalance: number;
    autoCompound: boolean;
    notifications: boolean;
  };
}

// Investment Vault Types
export interface InvestmentVault {
  id: string;
  name: string;
  description: string;
  category: 'conservative' | 'moderate' | 'aggressive' | 'thematic' | 'esg';
  riskLevel: 1 | 2 | 3 | 4 | 5; // 1 = Very Low, 5 = Very High
  expectedReturn: {
    min: number; // Minimum expected annual return
    max: number; // Maximum expected annual return
    target: number; // Target annual return
  };
  minimumInvestment: number;
  maximumInvestment: number;
  managementFee: number; // Annual management fee percentage
  performanceFee: number; // Performance fee percentage
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalInvestors: number;
  totalAssets: number;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
    yearly: number;
    allTime: number;
  };
  holdings: VaultHolding[];
  strategy: string;
  manager: {
    name: string;
    experience: string;
    credentials: string[];
  };
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
}

export interface VaultHolding {
  id: string;
  vaultId: string;
  stockSymbol: string;
  stockName: string;
  weight: number; // Percentage of vault
  shares: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  lastUpdated: Date;
}

export interface UserVaultInvestment {
  id: string;
  userId: string;
  vaultId: string;
  amount: number;
  currency: 'GHS' | 'USD';
  shares: number;
  averagePrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  status: 'active' | 'paused' | 'liquidated';
  createdAt: Date;
  lastContribution?: Date;
  totalContributions: number;
  totalWithdrawals: number;
  autoInvestEnabled: boolean;
  autoInvestAmount?: number;
  autoInvestFrequency?: 'daily' | 'weekly' | 'monthly';
  nextAutoInvest?: Date;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  category: 'emergency' | 'vacation' | 'education' | 'home' | 'car' | 'wedding' | 'retirement' | 'other';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  contributions: GoalContribution[];
  autoSaveRules: string[]; // IDs of auto-save rules linked to this goal
  progress: number; // Percentage of goal achieved
  estimatedCompletionDate?: Date;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  source: 'manual' | 'auto_save' | 'round_up' | 'transfer';
  sourceId?: string; // ID of auto-save rule or transfer
  createdAt: Date;
  description?: string;
}

export interface SmartSaveInsight {
  id: string;
  userId: string;
  type: 'spending_pattern' | 'saving_opportunity' | 'goal_progress' | 'market_opportunity';
  title: string;
  description: string;
  actionRequired: boolean;
  actionText?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: {
    amount?: number;
    percentage?: number;
    category?: string;
    goalId?: string;
    vaultId?: string;
  };
}

// Savings Analytics
export interface SavingsAnalytics {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  totalSaved: number;
  totalInvested: number;
  totalInterest: number;
  totalGains: number;
  autoSaveTransactions: number;
  roundUpTransactions: number;
  averageRoundUp: number;
  topCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  goalProgress: {
    goalId: string;
    goalName: string;
    progress: number;
    remaining: number;
    daysRemaining: number;
  }[];
  vaultPerformance: {
    vaultId: string;
    vaultName: string;
    return: number;
    value: number;
  }[];
  insights: SmartSaveInsight[];
}

// Constants
export const VAULT_CATEGORIES = [
  { id: 'conservative', name: 'Conservative', description: 'Low risk, stable returns', icon: '🛡️', color: '#4CAF50' },
  { id: 'moderate', name: 'Moderate', description: 'Balanced risk and return', icon: '⚖️', color: '#2196F3' },
  { id: 'aggressive', name: 'Aggressive', description: 'High risk, high potential returns', icon: '🚀', color: '#FF9800' },
  { id: 'thematic', name: 'Thematic', description: 'Focused on specific themes', icon: '🎯', color: '#9C27B0' },
  { id: 'esg', name: 'ESG', description: 'Environmental, Social, Governance', icon: '🌱', color: '#4CAF50' },
];

export const SAVINGS_GOAL_CATEGORIES = [
  { id: 'emergency', name: 'Emergency Fund', icon: '🚨', color: '#F44336' },
  { id: 'vacation', name: 'Vacation', icon: '✈️', color: '#2196F3' },
  { id: 'education', name: 'Education', icon: '🎓', color: '#4CAF50' },
  { id: 'home', name: 'Home Purchase', icon: '🏠', color: '#FF9800' },
  { id: 'car', name: 'Car Purchase', icon: '🚗', color: '#9C27B0' },
  { id: 'wedding', name: 'Wedding', icon: '💍', color: '#E91E63' },
  { id: 'retirement', name: 'Retirement', icon: '👴', color: '#607D8B' },
  { id: 'other', name: 'Other', icon: '💰', color: '#795548' },
];

export const AUTO_SAVE_TRIGGER_TYPES = [
  { id: 'round_up', name: 'Round Up', description: 'Round up transactions to nearest amount', icon: '🔄' },
  { id: 'percentage', name: 'Percentage', description: 'Save a percentage of each transaction', icon: '📊' },
  { id: 'fixed_amount', name: 'Fixed Amount', description: 'Save a fixed amount per transaction', icon: '💵' },
  { id: 'smart_save', name: 'Smart Save', description: 'AI-powered savings based on spending patterns', icon: '🤖' },
];

export const ROUND_UP_AMOUNTS = [1, 2, 5, 10, 25, 50, 100];
export const SAVINGS_PERCENTAGES = [1, 2, 5, 10, 15, 20, 25];
export const FIXED_SAVINGS_AMOUNTS = [5, 10, 25, 50, 100, 200, 500];