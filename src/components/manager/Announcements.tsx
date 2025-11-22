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

export const Announcements: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const mockAnnouncements = [
    {
      id: '1',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight at 2 AM',
      priority: 'high',
      status: 'active',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      title: 'New Feature Release',
      message: 'Check out our new AI trading features!',
      priority: 'medium',
      status: 'active',
      timestamp: '1 day ago',
    },
  ];

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.trim()) {
      Alert.alert('Error', 'Please enter an announcement message');
      return;
    }
    // This would call a backend function
    Alert.alert('Success', 'Announcement created (pending admin approval)');
    setNewAnnouncement('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Create Announcement */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Create Announcement</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Enter announcement message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={newAnnouncement}
              onChangeText={setNewAnnouncement}
            />
            <View style={styles.priorityRow}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Priority:</Text>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    { backgroundColor: priority === p ? colors.primary : colors.background },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    { color: priority === p ? colors.textWhite : colors.textSecondary },
                  ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateAnnouncement}
            >
              <SFSymbol name="paperplane.fill" size={18} color={colors.textWhite} />
              <Text style={[styles.createButtonText, { color: colors.textWhite }]}>
                Create Announcement
              </Text>
            </TouchableOpacity>
            <View style={[styles.noteCard, { backgroundColor: colors.warningLight }]}>
              <SFSymbol name="info.circle.fill" size={16} color={colors.warning} />
              <Text style={[styles.noteText, { color: colors.warning }]}>
                Announcements require admin approval before being sent to users.
              </Text>
            </View>
          </View>
        </View>

        {/* Active Announcements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Active Announcements ({mockAnnouncements.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {mockAnnouncements.map((announcement) => (
              <View key={announcement.id} style={styles.announcementRow}>
                <View style={styles.announcementInfo}>
                  <View style={styles.announcementHeader}>
                    <Text style={[styles.announcementTitle, { color: colors.textPrimary }]}>
                      {announcement.title}
                    </Text>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: `${getPriorityColor(announcement.priority)}20` },
                    ]}>
                      <Text style={[
                        styles.priorityBadgeText,
                        { color: getPriorityColor(announcement.priority) },
                      ]}>
                        {announcement.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.announcementMessage, { color: colors.textSecondary }]}>
                    {announcement.message}
                  </Text>
                  <Text style={[styles.announcementTime, { color: colors.textSecondary }]}>
                    {announcement.timestamp}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: colors.successLight },
                ]}>
                  <Text style={[styles.statusText, { color: colors.success }]}>
                    {announcement.status}
                  </Text>
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
  card: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
    ...typography.body,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyMedium,
    marginRight: spacing.sm,
  },
  priorityButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityButtonText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  createButtonText: {
    ...typography.button,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.sm,
  },
  noteText: {
    ...typography.bodySmall,
    flex: 1,
    fontSize: 11,
  },
  announcementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  announcementTitle: {
    ...typography.h6,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
  priorityBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  announcementMessage: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  announcementTime: {
    ...typography.bodySmall,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
});

