import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

interface MarketAPI {
  id: string;
  name: string;
  market: 'Ghana' | 'US' | 'Crypto';
  status: 'connected' | 'disconnected';
  refreshSpeed: number;
}

export const MarketControls: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [newSymbol, setNewSymbol] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [apis, setAPIs] = useState<MarketAPI[]>([
    { id: '1', name: 'GSE API', market: 'Ghana', status: 'connected', refreshSpeed: 5 },
    { id: '2', name: 'Polygon.io', market: 'US', status: 'connected', refreshSpeed: 1 },
    { id: '3', name: 'EODHD', market: 'US', status: 'connected', refreshSpeed: 1 },
    { id: '4', name: 'Twelve Data', market: 'US', status: 'disconnected', refreshSpeed: 5 },
    { id: '5', name: 'CoinGecko', market: 'Crypto', status: 'connected', refreshSpeed: 10 },
  ]);

  const toggleAPI = (id: string) => {
    setAPIs(apis.map(api => 
      api.id === id 
        ? { ...api, status: api.status === 'connected' ? 'disconnected' : 'connected' }
        : api
    ));
  };

  const handleAddSymbol = () => {
    if (newSymbol.trim()) {
      Alert.alert('Success', `Symbol ${newSymbol} added`);
      setNewSymbol('');
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'connected' ? colors.success : colors.error;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Market APIs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Market Data APIs</Text>
          <View style={styles.apisList}>
            {apis.map((api) => (
              <View key={api.id} style={[styles.apiCard, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.apiHeader}>
                  <View style={styles.apiInfo}>
                    <Text style={[styles.apiName, { color: colors.textPrimary }]}>{api.name}</Text>
                    <Text style={[styles.apiMarket, { color: colors.textSecondary }]}>
                      {api.market} Market
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(api.status)}20` }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(api.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(api.status) }]}>
                      {api.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.apiDetails}>
                  <Text style={[styles.apiDetailLabel, { color: colors.textSecondary }]}>
                    Refresh Speed: {api.refreshSpeed}s
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { backgroundColor: api.status === 'connected' ? colors.errorLight : colors.successLight },
                  ]}
                  onPress={() => toggleAPI(api.id)}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      { color: api.status === 'connected' ? colors.error : colors.success },
                    ]}
                  >
                    {api.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Stock Symbols Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Stock Symbols</Text>
          <View style={[styles.addSymbolCard, { backgroundColor: colors.backgroundSecondary }]}>
            <TextInput
              style={[styles.symbolInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Enter stock symbol (e.g., MTN)"
              placeholderTextColor={colors.textLight}
              value={newSymbol}
              onChangeText={setNewSymbol}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddSymbol}
            >
              <Text style={[styles.addButtonText, { color: colors.textWhite }]}>Add Symbol</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trading Hours */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Trading Hours (Ghana Market)</Text>
          <View style={[styles.tradingHoursCard, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.tradingHoursRow}>
              <Text style={[styles.tradingHoursLabel, { color: colors.textSecondary }]}>Market Hours:</Text>
              <Text style={[styles.tradingHoursValue, { color: colors.textPrimary }]}>
                9:00 AM - 3:00 PM GMT
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => Alert.alert('Edit Trading Hours', 'Feature coming soon')}
            >
              <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Hours</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Maintenance Mode */}
        <View style={styles.section}>
          <View style={[styles.maintenanceCard, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.maintenanceHeader}>
              <View style={styles.maintenanceInfo}>
                <Text style={[styles.maintenanceTitle, { color: colors.textPrimary }]}>
                  Maintenance Mode
                </Text>
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
            {maintenanceMode && (
              <View style={[styles.maintenanceWarning, { backgroundColor: colors.warningLight }]}>
                <SFSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
                <Text style={[styles.maintenanceWarningText, { color: colors.warning }]}>
                  All markets are currently disabled for maintenance
                </Text>
              </View>
            )}
          </View>
        </View>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  apisList: {
    gap: spacing.md,
  },
  apiCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  apiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  apiInfo: {
    flex: 1,
  },
  apiName: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  apiMarket: {
    ...typography.bodySmall,
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
  apiDetails: {
    marginBottom: spacing.sm,
  },
  apiDetailLabel: {
    ...typography.bodySmall,
  },
  toggleButton: {
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  addSymbolCard: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  symbolInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...typography.body,
  },
  addButton: {
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  tradingHoursCard: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  tradingHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tradingHoursLabel: {
    ...typography.body,
  },
  tradingHoursValue: {
    ...typography.body,
    fontWeight: '600',
  },
  editButton: {
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  maintenanceCard: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  maintenanceHeader: {
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
  maintenanceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.sm,
  },
  maintenanceWarningText: {
    ...typography.bodySmall,
    flex: 1,
  },
});

