import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { StockService } from '../services/stockService';
import { PortfolioItem, Stock } from '../types';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const PortfolioScreen: React.FC = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const stockService = StockService.getInstance();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [portfolioData, stocksData] = await Promise.all([
        user ? stockService.getPortfolio(user.uid) : [],
        stockService.getStocks(),
      ]);

      setPortfolio(portfolioData);
      setStocks(stocksData);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      Alert.alert('Error', 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (user) {
        const updatedPortfolio = await stockService.getPortfolio(user.uid);
        setPortfolio(updatedPortfolio);
      }
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateTotalValue = () => {
    return portfolio.reduce((total, item) => total + item.totalValue, 0);
  };

  const calculateTotalGain = () => {
    return portfolio.reduce((total, item) => total + item.profitLoss, 0);
  };

  const calculateTotalGainPercent = () => {
    const totalValue = calculateTotalValue();
    const totalGain = calculateTotalGain();
    const investedAmount = totalValue - totalGain;
    return investedAmount > 0 ? (totalGain / investedAmount) * 100 : 0;
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getStockName = (stockId: string) => {
    const stock = stocks.find(s => s.id === stockId);
    return stock?.name || 'Unknown Stock';
  };

  const getStockSymbol = (stockId: string) => {
    const stock = stocks.find(s => s.id === stockId);
    return stock?.symbol || 'UNK';
  };

  const renderPortfolioHeader = () => {
    const totalValue = calculateTotalValue();
    const totalGain = calculateTotalGain();
    const totalGainPercent = calculateTotalGainPercent();
    const isPositive = totalGain >= 0;

    return (
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Total Value</Text>
          <Text style={styles.portfolioValue}>{formatCurrency(totalValue)}</Text>
          
          <View style={styles.gainContainer}>
            <Text style={[
              styles.gainText,
              { color: isPositive ? colors.success : colors.error }
            ]}>
              {formatCurrency(totalGain)} ({formatPercent(totalGainPercent)})
            </Text>
            <Text style={styles.gainLabel}>Total Gain/Loss</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPortfolioChart = () => {
    if (portfolio.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartIcon}>📊</Text>
          <Text style={styles.emptyChartText}>No investments yet</Text>
          <Text style={styles.emptyChartSubtext}>
            Start investing to see your portfolio breakdown
          </Text>
        </View>
      );
    }

    // Simple pie chart representation with colored segments
    const totalValue = calculateTotalValue();
    const segments = portfolio.map((item, index) => {
      const percentage = (item.totalValue / totalValue) * 100;
      const colors_list = [colors.primary, colors.accent, colors.success, colors.warning, colors.error];
      return {
        ...item,
        percentage,
        color: colors_list[index % colors_list.length],
      };
    });

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Portfolio Breakdown</Text>
        <View style={styles.pieChart}>
          {segments.map((segment, index) => (
            <View
              key={segment.stockId}
              style={[
                styles.chartSegment,
                {
                  backgroundColor: segment.color,
                  transform: [{ rotate: `${(index * 360) / segments.length}deg` }],
                }
              ]}
            />
          ))}
        </View>
        <View style={styles.legend}>
          {segments.map((segment, index) => (
            <View key={segment.stockId} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
              <Text style={styles.legendText}>
                {getStockSymbol(segment.stockId)} ({segment.percentage.toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderHoldingsList = () => {
    if (portfolio.length === 0) {
      return (
        <View style={styles.emptyHoldings}>
          <Text style={styles.emptyHoldingsIcon}>💼</Text>
          <Text style={styles.emptyHoldingsText}>No holdings</Text>
          <Text style={styles.emptyHoldingsSubtext}>
            Your stock holdings will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.holdingsContainer}>
        <Text style={styles.holdingsTitle}>Your Holdings</Text>
        {portfolio.map((item, index) => {
          const isPositive = item.profitLoss >= 0;
          return (
            <View key={item.stockId} style={styles.holdingItem}>
              <View style={styles.holdingInfo}>
                <Text style={styles.holdingSymbol}>
                  {getStockSymbol(item.stockId)}
                </Text>
                <Text style={styles.holdingName}>
                  {getStockName(item.stockId)}
                </Text>
                <Text style={styles.holdingQuantity}>
                  {item.quantity} shares
                </Text>
              </View>
              
              <View style={styles.holdingValue}>
                <Text style={styles.holdingPrice}>
                  {formatCurrency(item.currentPrice)}
                </Text>
                <Text style={styles.holdingTotal}>
                  {formatCurrency(item.totalValue)}
                </Text>
                <Text style={[
                  styles.holdingChange,
                  { color: isPositive ? colors.success : colors.error }
                ]}>
                  {formatCurrency(item.profitLoss)} ({formatPercent(item.profitLossPercent)})
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => Alert.alert('Export', 'Export portfolio to PDF')}
      >
        <Text style={styles.actionIcon}>📄</Text>
        <Text style={styles.actionText}>Export PDF</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => Alert.alert('Share', 'Share portfolio performance')}
      >
        <Text style={styles.actionIcon}>📤</Text>
        <Text style={styles.actionText}>Share</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderPortfolioHeader()}
      {renderPortfolioChart()}
      {renderHoldingsList()}
      {renderQuickActions()}
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
    marginBottom: spacing.lg,
  },
  portfolioCard: {
    backgroundColor: colors.background,
    padding: spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
    ...shadows.card,
  },
  portfolioLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  portfolioValue: {
    ...typography.priceXLarge,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  gainContainer: {
    alignItems: 'center',
  },
  gainText: {
    ...typography.h5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  gainLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chartContainer: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  chartTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  chartSegment: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: 0,
    left: 0,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyChart: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyChartIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyChartText: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyChartSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  holdingsContainer: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  holdingsTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingSymbol: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  holdingName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  holdingQuantity: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  holdingValue: {
    alignItems: 'flex-end',
  },
  holdingPrice: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  holdingTotal: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  holdingChange: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  emptyHoldings: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyHoldingsIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyHoldingsText: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyHoldingsSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    margin: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    ...shadows.card,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
