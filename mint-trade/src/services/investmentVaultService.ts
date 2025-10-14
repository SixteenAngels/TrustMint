import { 
  InvestmentVault, 
  VaultHolding, 
  UserVaultInvestment,
  VAULT_CATEGORIES 
} from '../types/savings';
import { db } from '../firebase.config';
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
  increment
} from 'firebase/firestore';

export class InvestmentVaultService {
  private static instance: InvestmentVaultService;

  static getInstance(): InvestmentVaultService {
    if (!InvestmentVaultService.instance) {
      InvestmentVaultService.instance = new InvestmentVaultService();
    }
    return InvestmentVaultService.instance;
  }

  // Get all available vaults
  async getAvailableVaults(): Promise<InvestmentVault[]> {
    try {
      const vaultsQuery = query(
        collection(db, 'investmentVaults'),
        where('isActive', '==', true),
        orderBy('isFeatured', 'desc'),
        orderBy('totalInvestors', 'desc')
      );

      const snapshot = await getDocs(vaultsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          holdings: data.holdings?.map((holding: any) => ({
            ...holding,
            lastUpdated: holding.lastUpdated?.toDate() || new Date(),
          })) || [],
        } as InvestmentVault;
      });
    } catch (error) {
      console.error('Error getting available vaults:', error);
      throw error;
    }
  }

  // Get vault by ID
  async getVaultById(vaultId: string): Promise<InvestmentVault | null> {
    try {
      const vaultDoc = await getDoc(doc(db, 'investmentVaults', vaultId));
      
      if (!vaultDoc.exists()) {
        return null;
      }

      const data = vaultDoc.data();
      return {
        id: vaultDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        holdings: data.holdings?.map((holding: any) => ({
          ...holding,
          lastUpdated: holding.lastUpdated?.toDate() || new Date(),
        })) || [],
      } as InvestmentVault;
    } catch (error) {
      console.error('Error getting vault by ID:', error);
      throw error;
    }
  }

  // Get vaults by category
  async getVaultsByCategory(category: string): Promise<InvestmentVault[]> {
    try {
      const vaultsQuery = query(
        collection(db, 'investmentVaults'),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('totalInvestors', 'desc')
      );

      const snapshot = await getDocs(vaultsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          holdings: data.holdings?.map((holding: any) => ({
            ...holding,
            lastUpdated: holding.lastUpdated?.toDate() || new Date(),
          })) || [],
        } as InvestmentVault;
      });
    } catch (error) {
      console.error('Error getting vaults by category:', error);
      throw error;
    }
  }

  // Get featured vaults
  async getFeaturedVaults(): Promise<InvestmentVault[]> {
    try {
      const vaultsQuery = query(
        collection(db, 'investmentVaults'),
        where('isFeatured', '==', true),
        where('isActive', '==', true),
        orderBy('totalInvestors', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(vaultsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          holdings: data.holdings?.map((holding: any) => ({
            ...holding,
            lastUpdated: holding.lastUpdated?.toDate() || new Date(),
          })) || [],
        } as InvestmentVault;
      });
    } catch (error) {
      console.error('Error getting featured vaults:', error);
      throw error;
    }
  }

  // Get new vaults
  async getNewVaults(): Promise<InvestmentVault[]> {
    try {
      const vaultsQuery = query(
        collection(db, 'investmentVaults'),
        where('isNew', '==', true),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(vaultsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          holdings: data.holdings?.map((holding: any) => ({
            ...holding,
            lastUpdated: holding.lastUpdated?.toDate() || new Date(),
          })) || [],
        } as InvestmentVault;
      });
    } catch (error) {
      console.error('Error getting new vaults:', error);
      throw error;
    }
  }

  // Invest in vault
  async investInVault(
    userId: string,
    vaultId: string,
    amount: number,
    currency: 'GHS' | 'USD' = 'GHS'
  ): Promise<string> {
    try {
      // Get vault details
      const vault = await this.getVaultById(vaultId);
      if (!vault) {
        throw new Error('Vault not found');
      }

      // Validate investment amount
      if (amount < vault.minimumInvestment) {
        throw new Error(`Minimum investment is ₵${vault.minimumInvestment}`);
      }

      if (amount > vault.maximumInvestment) {
        throw new Error(`Maximum investment is ₵${vault.maximumInvestment}`);
      }

      // Calculate shares (simplified - in real app, this would be more complex)
      const sharePrice = vault.totalAssets / vault.totalInvestors || 1;
      const shares = amount / sharePrice;

      // Create user investment record
      const investmentData: Omit<UserVaultInvestment, 'id' | 'createdAt' | 'currentValue' | 'gainLoss' | 'gainLossPercentage' | 'totalContributions' | 'totalWithdrawals'> = {
        userId,
        vaultId,
        amount,
        currency,
        shares,
        averagePrice: sharePrice,
        status: 'active',
        autoInvestEnabled: false,
      };

      const investmentRef = await addDoc(collection(db, 'userVaultInvestments'), {
        ...investmentData,
        currentValue: amount,
        gainLoss: 0,
        gainLossPercentage: 0,
        totalContributions: amount,
        totalWithdrawals: 0,
        createdAt: serverTimestamp(),
      });

      // Update vault stats
      await updateDoc(doc(db, 'investmentVaults', vaultId), {
        totalInvestors: increment(1),
        totalAssets: increment(amount),
      });

      return investmentRef.id;
    } catch (error) {
      console.error('Error investing in vault:', error);
      throw error;
    }
  }

  // Get user's vault investments
  async getUserVaultInvestments(userId: string): Promise<UserVaultInvestment[]> {
    try {
      const investmentsQuery = query(
        collection(db, 'userVaultInvestments'),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(investmentsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastContribution: data.lastContribution?.toDate(),
          nextAutoInvest: data.nextAutoInvest?.toDate(),
        } as UserVaultInvestment;
      });
    } catch (error) {
      console.error('Error getting user vault investments:', error);
      throw error;
    }
  }

  // Get vault investment by ID
  async getVaultInvestmentById(investmentId: string): Promise<UserVaultInvestment | null> {
    try {
      const investmentDoc = await getDoc(doc(db, 'userVaultInvestments', investmentId));
      
      if (!investmentDoc.exists()) {
        return null;
      }

      const data = investmentDoc.data();
      return {
        id: investmentDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastContribution: data.lastContribution?.toDate(),
        nextAutoInvest: data.nextAutoInvest?.toDate(),
      } as UserVaultInvestment;
    } catch (error) {
      console.error('Error getting vault investment by ID:', error);
      throw error;
    }
  }

  // Add additional investment to existing vault
  async addToVaultInvestment(
    investmentId: string,
    amount: number
  ): Promise<void> {
    try {
      const investmentDoc = await getDoc(doc(db, 'userVaultInvestments', investmentId));
      if (!investmentDoc.exists()) {
        throw new Error('Investment not found');
      }

      const investment = investmentDoc.data() as UserVaultInvestment;
      const newTotalAmount = investment.amount + amount;
      const newShares = (investment.shares * investment.averagePrice + amount) / investment.averagePrice;

      await updateDoc(doc(db, 'userVaultInvestments', investmentId), {
        amount: newTotalAmount,
        shares: newShares,
        totalContributions: increment(amount),
        lastContribution: serverTimestamp(),
      });

      // Update vault total assets
      await updateDoc(doc(db, 'investmentVaults', investment.vaultId), {
        totalAssets: increment(amount),
      });
    } catch (error) {
      console.error('Error adding to vault investment:', error);
      throw error;
    }
  }

  // Withdraw from vault investment
  async withdrawFromVaultInvestment(
    investmentId: string,
    amount: number
  ): Promise<void> {
    try {
      const investmentDoc = await getDoc(doc(db, 'userVaultInvestments', investmentId));
      if (!investmentDoc.exists()) {
        throw new Error('Investment not found');
      }

      const investment = investmentDoc.data() as UserVaultInvestment;
      
      if (amount > investment.currentValue) {
        throw new Error('Insufficient funds for withdrawal');
      }

      const newAmount = investment.amount - amount;
      const newShares = (investment.shares * investment.averagePrice - amount) / investment.averagePrice;

      await updateDoc(doc(db, 'userVaultInvestments', investmentId), {
        amount: newAmount,
        shares: newShares,
        totalWithdrawals: increment(amount),
      });

      // Update vault total assets
      await updateDoc(doc(db, 'investmentVaults', investment.vaultId), {
        totalAssets: increment(-amount),
      });
    } catch (error) {
      console.error('Error withdrawing from vault investment:', error);
      throw error;
    }
  }

  // Enable auto-invest for vault
  async enableAutoInvest(
    investmentId: string,
    amount: number,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Promise<void> {
    try {
      const nextAutoInvest = this.calculateNextAutoInvest(frequency);

      await updateDoc(doc(db, 'userVaultInvestments', investmentId), {
        autoInvestEnabled: true,
        autoInvestAmount: amount,
        autoInvestFrequency: frequency,
        nextAutoInvest: nextAutoInvest,
      });
    } catch (error) {
      console.error('Error enabling auto-invest:', error);
      throw error;
    }
  }

  // Disable auto-invest for vault
  async disableAutoInvest(investmentId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'userVaultInvestments', investmentId), {
        autoInvestEnabled: false,
        autoInvestAmount: null,
        autoInvestFrequency: null,
        nextAutoInvest: null,
      });
    } catch (error) {
      console.error('Error disabling auto-invest:', error);
      throw error;
    }
  }

  // Process auto-investments
  async processAutoInvestments(): Promise<void> {
    try {
      const now = new Date();
      const investmentsQuery = query(
        collection(db, 'userVaultInvestments'),
        where('autoInvestEnabled', '==', true),
        where('nextAutoInvest', '<=', now),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(investmentsQuery);
      
      for (const doc of snapshot.docs) {
        const investment = doc.data() as UserVaultInvestment;
        
        if (investment.autoInvestAmount && investment.autoInvestFrequency) {
          await this.addToVaultInvestment(doc.id, investment.autoInvestAmount);
          
          // Schedule next auto-invest
          const nextAutoInvest = this.calculateNextAutoInvest(investment.autoInvestFrequency);
          await updateDoc(doc.ref, {
            nextAutoInvest: nextAutoInvest,
          });
        }
      }
    } catch (error) {
      console.error('Error processing auto-investments:', error);
      throw error;
    }
  }

  // Get vault performance
  async getVaultPerformance(vaultId: string): Promise<{
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  }> {
    try {
      // Mock performance data - in real app, this would calculate from historical data
      return {
        totalReturn: 12.5,
        annualizedReturn: 8.2,
        volatility: 15.3,
        sharpeRatio: 0.54,
        maxDrawdown: -8.7,
      };
    } catch (error) {
      console.error('Error getting vault performance:', error);
      throw error;
    }
  }

  // Search vaults
  async searchVaults(query: string): Promise<InvestmentVault[]> {
    try {
      const vaults = await this.getAvailableVaults();
      
      return vaults.filter(vault => 
        vault.name.toLowerCase().includes(query.toLowerCase()) ||
        vault.description.toLowerCase().includes(query.toLowerCase()) ||
        vault.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching vaults:', error);
      throw error;
    }
  }

  // Get vault categories
  getVaultCategories() {
    return VAULT_CATEGORIES;
  }

  // Helper methods
  private calculateNextAutoInvest(frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }

  // Create sample vaults (for development)
  async createSampleVaults(): Promise<void> {
    try {
      const sampleVaults: Omit<InvestmentVault, 'id'>[] = [
        {
          name: 'Ghana Growth Fund',
          description: 'Diversified portfolio focused on Ghanaian growth stocks',
          category: 'moderate',
          riskLevel: 3,
          expectedReturn: { min: 8, max: 15, target: 12 },
          minimumInvestment: 100,
          maximumInvestment: 100000,
          managementFee: 1.5,
          performanceFee: 10,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          totalInvestors: 1250,
          totalAssets: 2500000,
          performance: {
            daily: 0.2,
            weekly: 1.5,
            monthly: 6.2,
            quarterly: 18.5,
            yearly: 12.3,
            allTime: 45.7,
          },
          holdings: [
            {
              id: '1',
              vaultId: 'vault1',
              stockSymbol: 'MTN',
              stockName: 'MTN Ghana',
              weight: 25,
              shares: 1000,
              averagePrice: 0.85,
              currentPrice: 0.92,
              marketValue: 920,
              gainLoss: 70,
              gainLossPercentage: 8.2,
              lastUpdated: new Date(),
            },
            {
              id: '2',
              vaultId: 'vault1',
              stockSymbol: 'GCB',
              stockName: 'GCB Bank',
              weight: 20,
              shares: 500,
              averagePrice: 4.20,
              currentPrice: 4.50,
              marketValue: 2250,
              gainLoss: 150,
              gainLossPercentage: 7.1,
              lastUpdated: new Date(),
            },
          ],
          strategy: 'Focus on established Ghanaian companies with strong fundamentals and growth potential',
          manager: {
            name: 'Kwame Asante',
            experience: '15 years in Ghanaian markets',
            credentials: ['CFA', 'MBA Finance'],
          },
          tags: ['Ghana', 'Growth', 'Diversified', 'Blue Chip'],
          isFeatured: true,
          isNew: false,
        },
        {
          name: 'Tech Innovation Vault',
          description: 'High-growth technology and innovation companies',
          category: 'aggressive',
          riskLevel: 5,
          expectedReturn: { min: 15, max: 30, target: 22 },
          minimumInvestment: 200,
          maximumInvestment: 50000,
          managementFee: 2.0,
          performanceFee: 15,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          totalInvestors: 450,
          totalAssets: 800000,
          performance: {
            daily: 0.8,
            weekly: 3.2,
            monthly: 12.5,
            quarterly: 28.7,
            yearly: 18.9,
            allTime: 67.3,
          },
          holdings: [],
          strategy: 'Invest in innovative technology companies with disruptive potential',
          manager: {
            name: 'Ama Serwaa',
            experience: '12 years in tech investing',
            credentials: ['MBA Technology', 'Certified Tech Analyst'],
          },
          tags: ['Technology', 'Innovation', 'High Growth', 'Disruptive'],
          isFeatured: true,
          isNew: true,
        },
      ];

      for (const vault of sampleVaults) {
        await addDoc(collection(db, 'investmentVaults'), {
          ...vault,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error creating sample vaults:', error);
      throw error;
    }
  }
}