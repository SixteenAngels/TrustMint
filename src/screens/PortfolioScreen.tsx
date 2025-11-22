import React, { useState, useEffect, useCallback } from 'react';
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
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { useNavigationContext } from '../contexts/NavigationContext';

export const PortfolioScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const { switchTab } = useNavigationContext();

  const stockService = StockService.getInstance();

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Portfolio loading timeout')), 10000)
      );

      // Load portfolio and stocks with timeout
      let portfolioData: PortfolioItem[] = [];
      let stocksData: Stock[] = [];

      try {
        [portfolioData, stocksData] = await Promise.race([
          Promise.all([
            stockService.getPortfolio(user.uid),
            stockService.getStocks(),
          ]),
          timeoutPromise
        ]) as Promise<[PortfolioItem[], Stock[]]>;
      } catch (loadError: any) {
        console.warn('Could not load portfolio data:', loadError);
        
        // Try to load stocks separately (non-blocking)
        try {
          stocksData = await Promise.race([
            stockService.getStocks(),
            timeoutPromise
          ]) as Stock[];
        } catch (stocksError) {
          console.warn('Could not load stocks:', stocksError);
          stocksData = [];
        }
        
        // Set empty portfolio if we couldn't load it
        portfolioData = [];
      }

      setPortfolio(portfolioData);
      setStocks(stocksData);
    } catch (error: any) {
      console.error('Error loading portfolio data:', error);
      
      // Set empty arrays so screen still renders
      setPortfolio([]);
      setStocks([]);
      
      // Only show alert if it's not a timeout (timeout is expected)
      if (!error.message?.includes('timeout')) {
        Alert.alert('Warning', 'Could not load portfolio data. Showing offline mode.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, stockService]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  useEffect(() => {
    if (user && portfolio.length > 0 && !loadingAI) {
      // Delay AI analysis to avoid blocking initial render
      const timer = setTimeout(() => {
        loadAIAnalysis();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, portfolio.length]);

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

  const loadAIAnalysis = useCallback(async () => {
    if (!user) return;
    
    setLoadingAI(true);
    try {
      // Add timeout for AI analysis (15 seconds since it can take longer)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI analysis timeout')), 15000)
      );

      const { AIService } = await import('../services/aiService');
      const aiService = AIService.getInstance();
      
      const analysis = await Promise.race([
        aiService.generatePortfolioAnalysis(user.uid || user.id),
        timeoutPromise
      ]);
      
      setAiAnalysis(analysis);
    } catch (error: any) {
      console.error('Error loading AI analysis:', error);
      // Don't set analysis if it fails - it's optional
      setAiAnalysis(null);
    } finally {
      setLoadingAI(false);
    }
  }, [user]);

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

  const renderQuickActions = () => {
    const handleExport = () => {
      // Export functionality - for now show info
      Alert.alert(
        'Export Portfolio',
        'Export your portfolio as PDF. This feature will generate a detailed report of your holdings and performance.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Export', onPress: () => {
            // TODO: Implement PDF export using react-native-pdf or similar
            Alert.alert('Coming Soon', 'PDF export feature will be available soon!');
          }}
        ]
      );
    };

    const handleShare = () => {
      // Share functionality - for now show info
      Alert.alert(
        'Share Portfolio',
        'Share your portfolio performance with others. This feature will allow you to share your portfolio summary.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share', onPress: () => {
            // TODO: Implement share using expo-sharing or react-native-share
            Alert.alert('Coming Soon', 'Share feature will be available soon!');
          }}
        ]
      );
    };

    return (
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExport}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>Export PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAIInsights = () => {
    if (loadingAI) {
      return (
        <View style={styles.aiContainer}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <Text style={styles.aiSubtitle}>Analyzing your portfolio...</Text>
        </View>
      );
    }

    if (!aiAnalysis) {
      return (
        <View style={styles.aiContainer}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <Text style={styles.aiSubtitle}>
            {portfolio.length === 0 
              ? 'Start building your portfolio to get AI insights'
              : 'AI analysis will appear here'}
          </Text>
          {portfolio.length > 0 && (
            <TouchableOpacity
              style={styles.aiButton}
              onPress={loadAIAnalysis}
            >
              <Text style={styles.aiButtonText}>Generate AI Analysis</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    const topRecommendation = aiAnalysis.recommendations?.[0];
    const riskLevel = aiAnalysis.riskAssessment?.level || 'medium';
    const overallScore = aiAnalysis.overallScore || 0;

    return (
      <View style={styles.aiContainer}>
        <View style={styles.aiHeader}>
          <View>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <Text style={styles.aiSubtitle}>
              Portfolio Health Score: {overallScore}/100
            </Text>
          </View>
          <View style={[
            styles.scoreBadge,
            { backgroundColor: overallScore >= 70 ? colors.success : overallScore >= 50 ? colors.warning : colors.error }
          ]}>
            <Text style={styles.scoreBadgeText}>{overallScore}</Text>
          </View>
        </View>

        {topRecommendation && (
          <View style={styles.aiInsightCard}>
            <Text style={styles.aiInsightTitle}>Next Best Action</Text>
            <Text style={styles.aiInsightBody}>
              {topRecommendation.action}: {topRecommendation.reasoning}
            </Text>
            <View style={styles.aiBadges}>
              <Text style={styles.aiBadge}>
                Priority: {topRecommendation.priority.toUpperCase()}
              </Text>
              <Text style={styles.aiBadge}>
                Risk: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </Text>
            </View>
          </View>
        )}

        {!topRecommendation && (
          <View style={styles.aiInsightCard}>
            <Text style={styles.aiInsightTitle}>Portfolio Analysis</Text>
            <Text style={styles.aiInsightBody}>
              Your portfolio shows {aiAnalysis.riskAssessment?.level || 'medium'} risk with a diversification score of {aiAnalysis.diversification?.score || 0}/100.
            </Text>
            <View style={styles.aiBadges}>
              <Text style={styles.aiBadge}>
                Risk Level: {riskLevel.toUpperCase()}
              </Text>
              <Text style={styles.aiBadge}>
                Diversification: {aiAnalysis.diversification?.score || 0}/100
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => switchTab('ai')}
        >
          <Text style={styles.aiButtonText}>View Full AI Report</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAITraders = () => {
    const pods = [
      { name: 'Momentum Trader', focus: 'Short-term breakouts', risk: 'Medium', return: '+12.4%' },
      { name: 'Income Vault', focus: 'Dividend equities', risk: 'Low', return: '+6.1%' },
      { name: 'Crypto Quant', focus: 'BTC-ETH rotation', risk: 'High', return: '+18.9%' },
    ];
    return (
      <View style={styles.aiTradersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Trader Pods</Text>
          <TouchableOpacity onPress={() => switchTab('ai')}>
            <Text style={styles.seeAllText}>Launch AI Hub</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pods.map((pod) => (
            <View key={pod.name} style={styles.aiTraderCard}>
              <Text style={styles.aiTraderName}>{pod.name}</Text>
              <Text style={styles.aiTraderFocus}>{pod.focus}</Text>
              <View style={styles.aiTraderMeta}>
                <Text style={styles.aiTraderPill}>Risk: {pod.risk}</Text>
                <Text style={styles.aiTraderPill}>Return: {pod.return}</Text>
              </View>
              <TouchableOpacity
                style={styles.aiTraderButton}
                onPress={() => switchTab('ai')}
              >
                <Text style={styles.aiTraderButtonText}>View Strategy</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingBanner}>
            <Text style={styles.loadingText}>Loading portfolio...</Text>
          </View>
        )}
        {renderPortfolioHeader()}
        {renderPortfolioChart()}
        {renderHoldingsList()}
        {renderAIInsights()}
        {renderAITraders()}
        {renderQuickActions()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  loadingBanner: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    margin: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.primary,
  },
  bottomSpacing: {
    height: 100,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  aiContainer: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadgeText: {
    ...typography.h5,
    color: colors.textWhite,
    fontWeight: '700',
  },
  aiSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  aiInsightCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  aiInsightTitle: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  aiInsightBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  aiBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  aiButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  aiTradersSection: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    ...shadows.card,
  },
  aiTraderCard: {
    width: 220,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    marginLeft: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiTraderName: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  aiTraderFocus: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  aiTraderMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  aiTraderPill: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  aiTraderButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiTraderButtonText: {
    ...typography.button,
    color: colors.textWhite,
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
