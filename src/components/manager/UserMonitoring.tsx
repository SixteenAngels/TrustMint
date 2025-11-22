import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

export const UserMonitoring: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'verified' | 'suspended'>('all');

  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', verified: true, trades: 45, joined: '2024-01-15', flagged: false },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', verified: true, trades: 23, joined: '2024-02-20', flagged: false },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'suspended', verified: false, trades: 12, joined: '2024-03-10', flagged: true },
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && user.status === 'active') ||
                         (filter === 'verified' && user.verified) ||
                         (filter === 'suspended' && user.status === 'suspended');
    return matchesSearch && matchesFilter;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Search and Filters */}
        <View style={styles.section}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.backgroundSecondary, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Search users..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.filterRow}>
            {(['all', 'active', 'verified', 'suspended'] as const).map((filterOption) => (
              <TouchableOpacity
                key={filterOption}
                style={[
                  styles.filterButton,
                  { backgroundColor: filter === filterOption ? colors.primary : colors.backgroundSecondary },
                ]}
                onPress={() => setFilter(filterOption)}
              >
                <Text style={[
                  styles.filterButtonText,
                  { color: filter === filterOption ? colors.textWhite : colors.textSecondary },
                ]}>
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Users List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Users ({filteredUsers.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <View style={styles.userHeader}>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: user.status === 'active' ? colors.successLight : colors.errorLight },
                    ]}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: user.status === 'active' ? colors.success : colors.error },
                      ]} />
                      <Text style={[
                        styles.statusText,
                        { color: user.status === 'active' ? colors.success : colors.error },
                      ]}>
                        {user.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                  <View style={styles.userStats}>
                    <Text style={[styles.userStat, { color: colors.textSecondary }]}>
                      {user.trades} trades
                    </Text>
                    <Text style={[styles.userStat, { color: colors.textSecondary }]}>
                      Joined: {user.joined}
                    </Text>
                    {user.verified && (
                      <View style={[styles.verifiedBadge, { backgroundColor: colors.successLight }]}>
                        <SFSymbol name="checkmark.shield.fill" size={12} color={colors.success} />
                        <Text style={[styles.verifiedText, { color: colors.success }]}>Verified</Text>
                      </View>
                    )}
                    {user.flagged && (
                      <View style={[styles.flaggedBadge, { backgroundColor: colors.errorLight }]}>
                        <SFSymbol name="flag.fill" size={12} color={colors.error} />
                        <Text style={[styles.flaggedText, { color: colors.error }]}>Flagged</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.viewButton, { backgroundColor: colors.primaryLight }]}
                    onPress={() => {}}
                  >
                    <Text style={[styles.viewButtonText, { color: colors.primary }]}>View</Text>
                  </TouchableOpacity>
                  {user.status === 'active' && (
                    <TouchableOpacity
                      style={[styles.flagButton, { backgroundColor: colors.warningLight }]}
                      onPress={() => {
                        // This would call flagUser backend function
                        Alert.alert('Flag User', `Flag ${user.name} for review?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Flag', onPress: () => Alert.alert('Success', 'User flagged for admin review') },
                        ]);
                      }}
                    >
                      <SFSymbol name="flag" size={16} color={colors.warning} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  searchInput: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...typography.body,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  filterButtonText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.h6,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  userEmail: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  userStat: {
    ...typography.caption,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    gap: spacing.xs,
  },
  verifiedText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '600',
  },
  flaggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    gap: spacing.xs,
  },
  flaggedText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  viewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  viewButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  flagButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

