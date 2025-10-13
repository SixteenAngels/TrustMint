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
import { Stock, PortfolioItem } from '../types';
import { PortfolioCard } from '../components/PortfolioCard';
import { StockList } from '../components/StockList';
import { QuickActions } from '../components/QuickActions';

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
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'Trader'}!</Text>
        <Text style={styles.subtitle}>Ready to trade smart?</Text>
      </View>

      {/* Portfolio Overview */}
      <PortfolioCard
        totalValue={calculateTotalValue()}
        dayGain={calculateDayGain()}
        dayGainPercent={calculateDayGainPercent()}
        balance={user?.balance || 0}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Top Movers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Movers</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
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
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
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
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <StockList
          stocks={stocks.slice(0, 10)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});