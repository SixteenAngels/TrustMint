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

export const SupportTickets: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'urgent'>('all');

  const mockTickets = [
    { id: '1', user: 'John Doe', subject: 'Account verification issue', status: 'open', priority: 'high', time: '2 hours ago' },
    { id: '2', user: 'Jane Smith', subject: 'Payment not processing', status: 'open', priority: 'urgent', time: '5 hours ago' },
    { id: '3', user: 'Bob Johnson', subject: 'Trading question', status: 'resolved', priority: 'medium', time: '1 day ago' },
  ];

  const filteredTickets = mockTickets.filter(ticket => 
    filter === 'all' || 
    (filter === 'open' && ticket.status === 'open') ||
    (filter === 'resolved' && ticket.status === 'resolved') ||
    (filter === 'urgent' && ticket.priority === 'urgent')
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      default: return colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Filters */}
        <View style={styles.section}>
          <View style={styles.filterRow}>
            {(['all', 'open', 'resolved', 'urgent'] as const).map((filterOption) => (
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

        {/* Tickets List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Support Tickets ({filteredTickets.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {filteredTickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketRow}>
                <View style={styles.ticketInfo}>
                  <View style={styles.ticketHeader}>
                    <Text style={[styles.ticketSubject, { color: colors.textPrimary }]}>
                      {ticket.subject}
                    </Text>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: `${getPriorityColor(ticket.priority)}20` },
                    ]}>
                      <Text style={[
                        styles.priorityText,
                        { color: getPriorityColor(ticket.priority) },
                      ]}>
                        {ticket.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.ticketUser, { color: colors.textSecondary }]}>
                    {ticket.user} • {ticket.time}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: ticket.status === 'resolved' ? colors.successLight : colors.warningLight },
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: ticket.status === 'resolved' ? colors.success : colors.warning },
                    ]}>
                      {ticket.status}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.viewButton, { backgroundColor: colors.primaryLight }]}
                  onPress={() => {}}
                >
                  <Text style={[styles.viewButtonText, { color: colors.primary }]}>View</Text>
                </TouchableOpacity>
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
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  ticketSubject: {
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
  priorityText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  ticketUser: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
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
});

