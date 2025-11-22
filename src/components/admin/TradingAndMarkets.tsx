import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

type Tab = 'trades' | 'markets' | 'crypto' | 'brokers';

export const TradingAndMarkets: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [activeTab, setActiveTab] = useState<Tab>('trades');
  const [filter, setFilter] = useState<'all' | 'executed' | 'pending' | 'failed' | 'flagged'>('all');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const mockTrades = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      type: 'buy',
      symbol: 'MTN',
      amount: 100,
      price: 12.50,
      status: 'executed',
      market: 'Ghana',
      broker: 'GSE',
      aiAssisted: true,
      timestamp: '2 hours ago',
      flagged: false,
    },
  ];

  const marketAPIs = [
    { id: '1', name: 'GSE API', market: 'Ghana', status: 'connected', refreshSpeed: 5 },
    { id: '2', name: 'Polygon.io', market: 'US', status: 'connected', refreshSpeed: 1 },
    { id: '3', name: 'CoinGecko', market: 'Crypto', status: 'connected', refreshSpeed: 10 },
  ];

  const supportedMarkets = ['Ghana', 'USA', 'Nigeria', 'India'];
  const supportedCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'ADA'];

  const getStatusColor = (status: string) => {
    return status === 'connected' || status === 'executed' ? colors.success : colors.error;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabBar}>
          {(['trades', 'markets', 'crypto', 'brokers'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.primary },
                { borderColor: colors.border },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.textWhite : colors.textSecondary },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <View>
            <View style={styles.filterRow}>
              {(['all', 'executed', 'pending', 'failed', 'flagged'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterButton,
                    filter === f && { backgroundColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => setFilter(f)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      { color: filter === f ? colors.textWhite : colors.textSecondary },
                    ]}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.tradesList}>
              {mockTrades.map((trade) => (
                <View key={trade.id} style={[styles.tradeCard, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={styles.tradeHeader}>
                    <View style={styles.tradeType}>
                      <View style={[styles.typeBadge, { backgroundColor: trade.type === 'buy' ? colors.successLight : colors.errorLight }]}>
                        <SFSymbol name={trade.type === 'buy' ? 'arrow.up' : 'arrow.down'} size={16} color={trade.type === 'buy' ? colors.success : colors.error} />
                        <Text style={[styles.typeText, { color: trade.type === 'buy' ? colors.success : colors.error }]}>
                          {trade.type.toUpperCase()}
                        </Text>
                      </View>
                      {trade.aiAssisted && (
                        <View style={[styles.aiBadge, { backgroundColor: colors.primaryLight }]}>
                          <SFSymbol name="sparkles" size={12} color={colors.primary} />
                          <Text style={[styles.aiText, { color: colors.primary }]}>AI</Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(trade.status)}20` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(trade.status) }]}>
                        {trade.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tradeDetails}>
                    <View style={styles.tradeDetailRow}>
                      <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>Symbol:</Text>
                      <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>{trade.symbol}</Text>
                    </View>
                    <View style={styles.tradeDetailRow}>
                      <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>User:</Text>
                      <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>{trade.userName}</Text>
                    </View>
                    <View style={styles.tradeDetailRow}>
                      <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>Amount:</Text>
                      <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>{trade.amount} shares</Text>
                    </View>
                    <View style={styles.tradeDetailRow}>
                      <Text style={[styles.tradeDetailLabel, { color: colors.textSecondary }]}>Market:</Text>
                      <Text style={[styles.tradeDetailValue, { color: colors.textPrimary }]}>{trade.market}</Text>
                    </View>
                  </View>
                  {trade.flagged && (
                    <TouchableOpacity
                      style={[styles.freezeButton, { backgroundColor: colors.errorLight }]}
                      onPress={() => {}}
                    >
                      <Text style={[styles.freezeButtonText, { color: colors.error }]}>Freeze Trade</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Supported Markets</Text>
              <View style={styles.marketsList}>
                {supportedMarkets.map((market) => (
                  <View key={market} style={styles.marketItem}>
                    <Text style={[styles.marketName, { color: colors.textPrimary }]}>{market}</Text>
                    <View style={[styles.marketStatus, { backgroundColor: colors.successLight }]}>
                      <Text style={[styles.marketStatusText, { color: colors.success }]}>ACTIVE</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Market Data APIs</Text>
              {marketAPIs.map((api) => (
                <View key={api.id} style={styles.apiRow}>
                  <View style={styles.apiInfo}>
                    <Text style={[styles.apiName, { color: colors.textPrimary }]}>{api.name}</Text>
                    <Text style={[styles.apiMarket, { color: colors.textSecondary }]}>{api.market} Market</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(api.status)}20` }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(api.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(api.status) }]}>{api.status}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.maintenanceRow}>
                <View style={styles.maintenanceInfo}>
                  <Text style={[styles.maintenanceTitle, { color: colors.textPrimary }]}>Maintenance Mode</Text>
                  <Text style={[styles.maintenanceSubtitle, { color: colors.textSecondary }]}>
                    Temporarily disable all markets
                  </Text>
                </View>
                <Switch
                  value={maintenanceMode}
                  onValueChange={setMaintenanceMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={maintenanceMode ? colors.textWhite : colors.textLight}
                />
              </View>
            </View>
          </View>
        )}

        {/* Crypto Tab */}
        {activeTab === 'crypto' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Supported Coins</Text>
              <View style={styles.coinsGrid}>
                {supportedCoins.map((coin) => (
                  <View key={coin} style={[styles.coinCard, { backgroundColor: colors.background }]}>
                    <Text style={[styles.coinSymbol, { color: colors.textPrimary }]}>{coin}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Crypto Wallet Management</Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => {}}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Manage Wallets</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Brokers Tab */}
        {activeTab === 'brokers' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Broker API Settings</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Configure broker integrations and API keys
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight, marginTop: spacing.md }]}
                onPress={() => {}}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Configure Brokers</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  tab: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  tradesList: {
    gap: spacing.md,
  },
  tradeCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  tradeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  typeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  aiText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  tradeDetails: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tradeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  tradeDetailLabel: {
    ...typography.bodySmall,
  },
  tradeDetailValue: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  freezeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  freezeButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  marketsList: {
    gap: spacing.sm,
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  marketName: {
    ...typography.body,
    fontWeight: '500',
  },
  marketStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  marketStatusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  apiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  apiInfo: {
    flex: 1,
  },
  apiName: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  apiMarket: {
    ...typography.bodySmall,
  },
  maintenanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  maintenanceSubtitle: {
    ...typography.bodySmall,
  },
  coinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  coinCard: {
    padding: spacing.md,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  coinSymbol: {
    ...typography.h6,
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
});

