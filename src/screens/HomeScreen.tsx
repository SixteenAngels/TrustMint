import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useNavigationContext } from '../contexts/NavigationContext';
import { StockService } from '../services/stockService';
import { AIService } from '../services/aiService';
import { Stock, PortfolioItem } from '../types';
import { SFSymbol } from '../components/SFSymbols';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors } from '../styles/colors';

const { width: screenWidth } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
  const colors = theme.colors;
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { switchTab } = useNavigationContext();
  
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiNews, setAiNews] = useState<any[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [dayGain, setDayGain] = useState(0);
  const [dayGainPercent, setDayGainPercent] = useState(0);

  const stockService = StockService.getInstance();
  const aiService = AIService.getInstance();

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [stocksData, portfolioData] = await Promise.all([
        stockService.fetchLiveData(),
        user ? stockService.getPortfolio(user.uid) : [],
      ]);
      
      setStocks(stocksData);
      setPortfolio(portfolioData);

      // Calculate profit/loss
      const profit = portfolioData.reduce((sum, item) => sum + item.profitLoss, 0);
      const totalValue = portfolioData.reduce((sum, item) => sum + item.totalValue, 0);
      const gain = portfolioData.reduce((sum, item) => sum + item.profitLoss, 0);
      const gainPercent = totalValue > 0 ? (gain / (totalValue - gain)) * 100 : 0;

      setTotalProfit(profit);
      setDayGain(gain);
      setDayGainPercent(gainPercent);

      // Load AI news
      if (portfolioData.length > 0) {
        try {
          const topStock = portfolioData[0];
          const stockSymbol = topStock.stockSymbol || 'MTN';
          const stock = stocksData.find(s => s.symbol === stockSymbol) || stocksData[0];
          if (stock) {
            const insights = await aiService.generateStockInsights(stockSymbol, stock);
            setAiNews(insights.slice(0, 3).map(insight => ({
              id: insight.id,
              title: insight.title,
              description: insight.description,
              type: insight.type,
              sentiment: insight.type === 'buy' ? 'positive' : insight.type === 'sell' ? 'negative' : 'neutral',
            })));
          }
        } catch (error) {
          console.error('Error loading AI news:', error);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, stockService, aiService]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const formatCurrency = (amount: number) => {
    return `₵${Math.abs(amount).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Trader'} 👋</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => switchTab('notifications')}
        >
          <SFSymbol name="bell" size={22} color={colors.textPrimary} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPortfolioSummary = () => {
    const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
    const isPositive = dayGain >= 0;

    return (
      <View style={styles.portfolioCard}>
        <View style={styles.portfolioHeader}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <TouchableOpacity onPress={() => switchTab('portfolio')}>
            <SFSymbol name="arrow.right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.portfolioValue}>{formatCurrency(totalValue)}</Text>
        <View style={styles.profitContainer}>
          <View style={[styles.profitBadge, { backgroundColor: isPositive ? colors.success + '20' : colors.error + '20' }]}>
            <SFSymbol 
              name={isPositive ? "arrow.up.right" : "arrow.down.right"} 
              size={14} 
              color={isPositive ? colors.success : colors.error} 
            />
            <Text style={[styles.profitText, { color: isPositive ? colors.success : colors.error }]}>
              {formatCurrency(dayGain)} ({formatPercentage(dayGainPercent)})
            </Text>
          </View>
          <Text style={styles.profitLabel}>Today</Text>
        </View>
      </View>
    );
  };

  const renderQuickStats = () => {
    const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
    const availableCash = wallet?.balance || 0;
    const totalInvested = portfolio.reduce((sum, item) => sum + (item.averagePrice * item.quantity), 0);

    return (
      <View style={styles.statsRow}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => switchTab('wallet')}
        >
          <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
            <SFSymbol name="creditcard" size={20} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{formatCurrency(availableCash)}</Text>
          <Text style={styles.statLabel}>Available Cash</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => switchTab('portfolio')}
        >
          <View style={[styles.statIcon, { backgroundColor: totalProfit >= 0 ? colors.success + '20' : colors.error + '20' }]}>
            <SFSymbol 
              name={totalProfit >= 0 ? "arrow.up.right" : "arrow.down.right"} 
              size={20} 
              color={totalProfit >= 0 ? colors.success : colors.error} 
            />
          </View>
          <Text style={[styles.statValue, { color: totalProfit >= 0 ? colors.success : colors.error }]}>
            {formatCurrency(totalProfit)}
          </Text>
          <Text style={styles.statLabel}>Total Profit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => switchTab('portfolio')}
        >
          <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
            <SFSymbol name="chart.bar" size={20} color={colors.warning} />
          </View>
          <Text style={styles.statValue}>{portfolio.length}</Text>
          <Text style={styles.statLabel}>Holdings</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRecentTrades = () => {
    if (portfolio.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <SFSymbol name="chart.line.uptrend.xyaxis" size={40} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No stocks in your portfolio yet</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => switchTab('trading')}
          >
            <Text style={styles.emptyButtonText}>Start Trading</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Holdings</Text>
          <TouchableOpacity onPress={() => switchTab('portfolio')}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
        {portfolio.slice(0, 5).map((item, index) => {
          const stock = stocks.find(s => s.symbol === item.stockSymbol || s.id === item.stockId);
          const isPositive = item.profitLoss >= 0;
          
          return (
            <TouchableOpacity 
              key={item.id || index}
              style={styles.tradeItem}
              onPress={() => switchTab('portfolio')}
            >
              <View style={styles.tradeLeft}>
                <View style={[styles.tradeIcon, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.tradeSymbol}>{item.stockSymbol?.substring(0, 2) || 'ST'}</Text>
                </View>
                <View style={styles.tradeInfo}>
                  <Text style={styles.tradeName}>{stock?.name || item.stockSymbol || 'Stock'}</Text>
                  <Text style={styles.tradeQuantity}>{item.quantity} shares</Text>
                </View>
              </View>
              <View style={styles.tradeRight}>
                <Text style={styles.tradePrice}>{formatCurrency(item.currentPrice)}</Text>
                <View style={[styles.tradeChange, { backgroundColor: isPositive ? colors.success + '20' : colors.error + '20' }]}>
                  <SFSymbol 
                    name={isPositive ? "arrow.up.right" : "arrow.down.right"} 
                    size={10} 
                    color={isPositive ? colors.success : colors.error} 
                  />
                  <Text style={[styles.tradeChangeText, { color: isPositive ? colors.success : colors.error }]}>
                    {formatPercentage(item.profitLossPercent)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderAINews = () => {
    if (aiNews.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <SFSymbol name="sparkles" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>AI Insights</Text>
          </View>
          <TouchableOpacity onPress={() => switchTab('ai')}>
            <Text style={styles.seeAllText}>More →</Text>
          </TouchableOpacity>
        </View>
        {aiNews.map((news, index) => (
          <View key={news.id || index} style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <View style={[
                styles.newsIcon, 
                { backgroundColor: news.sentiment === 'positive' ? colors.success + '20' : news.sentiment === 'negative' ? colors.error + '20' : colors.primaryLight }
              ]}>
                <SFSymbol 
                  name={news.sentiment === 'positive' ? "arrow.up.right" : news.sentiment === 'negative' ? "arrow.down.right" : "info.circle"} 
                  size={16} 
                  color={news.sentiment === 'positive' ? colors.success : news.sentiment === 'negative' ? colors.error : colors.primary} 
                />
              </View>
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{news.title}</Text>
                <Text style={styles.newsDescription} numberOfLines={2}>
                  {news.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTopMovers = () => {
    const topMovers = stocks
      .slice()
      .sort((a, b) => Math.abs((b.changePercent || 0)) - Math.abs((a.changePercent || 0)))
      .slice(0, 3);

    if (topMovers.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Movers</Text>
          <TouchableOpacity onPress={() => switchTab('trading')}>
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>
        {topMovers.map((stock, index) => {
          const isPositive = (stock.changePercent || 0) >= 0;
          return (
            <TouchableOpacity 
              key={stock.id || index}
              style={styles.moverItem}
              onPress={() => switchTab('trading')}
            >
              <View style={styles.moverLeft}>
                <View style={[styles.moverIcon, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.moverSymbol}>{stock.symbol.substring(0, 2)}</Text>
                </View>
                <View>
                  <Text style={styles.moverName}>{stock.name}</Text>
                  <Text style={styles.moverSymbolText}>{stock.symbol}</Text>
                </View>
              </View>
              <View style={styles.moverRight}>
                <Text style={styles.moverPrice}>{formatCurrency(stock.price)}</Text>
                <View style={[styles.moverChange, { backgroundColor: isPositive ? colors.success + '20' : colors.error + '20' }]}>
                  <SFSymbol 
                    name={isPositive ? "arrow.up.right" : "arrow.down.right"} 
                    size={10} 
                    color={isPositive ? colors.success : colors.error} 
                  />
                  <Text style={[styles.moverChangeText, { color: isPositive ? colors.success : colors.error }]}>
                    {formatPercentage(stock.changePercent || 0)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderPortfolioSummary()}
        {renderQuickStats()}
        {renderRecentTrades()}
        {renderAINews()}
        {renderTopMovers()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

type ThemeColors = typeof defaultColors;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: spacing.xxxl,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greeting: {
      ...typography.body,
      color: colors.textSecondary,
    },
    userName: {
      ...typography.h2,
      color: colors.textPrimary,
      fontWeight: '700',
      marginTop: spacing.xs,
    },
    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      ...shadows.sm,
    },
    notificationBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.error,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
    },
    portfolioCard: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      ...shadows.lg,
    },
    portfolioHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    portfolioLabel: {
      ...typography.body,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    portfolioValue: {
      ...typography.h1,
      color: colors.textWhite,
      fontWeight: '700',
      fontSize: 36,
      marginBottom: spacing.md,
    },
    profitContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    profitBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      gap: spacing.xs,
    },
    profitText: {
      ...typography.bodyMedium,
      fontWeight: '600',
    },
    profitLabel: {
      ...typography.caption,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: spacing.md,
      alignItems: 'center',
      ...shadows.card,
    },
    statIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    statValue: {
      ...typography.h4,
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    statLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    section: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.card,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    sectionTitle: {
      ...typography.h5,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    seeAllText: {
      ...typography.bodyMedium,
      color: colors.primary,
      fontWeight: '600',
    },
    tradeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tradeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    tradeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    tradeSymbol: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '700',
    },
    tradeInfo: {
      flex: 1,
    },
    tradeName: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    tradeQuantity: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    tradeRight: {
      alignItems: 'flex-end',
    },
    tradePrice: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    tradeChange: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
      gap: 4,
    },
    tradeChangeText: {
      ...typography.caption,
      fontWeight: '600',
    },
    newsCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    newsHeader: {
      flexDirection: 'row',
    },
    newsIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
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
    newsDescription: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    moverItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    moverLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    moverIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    moverSymbol: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '700',
    },
    moverName: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    moverSymbolText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    moverRight: {
      alignItems: 'flex-end',
    },
    moverPrice: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    moverChange: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
      gap: 4,
    },
    moverChangeText: {
      ...typography.caption,
      fontWeight: '600',
    },
    emptyCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: spacing.xl,
      alignItems: 'center',
      marginBottom: spacing.lg,
      ...shadows.card,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: 12,
    },
    emptyButtonText: {
      ...typography.button,
      color: colors.textWhite,
      fontWeight: '600',
    },
    bottomSpacing: {
      height: 100,
    },
  });
