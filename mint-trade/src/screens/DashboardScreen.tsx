import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { StockService } from '../services/stockService';
import { Stock, PortfolioItem } from '../types';
import { PortfolioCard } from '../components/PortfolioCard';
import { StockList } from '../components/StockList';
import { QuickActions } from '../components/QuickActions';
import { HeroSection } from '../components/HeroSection';
import { MarketTicker } from '../components/MarketTicker';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const stockService = StockService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stocksData, portfolioData] = await Promise.all([
        stockService.getStocks(),
        user ? stockService.getPortfolio(user.uid) : []
      ]);
      
      setStocks(stocksData);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch fresh data from GSE
      const freshStocks = await stockService.fetchLiveData();
      setStocks(freshStocks);
      
      // Update portfolio with fresh prices
      if (user) {
        const updatedPortfolio = await stockService.getPortfolio(user.uid);
        setPortfolio(updatedPortfolio);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateTotalValue = () => {
    return portfolio.reduce((total, item) => total + item.totalValue, 0);
  };

  const calculateDayGain = () => {
    return portfolio.reduce((total, item) => total + item.profitLoss, 0);
  };

  const calculateDayGainPercent = () => {
    const totalValue = calculateTotalValue();
    const dayGain = calculateDayGain();
    return totalValue > 0 ? (dayGain / (totalValue - dayGain)) * 100 : 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
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
      {/* Hero Section */}
      <HeroSection
        userName={user?.name || 'Trader'}
        portfolioValue={calculateTotalValue()}
        dayGain={calculateDayGain()}
        dayGainPercent={calculateDayGainPercent()}
      />

      {/* Live Market Ticker */}
      <MarketTicker stocks={stocks.slice(0, 6)} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Top Movers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Movers</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <Text style={styles.seeAllArrow}>→</Text>
          </TouchableOpacity>
        </View>
        <StockList
          stocks={stocks
            .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
            .slice(0, 5)
          }
        />
      </View>

      {/* Your Portfolio */}
      {portfolio.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Portfolio</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>View All</Text>
              <Text style={styles.seeAllArrow}>→</Text>
            </TouchableOpacity>
          </View>
          <StockList
            stocks={portfolio.map(item => ({
              id: item.stockId,
              name: '', // Will be populated from stock data
              symbol: '',
              price: item.currentPrice,
              change: item.profitLoss,
              changePercent: item.profitLossPercent,
              volume: 0,
              updatedAt: new Date(),
            }))}
            showQuantity={true}
            quantities={portfolio.map(item => item.quantity)}
          />
        </View>
      )}

      {/* Market Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Market Overview</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <Text style={styles.seeAllArrow}>→</Text>
          </TouchableOpacity>
        </View>
        <StockList
          stocks={stocks.slice(0, 10)}
        />
      </View>

      {/* Bottom spacing for tab bar */}
      <View style={styles.bottomSpacing} />
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
  section: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  seeAllArrow: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  bottomSpacing: {
    height: 100, // Space for tab bar
  },
});