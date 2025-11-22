import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

export const ContentModeration: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reported' | 'approved' | 'rejected'>('pending');

  const mockContent = [
    {
      id: '1',
      type: 'post',
      author: 'John Doe',
      content: 'Check out this stock analysis...',
      status: 'pending',
      reports: 0,
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      type: 'comment',
      author: 'Jane Smith',
      content: 'Great insights!',
      status: 'reported',
      reports: 3,
      timestamp: '5 hours ago',
    },
  ];

  const filteredContent = mockContent.filter(item => 
    filter === 'all' || item.status === filter
  );

  const handleApprove = (item: any) => {
    // Managers can approve content
  };

  const handleReject = (item: any) => {
    // Managers can reject/remove content
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Filters */}
        <View style={styles.section}>
          <View style={styles.filterRow}>
            {(['all', 'pending', 'reported', 'approved', 'rejected'] as const).map((filterOption) => (
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

        {/* Content List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Content Moderation ({filteredContent.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {filteredContent.map((item) => (
              <View key={item.id} style={styles.contentRow}>
                <View style={styles.contentInfo}>
                  <View style={styles.contentHeader}>
                    <View style={[
                      styles.typeBadge,
                      { backgroundColor: item.type === 'post' ? colors.primaryLight : colors.warningLight },
                    ]}>
                      <Text style={[
                        styles.typeText,
                        { color: item.type === 'post' ? colors.primary : colors.warning },
                      ]}>
                        {item.type}
                      </Text>
                    </View>
                    {item.reports > 0 && (
                      <View style={[styles.reportBadge, { backgroundColor: colors.errorLight }]}>
                        <SFSymbol name="exclamationmark.triangle.fill" size={12} color={colors.error} />
                        <Text style={[styles.reportText, { color: colors.error }]}>
                          {item.reports} reports
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.contentText, { color: colors.textPrimary }]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.contentAuthor, { color: colors.textSecondary }]}>
                    {item.author} • {item.timestamp}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.successLight }]}
                    onPress={() => handleApprove(item)}
                  >
                    <SFSymbol name="checkmark.circle.fill" size={18} color={colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
                    onPress={() => handleReject(item)}
                  >
                    <SFSymbol name="xmark.circle.fill" size={18} color={colors.error} />
                  </TouchableOpacity>
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  contentInfo: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  typeText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  reportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    gap: spacing.xs,
  },
  reportText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  contentText: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  contentAuthor: {
    ...typography.bodySmall,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

