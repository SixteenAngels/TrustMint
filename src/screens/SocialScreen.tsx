import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { SocialService } from '../services/socialService';
import { User, Post } from '../types';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const SocialScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const socialService = SocialService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, postsData] = await Promise.all([
        socialService.getUsers(),
        socialService.getPosts(),
      ]);
      setUsers(usersData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading social data:', error);
      Alert.alert('Error', 'Failed to load social data');
    } finally {
      setLoading(false);
    }
  };

  const renderFollowSuggestion = ({ item }: { item: User }) => (
    <View style={styles.followCard}>
      <Image source={{ uri: item.avatar }} style={styles.followAvatar} />
      <Text style={styles.followName}>{item.name}</Text>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.userAvatar }} style={styles.postAvatar} />
        <View>
          <Text style={styles.postUserName}>{item.userName}</Text>
          <Text style={styles.postTime}>{item.timestamp}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postActionButton}>
          <Text>👍</Text>
          <Text style={styles.postActionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton}>
          <Text>💬</Text>
          <Text style={styles.postActionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton}>
          <Text>🔄</Text>
          <Text style={styles.postActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading social feed...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
      </View>

      <View style={styles.followContainer}>
        <Text style={styles.sectionTitle}>Who to Follow</Text>
        <FlatList
          data={users}
          renderItem={renderFollowSuggestion}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: spacing.lg }}
        />
      </View>

      <View style={styles.feedContainer}>
        <Text style={styles.sectionTitle}>Feed</Text>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScrollView>
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
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  followContainer: {
    paddingVertical: spacing.lg,
  },
  followCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.card,
    width: 140,
  },
  followAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.sm,
  },
  followName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  followButtonText: {
    ...typography.bodySmall,
    color: '#fff',
    fontWeight: 'bold',
  },
  feedContainer: {
    paddingVertical: spacing.lg,
  },
  postCard: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  postUserName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  postTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  postContent: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});
