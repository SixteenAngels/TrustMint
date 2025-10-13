import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stock } from '../types';

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
              <Text style={styles.quantity}>{quantity} shares</Text>
            )}
          </View>
          <Text style={styles.stockName} numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
        
        <View style={styles.stockPrice}>
          <Text style={styles.price}>{formatCurrency(stock.price)}</Text>
          <View style={styles.changeContainer}>
            <Text style={[
              styles.change,
              { color: isPositive ? '#34C759' : '#FF3B30' }
            ]}>
              {formatPercent(stock.changePercent)}
            </Text>
            <Text style={[
              styles.changeAmount,
              { color: isPositive ? '#34C759' : '#FF3B30' }
            ]}>
              {formatCurrency(Math.abs(stock.change))}
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
    backgroundColor: '#fff',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stockInfo: {
    flex: 1,
    marginRight: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  quantity: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockName: {
    fontSize: 14,
    color: '#666',
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  changeAmount: {
    fontSize: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});