export interface User {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  nationalId?: string;
  verified: boolean;
  balance: number;
  createdAt: Date;
  pin?: string;
}

export interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  updatedAt: Date;
}

export interface PortfolioItem {
  stockId: string;
  quantity: number;
  avgPrice: number;
  totalValue: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Transaction {
  id: string;
  userId: string;
  stockId: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'price_alert' | 'portfolio_update' | 'market_news';
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  completed: boolean;
  quiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  };
}

export interface PriceAlert {
  id: string;
  userId: string;
  stockId: string;
  condition: 'above' | 'below';
  targetPrice: number;
  active: boolean;
  createdAt: Date;
}