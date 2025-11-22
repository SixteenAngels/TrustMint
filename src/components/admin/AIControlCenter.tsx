import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SFSymbol } from '../SFSymbols';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { shadows } from '../../styles/shadows';

export const AIControlCenter: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const [aiEnabled, setAiEnabled] = useState({
    recommendations: true,
    autoTrading: true,
    alerts: true,
  });

  const [aiStats, setAiStats] = useState({
    modelVersion: 'v2.1.0',
    confidenceScore: 87.5,
    dailyPredictions: 1234,
    backtestingAccuracy: 82.3,
    userAdoption: 456,
  });

  const [riskThreshold, setRiskThreshold] = useState(75);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* AI Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>AI Statistics</Text>
          <View style={[styles.statsCard, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Model Version</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {aiStats.modelVersion}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Confidence Score</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {aiStats.confidenceScore}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Daily Predictions</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {aiStats.dailyPredictions.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Backtesting Accuracy</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {aiStats.backtestingAccuracy}%
                </Text>
              </View>
            </View>
            <View style={styles.userAdoption}>
              <SFSymbol name="person.2" size={20} color={colors.primary} />
              <Text style={[styles.userAdoptionText, { color: colors.textPrimary }]}>
                {aiStats.userAdoption} users using AI auto-trade
              </Text>
            </View>
          </View>
        </View>

        {/* AI Controls */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>AI Controls</Text>
          <View style={[styles.controlsCard, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.controlRow}>
              <View style={styles.controlInfo}>
                <Text style={[styles.controlLabel, { color: colors.textPrimary }]}>
                  AI Recommendations
                </Text>
                <Text style={[styles.controlDescription, { color: colors.textSecondary }]}>
                  Enable AI-generated stock recommendations
                </Text>
              </View>
              <Switch
                value={aiEnabled.recommendations}
                onValueChange={(value) => setAiEnabled({ ...aiEnabled, recommendations: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={aiEnabled.recommendations ? colors.textWhite : colors.textLight}
              />
            </View>

            <View style={styles.controlRow}>
              <View style={styles.controlInfo}>
                <Text style={[styles.controlLabel, { color: colors.textPrimary }]}>
                  AI Auto-Trading
                </Text>
                <Text style={[styles.controlDescription, { color: colors.textSecondary }]}>
                  Allow AI to execute trades automatically
                </Text>
              </View>
              <Switch
                value={aiEnabled.autoTrading}
                onValueChange={(value) => setAiEnabled({ ...aiEnabled, autoTrading: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={aiEnabled.autoTrading ? colors.textWhite : colors.textLight}
              />
            </View>

            <View style={styles.controlRow}>
              <View style={styles.controlInfo}>
                <Text style={[styles.controlLabel, { color: colors.textPrimary }]}>
                  AI Alerts
                </Text>
                <Text style={[styles.controlDescription, { color: colors.textSecondary }]}>
                  Send AI-generated price alerts to users
                </Text>
              </View>
              <Switch
                value={aiEnabled.alerts}
                onValueChange={(value) => setAiEnabled({ ...aiEnabled, alerts: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={aiEnabled.alerts ? colors.textWhite : colors.textLight}
              />
            </View>
          </View>
        </View>

        {/* Risk Threshold */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Risk Threshold</Text>
          <View style={[styles.riskCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.riskLabel, { color: colors.textSecondary }]}>
              Current Threshold: {riskThreshold}%
            </Text>
            <View style={styles.riskSlider}>
              <View style={[styles.riskBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.riskBarFill,
                    { backgroundColor: colors.primary, width: `${riskThreshold}%` },
                  ]}
                />
              </View>
            </View>
            <View style={styles.riskButtons}>
              <TouchableOpacity
                style={[styles.riskButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => setRiskThreshold(Math.max(0, riskThreshold - 5))}
              >
                <Text style={[styles.riskButtonText, { color: colors.primary }]}>-5%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.riskButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => setRiskThreshold(Math.min(100, riskThreshold + 5))}
              >
                <Text style={[styles.riskButtonText, { color: colors.primary }]}>+5%</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Blocked Stocks */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Blocked Stocks from AI Trading</Text>
          <View style={[styles.blockedCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.blockedText, { color: colors.textSecondary }]}>
              No stocks currently blocked
            </Text>
            <TouchableOpacity
              style={[styles.addBlockedButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => {}}
            >
              <Text style={[styles.addBlockedButtonText, { color: colors.primary }]}>
                Add Blocked Stock
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
  statsCard: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h6,
    fontWeight: '600',
  },
  userAdoption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  userAdoptionText: {
    ...typography.body,
    fontWeight: '500',
  },
  controlsCard: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  controlInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  controlLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  controlDescription: {
    ...typography.bodySmall,
  },
  riskCard: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  riskLabel: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  riskSlider: {
    marginBottom: spacing.md,
  },
  riskBar: {
    height: 8,
    borderRadius: 4,
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  riskButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  riskButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  riskButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  blockedCard: {
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  blockedText: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  addBlockedButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  addBlockedButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});

