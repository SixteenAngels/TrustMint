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

export const AdminSettings: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    minDeposit: 100,
    maxDailyTradeLimit: 100000,
    supportedCountries: ['Ghana', 'Nigeria', 'Kenya'],
  });

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');

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
        {/* User Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>User Management</Text>
          
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Add New Admin</Text>
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
                <Text style={[styles.addButtonText, { color: colors.textWhite }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Add New Manager</Text>
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
                <Text style={[styles.addButtonText, { color: colors.textWhite }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Platform Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Platform Settings</Text>
          
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Maintenance Mode
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Temporarily disable the platform
                </Text>
              </View>
              <Switch
                value={settings.maintenanceMode}
                onValueChange={(value) => setSettings({ ...settings, maintenanceMode: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={settings.maintenanceMode ? colors.textWhite : colors.textLight}
              />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Minimum Deposit</Text>
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
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Maximum Daily Trade Limit</Text>
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
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Update Announcements</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <TouchableOpacity
              style={[styles.announcementButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => Alert.alert('Announcements', 'Feature coming soon')}
            >
              <SFSymbol name="megaphone.fill" size={20} color={colors.primary} />
              <Text style={[styles.announcementButtonText, { color: colors.primary }]}>
                Create New Announcement
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Supported Countries */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Supported Countries</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
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
              <Text style={[styles.addCountryButtonText, { color: colors.primary }]}>
                + Add Country
              </Text>
            </TouchableOpacity>
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
  card: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
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
  announcementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  announcementButtonText: {
    ...typography.body,
    fontWeight: '600',
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
});

