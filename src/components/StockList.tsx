import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stock } from '../types';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

interface StockListProps {
  stocks: Stock[];
  showQuantity?: boolean;
  quantities?: number[];
  onStockPress?: (stock: Stock) => void;
}

export const StockList: React.FC<StockListProps> = ({
  stocks,
  showQuantity = false,
  quantities = [],
  onStockPress,
}) => {
  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const renderStockItem = (stock: Stock, index: number) => {
    const quantity = quantities[index] || 0;
    const isPositive = stock.change >= 0;
    const statusColor = isPositive ? colors.success : colors.error;
    const statusBackground = isPositive ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)';
    
    return (
      <TouchableOpacity
        key={stock.id}
        style={styles.stockItem}
        onPress={() => onStockPress?.(stock)}
      >
        <View style={styles.stockInfo}>
          <View style={styles.stockHeader}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            {showQuantity && quantity > 0 && (
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>{quantity} shares</Text>
              </View>
            )}
          </View>
          <Text style={styles.stockName} numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
        
        <View style={styles.stockPrice}>
          <Text style={styles.price}>{formatCurrency(stock.price)}</Text>
          <View style={[styles.changeContainer, { backgroundColor: statusBackground }]}>
            <Text style={[styles.change, { color: statusColor }]}>
              {formatPercent(stock.changePercent)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (stocks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No stocks available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {stocks.map(renderStockItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stockInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stockSymbol: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  quantityBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  quantityText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  stockName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  changeContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  change: {
    ...typography.caption,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
