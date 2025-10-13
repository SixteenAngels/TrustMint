import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PortfolioCardProps {
  totalValue: number;
  dayGain: number;
  dayGainPercent: number;
  balance: number;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  totalValue,
  dayGain,
  dayGainPercent,
  balance,
}) => {
  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio Value</Text>
        <Text style={styles.balance}>Cash: {formatCurrency(balance)}</Text>
      </View>
      
      <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
      
      <View style={styles.gainContainer}>
        <Text style={[
          styles.dayGain,
          { color: dayGain >= 0 ? '#34C759' : '#FF3B30' }
        ]}>
          {formatCurrency(dayGain)} ({formatPercent(dayGainPercent)})
        </Text>
        <Text style={styles.dayGainLabel}>Today</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  balance: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  gainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayGain: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  dayGainLabel: {
    fontSize: 14,
    color: '#666',
  },
});