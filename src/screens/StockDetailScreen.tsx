import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { AdvancedChart } from '../components/AdvancedChart';
import { TechnicalAnalysis } from '../components/TechnicalAnalysis';
import { ChartService } from '../services/chartService';
import { StockService } from '../services/stockService';
import { Stock } from '../types';
import { ChartMetrics } from '../types/charting';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { useTheme } from '../contexts/ThemeContext';
import { SFSymbol } from '../components/SFSymbols';
import { useNavigationContext } from '../contexts/NavigationContext';

interface StockDetailScreenProps {
  symbol: string;
  onClose: () => void;
  onTrade?: (stock: Stock, type: 'buy' | 'sell') => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const StockDetailScreen: React.FC<StockDetailScreenProps> = ({
  symbol,
  onClose,
  onTrade,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [stock, setStock] = useState<Stock | null>(null);
  const [chartMetrics, setChartMetrics] = useState<ChartMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'analysis' | 'info' | 'news'>('chart');

  const stockService = StockService.getInstance();
  const chartService = ChartService.getInstance();
  const { openTrading } = useNavigationContext();

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStockData();
    setRefreshing(false);
  };

  const handleDataPointPress = (data: any) => {
    console.log('Data point pressed:', data);
  };

  const handleBuyStock = () => {
    if (stock && openTrading) {
      openTrading(stock, 'buy');
      onClose(); // Close detail screen when opening trading
    } else if (stock && onTrade) {
      onTrade(stock, 'buy');
    } else {
      Alert.alert('Buy Stock', `Buy ${symbol} - Trading feature coming soon!`);
    }
  };

  const handleSellStock = () => {
    if (stock && openTrading) {
      openTrading(stock, 'sell');
      onClose(); // Close detail screen when opening trading
    } else if (stock && onTrade) {
      onTrade(stock, 'sell');
    } else {
      Alert.alert('Sell Stock', `Sell ${symbol} - Trading feature coming soon!`);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <SFSymbol name="xmark" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>{stock?.name || 'Loading...'}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.priceContainer}>
        <View style={styles.priceMain}>
          <Text style={styles.currentPrice}>
            {stock ? formatCurrency(stock.price) : '₵0.00'}
          </Text>
          <View style={[
            styles.changeBadge,
            stock && { backgroundColor: getChangeColor(stock.change) + '20' }
          ]}>
            <SFSymbol 
              name={stock && stock.change >= 0 ? "arrow.up.right" : "arrow.down.right"} 
              size={14} 
              color={stock ? getChangeColor(stock.change) : colors.textSecondary} 
            />
            <Text style={[
              styles.changeText,
              { color: stock ? getChangeColor(stock.change) : colors.textSecondary }
            ]}>
              {stock ? `${formatCurrency(Math.abs(stock.change))} (${formatPercentage(stock.changePercent)})` : '₵0.00 (0.00%)'}
            </Text>
          </View>
        </View>
        
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatLabel}>High</Text>
            <Text style={styles.quickStatValue}>₵{(stock?.price || 0) * 1.05}</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatLabel}>Low</Text>
            <Text style={styles.quickStatValue}>₵{(stock?.price || 0) * 0.95}</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatLabel}>Vol</Text>
            <Text style={styles.quickStatValue}>
              {stock?.volume ? `${(stock.volume / 1000).toFixed(0)}K` : '0K'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { id: 'chart', label: 'Chart', icon: 'chart.line.uptrend.xyaxis' },
        { id: 'analysis', label: 'Analysis', icon: 'chart.bar' },
        { id: 'info', label: 'Details', icon: 'info.circle' },
        { id: 'news', label: 'News', icon: 'newspaper' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabItem,
            activeTab === tab.id && styles.tabItemActive
          ]}
          onPress={() => setActiveTab(tab.id as any)}
        >
          <SFSymbol 
            name={tab.icon} 
            size={18} 
            color={activeTab === tab.id ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabLabel,
            activeTab === tab.id && styles.tabLabelActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChartTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.chartWrapper}>
        <AdvancedChart
          symbol={symbol}
          onDataPointPress={handleDataPointPress}
          theme="light"
        />
      </View>
    </ScrollView>
  );

  const renderAnalysisTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.chartWrapper}>
        <TechnicalAnalysis
          symbol={symbol}
          timeRange="1M"
        />
      </View>
    </ScrollView>
  );

  const renderInfoTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Key Metrics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <View style={styles.metricIcon}>
              <SFSymbol name="building.2" size={20} color={colors.primary} />
            </View>
            <Text style={styles.metricLabel}>Market Cap</Text>
            <Text style={styles.metricValue}>₵2.5B</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={styles.metricIcon}>
              <SFSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.primary} />
            </View>
            <Text style={styles.metricLabel}>P/E Ratio</Text>
            <Text style={styles.metricValue}>15.2</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={styles.metricIcon}>
              <SFSymbol name="percent" size={20} color={colors.primary} />
            </View>
            <Text style={styles.metricLabel}>Dividend</Text>
            <Text style={styles.metricValue}>3.2%</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={styles.metricIcon}>
              <SFSymbol name="arrow.up.arrow.down" size={20} color={colors.primary} />
            </View>
            <Text style={styles.metricLabel}>Volume</Text>
            <Text style={styles.metricValue}>1.2M</Text>
          </View>
        </View>
      </View>

      {/* Company Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.infoText}>
          {stock?.name || 'Company Name'} is a leading company in the Ghana Stock Exchange.
          The company has shown consistent growth and strong financial performance over the years.
        </Text>
      </View>

      {/* Financial Highlights */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial Highlights</Text>
        <View style={styles.highlightsList}>
          <View style={styles.highlightRow}>
            <View style={styles.highlightLeft}>
              <SFSymbol name="arrow.up.right" size={16} color={colors.success} />
              <Text style={styles.highlightLabel}>Revenue Growth</Text>
            </View>
            <Text style={[styles.highlightValue, { color: colors.success }]}>+12.5%</Text>
          </View>
          <View style={styles.highlightRow}>
            <View style={styles.highlightLeft}>
              <SFSymbol name="chart.bar" size={16} color={colors.success} />
              <Text style={styles.highlightLabel}>Profit Margin</Text>
            </View>
            <Text style={[styles.highlightValue, { color: colors.success }]}>18.3%</Text>
          </View>
          <View style={styles.highlightRow}>
            <View style={styles.highlightLeft}>
              <SFSymbol name="star.fill" size={16} color={colors.success} />
              <Text style={styles.highlightLabel}>ROE</Text>
            </View>
            <Text style={[styles.highlightValue, { color: colors.success }]}>15.7%</Text>
          </View>
          <View style={styles.highlightRow}>
            <View style={styles.highlightLeft}>
              <SFSymbol name="exclamationmark.triangle" size={16} color={colors.warning} />
              <Text style={styles.highlightLabel}>Debt to Equity</Text>
            </View>
            <Text style={[styles.highlightValue, { color: colors.warning }]}>0.45</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderNewsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Latest News</Text>
        {[
          {
            title: `${symbol} Reports Strong Q3 Earnings`,
            summary: 'Company exceeds expectations with 15% revenue growth',
            time: '2 hours ago',
          },
          {
            title: `Analyst Upgrades ${symbol} to Buy`,
            summary: 'Goldman Sachs raises target price to ₵1.50',
            time: '5 hours ago',
          },
          {
            title: `${symbol} Announces Dividend Payment`,
            summary: 'Company declares ₵0.05 per share dividend',
            time: '1 day ago',
          },
        ].map((news, index) => (
          <View key={index} style={styles.newsItem}>
            <View style={styles.newsHeader}>
              <View style={styles.newsIcon}>
                <SFSymbol name="newspaper" size={16} color={colors.primary} />
              </View>
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{news.title}</Text>
                <Text style={styles.newsSummary}>{news.summary}</Text>
              </View>
            </View>
            <Text style={styles.newsTime}>{news.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderActionButtons = () => (
    <View style={styles.actionBar}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.sellBtn]}
        onPress={handleSellStock}
      >
        <SFSymbol name="arrow.down.circle.fill" size={20} color={colors.textWhite} />
        <Text style={styles.sellBtnText}>Sell</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, styles.buyBtn]}
        onPress={handleBuyStock}
      >
        <SFSymbol name="arrow.up.circle.fill" size={20} color={colors.textWhite} />
        <Text style={styles.buyBtnText}>Buy</Text>
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
      {renderTabBar()}
      
      <View style={styles.contentContainer}>
        {activeTab === 'chart' && renderChartTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'news' && renderNewsTab()}
      </View>
      
      {renderActionButtons()}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
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
  headerContainer: {
    backgroundColor: colors.backgroundSecondary,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  symbol: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    maxWidth: screenWidth - 120,
  },
  placeholder: {
    width: 36,
  },
  priceContainer: {
    marginTop: spacing.md,
  },
  priceMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  currentPrice: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 32,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  changeText: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  quickStatValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
    gap: spacing.xs,
  },
  tabItemActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  chartWrapper: {
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  cardTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metricItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  metricValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  highlightsList: {
    gap: spacing.md,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  highlightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  highlightLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  highlightValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  newsItem: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  newsHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  newsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  newsContent: {
    flex: 1,
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
  },
  newsTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionBar: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.sm,
    ...shadows.md,
  },
  sellBtn: {
    backgroundColor: colors.error,
  },
  buyBtn: {
    backgroundColor: colors.primary,
  },
  sellBtnText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 16,
  },
  buyBtnText: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 16,
  },
});
