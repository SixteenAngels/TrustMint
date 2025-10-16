// AI Insights Types
export interface AIInsight {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'alert' | 'analysis' | 'prediction';
  symbol: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  reasoning: string[];
  dataPoints: DataPoint[];
  timeframe: 'short' | 'medium' | 'long';
  riskLevel: 'low' | 'medium' | 'high';
  targetPrice?: number;
  stopLoss?: number;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  tags: string[];
  source: 'technical' | 'fundamental' | 'sentiment' | 'news' | 'social';
}

export interface DataPoint {
  name: string;
  value: number;
  change: number;
  significance: 'low' | 'medium' | 'high';
  description: string;
}

export interface AIPrediction {
  id: string;
  symbol: string;
  timeframe: string;
  prediction: {
    price: number;
    confidence: number;
    direction: 'up' | 'down' | 'sideways';
  };
  factors: PredictionFactor[];
  createdAt: Date;
  targetDate: Date;
}

export interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface AIPortfolioAnalysis {
  userId: string;
  overallScore: number;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
  };
  diversification: {
    score: number;
    sectors: SectorAnalysis[];
    recommendations: string[];
  };
  performance: {
    score: number;
    vsBenchmark: number;
    trends: string[];
  };
  recommendations: PortfolioRecommendation[];
  createdAt: Date;
}

export interface SectorAnalysis {
  sector: string;
  allocation: number;
  performance: number;
  recommendation: 'overweight' | 'underweight' | 'neutral';
  reasoning: string;
}

export interface PortfolioRecommendation {
  type: 'buy' | 'sell' | 'rebalance';
  symbol: string;
  action: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
}

export interface AINewsAnalysis {
  id: string;
  title: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  affectedSymbols: string[];
  summary: string;
  keyPoints: string[];
  publishedAt: Date;
  analyzedAt: Date;
}

export interface AISentimentAnalysis {
  symbol: string;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  score: number; // -100 to 100
  sources: {
    social: number;
    news: number;
    analyst: number;
    technical: number;
  };
  trends: SentimentTrend[];
  lastUpdated: Date;
}

export interface SentimentTrend {
  period: string;
  sentiment: number;
  change: number;
  description: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'stock' | 'portfolio' | 'strategy' | 'education';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionItems: string[];
  resources: string[];
  estimatedImpact: number;
  timeToImplement: string;
  isPersonalized: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// Multi-Language Types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export interface Translation {
  key: string;
  value: string;
  language: string;
  context?: string;
  plural?: string;
}

export interface LocalizedString {
  [language: string]: string;
}

// AI Configuration
export interface AIConfig {
  enabled: boolean;
  models: {
    insights: string;
    predictions: string;
    sentiment: string;
    news: string;
  };
  thresholds: {
    confidence: number;
    risk: number;
    impact: number;
  };
  updateFrequency: {
    insights: number; // minutes
    predictions: number;
    sentiment: number;
    news: number;
  };
}

// AI Constants
export const AI_INSIGHT_TYPES = [
  'buy',
  'sell', 
  'hold',
  'alert',
  'analysis',
  'prediction'
] as const;

export const AI_TIMEFRAMES = [
  'short',
  'medium',
  'long'
] as const;

export const AI_RISK_LEVELS = [
  'low',
  'medium',
  'high'
] as const;

export const AI_SOURCES = [
  'technical',
  'fundamental',
  'sentiment',
  'news',
  'social'
] as const;

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    rtl: false,
  },
  {
    code: 'tw',
    name: 'Twi',
    nativeName: 'Twi',
    flag: '🇬🇭',
    rtl: false,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
  },
];

export const DEFAULT_LANGUAGE = 'en';
