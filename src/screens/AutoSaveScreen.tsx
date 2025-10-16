import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { AutoSaveService } from '../services/autoSaveService';
import { InvestmentVaultService } from '../services/investmentVaultService';
import { 
  AutoSaveRule, 
  SavingsAccount, 
  SavingsGoal, 
  SavingsAnalytics,
  AUTO_SAVE_TRIGGER_TYPES,
  ROUND_UP_AMOUNTS,
  SAVINGS_PERCENTAGES,
  FIXED_SAVINGS_AMOUNTS,
  SAVINGS_GOAL_CATEGORIES
} from '../types/savings';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const AutoSaveScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'goals' | 'analytics'>('rules');
  const [rules, setRules] = useState<AutoSaveRule[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [analytics, setAnalytics] = useState<SavingsAnalytics | null>(null);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create rule form state
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [triggerType, setTriggerType] = useState<string>('');
  const [roundUpAmount, setRoundUpAmount] = useState<number>(5);
  const [percentage, setPercentage] = useState<number>(5);
  const [fixedAmount, setFixedAmount] = useState<number>(10);
  const [destinationType, setDestinationType] = useState<string>('');
  const [destinationId, setDestinationId] = useState('');

  // Create goal form state
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [goalCategory, setGoalCategory] = useState('');
  const [goalPriority, setGoalPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const autoSaveService = AutoSaveService.getInstance();
  const vaultService = InvestmentVaultService.getInstance();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const userId = 'current_user_id';
      const [userRules, userGoals, userAccounts] = await Promise.all([
        autoSaveService.getAutoSaveRules(userId),
        autoSaveService.getSavingsGoals(userId),
        autoSaveService.getSavingsAccounts(userId),
      ]);
      
      setRules(userRules);
      setGoals(userGoals);
      setAccounts(userAccounts);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const userId = 'current_user_id';
      const userAnalytics = await autoSaveService.getSavingsAnalytics(userId, 'month');
      setAnalytics(userAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCreateRule = async () => {
    if (!ruleName || !triggerType || !destinationType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const userId = 'current_user_id';
      const triggerSettings: any = {};

      switch (triggerType) {
        case 'round_up':
          triggerSettings.roundUpAmount = roundUpAmount;
          triggerSettings.minimumTransaction = 10;
          break;
        case 'percentage':
          triggerSettings.percentage = percentage;
          break;
        case 'fixed_amount':
          triggerSettings.fixedAmount = fixedAmount;
          break;
        case 'smart_save':
          triggerSettings.smartSaveEnabled = true;
          triggerSettings.maxDailyAmount = 100;
          triggerSettings.spendingThreshold = 50;
          break;
      }

      const ruleData = {
        userId,
        name: ruleName,
        description: ruleDescription,
        isActive: true,
        triggerType: triggerType as 'round_up' | 'percentage' | 'fixed_amount' | 'smart_save',
        triggerSettings,
        destinationType: destinationType as 'savings_account' | 'investment_vault' | 'specific_stock',
        destinationId: destinationId || 'default_savings',
        priority: rules.length + 1,
      };

      await autoSaveService.createAutoSaveRule(ruleData);
      
      Alert.alert('Success', 'Auto-save rule created successfully!');
      setShowCreateRule(false);
      resetRuleForm();
      loadInitialData();
    } catch (error) {
      console.error('Error creating rule:', error);
      Alert.alert('Error', 'Failed to create auto-save rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalName || !targetAmount || !targetDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const userId = 'current_user_id';
      const goalData = {
        userId,
        name: goalName,
        description: goalDescription,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        targetDate: new Date(targetDate),
        priority: goalPriority,
        category: (goalCategory || 'other') as 'emergency' | 'vacation' | 'education' | 'home' | 'car' | 'wedding' | 'retirement' | 'other',
        isActive: true,
        contributions: [],
        autoSaveRules: [],
        progress: 0,
        isCompleted: false,
      };

      await autoSaveService.createSavingsGoal(goalData);
      
      Alert.alert('Success', 'Savings goal created successfully!');
      setShowCreateGoal(false);
      resetGoalForm();
      loadInitialData();
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create savings goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await autoSaveService.updateAutoSaveRule(ruleId, { isActive });
      loadInitialData();
    } catch (error) {
      console.error('Error toggling rule:', error);
      Alert.alert('Error', 'Failed to update rule. Please try again.');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this auto-save rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await autoSaveService.deleteAutoSaveRule(ruleId);
              loadInitialData();
            } catch (error) {
              console.error('Error deleting rule:', error);
              Alert.alert('Error', 'Failed to delete rule. Please try again.');
            }
          }
        }
      ]
    );
  };

  const resetRuleForm = () => {
    setRuleName('');
    setRuleDescription('');
    setTriggerType('');
    setRoundUpAmount(5);
    setPercentage(5);
    setFixedAmount(10);
    setDestinationType('');
    setDestinationId('');
  };

  const resetGoalForm = () => {
    setGoalName('');
    setGoalDescription('');
    setTargetAmount('');
    setTargetDate('');
    setGoalCategory('');
    setGoalPriority('medium');
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'rules', label: 'Rules', icon: '⚙️' },
        { id: 'goals', label: 'Goals', icon: '🎯' },
        { id: 'analytics', label: 'Analytics', icon: '📊' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab(tab.id as 'rules' | 'goals' | 'analytics')}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.tabTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRulesTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Auto-Save Rules</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateRule(true)}
          >
            <Text style={styles.addButtonText}>+ Add Rule</Text>
          </TouchableOpacity>
        </View>
        
        {rules.map((rule) => (
          <View key={rule.id} style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleName}>{rule.name}</Text>
              <Switch
                value={rule.isActive}
                onValueChange={(value) => handleToggleRule(rule.id, value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={rule.isActive ? colors.textWhite : colors.textSecondary}
              />
            </View>
            
            <Text style={styles.ruleDescription}>{rule.description}</Text>
            
            <View style={styles.ruleDetails}>
              <Text style={styles.ruleDetail}>
                Type: {AUTO_SAVE_TRIGGER_TYPES.find(t => t.id === rule.triggerType)?.name}
              </Text>
              <Text style={styles.ruleDetail}>
                Saved: ₵{rule.totalSaved.toFixed(2)}
              </Text>
              <Text style={styles.ruleDetail}>
                Transactions: {rule.transactionCount}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteRule(rule.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderGoalsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateGoal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Goal</Text>
          </TouchableOpacity>
        </View>
        
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.goalProgress}>{goal.progress.toFixed(1)}%</Text>
            </View>
            
            <Text style={styles.goalDescription}>{goal.description}</Text>
            
            <View style={styles.goalProgressBar}>
              <View 
                style={[
                  styles.goalProgressFill, 
                  { width: `${Math.min(goal.progress, 100)}%` }
                ]} 
              />
            </View>
            
            <View style={styles.goalDetails}>
              <Text style={styles.goalDetail}>
                ₵{goal.currentAmount.toFixed(2)} / ₵{goal.targetAmount.toFixed(2)}
              </Text>
              <Text style={styles.goalDetail}>
                Target: {goal.targetDate.toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Savings Analytics</Text>
        
        {analytics ? (
          <>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>This Month</Text>
              <Text style={styles.analyticsAmount}>₵{analytics.totalSaved.toFixed(2)}</Text>
              <Text style={styles.analyticsSubtext}>Total Saved</Text>
            </View>
            
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics.autoSaveTransactions}</Text>
                <Text style={styles.analyticsLabel}>Auto-Save Transactions</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>₵{analytics.averageRoundUp.toFixed(2)}</Text>
                <Text style={styles.analyticsLabel}>Average Round-Up</Text>
              </View>
            </View>
            
            <View style={styles.goalsSection}>
              <Text style={styles.goalsTitle}>Goal Progress</Text>
              {analytics.goalProgress.map((goal) => (
                <View key={goal.goalId} style={styles.goalProgressItem}>
                  <Text style={styles.goalProgressName}>{goal.goalName}</Text>
                  <Text style={styles.goalProgressPercent}>{goal.progress.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>No analytics data available</Text>
        )}
      </View>
    </ScrollView>
  );

  const renderCreateRuleModal = () => (
    <Modal
      visible={showCreateRule}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateRule(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowCreateRule(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Auto-Save Rule</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rule Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Round up to nearest 5"
              value={ruleName}
              onChangeText={setRuleName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional description"
              value={ruleDescription}
              onChangeText={setRuleDescription}
              multiline
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Trigger Type *</Text>
            <View style={styles.triggerTypeGrid}>
              {AUTO_SAVE_TRIGGER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.triggerTypeButton,
                    triggerType === type.id && styles.triggerTypeButtonActive
                  ]}
                  onPress={() => setTriggerType(type.id)}
                >
                  <Text style={styles.triggerTypeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.triggerTypeText,
                    triggerType === type.id && styles.triggerTypeTextActive
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {triggerType === 'round_up' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Round Up Amount</Text>
              <View style={styles.amountGrid}>
                {ROUND_UP_AMOUNTS.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.amountButton,
                      roundUpAmount === amount && styles.amountButtonActive
                    ]}
                    onPress={() => setRoundUpAmount(amount)}
                  >
                    <Text style={[
                      styles.amountButtonText,
                      roundUpAmount === amount && styles.amountButtonTextActive
                    ]}>
                      {amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {triggerType === 'percentage' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Percentage</Text>
              <View style={styles.amountGrid}>
                {SAVINGS_PERCENTAGES.map((percent) => (
                  <TouchableOpacity
                    key={percent}
                    style={[
                      styles.amountButton,
                      percentage === percent && styles.amountButtonActive
                    ]}
                    onPress={() => setPercentage(percent)}
                  >
                    <Text style={[
                      styles.amountButtonText,
                      percentage === percent && styles.amountButtonTextActive
                    ]}>
                      {percent}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {triggerType === 'fixed_amount' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fixed Amount</Text>
              <View style={styles.amountGrid}>
                {FIXED_SAVINGS_AMOUNTS.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.amountButton,
                      fixedAmount === amount && styles.amountButtonActive
                    ]}
                    onPress={() => setFixedAmount(amount)}
                  >
                    <Text style={[
                      styles.amountButtonText,
                      fixedAmount === amount && styles.amountButtonTextActive
                    ]}>
                      ₵{amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.createButton, (!ruleName || !triggerType) && styles.createButtonDisabled]}
            onPress={handleCreateRule}
            disabled={!ruleName || !triggerType || loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Rule'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderCreateGoalModal = () => (
    <Modal
      visible={showCreateGoal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateGoal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowCreateGoal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Savings Goal</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Goal Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Emergency Fund"
              value={goalName}
              onChangeText={setGoalName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional description"
              value={goalDescription}
              onChangeText={setGoalDescription}
              multiline
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Target Amount (₵) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="10000"
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Target Date *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="2024-12-31"
              value={targetDate}
              onChangeText={setTargetDate}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {SAVINGS_GOAL_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    goalCategory === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setGoalCategory(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    goalCategory === category.id && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.createButton, (!goalName || !targetAmount || !targetDate) && styles.createButtonDisabled]}
            onPress={handleCreateGoal}
            disabled={!goalName || !targetAmount || !targetDate || loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Goal'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading && activeTab === 'rules') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Auto-Save</Text>
        <Text style={styles.subtitle}>Automatically save money from your transactions</Text>
      </View>

      {/* Tab Selector */}
      {renderTabSelector()}

      {/* Content */}
      {activeTab === 'rules' && renderRulesTab()}
      {activeTab === 'goals' && renderGoalsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}

      {/* Modals */}
      {renderCreateRuleModal()}
      {renderCreateGoalModal()}
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
    backgroundColor: colors.background,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  ruleCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ruleName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  ruleDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  ruleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ruleDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  goalProgress: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  goalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  analyticsCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  analyticsTitle: {
    ...typography.body,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  analyticsAmount: {
    ...typography.h2,
    color: colors.textWhite,
    fontWeight: '700',
  },
  analyticsSubtext: {
    ...typography.caption,
    color: colors.textWhite,
    marginTop: spacing.xs,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsValue: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  analyticsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  goalsSection: {
    marginTop: spacing.lg,
  },
  goalsTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  goalProgressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  goalProgressName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  goalProgressPercent: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  noDataText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxxl,
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
  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textPrimary,
  },
  triggerTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  triggerTypeButton: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  triggerTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  triggerTypeIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  triggerTypeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  triggerTypeTextActive: {
    color: colors.textWhite,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountButton: {
    width: '30%',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  amountButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  amountButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  amountButtonTextActive: {
    color: colors.textWhite,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.textWhite,
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  createButtonDisabled: {
    backgroundColor: colors.border,
  },
  createButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontSize: 18,
  },
});