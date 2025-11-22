import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

type Tab = 'settings' | 'content' | 'logs' | 'apikeys' | 'support';

export const SettingsAndSystem: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');

  const [settings, setSettings] = useState({
    minDeposit: 100,
    maxDailyTradeLimit: 100000,
    supportedCountries: ['Ghana', 'Nigeria', 'Kenya'],
  });

  const apiKeys = [
    { name: 'OpenAI API Key', category: 'AI', masked: 'sk-••••••••••••••••' },
    { name: 'KYC API Key', category: 'KYC', masked: 'kyc_••••••••••••••••' },
    { name: 'GSE API Key', category: 'Markets', masked: 'gse_••••••••••••••••' },
    { name: 'SMS API Key', category: 'Notifications', masked: 'sms_••••••••••••••••' },
  ];

  const systemLogs = [
    { id: '1', type: 'trade', message: 'Trade executed: MTN x100', timestamp: '2 hours ago' },
    { id: '2', type: 'admin', message: 'Admin login: admin@minttrade.com', timestamp: '3 hours ago' },
    { id: '3', type: 'system', message: 'System backup completed', timestamp: '1 day ago' },
  ];

  const handleAddAdmin = () => {
    if (newAdminEmail.trim()) {
      Alert.alert('Success', `Admin ${newAdminEmail} added`);
      setNewAdminEmail('');
    }
  };

  const handleAddManager = () => {
    if (newManagerEmail.trim()) {
      Alert.alert('Success', `Manager ${newManagerEmail} added`);
      setNewManagerEmail('');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabBar}>
          {(['settings', 'content', 'logs', 'apikeys', 'support'] as Tab[]).map((tab) => (
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
                {tab === 'apikeys' ? 'API Keys' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>User Management</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder="admin@example.com"
                  placeholderTextColor={colors.textLight}
                  value={newAdminEmail}
                  onChangeText={setNewAdminEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddAdmin}
                >
                  <Text style={[styles.addButtonText, { color: colors.textWhite }]}>Add Admin</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder="manager@example.com"
                  placeholderTextColor={colors.textLight}
                  value={newManagerEmail}
                  onChangeText={setNewManagerEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.accent }]}
                  onPress={handleAddManager}
                >
                  <Text style={[styles.addButtonText, { color: colors.textWhite }]}>Add Manager</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Maintenance Mode</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Temporarily disable the platform
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

            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Minimum Deposit</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                  value={settings.minDeposit.toString()}
                  onChangeText={(text) => setSettings({ ...settings, minDeposit: parseInt(text) || 0 })}
                  keyboardType="numeric"
                />
                <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>₵</Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Maximum Daily Trade Limit</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                  value={settings.maxDailyTradeLimit.toString()}
                  onChangeText={(text) => setSettings({ ...settings, maxDailyTradeLimit: parseInt(text) || 0 })}
                  keyboardType="numeric"
                />
                <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>₵</Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Supported Countries</Text>
              {settings.supportedCountries.map((country, index) => (
                <View key={index} style={styles.countryRow}>
                  <Text style={[styles.countryName, { color: colors.textPrimary }]}>{country}</Text>
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: colors.errorLight }]}
                    onPress={() => {}}
                  >
                    <Text style={[styles.removeButtonText, { color: colors.error }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.addCountryButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => Alert.alert('Add Country', 'Feature coming soon')}
              >
                <Text style={[styles.addCountryButtonText, { color: colors.primary }]}>+ Add Country</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>App Branding</Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => Alert.alert('Banners', 'Manage app banners')}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Manage Banners</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight, marginTop: spacing.sm }]}
                onPress={() => Alert.alert('News Feed', 'Manage news feed')}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Manage News Feed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight, marginTop: spacing.sm }]}
                onPress={() => Alert.alert('Alerts', 'Manage alerts')}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Manage Alerts</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>System Logs</Text>
              {systemLogs.map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <View style={[styles.logIcon, { backgroundColor: `${colors.primary}20` }]}>
                    <SFSymbol name="doc.text.fill" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.logContent}>
                    <Text style={[styles.logMessage, { color: colors.textPrimary }]}>{log.message}</Text>
                    <Text style={[styles.logTimestamp, { color: colors.textSecondary }]}>{log.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* API Keys Tab */}
        {activeTab === 'apikeys' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>API Keys Vault</Text>
              {apiKeys.map((key, index) => (
                <View key={index} style={styles.apiKeyRow}>
                  <View style={styles.apiKeyInfo}>
                    <Text style={[styles.apiKeyName, { color: colors.textPrimary }]}>{key.name}</Text>
                    <Text style={[styles.apiKeyCategory, { color: colors.textSecondary }]}>{key.category}</Text>
                  </View>
                  <View style={styles.apiKeyValue}>
                    <Text style={[styles.apiKeyMasked, { color: colors.textSecondary }]}>{key.masked}</Text>
                    <TouchableOpacity
                      style={[styles.revealButton, { backgroundColor: colors.primaryLight }]}
                      onPress={() => Alert.alert('API Key', 'Key revealed (hidden in production)')}
                    >
                      <Text style={[styles.revealButtonText, { color: colors.primary }]}>Reveal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Support Tickets</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Manage customer support tickets
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight, marginTop: spacing.md }]}
                onPress={() => Alert.alert('Support', 'View support tickets')}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>View Tickets</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Notification Settings</Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => Alert.alert('Notifications', 'Configure notification settings')}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Configure</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Security Settings</Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => Alert.alert('Security', 'Manage security settings')}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Manage Security</Text>
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
    minWidth: '18%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '500',
    fontSize: 11,
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
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
  },
  addButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  addButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  currencyLabel: {
    ...typography.h6,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.bodySmall,
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countryName: {
    ...typography.body,
  },
  removeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  removeButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  addCountryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  addCountryButtonText: {
    ...typography.bodySmall,
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
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  logTimestamp: {
    ...typography.bodySmall,
  },
  apiKeyRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  apiKeyInfo: {
    marginBottom: spacing.sm,
  },
  apiKeyName: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  apiKeyCategory: {
    ...typography.bodySmall,
  },
  apiKeyValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apiKeyMasked: {
    ...typography.bodySmall,
    fontFamily: 'monospace',
  },
  revealButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  revealButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});

