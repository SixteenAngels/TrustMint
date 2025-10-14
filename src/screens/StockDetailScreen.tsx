import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { AdvancedChart } from '../components/AdvancedChart';
import { TechnicalAnalysis } from '../components/TechnicalAnalysis';
import { ChartService } from '../services/chartService';
import { StockService } from '../services/stockService';
import { Stock } from '../types';
import { ChartMetrics } from '../types/charting';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface StockDetailScreenProps {
  symbol: string;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const StockDetailScreen: React.FC<StockDetailScreenProps> = ({
  symbol,
  onClose,
}) => {
  const [stock, setStock] = useState<Stock | null>(null);
  const [chartMetrics, setChartMetrics] = useState<ChartMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chart' | 'analysis' | 'info' | 'news'>('chart');

  const stockService = StockService.getInstance();
  const chartService = ChartService.getInstance();

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const stockData = await stockService.getStock(symbol);
      setStock(stockData);
    } catch (error) {
      console.error('Error loading stock data:', error);
      Alert.alert('Error', 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleDataPointPress = (data: any) => {
    // Handle chart data point press
    console.log('Data point pressed:', data);
  };

  const handleBuyStock = () => {
    Alert.alert('Buy Stock', `Buy ${symbol} - Coming soon!`);
  };

  const handleSellStock = () => {
    Alert.alert('Sell Stock', `Sell ${symbol} - Coming soon!`);
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return colors.success;
    if (change < 0) return colors.error;
    return colors.textSecondary;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.stockInfo}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.name}>{stock?.name || 'Loading...'}</Text>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.currentPrice}>
          {stock ? formatCurrency(stock.price) : '₵0.00'}
        </Text>
        <Text style={[
          styles.change,
          { color: stock ? getChangeColor(stock.change) : colors.textSecondary }
        ]}>
          {stock ? `${formatCurrency(stock.change)} (${formatPercentage(stock.changePercent)})` : '₵0.00 (0.00%)'}
        </Text>
      </View>
    </View>
  );

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'chart', label: 'Chart', icon: '📈' },
        { id: 'analysis', label: 'Analysis', icon: '📊' },
        { id: 'info', label: 'Info', icon: 'ℹ️' },
        { id: 'news', label: 'News', icon: '📰' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab(tab.id as any)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.tabTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChartTab = () => (
    <View style={styles.tabContent}>
      <AdvancedChart
        symbol={symbol}
        onDataPointPress={handleDataPointPress}
        theme="light"
      />
    </View>
  );

  const renderAnalysisTab = () => (
    <View style={styles.tabContent}>
      <TechnicalAnalysis
        symbol={symbol}
        timeRange="1M"
      />
    </View>
  );

  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Market Cap</Text>
              <Text style={styles.metricValue}>₵2.5B</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>P/E Ratio</Text>
              <Text style={styles.metricValue}>15.2</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Dividend Yield</Text>
              <Text style={styles.metricValue}>3.2%</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Volume</Text>
              <Text style={styles.metricValue}>1.2M</Text>
            </View>
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {stock?.name || 'Company Name'} is a leading company in the Ghana Stock Exchange.
              The company has shown consistent growth and strong financial performance.
            </Text>
          </View>
        </View>

        {/* Financial Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Highlights</Text>
          <View style={styles.highlightsList}>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightLabel}>Revenue Growth</Text>
              <Text style={[styles.highlightValue, { color: colors.success }]}>+12.5%</Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightLabel}>Profit Margin</Text>
              <Text style={[styles.highlightValue, { color: colors.success }]}>18.3%</Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightLabel}>ROE</Text>
              <Text style={[styles.highlightValue, { color: colors.success }]}>15.7%</Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightLabel}>Debt to Equity</Text>
              <Text style={[styles.highlightValue, { color: colors.warning }]}>0.45</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderNewsTab = () => (
    <View style={styles.tabContent}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest News</Text>
          {[
            {
              title: `${symbol} Reports Strong Q3 Earnings`,
              summary: 'Company exceeds expectations with 15% revenue growth',
              time: '2 hours ago',
            },
            {
              title: 'Analyst Upgrades ${symbol} to Buy',
              summary: 'Goldman Sachs raises target price to ₵1.50',
              time: '5 hours ago',
            },
            {
              title: `${symbol} Announces Dividend Payment`,
              summary: 'Company declares ₵0.05 per share dividend',
              time: '1 day ago',
            },
          ].map((news, index) => (
            <View key={index} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{news.title}</Text>
              <Text style={styles.newsSummary}>{news.summary}</Text>
              <Text style={styles.newsTime}>{news.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[styles.actionButton, styles.sellButton]}
        onPress={handleSellStock}
      >
        <Text style={styles.sellButtonText}>Sell</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.buyButton]}
        onPress={handleBuyStock}
      >
        <Text style={styles.buyButtonText}>Buy</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading stock details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabSelector()}
      
      {activeTab === 'chart' && renderChartTab()}
      {activeTab === 'analysis' && renderAnalysisTab()}
      {activeTab === 'info' && renderInfoTab()}
      {activeTab === 'news' && renderNewsTab()}
      
      {renderActionButtons()}
    </View>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.backgroundSecondary,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  stockInfo: {
    flex: 1,
    alignItems: 'center',
  },
  symbol: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  name: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  change: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
  },
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  highlightsList: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  highlightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  highlightLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  highlightValue: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  newsCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  newsTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  newsSummary: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  newsTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  actionButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  sellButton: {
    backgroundColor: colors.error,
  },
  buyButton: {
    backgroundColor: colors.primary,
  },
  sellButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontSize: 18,
  },
  buyButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontSize: 18,
  },
});