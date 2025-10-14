import { 
  AutoSaveRule, 
  RoundUpTransaction, 
  SavingsAccount, 
  SavingsGoal,
  GoalContribution,
  SmartSaveInsight,
  SavingsAnalytics,
  ROUND_UP_AMOUNTS,
  SAVINGS_PERCENTAGES,
  FIXED_SAVINGS_AMOUNTS
} from '../types/savings';
import { db } from '../../firebase.config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  arrayUnion
} from 'firebase/firestore';

export class AutoSaveService {
  private static instance: AutoSaveService;

  static getInstance(): AutoSaveService {
    if (!AutoSaveService.instance) {
      AutoSaveService.instance = new AutoSaveService();
    }
    return AutoSaveService.instance;
  }

  // Create auto-save rule
  async createAutoSaveRule(ruleData: Omit<AutoSaveRule, 'id' | 'createdAt' | 'updatedAt' | 'totalSaved' | 'transactionCount'>): Promise<string> {
    try {
      const ruleRef = await addDoc(collection(db, 'autoSaveRules'), {
        ...ruleData,
        totalSaved: 0,
        transactionCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return ruleRef.id;
    } catch (error) {
      console.error('Error creating auto-save rule:', error);
      throw error;
    }
  }

  // Get user's auto-save rules
  async getAutoSaveRules(userId: string): Promise<AutoSaveRule[]> {
    try {
      const rulesQuery = query(
        collection(db, 'autoSaveRules'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(rulesQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastTriggered: data.lastTriggered?.toDate(),
        } as AutoSaveRule;
      });
    } catch (error) {
      console.error('Error getting auto-save rules:', error);
      throw error;
    }
  }

  // Update auto-save rule
  async updateAutoSaveRule(ruleId: string, updates: Partial<AutoSaveRule>): Promise<void> {
    try {
      await updateDoc(doc(db, 'autoSaveRules', ruleId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating auto-save rule:', error);
      throw error;
    }
  }

  // Delete auto-save rule
  async deleteAutoSaveRule(ruleId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'autoSaveRules', ruleId), {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error deleting auto-save rule:', error);
      throw error;
    }
  }

  // Process transaction for auto-save
  async processTransactionForAutoSave(
    userId: string,
    transactionId: string,
    amount: number,
    transactionType: 'payment' | 'trade' | 'transfer',
    metadata?: any
  ): Promise<RoundUpTransaction[]> {
    try {
      const rules = await this.getAutoSaveRules(userId);
      const triggeredTransactions: RoundUpTransaction[] = [];

      for (const rule of rules) {
        if (!this.shouldTriggerRule(rule, amount, transactionType)) {
          continue;
        }

        const roundUpAmount = this.calculateRoundUpAmount(rule, amount);
        if (roundUpAmount <= 0) {
          continue;
        }

        // Check daily limits
        if (rule.triggerSettings.maxDailyAmount) {
          const dailySaved = await this.getDailySavedAmount(userId, rule.id);
          if (dailySaved + roundUpAmount > rule.triggerSettings.maxDailyAmount) {
            continue;
          }
        }

        const roundUpTransaction = await this.createRoundUpTransaction(
          userId,
          transactionId,
          amount,
          roundUpAmount,
          rule,
          transactionType,
          metadata
        );

        triggeredTransactions.push(roundUpTransaction);
      }

      return triggeredTransactions;
    } catch (error) {
      console.error('Error processing transaction for auto-save:', error);
      throw error;
    }
  }

  // Create round-up transaction
  private async createRoundUpTransaction(
    userId: string,
    originalTransactionId: string,
    originalAmount: number,
    roundUpAmount: number,
    rule: AutoSaveRule,
    transactionType: 'payment' | 'trade' | 'transfer',
    metadata?: any
  ): Promise<RoundUpTransaction> {
    try {
      const roundUpData: Omit<RoundUpTransaction, 'id' | 'createdAt'> = {
        userId,
        originalTransactionId,
        originalAmount,
        roundUpAmount,
        totalAmount: originalAmount + roundUpAmount,
        autoSaveRuleId: rule.id,
        destinationId: rule.destinationId,
        status: 'pending',
        metadata: {
          transactionType,
          ...metadata,
        },
      };

      const roundUpRef = await addDoc(collection(db, 'roundUpTransactions'), {
        ...roundUpData,
        createdAt: serverTimestamp(),
      });

      // Update auto-save rule stats
      await updateDoc(doc(db, 'autoSaveRules', rule.id), {
        totalSaved: increment(roundUpAmount),
        transactionCount: increment(1),
        lastTriggered: serverTimestamp(),
      });

      return {
        id: roundUpRef.id,
        ...roundUpData,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating round-up transaction:', error);
      throw error;
    }
  }

  // Process round-up transaction
  async processRoundUpTransaction(roundUpId: string): Promise<void> {
    try {
      const roundUpDoc = await getDoc(doc(db, 'roundUpTransactions', roundUpId));
      if (!roundUpDoc.exists()) {
        throw new Error('Round-up transaction not found');
      }

      const roundUpData = roundUpDoc.data() as RoundUpTransaction;
      
      // Update status to processing
      await updateDoc(doc(db, 'roundUpTransactions', roundUpId), {
        status: 'processing',
      });

      // Process the round-up based on destination type
      await this.processRoundUpDestination(roundUpData);

      // Update status to completed
      await updateDoc(doc(db, 'roundUpTransactions', roundUpId), {
        status: 'completed',
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      // Mark as failed
      await updateDoc(doc(db, 'roundUpTransactions', roundUpId), {
        status: 'failed',
      });
      console.error('Error processing round-up transaction:', error);
      throw error;
    }
  }

  // Process round-up destination
  private async processRoundUpDestination(roundUp: RoundUpTransaction): Promise<void> {
    try {
      // Get the auto-save rule to determine destination type
      const ruleDoc = await getDoc(doc(db, 'autoSaveRules', roundUp.autoSaveRuleId));
      if (!ruleDoc.exists()) {
        throw new Error('Auto-save rule not found');
      }

      const rule = ruleDoc.data() as AutoSaveRule;

      switch (rule.destinationType) {
        case 'savings_account':
          await this.addToSavingsAccount(roundUp.destinationId, roundUp.roundUpAmount);
          break;
        case 'investment_vault':
          await this.addToInvestmentVault(roundUp.destinationId, roundUp.roundUpAmount);
          break;
        case 'specific_stock':
          await this.addToSpecificStock(roundUp.destinationId, roundUp.roundUpAmount);
          break;
      }
    } catch (error) {
      console.error('Error processing round-up destination:', error);
      throw error;
    }
  }

  // Add to savings account
  private async addToSavingsAccount(accountId: string, amount: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'savingsAccounts', accountId), {
        balance: increment(amount),
        totalDeposits: increment(amount),
        lastActivity: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding to savings account:', error);
      throw error;
    }
  }

  // Add to investment vault
  private async addToInvestmentVault(vaultId: string, amount: number): Promise<void> {
    try {
      // This would integrate with the investment vault service
      console.log(`Adding ${amount} to vault ${vaultId}`);
    } catch (error) {
      console.error('Error adding to investment vault:', error);
      throw error;
    }
  }

  // Add to specific stock
  private async addToSpecificStock(stockSymbol: string, amount: number): Promise<void> {
    try {
      // This would integrate with the stock trading service
      console.log(`Adding ${amount} to stock ${stockSymbol}`);
    } catch (error) {
      console.error('Error adding to specific stock:', error);
      throw error;
    }
  }

  // Create savings account
  async createSavingsAccount(accountData: Omit<SavingsAccount, 'id' | 'createdAt' | 'totalDeposits' | 'totalWithdrawals' | 'totalInterest'>): Promise<string> {
    try {
      const accountRef = await addDoc(collection(db, 'savingsAccounts'), {
        ...accountData,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalInterest: 0,
        createdAt: serverTimestamp(),
      });

      return accountRef.id;
    } catch (error) {
      console.error('Error creating savings account:', error);
      throw error;
    }
  }

  // Get user's savings accounts
  async getSavingsAccounts(userId: string): Promise<SavingsAccount[]> {
    try {
      const accountsQuery = query(
        collection(db, 'savingsAccounts'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(accountsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActivity: data.lastActivity?.toDate(),
        } as SavingsAccount;
      });
    } catch (error) {
      console.error('Error getting savings accounts:', error);
      throw error;
    }
  }

  // Create savings goal
  async createSavingsGoal(goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'isCompleted'>): Promise<string> {
    try {
      const goalRef = await addDoc(collection(db, 'savingsGoals'), {
        ...goalData,
        progress: 0,
        isCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return goalRef.id;
    } catch (error) {
      console.error('Error creating savings goal:', error);
      throw error;
    }
  }

  // Get user's savings goals
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    try {
      const goalsQuery = query(
        collection(db, 'savingsGoals'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(goalsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          targetDate: data.targetDate?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        } as SavingsGoal;
      });
    } catch (error) {
      console.error('Error getting savings goals:', error);
      throw error;
    }
  }

  // Add contribution to goal
  async addGoalContribution(contributionData: Omit<GoalContribution, 'id' | 'createdAt'>): Promise<string> {
    try {
      const contributionRef = await addDoc(collection(db, 'goalContributions'), {
        ...contributionData,
        createdAt: serverTimestamp(),
      });

      // Update goal progress
      await this.updateGoalProgress(contributionData.goalId, contributionData.amount);

      return contributionRef.id;
    } catch (error) {
      console.error('Error adding goal contribution:', error);
      throw error;
    }
  }

  // Update goal progress
  private async updateGoalProgress(goalId: string, amount: number): Promise<void> {
    try {
      const goalDoc = await getDoc(doc(db, 'savingsGoals', goalId));
      if (!goalDoc.exists()) {
        throw new Error('Savings goal not found');
      }

      const goalData = goalDoc.data() as SavingsGoal;
      const newCurrentAmount = goalData.currentAmount + amount;
      const progress = Math.min((newCurrentAmount / goalData.targetAmount) * 100, 100);
      const isCompleted = newCurrentAmount >= goalData.targetAmount;

      await updateDoc(doc(db, 'savingsGoals', goalId), {
        currentAmount: newCurrentAmount,
        progress,
        isCompleted,
        completedAt: isCompleted ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  // Get savings analytics
  async getSavingsAnalytics(userId: string, period: 'week' | 'month' | 'quarter' | 'year'): Promise<SavingsAnalytics> {
    try {
      // Calculate date range
      const now = new Date();
      const startDate = this.getStartDate(now, period);

      // Get round-up transactions
      const roundUpQuery = query(
        collection(db, 'roundUpTransactions'),
        where('userId', '==', userId),
        where('createdAt', '>=', startDate),
        where('status', '==', 'completed')
      );

      const roundUpSnapshot = await getDocs(roundUpQuery);
      const roundUpTransactions = roundUpSnapshot.docs.map(doc => doc.data() as RoundUpTransaction);

      // Calculate analytics
      const totalSaved = roundUpTransactions.reduce((sum, t) => sum + t.roundUpAmount, 0);
      const averageRoundUp = totalSaved / roundUpTransactions.length || 0;

      // Get goals
      const goals = await this.getSavingsGoals(userId);
      const goalProgress = goals.map(goal => ({
        goalId: goal.id,
        goalName: goal.name,
        progress: goal.progress,
        remaining: goal.targetAmount - goal.currentAmount,
        daysRemaining: Math.ceil((goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      }));

      // Generate insights
      const insights = await this.generateSmartSaveInsights(userId, totalSaved, goals);

      return {
        userId,
        period,
        totalSaved,
        totalInvested: 0, // Would be calculated from vault investments
        totalInterest: 0, // Would be calculated from savings accounts
        totalGains: 0, // Would be calculated from investments
        autoSaveTransactions: roundUpTransactions.length,
        roundUpTransactions: roundUpTransactions.length,
        averageRoundUp,
        topCategories: [], // Would be calculated from transaction categories
        goalProgress,
        vaultPerformance: [], // Would be calculated from vault performance
        insights,
      };
    } catch (error) {
      console.error('Error getting savings analytics:', error);
      throw error;
    }
  }

  // Generate smart save insights
  private async generateSmartSaveInsights(userId: string, totalSaved: number, goals: SavingsGoal[]): Promise<SmartSaveInsight[]> {
    const insights: SmartSaveInsight[] = [];

    // Check if user has any goals
    if (goals.length === 0) {
      insights.push({
        id: 'no_goals',
        userId,
        type: 'saving_opportunity',
        title: 'Set Your First Savings Goal',
        description: 'Create a savings goal to track your progress and stay motivated.',
        actionRequired: true,
        actionText: 'Create Goal',
        priority: 'high',
        isRead: false,
        createdAt: new Date(),
      });
    }

    // Check for goals that are behind schedule
    const behindScheduleGoals = goals.filter(goal => {
      const daysRemaining = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const expectedProgress = Math.max(0, 100 - (daysRemaining / 365) * 100);
      return goal.progress < expectedProgress && !goal.isCompleted;
    });

    if (behindScheduleGoals.length > 0) {
      insights.push({
        id: 'behind_schedule',
        userId,
        type: 'goal_progress',
        title: 'Goals Behind Schedule',
        description: `You have ${behindScheduleGoals.length} goal(s) that are behind schedule. Consider increasing your savings rate.`,
        actionRequired: true,
        actionText: 'View Goals',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(),
        metadata: {
          amount: behindScheduleGoals.length,
        },
      });
    }

    return insights;
  }

  // Helper methods
  private shouldTriggerRule(rule: AutoSaveRule, amount: number, transactionType: string): boolean {
    // Check minimum transaction amount
    if (rule.triggerSettings.minimumTransaction && amount < rule.triggerSettings.minimumTransaction) {
      return false;
    }

    // Check spending threshold for smart save
    if (rule.triggerType === 'smart_save' && rule.triggerSettings.spendingThreshold) {
      return amount >= rule.triggerSettings.spendingThreshold;
    }

    return true;
  }

  private calculateRoundUpAmount(rule: AutoSaveRule, amount: number): number {
    switch (rule.triggerType) {
      case 'round_up':
        const roundUpAmount = rule.triggerSettings.roundUpAmount || 5;
        return Math.ceil(amount / roundUpAmount) * roundUpAmount - amount;
      
      case 'percentage':
        const percentage = rule.triggerSettings.percentage || 5;
        return amount * (percentage / 100);
      
      case 'fixed_amount':
        return rule.triggerSettings.fixedAmount || 0;
      
      case 'smart_save':
        // AI-powered calculation based on spending patterns
        return this.calculateSmartSaveAmount(amount);
      
      default:
        return 0;
    }
  }

  private calculateSmartSaveAmount(amount: number): number {
    // Simple smart save logic - save 1-5% based on amount
    if (amount < 50) return 0;
    if (amount < 100) return 1;
    if (amount < 500) return 2;
    if (amount < 1000) return 5;
    return 10;
  }

  private async getDailySavedAmount(userId: string, ruleId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyQuery = query(
        collection(db, 'roundUpTransactions'),
        where('userId', '==', userId),
        where('autoSaveRuleId', '==', ruleId),
        where('createdAt', '>=', today),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(dailyQuery);
      return snapshot.docs.reduce((sum, doc) => sum + doc.data().roundUpAmount, 0);
    } catch (error) {
      console.error('Error getting daily saved amount:', error);
      return 0;
    }
  }

  private getStartDate(now: Date, period: string): Date {
    const startDate = new Date(now);
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return startDate;
  }
}