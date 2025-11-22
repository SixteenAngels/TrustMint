import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { StockService } from '../services/stockService';
import { Stock } from '../types';
import { StockList } from '../components/StockList';
import { StockDetailScreen } from './StockDetailScreen';
import { SFSymbol } from '../components/SFSymbols';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

const { width } = Dimensions.get('window');

type TabType = 'all' | 'gainers' | 'losers' | 'sectors';

export const MarketsScreen: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('Ghana');

  const countries = ['Ghana', 'US', 'India', 'Kenya', 'Nigeria', 'Crypto'];
  const stockService = StockService.getInstance(selectedCountry);

  useEffect(() => {
    loadStocks();
  }, [selectedCountry]);

  const filterStocks = useCallback(() => {
    let filtered = [...stocks];

    if (searchQuery.trim()) {
      filtered = filtered.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeTab) {
      case 'gainers':
        filtered = filtered.filter(stock => stock.change > 0);
        break;
      case 'losers':
        filtered = filtered.filter(stock => stock.change < 0);
        break;
      case 'sectors':
        filtered = filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
      default:
        filtered = filtered.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    }

    setFilteredStocks(filtered);
  }, [stocks, searchQuery, activeTab]);

  useEffect(() => {
    filterStocks();
  }, [filterStocks]);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const stocksData = await stockService.fetchLiveData();
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

  const tabs = [
    { id: 'all' as TabType, label: 'All', icon: 'list.bullet' },
    { id: 'gainers' as TabType, label: 'Gainers', icon: 'arrow.up.right' },
    { id: 'losers' as TabType, label: 'Losers', icon: 'arrow.down.right' },
    { id: 'sectors' as TabType, label: 'Sectors', icon: 'square.grid.2x2' },
  ];

  const getMarketSummary = () => {
    const totalGainers = stocks.filter(s => s.change > 0).length;
    const totalLosers = stocks.filter(s => s.change < 0).length;
    const avgChange = stocks.length > 0
      ? stocks.reduce((sum, stock) => sum + (stock.changePercent || 0), 0) / stocks.length
      : 0;
    return { totalGainers, totalLosers, avgChange };
  };

  const getMarketIndices = () => {
    const presets: Record<string, { name: string; value: string; change: string }[]> = {
      Ghana: [
        { name: 'GSE Composite', value: '3,124.42', change: '+0.82%' },
        { name: 'GSE Financial', value: '2,035.18', change: '+0.21%' },
      ],
      US: [
        { name: 'S&P 500', value: '5,098.12', change: '+0.67%' },
        { name: 'NASDAQ', value: '16,235.44', change: '+1.02%' },
      ],
      India: [
        { name: 'Nifty 50', value: '22,365.45', change: '+0.55%' },
        { name: 'BSE Sensex', value: '73,248.16', change: '+0.49%' },
      ],
      Kenya: [
        { name: 'NSE All Share', value: '97.14', change: '-0.12%' },
        { name: 'NSE 20', value: '1,567.08', change: '+0.08%' },
      ],
      Nigeria: [
        { name: 'NGX All-Share', value: '102,138.56', change: '+0.34%' },
        { name: 'NGX 30', value: '3,658.27', change: '+0.18%' },
      ],
      Crypto: [
        { name: 'Bitcoin', value: '$63,420', change: '+1.84%' },
        { name: 'Ethereum', value: '$3,280', change: '+2.12%' },
      ],
    };
    return presets[selectedCountry] || presets['Ghana'];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <SFSymbol name="chart.line.uptrend.xyaxis" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading market data...</Text>
      </View>
    );
  }

  if (selectedStock) {
    return (
      <StockDetailScreen
        symbol={selectedStock}
        onClose={() => setSelectedStock(null)}
        onTrade={(stock, type) => {
          // Navigate to trading screen with selected stock
          // This would need to be passed through props or context
          setSelectedStock(null);
          Alert.alert(
            type === 'buy' ? 'Buy Stock' : 'Sell Stock',
            `Navigate to trading screen for ${stock.symbol} - ${type}`,
            [{ text: 'OK' }]
          );
        }}
      />
    );
  }

  const summary = getMarketSummary();
  const indices = getMarketIndices();
  const topGainer = [...filteredStocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  const topLoser = [...filteredStocks].sort((a, b) => a.changePercent - b.changePercent)[0];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Markets</Text>
              <Text style={styles.headerSubtitle}>
                {selectedCountry === 'Crypto' ? 'Digital Assets' : `${selectedCountry} Exchange`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <SFSymbol name="arrow.clockwise" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Country Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.countryScroll}
            contentContainerStyle={styles.countryScrollContent}
          >
            {countries.map((country) => (
              <TouchableOpacity
                key={country}
                style={[
                  styles.countryChip,
                  selectedCountry === country && styles.countryChipActive,
                ]}
                onPress={() => setSelectedCountry(country)}
              >
                <Text
                  style={[
                    styles.countryChipText,
                    selectedCountry === country && styles.countryChipTextActive,
                  ]}
                >
                  {country}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Market Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Market Overview</Text>
            <View style={[
              styles.overviewBadge,
              { backgroundColor: summary.avgChange >= 0 ? colors.successLight : colors.error + '20' }
            ]}>
              <Text style={[
                styles.overviewBadgeText,
                { color: summary.avgChange >= 0 ? colors.success : colors.error }
              ]}>
                {summary.avgChange >= 0 ? '+' : ''}{summary.avgChange.toFixed(2)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatValue}>{summary.totalGainers}</Text>
              <Text style={styles.overviewStatLabel}>Gainers</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatValue}>{summary.totalLosers}</Text>
              <Text style={styles.overviewStatLabel}>Losers</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatValue}>{stocks.length}</Text>
              <Text style={styles.overviewStatLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Market Indices */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.indicesScroll}
          contentContainerStyle={styles.indicesScrollContent}
        >
          {indices.map((index, idx) => {
            const isPositive = !index.change.includes('-');
            return (
              <View key={idx} style={styles.indexCard}>
                <Text style={styles.indexName}>{index.name}</Text>
                <Text style={styles.indexValue}>{index.value}</Text>
                <View style={[
                  styles.indexChangeBadge,
                  { backgroundColor: isPositive ? colors.successLight : colors.error + '20' }
                ]}>
                  <SFSymbol
                    name={isPositive ? 'arrow.up.right' : 'arrow.down.right'}
                    size={12}
                    color={isPositive ? colors.success : colors.error}
                  />
                  <Text style={[
                    styles.indexChange,
                    { color: isPositive ? colors.success : colors.error }
                  ]}>
                    {index.change}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Top Movers */}
        {(topGainer || topLoser) && (
          <View style={styles.moversSection}>
            <Text style={styles.sectionTitle}>Top Movers</Text>
            <View style={styles.moversRow}>
              {topGainer && (
                <TouchableOpacity
                  style={[styles.moverCard, styles.moverCardGainer]}
                  onPress={() => setSelectedStock(topGainer.symbol)}
                >
                  <View style={styles.moverHeader}>
                    <SFSymbol name="arrow.up.right" size={20} color={colors.success} />
                    <Text style={styles.moverLabel}>Top Gainer</Text>
                  </View>
                  <Text style={styles.moverSymbol}>{topGainer.symbol}</Text>
                  <Text style={styles.moverName} numberOfLines={1}>{topGainer.name}</Text>
                  <Text style={styles.moverPrice}>₵{topGainer.price.toFixed(2)}</Text>
                  <Text style={[styles.moverChange, { color: colors.success }]}>
                    +{topGainer.changePercent.toFixed(2)}%
                  </Text>
                </TouchableOpacity>
              )}
              {topLoser && (
                <TouchableOpacity
                  style={[styles.moverCard, styles.moverCardLoser]}
                  onPress={() => setSelectedStock(topLoser.symbol)}
                >
                  <View style={styles.moverHeader}>
                    <SFSymbol name="arrow.down.right" size={20} color={colors.error} />
                    <Text style={styles.moverLabel}>Top Loser</Text>
                  </View>
                  <Text style={styles.moverSymbol}>{topLoser.symbol}</Text>
                  <Text style={styles.moverName} numberOfLines={1}>{topLoser.name}</Text>
                  <Text style={styles.moverPrice}>₵{topLoser.price.toFixed(2)}</Text>
                  <Text style={[styles.moverChange, { color: colors.error }]}>
                    {topLoser.changePercent.toFixed(2)}%
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <SFSymbol name="magnifyingglass" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stocks..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <SFSymbol name="xmark.circle.fill" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.tabActive,
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <SFSymbol
                  name={tab.icon}
                  size={16}
                  color={activeTab === tab.id ? colors.textWhite : colors.textSecondary}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stocks List */}
        <View style={styles.stocksSection}>
          <View style={styles.stocksHeader}>
            <Text style={styles.stocksTitle}>
              {activeTab === 'all' ? 'All Stocks' : 
               activeTab === 'gainers' ? 'Top Gainers' :
               activeTab === 'losers' ? 'Top Losers' : 'By Sector'}
            </Text>
            <Text style={styles.stocksCount}>{filteredStocks.length} stocks</Text>
          </View>
          <View style={styles.stocksListContainer}>
            <StockList
              stocks={filteredStocks}
              onStockPress={(stock) => setSelectedStock(stock.symbol)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
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
    marginTop: spacing.md,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryScroll: {
    marginTop: spacing.sm,
  },
  countryScrollContent: {
    gap: spacing.sm,
  },
  countryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  countryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  countryChipText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  countryChipTextActive: {
    color: colors.textWhite,
    fontWeight: '600',
  },
  overviewCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    padding: spacing.lg,
    ...shadows.card,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  overviewTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  overviewBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  overviewBadgeText: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  overviewStatValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  overviewStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  indicesScroll: {
    marginBottom: spacing.md,
  },
  indicesScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  indexCard: {
    width: 180,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.card,
  },
  indexName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  indexValue: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  indexChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  indexChange: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  moversSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  moversRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  moverCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.card,
  },
  moverCardGainer: {
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  moverCardLoser: {
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  moverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  moverLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  moverSymbol: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  moverName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  moverPrice: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  moverChange: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  tabsSection: {
    marginBottom: spacing.md,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.textWhite,
    fontWeight: '600',
  },
  stocksSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  stocksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stocksTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stocksCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stocksListContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.card,
  },
});
