import { 
  UserProfile, 
  UserStats, 
  Follow, 
  TradeAlert, 
  TradeComment, 
  CopyTrade, 
  SocialFeed,
  Leaderboard,
  LeaderboardEntry,
  TradingGroup,
  DirectMessage,
  SocialAnalytics,
  SocialTradingSettings,
  Badge
} from '../types/social';
import firestore, { type FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

const db = firestore();

export class SocialService {
  private static instance: SocialService;

  static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService();
    }
    return SocialService.instance;
  }

  // User Profile Management
  async createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<string> {
    try {
      const profileRef = await db.collection('userProfiles').add({
        ...profileData,
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return profileRef.id;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const snapshot = await db.collection('userProfiles').where('userId', '==', userId).get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        joinDate: data.joinDate || new Date(),
        stats: {
          ...data.stats,
          badges: data.stats?.badges?.map((badge: Badge) => ({
            ...badge,
            earnedDate: badge.earnedDate || new Date(),
          })) || [],
        },
      } as UserProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const snapshot = await db.collection('userProfiles').where('userId', '==', userId).get();
      
      if (snapshot.empty) {
        throw new Error('User profile not found');
      }
      
      const profileRef = db.collection('userProfiles').doc(snapshot.docs[0].id);
      await profileRef.update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Follow System
  async followUser(followerId: string, followingId: string): Promise<string> {
    try {
      // Check if already following
      const existingFollow = await this.getFollow(followerId, followingId);
      if (existingFollow) {
        throw new Error('Already following this user');
      }

      const followRef = await db.collection('follows').add({
        followerId,
        followingId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'active',
      });

      // Update follower counts
      await this.updateFollowerCount(followingId, 1);
      await this.updateFollowingCount(followerId, 1);

      return followRef.id;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      const follow = await this.getFollow(followerId, followingId);
      if (!follow) {
        throw new Error('Not following this user');
      }

      await db.collection('follows').doc(follow.id).delete();

      // Update follower counts
      await this.updateFollowerCount(followingId, -1);
      await this.updateFollowingCount(followerId, -1);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async getFollow(followerId: string, followingId: string): Promise<Follow | null> {
    try {
      const snapshot = await db.collection('follows')
        .where('followerId', '==', followerId)
        .where('followingId', '==', followingId)
        .where('status', '==', 'active')
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Follow;
    } catch (error) {
      console.error('Error getting follow:', error);
      throw error;
    }
  }

  async getFollowers(userId: string, limitCount: number = 20): Promise<UserProfile[]> {
    try {
      const snapshot = await db.collection('follows')
        .where('followingId', '==', userId)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();
      
      const followerIds = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => doc.data().followerId);
      const profiles: UserProfile[] = [];
      
      for (const followerId of followerIds) {
        const profile = await this.getUserProfile(followerId);
        if (profile) profiles.push(profile);
      }
      
      return profiles;
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  }

  async getFollowing(userId: string, limitCount: number = 20): Promise<UserProfile[]> {
    try {
      const snapshot = await db.collection('follows')
        .where('followerId', '==', userId)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();
      
      const followingIds = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => doc.data().followingId);
      const profiles: UserProfile[] = [];
      
      for (const followingId of followingIds) {
        const profile = await this.getUserProfile(followingId);
        if (profile) profiles.push(profile);
      }
      
      return profiles;
    } catch (error) {
      console.error('Error getting following:', error);
      throw error;
    }
  }

  // Trade Alerts
  async createTradeAlert(alertData: Omit<TradeAlert, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares'>): Promise<string> {
    try {
      const alertRef = await db.collection('tradeAlerts').add({
        ...alertData,
        timestamp: firestore.FieldValue.serverTimestamp(),
        likes: 0,
        comments: 0,
        shares: 0,
      });
      return alertRef.id;
    } catch (error) {
      console.error('Error creating trade alert:', error);
      throw error;
    }
  }

  async getTradeAlerts(userId?: string, limitCount: number = 20): Promise<TradeAlert[]> {
    try {
      let alertsQuery = db.collection('tradeAlerts')
          .where('isPublic', '==', true)
          .orderBy('timestamp', 'desc')
          .limit(limitCount);
      
      if (userId) {
        alertsQuery = db.collection('tradeAlerts')
          .where('userId', '==', userId)
          .where('isPublic', '==', true)
          .orderBy('timestamp', 'desc')
          .limit(limitCount)
      }
      
      const snapshot = await alertsQuery.get();
      
      return snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as TradeAlert;
      });
    } catch (error) {
      console.error('Error getting trade alerts:', error);
      throw error;
    }
  }

  async getSocialFeed(userId: string, limitCount: number = 20): Promise<SocialFeed[]> {
    try {
      // Get following list
      const following = await this.getFollowing(userId, 100);
      const followingIds = following.map(user => user.id);
      
      // Get trade alerts from following users
      const snapshot = await db.collection('tradeAlerts')
        .where('userId', 'in', followingIds)
        .where('isPublic', '==', true)
        .orderBy('timestamp', 'desc')
        .limit(limitCount)
        .get();
      
      return snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as SocialFeed;
      });
    } catch (error) {
      console.error('Error getting social feed:', error);
      throw error;
    }
  }

  // Copy Trading
  async createCopyTrade(copyTradeData: Omit<CopyTrade, 'id' | 'timestamp' | 'status' | 'profit'>): Promise<string> {
    try {
      const copyTradeRef = await db.collection('copyTrades').add({
        ...copyTradeData,
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        profit: 0,
      });
      return copyTradeRef.id;
    } catch (error) {
      console.error('Error creating copy trade:', error);
      throw error;
    }
  }

  async getCopyTrades(userId: string, limitCount: number = 20): Promise<CopyTrade[]> {
    try {
      const snapshot = await db.collection('copyTrades')
        .where('copierId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limitCount)
        .get();
      
      return snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as CopyTrade;
      });
    } catch (error) {
      console.error('Error getting copy trades:', error);
      throw error;
    }
  }

  // Leaderboards
  async getLeaderboard(criteria: string, period: string, limitCount: number = 50): Promise<LeaderboardEntry[]> {
    try {
      // TODO: Implement real leaderboard data from database
      // This should query user performance data and calculate rankings
      throw new Error('Leaderboard data not implemented - requires production database integration');
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Messaging
  async sendDirectMessage(messageData: Omit<DirectMessage, 'id' | 'timestamp' | 'isRead'>): Promise<string> {
    try {
      const messageRef = await db.collection('directMessages').add({
        ...messageData,
        timestamp: firestore.FieldValue.serverTimestamp(),
        isRead: false,
      });
      return messageRef.id;
    } catch (error) {
      console.error('Error sending direct message:', error);
      throw error;
    }
  }

  async getDirectMessages(userId: string, otherUserId: string, limitCount: number = 50): Promise<DirectMessage[]> {
    try {
      const snapshot = await db.collection('directMessages')
        .where('senderId', 'in', [userId, otherUserId])
        .where('recipientId', 'in', [userId, otherUserId])
        .orderBy('timestamp', 'desc')
        .limit(limitCount)
        .get();
      
      return snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as DirectMessage;
      });
    } catch (error) {
      console.error('Error getting direct messages:', error);
      throw error;
    }
  }

  // Analytics
  async getSocialAnalytics(userId: string, period: string): Promise<SocialAnalytics> {
    try {
      // TODO: Implement real social analytics from database
      // This should query user engagement data and calculate metrics
      throw new Error('Social analytics not implemented - requires production database integration');
        userId,
        period: period as any,
        followers: {
          total: 1250,
          gained: 45,
          lost: 12,
          growth: 2.7,
        },
        engagement: {
          totalLikes: 3420,
          totalComments: 890,
          totalShares: 234,
          avgEngagement: 4.2,
        },
        content: {
          postsCount: 156,
          avgLikesPerPost: 21.9,
          avgCommentsPerPost: 5.7,
          avgSharesPerPost: 1.5,
        },
        trading: {
          tradesShared: 89,
          copyTradesReceived: 234,
          totalCopied: 1567,
          copySuccessRate: 78.5,
        },
      };
    } catch (error) {
      console.error('Error getting social analytics:', error);
      throw error;
    }
  }

  // Helper Methods
  private async updateFollowerCount(userId: string, change: number): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      if (profile) {
        await this.updateUserProfile(userId, {
          stats: {
            ...profile.stats,
            followersCount: profile.stats.followersCount + change,
          },
        });
      }
    } catch (error) {
      console.error('Error updating follower count:', error);
    }
  }

  private async updateFollowingCount(userId: string, change: number): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      if (profile) {
        await this.updateUserProfile(userId, {
          stats: {
            ...profile.stats,
            followingCount: profile.stats.followingCount + change,
          },
        });
      }
    } catch (error) {
      console.error('Error updating following count:', error);
    }
  }

  // Search Users
  async searchUsers(query: string, limitCount: number = 20): Promise<UserProfile[]> {
    try {
      // This would typically use a search service like Algolia
      // For now, we'll return mock data
      const mockUsers: UserProfile[] = [
        {
          id: 'user1',
          username: 'trader_pro',
          displayName: 'Trader Pro',
          bio: 'Professional trader with 10+ years experience',
          location: 'Accra, Ghana',
          joinDate: new Date('2020-01-15'),
          verified: true,
          stats: {
            followersCount: 1250,
            followingCount: 340,
            totalTrades: 1250,
            winRate: 78.5,
            totalReturn: 45.2,
            avgReturn: 3.2,
            bestTrade: 15.8,
            worstTrade: -8.2,
            riskScore: 7,
            experienceLevel: 'Expert',
            badges: [],
            portfolioValue: 125000,
            monthlyReturn: 5.2,
            yearlyReturn: 45.2,
          },
          preferences: {
            notifications: {
              newFollower: true,
              tradeAlerts: true,
              marketUpdates: true,
              socialActivity: true,
            },
            privacy: {
              showPortfolio: true,
              showTrades: true,
              showReturns: true,
              allowMessages: true,
            },
            trading: {
              riskTolerance: 'Aggressive',
              investmentStyle: 'Growth',
              preferredSectors: ['Technology', 'Banking'],
            },
          },
          privacy: {
            profileVisibility: 'Public',
            tradeVisibility: 'Public',
            portfolioVisibility: 'Public',
            allowCopyTrading: true,
            showRealMoney: false,
          },
        },
        // Add more mock users...
      ];
      
      return mockUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limitCount);
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
}
