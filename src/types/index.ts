// Re-export all types
export * from './common';
export * from './wallet';
export * from './payments';
export * from './savings';
export * from './social';
export * from './kyc';
export * from './ai';

// User type
export interface User {
  uid: string;
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  verified: boolean;
  balance: number;
  createdAt: Date | string;
  role?: 'user' | 'manager' | 'admin';
  isAdmin?: boolean;
  isManager?: boolean;
}

// Stock type
export interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  updatedAt?: Date | string;
}

// Transaction type
export interface Transaction {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  stockId: string;
  stockSymbol: string;
  quantity: number;
  price: number;
  total: number;
  fees: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date | string;
  completedAt?: Date | string;
}

// Portfolio item
export interface PortfolioItem {
  stockId: string;
  stockSymbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profit: number;
  profitPercent: number;
}

// Post type (for social features)
export interface Post {
  id: string;
  userId: string;
  content: string;
  timestamp: string | Date;
  likes: number;
  comments: number;
  shares: number;
}
