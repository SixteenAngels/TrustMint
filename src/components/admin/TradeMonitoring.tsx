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

interface Trade {
  id: string;
  userId: string;
  userName: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  status: 'executed' | 'pending' | 'failed';
  market: 'Ghana' | 'US' | 'Crypto';
  broker: string;
  aiAssisted: boolean;
  timestamp: string;
  flagged: boolean;
}

export const TradeMonitoring: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [filter, setFilter] = useState<'all' | 'executed' | 'pending' | 'failed' | 'flagged'>('all');

  const mockTrades: Trade[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      type: 'buy',
      symbol: 'MTN',
      amount: 100,
      price: 12.50,
      status: 'executed',
      market: 'Ghana',
      broker: 'GSE',
      aiAssisted: true,
      timestamp: '2 hours ago',
      flagged: false,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      type: 'sell',
      symbol: 'AAPL',
      amount: 50,
      price: 150.00,
      status: 'executed',
      market: 'US',
      broker: 'Polygon',
      aiAssisted: false,
      timestamp: '1 hour ago',
      flagged: true,
    },
  ];

  const filteredTrades = mockTrades.filter((trade) => 
    filter === 'all' || trade.status === filter || (filter === 'flagged' && trade.flagged)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.filterTabs}>
          {(['all', 'executed', 'pending', 'failed', 'flagged'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterTab,
                filter === f && { backgroundColor: colors.primary },
                { borderColor: colors.border },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: filter === f ? colors.textWhite : colors.textSecondary },
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tradesList}>
          {filteredTrades.map((trade) => (
            <View key={trade.id} style={[styles.tradeCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.tradeHeader}>
                <View style={styles.tradeType}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: trade.type === 'buy' ? colors.successLight : colors.errorLight },
                    ]}
                  >
                    <SFSymbol
                      name={trade.type === 'buy' ? 'arrow.up' : 'arrow.down'}
                      size={16}
                      color={trade.type === 'buy' ? colors.success : colors.error}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        { color: trade.type === 'buy' ? colors.success : colors.error },
                      ]}
                    >
                      {trade.type.toUpperCase()}
                    </Text>
                  </View>
                  {trade.aiAssisted && (
                    <View style={[styles.aiBadge, { backgroundColor: colors.primaryLight }]}>
                      <SFSymbol name="sparkles" size={12} color={colors.primary} />
                      <Text style={[styles.aiText, { color: colors.primary }]}>AI</Text>
                    </View>
                  )}
                  {trade.flagged && (
                    <View style={[styles.flagBadge, { backgroundColor: colors.errorLight }]}>
                      <SFSymbol name="exclamationmark.triangle.fill" size={12} color={colors.error} />
                    </View>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(trade.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(trade.status) }]}>
                    {trade.status}
                  </Text>
                </View>
              </View>

              <View style={styles.tradeDetails}>
                <View style={styles.tradeDetailRow}>
                  <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>Symbol:</Text>
                  <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>
                    {trade.symbol}
                  </Text>
                </View>
                <View style={styles.tradeDetailRow}>
                  <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>User:</Text>
                  <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>
                    {trade.userName}
                  </Text>
                </View>
                <View style={styles.tradeDetailRow}>
                  <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>Amount:</Text>
                  <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>
                    {trade.amount} shares
                  </Text>
                </View>
                <View style={styles.tradeDetailRow}>
                  <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>Price:</Text>
                  <Text style={[styles.tradeDetailValue, { color: colors.primary }]}>
                    ₵{trade.price.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.tradeDetailRow}>
                  <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>Market:</Text>
                  <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>
                    {trade.market}
                  </Text>
                </View>
                <View style={styles.tradeDetailRow}>
                  <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>Broker:</Text>
                  <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>
                    {trade.broker}
                  </Text>
                </View>
                <View style={styles.tradeDetailRow}>
                  <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>Time:</Text>
                  <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>
                    {trade.timestamp}
                  </Text>
                </View>
              </View>
            </View>
          ))}
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
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterTabText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  tradesList: {
    gap: spacing.md,
  },
  tradeCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tradeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  typeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  aiText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '600',
  },
  flagBadge: {
    padding: 2,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  tradeDetails: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tradeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  tradeDetailLabel: {
    ...typography.bodySmall,
  },
  tradeDetailValue: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
});

