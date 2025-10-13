// Social Trading Types
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate: Date;
  verified: boolean;
  stats: UserStats;
  preferences: UserPreferences;
  privacy: PrivacySettings;
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  totalTrades: number;
  winRate: number;
  totalReturn: number;
  avgReturn: number;
  bestTrade: number;
  worstTrade: number;
  riskScore: number; // 1-10 scale
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  badges: Badge[];
  portfolioValue: number;
  monthlyReturn: number;
  yearlyReturn: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface UserPreferences {
  notifications: {
    newFollower: boolean;
    tradeAlerts: boolean;
    marketUpdates: boolean;
    socialActivity: boolean;
  };
  privacy: {
    showPortfolio: boolean;
    showTrades: boolean;
    showReturns: boolean;
    allowMessages: boolean;
  };
  trading: {
    riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
    investmentStyle: 'Value' | 'Growth' | 'Momentum' | 'Dividend';
    preferredSectors: string[];
  };
}

export interface PrivacySettings {
  profileVisibility: 'Public' | 'Followers' | 'Private';
  tradeVisibility: 'Public' | 'Followers' | 'Private';
  portfolioVisibility: 'Public' | 'Followers' | 'Private';
  allowCopyTrading: boolean;
  showRealMoney: boolean;
}

// Social Trading Actions
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  status: 'active' | 'blocked';
}

export interface TradeAlert {
  id: string;
  userId: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  price: number;
  reason: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isPublic: boolean;
  tags: string[];
}

export interface TradeComment {
  id: string;
  tradeAlertId: string;
  userId: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: TradeComment[];
  isEdited: boolean;
}

export interface CopyTrade {
  id: string;
  copierId: string;
  originalTraderId: string;
  symbol: string;
  action: 'buy' | 'sell';
  amount: number;
  originalAmount: number;
  copyRatio: number; // 0.1 = 10% of original
  timestamp: Date;
  status: 'pending' | 'executed' | 'failed';
  profit: number;
}

export interface SocialFeed {
  id: string;
  userId: string;
  type: 'trade' | 'achievement' | 'milestone' | 'comment' | 'follow';
  content: any; // Flexible content based on type
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isShared: boolean;
}

// Leaderboards and Rankings
export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time';
  criteria: 'returns' | 'trades' | 'followers' | 'win-rate';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  value: number;
  change: number;
  changePercent: number;
  verified: boolean;
  badges: Badge[];
}

// Social Groups and Communities
export interface TradingGroup {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  coverImage?: string;
  membersCount: number;
  isPrivate: boolean;
  isVerified: boolean;
  createdBy: string;
  createdAt: Date;
  rules: string[];
  tags: string[];
  recentActivity: SocialFeed[];
}

export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
  status: 'active' | 'muted' | 'banned';
}

// Messaging and Communication
export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'trade_share' | 'file';
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'trade_snapshot';
  url: string;
  filename: string;
  size: number;
}

// Social Analytics
export interface SocialAnalytics {
  userId: string;
  period: '7d' | '30d' | '90d' | '1y';
  followers: {
    total: number;
    gained: number;
    lost: number;
    growth: number;
  };
  engagement: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    avgEngagement: number;
  };
  content: {
    postsCount: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgSharesPerPost: number;
  };
  trading: {
    tradesShared: number;
    copyTradesReceived: number;
    totalCopied: number;
    copySuccessRate: number;
  };
}

// Social Trading Settings
export interface SocialTradingSettings {
  userId: string;
  autoShareTrades: boolean;
  shareThreshold: number; // Minimum profit to auto-share
  allowCopyTrading: boolean;
  copyTradingFee: number; // Percentage fee for copy trades
  maxCopyTraders: number;
  minCopyAmount: number;
  maxCopyAmount: number;
  riskWarning: boolean;
  disclaimerAccepted: boolean;
}

// Social Trading Constants
export const EXPERIENCE_LEVELS = [
  'Beginner',
  'Intermediate', 
  'Advanced',
  'Expert'
] as const;

export const RISK_TOLERANCE_LEVELS = [
  'Conservative',
  'Moderate',
  'Aggressive'
] as const;

export const INVESTMENT_STYLES = [
  'Value',
  'Growth',
  'Momentum',
  'Dividend'
] as const;

export const BADGE_RARITIES = [
  'Common',
  'Rare',
  'Epic',
  'Legendary'
] as const;

export const LEADERBOARD_PERIODS = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'all-time'
] as const;

export const LEADERBOARD_CRITERIA = [
  'returns',
  'trades',
  'followers',
  'win-rate'
] as const;