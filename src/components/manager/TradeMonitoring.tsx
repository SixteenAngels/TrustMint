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

export const TradeMonitoring: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [filter, setFilter] = useState<'all' | 'executed' | 'pending' | 'failed' | 'flagged'>('all');

  const mockTrades = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      type: 'buy',
      symbol: 'MTN',
      quantity: 100,
      price: 12.50,
      status: 'executed',
      market: 'Ghana',
      timestamp: '2 hours ago',
      flagged: false,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      type: 'sell',
      symbol: 'AAPL',
      quantity: 50,
      price: 150.00,
      status: 'executed',
      market: 'US',
      timestamp: '1 hour ago',
      flagged: true,
    },
  ];

  const filteredTrades = mockTrades.filter(trade => 
    filter === 'all' || 
    trade.status === filter || 
    (filter === 'flagged' && trade.flagged)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const handleFlagTrade = (trade: any) => {
    // Managers can flag trades for admin review
    // This would call a backend function
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Filters */}
        <View style={styles.section}>
          <View style={styles.filterRow}>
            {(['all', 'executed', 'pending', 'failed', 'flagged'] as const).map((filterOption) => (
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

        {/* Trades List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Trade Monitoring ({filteredTrades.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {filteredTrades.map((trade) => (
              <View key={trade.id} style={styles.tradeRow}>
                <View style={styles.tradeInfo}>
                  <View style={styles.tradeHeader}>
                    <View style={styles.tradeTypeContainer}>
                      <View style={[
                        styles.tradeTypeBadge,
                        { backgroundColor: trade.type === 'buy' ? colors.successLight : colors.errorLight },
                      ]}>
                        <Text style={[
                          styles.tradeTypeText,
                          { color: trade.type === 'buy' ? colors.success : colors.error },
                        ]}>
                          {trade.type.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.tradeSymbol, { color: colors.textPrimary }]}>
                        {trade.symbol}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(trade.status)}20` },
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(trade.status) },
                      ]}>
                        {trade.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.tradeUser, { color: colors.textSecondary }]}>
                    {trade.userName} • {trade.market} • {trade.timestamp}
                  </Text>
                  <View style={styles.tradeDetails}>
                    <Text style={[styles.tradeDetail, { color: colors.textSecondary }]}>
                      Qty: {trade.quantity}
                    </Text>
                    <Text style={[styles.tradeDetail, { color: colors.textSecondary }]}>
                      Price: ₵{trade.price.toFixed(2)}
                    </Text>
                  </View>
                  {trade.flagged && (
                    <View style={[styles.flaggedBadge, { backgroundColor: colors.errorLight }]}>
                      <SFSymbol name="exclamationmark.triangle.fill" size={12} color={colors.error} />
                      <Text style={[styles.flaggedText, { color: colors.error }]}>Flagged for Review</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.flagButton, { backgroundColor: trade.flagged ? colors.errorLight : colors.warningLight }]}
                  onPress={() => handleFlagTrade(trade)}
                >
                  <SFSymbol 
                    name={trade.flagged ? "flag.fill" : "flag"} 
                    size={16} 
                    color={trade.flagged ? colors.error : colors.warning} 
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={[styles.card, { backgroundColor: colors.warningLight }]}>
          <SFSymbol name="info.circle.fill" size={20} color={colors.warning} />
          <Text style={[styles.noteText, { color: colors.warning }]}>
            Managers can flag suspicious trades. Only admins can freeze or cancel trades.
          </Text>
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
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  tradeInfo: {
    flex: 1,
  },
  tradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tradeTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  tradeTypeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  tradeSymbol: {
    ...typography.h6,
    fontWeight: '600',
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
  tradeUser: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  tradeDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  tradeDetail: {
    ...typography.caption,
  },
  flaggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  flaggedText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  flagButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    ...typography.bodySmall,
    flex: 1,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
});

