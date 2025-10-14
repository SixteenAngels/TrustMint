import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { SFSymbol } from './SFSymbols';

const { width: screenWidth } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onActionPress: (actionId: string) => void;
}

const quickActions: QuickAction[] = [
  {
    id: 'auto_save',
    title: 'Auto-Save',
    subtitle: 'Automatic savings features',
    icon: 'dollarsign.circle',
    color: colors.primary,
    onPress: () => {},
  },
  {
    id: 'investment_vaults',
    title: 'Investment Vaults',
    subtitle: 'Curated investment portfolios',
    icon: 'building.2',
    color: colors.success,
    onPress: () => {},
  },
  {
    id: 'kyc',
    title: 'KYC Verification',
    subtitle: 'Complete your identity verification',
    icon: 'person.badge.shield.checkmark',
    color: colors.warning,
    onPress: () => {},
  },
  {
    id: 'banking_dashboard',
    title: 'Banking Dashboard',
    subtitle: 'Complete financial overview',
    icon: 'chart.bar',
    color: colors.primary,
    onPress: () => {},
  },
];

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  visible,
  onClose,
  onActionPress,
}) => {
  const handleActionPress = (actionId: string) => {
    onActionPress(actionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <SFSymbol name="xmark" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>More Features</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banking & Finance</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={() => handleActionPress(action.id)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <SFSymbol name={action.icon} size={24} color={colors.textWhite} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (screenWidth - spacing.lg * 3) / 2,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});