import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SocialService } from '../services/socialService';
import { UserProfile, TradeAlert, SocialFeed } from '../types/social';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const SocialTradingScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'leaders' | 'messages'>('feed');
  const [socialFeed, setSocialFeed] = useState<SocialFeed[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<UserProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const socialService = SocialService.getInstance();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'feed') {
      loadSocialFeed();
    } else if (activeTab === 'discover') {
      loadDiscoverUsers();
    } else if (activeTab === 'leaders') {
      loadLeaderboard();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSocialFeed(),
        loadDiscoverUsers(),
        loadLeaderboard(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSocialFeed = async () => {
    try {
      // Mock user ID - in real app, get from auth context
      const userId = 'current_user_id';
      const feed = await socialService.getSocialFeed(userId, 20);
      setSocialFeed(feed);
    } catch (error) {
      console.error('Error loading social feed:', error);
    }
  };

  const loadDiscoverUsers = async () => {
    try {
      const users = await socialService.searchUsers('', 20);
      setDiscoverUsers(users);
    } catch (error) {
      console.error('Error loading discover users:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaders = await socialService.getLeaderboard('returns', 'monthly', 20);
      setLeaderboard(leaders);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      // Mock current user ID
      const currentUserId = 'current_user_id';
      await socialService.followUser(currentUserId, userId);
      Alert.alert('Success', 'You are now following this user!');
    } catch (error) {
      console.error('Error following user:', error);
      Alert.alert('Error', 'Failed to follow user');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      // Implement like functionality
      Alert.alert('Liked', 'Post liked!');
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSharePost = async (postId: string) => {
    try {
      // Implement share functionality
      Alert.alert('Shared', 'Post shared!');
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'feed', label: 'Feed', icon: '📰' },
        { id: 'discover', label: 'Discover', icon: '🔍' },
        { id: 'leaders', label: 'Leaders', icon: '🏆' },
        { id: 'messages', label: 'Messages', icon: '💬' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab(tab.id as any)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.tabTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSocialFeed = () => (
    <ScrollView 
      style={styles.feedContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {socialFeed.map((post) => (
        <View key={post.id} style={styles.feedPost}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.username}>@trader_pro</Text>
                <Text style={styles.postTime}>2 hours ago</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.postContent}>
            <Text style={styles.postText}>
              Just bought 100 shares of MTN at ₵1.20. Expecting 15% upside based on technical analysis. 
              #MTN #GhanaStocks #Trading
            </Text>
            
            <View style={styles.tradeDetails}>
              <View style={styles.tradeItem}>
                <Text style={styles.tradeLabel}>Symbol</Text>
                <Text style={styles.tradeValue}>MTN</Text>
              </View>
              <View style={styles.tradeItem}>
                <Text style={styles.tradeLabel}>Action</Text>
                <Text style={[styles.tradeValue, { color: colors.success }]}>BUY</Text>
              </View>
              <View style={styles.tradeItem}>
                <Text style={styles.tradeLabel}>Price</Text>
                <Text style={styles.tradeValue}>₵1.20</Text>
              </View>
              <View style={styles.tradeItem}>
                <Text style={styles.tradeLabel}>Target</Text>
                <Text style={[styles.tradeValue, { color: colors.success }]}>₵1.38</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLikePost(post.id)}
            >
              <Text style={styles.actionIcon}>❤️</Text>
              <Text style={styles.actionText}>24</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>8</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleSharePost(post.id)}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderDiscoverUsers = () => (
    <ScrollView style={styles.discoverContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search traders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {discoverUsers.map((user) => (
        <View key={user.id} style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.displayName}>{user.displayName}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.userBio}>{user.bio}</Text>
              <View style={styles.userStats}>
                <Text style={styles.statText}>
                  {user.stats.followersCount} followers
                </Text>
                <Text style={styles.statText}>
                  {user.stats.totalReturn}% return
                </Text>
                <Text style={styles.statText}>
                  {user.stats.winRate}% win rate
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.followButton}
            onPress={() => handleFollowUser(user.id)}
          >
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <ScrollView style={styles.leaderboardContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>Top Traders This Month</Text>
        <Text style={styles.leaderboardSubtitle}>Based on returns</Text>
      </View>
      
      {leaderboard.map((entry, index) => (
        <View key={entry.userId} style={styles.leaderboardEntry}>
          <View style={styles.rankContainer}>
            <Text style={styles.rankNumber}>{entry.rank}</Text>
            {entry.rank <= 3 && (
              <Text style={styles.rankMedal}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
              </Text>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.displayName}>{entry.displayName}</Text>
              <Text style={styles.username}>@{entry.username}</Text>
            </View>
          </View>
          
          <View style={styles.performanceContainer}>
            <Text style={styles.performanceValue}>
              +{entry.value}%
            </Text>
            <Text style={[
              styles.performanceChange,
              { color: entry.change >= 0 ? colors.success : colors.error }
            ]}>
              {entry.change >= 0 ? '+' : ''}{entry.change}%
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderMessages = () => (
    <View style={styles.messagesContainer}>
      <Text style={styles.comingSoonText}>Messages coming soon!</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading social features...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Social Trading</Text>
        <Text style={styles.subtitle}>Connect with traders, share insights</Text>
      </View>

      {/* Tab Selector */}
      {renderTabSelector()}

      {/* Content */}
      {activeTab === 'feed' && renderSocialFeed()}
      {activeTab === 'discover' && renderDiscoverUsers()}
      {activeTab === 'leaders' && renderLeaderboard()}
      {activeTab === 'messages' && renderMessages()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  feedContainer: {
    flex: 1,
  },
  feedPost: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  displayName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  postTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  followButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  postContent: {
    marginBottom: spacing.md,
  },
  postText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  tradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
  },
  tradeItem: {
    alignItems: 'center',
  },
  tradeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tradeValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  discoverContainer: {
    flex: 1,
  },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  searchInput: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  userBio: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  userStats: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardHeader: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  leaderboardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  leaderboardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 40,
  },
  rankNumber: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  rankMedal: {
    fontSize: 20,
    marginTop: spacing.xs,
  },
  performanceContainer: {
    alignItems: 'flex-end',
    marginLeft: 'auto',
  },
  performanceValue: {
    ...typography.h4,
    color: colors.success,
    fontWeight: '700',
  },
  performanceChange: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  messagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    ...typography.h4,
    color: colors.textSecondary,
  },
});