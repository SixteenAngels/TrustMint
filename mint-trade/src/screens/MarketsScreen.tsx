import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { StockService } from '../services/stockService';
import { Stock } from '../types';
import { StockList } from '../components/StockList';
import { StockDetailScreen } from './StockDetailScreen';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

type TabType = 'all' | 'gainers' | 'losers' | 'sectors';

export const MarketsScreen: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  const stockService = StockService.getInstance();

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    filterStocks();
  }, [stocks, searchQuery, activeTab]);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const stocksData = await stockService.getStocks();
      setStocks(stocksData);
    } catch (error) {
      console.error('Error loading stocks:', error);
      Alert.alert('Error', 'Failed to load market data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const freshStocks = await stockService.fetchLiveData();
      setStocks(freshStocks);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterStocks = () => {
    let filtered = [...stocks];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case 'gainers':
        filtered = filtered.filter(stock => stock.change > 0);
        break;
      case 'losers':
        filtered = filtered.filter(stock => stock.change < 0);
        break;
      case 'sectors':
        // Group by sectors (simplified)
        filtered = filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
      default:
        // Sort by absolute change for 'all' tab
        filtered = filtered.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    }

    setFilteredStocks(filtered);
  };

  const tabs = [
    { id: 'all' as TabType, label: 'All', count: stocks.length },
    { id: 'gainers' as TabType, label: 'Gainers', count: stocks.filter(s => s.change > 0).length },
    { id: 'losers' as TabType, label: 'Losers', count: stocks.filter(s => s.change < 0).length },
    { id: 'sectors' as TabType, label: 'Sectors', count: 0 },
  ];

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by company or symbol"
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsContainer}
      contentContainerStyle={styles.tabsContent}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab
          ]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <View style={[
              styles.tabBadge,
              activeTab === tab.id && styles.activeTabBadge
            ]}>
              <Text style={[
                styles.tabBadgeText,
                activeTab === tab.id && styles.activeTabBadgeText
              ]}>
                {tab.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMarketStats = () => {
    const totalGainers = stocks.filter(s => s.change > 0).length;
    const totalLosers = stocks.filter(s => s.change < 0).length;
    const avgChange = stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalGainers}</Text>
          <Text style={styles.statLabel}>Gainers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalLosers}</Text>
          <Text style={styles.statLabel}>Losers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            { color: avgChange >= 0 ? colors.success : colors.error }
          ]}>
            {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
          </Text>
          <Text style={styles.statLabel}>Avg Change</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading market data...</Text>
      </View>
    );
  }

  if (selectedStock) {
    return (
      <StockDetailScreen
        symbol={selectedStock}
        onClose={() => setSelectedStock(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Markets</Text>
        <Text style={styles.subtitle}>Ghana Stock Exchange</Text>
      </View>

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Tabs */}
      {renderTabs()}

      {/* Market Stats */}
      {renderMarketStats()}

      {/* Stock List */}
      <View style={styles.stocksContainer}>
        <StockList
          stocks={filteredStocks}
          onStockPress={(stock) => {
            setSelectedStock(stock.symbol);
          }}
        />
      </View>

      {/* Refresh Control */}
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
      />
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
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    color: colors.textLight,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearIcon: {
    fontSize: 16,
    color: colors.textLight,
  },
  tabsContainer: {
    backgroundColor: colors.backgroundSecondary,
    paddingBottom: spacing.lg,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.textWhite,
  },
  tabBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: spacing.sm,
  },
  activeTabBadge: {
    backgroundColor: colors.textWhite,
  },
  tabBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabBadgeText: {
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  stocksContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
});