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
  Dimensions,
} from 'react-native';
import { InvestmentVaultService } from '../services/investmentVaultService';
import { InvestmentVault, UserVaultInvestment, VAULT_CATEGORIES } from '../types/savings';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

const { width: screenWidth } = Dimensions.get('window');

export const InvestmentVaultsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explore' | 'my_vaults' | 'performance'>('explore');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [vaults, setVaults] = useState<InvestmentVault[]>([]);
  const [myInvestments, setMyInvestments] = useState<UserVaultInvestment[]>([]);
  const [featuredVaults, setFeaturedVaults] = useState<InvestmentVault[]>([]);
  const [newVaults, setNewVaults] = useState<InvestmentVault[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedVault, setSelectedVault] = useState<InvestmentVault | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');

  const vaultService = InvestmentVaultService.getInstance();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadVaultsByCategory();
    } else {
      loadAllVaults();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (activeTab === 'my_vaults') {
      loadMyInvestments();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [allVaults, featured, newVaultsData] = await Promise.all([
        vaultService.getAvailableVaults(),
        vaultService.getFeaturedVaults(),
        vaultService.getNewVaults(),
      ]);
      
      setVaults(allVaults);
      setFeaturedVaults(featured);
      setNewVaults(newVaultsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllVaults = async () => {
    try {
      const allVaults = await vaultService.getAvailableVaults();
      setVaults(allVaults);
    } catch (error) {
      console.error('Error loading all vaults:', error);
    }
  };

  const loadVaultsByCategory = async () => {
    try {
      const categoryVaults = await vaultService.getVaultsByCategory(selectedCategory);
      setVaults(categoryVaults);
    } catch (error) {
      console.error('Error loading vaults by category:', error);
    }
  };

  const loadMyInvestments = async () => {
    try {
      const userId = 'current_user_id';
      const investments = await vaultService.getUserVaultInvestments(userId);
      setMyInvestments(investments);
    } catch (error) {
      console.error('Error loading my investments:', error);
    }
  };

  const handleInvest = async () => {
    if (!selectedVault || !investmentAmount) {
      Alert.alert('Error', 'Please enter an investment amount');
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (amount < selectedVault.minimumInvestment) {
      Alert.alert('Error', `Minimum investment is ₵${selectedVault.minimumInvestment}`);
      return;
    }

    if (amount > selectedVault.maximumInvestment) {
      Alert.alert('Error', `Maximum investment is ₵${selectedVault.maximumInvestment}`);
      return;
    }

    setLoading(true);
    try {
      const userId = 'current_user_id';
      const investmentId = await vaultService.investInVault(userId, selectedVault.id, amount);
      
      Alert.alert(
        'Success',
        `Successfully invested ₵${amount.toFixed(2)} in ${selectedVault.name}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowInvestModal(false);
              setInvestmentAmount('');
              setSelectedVault(null);
              loadMyInvestments();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error investing in vault:', error);
      Alert.alert('Error', 'Failed to invest in vault. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAllVaults();
      return;
    }

    try {
      const searchResults = await vaultService.searchVaults(searchQuery);
      setVaults(searchResults);
    } catch (error) {
      console.error('Error searching vaults:', error);
    }
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'explore', label: 'Explore', icon: '🔍' },
        { id: 'my_vaults', label: 'My Vaults', icon: '💼' },
        { id: 'performance', label: 'Performance', icon: '📊' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab(tab.id as any)}
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

  const renderCategorySelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          !selectedCategory && styles.categoryButtonActive
        ]}
        onPress={() => setSelectedCategory('')}
      >
        <Text style={[
          styles.categoryText,
          !selectedCategory && styles.categoryTextActive
        ]}>
          All
        </Text>
      </TouchableOpacity>
      
      {VAULT_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.categoryTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search vaults..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>🔍</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVaultCard = (vault: InvestmentVault) => (
    <TouchableOpacity
      key={vault.id}
      style={styles.vaultCard}
      onPress={() => {
        setSelectedVault(vault);
        setShowInvestModal(true);
      }}
    >
      <View style={styles.vaultHeader}>
        <View style={styles.vaultInfo}>
          <Text style={styles.vaultName}>{vault.name}</Text>
          <Text style={styles.vaultCategory}>{vault.category.toUpperCase()}</Text>
        </View>
        <View style={styles.vaultBadges}>
          {vault.isFeatured && <Text style={styles.badge}>⭐ Featured</Text>}
          {vault.isNew && <Text style={styles.badge}>🆕 New</Text>}
        </View>
      </View>
      
      <Text style={styles.vaultDescription}>{vault.description}</Text>
      
      <View style={styles.vaultStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{vault.expectedReturn.target}%</Text>
          <Text style={styles.statLabel}>Expected Return</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{vault.riskLevel}/5</Text>
          <Text style={styles.statLabel}>Risk Level</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₵{vault.minimumInvestment}</Text>
          <Text style={styles.statLabel}>Min Investment</Text>
        </View>
      </View>
      
      <View style={styles.vaultPerformance}>
        <Text style={styles.performanceGridLabel}>Performance</Text>
        <View style={styles.performanceRow}>
          <Text style={styles.performanceItem}>1M: {vault.performance.monthly > 0 ? '+' : ''}{vault.performance.monthly.toFixed(1)}%</Text>
          <Text style={styles.performanceItem}>1Y: {vault.performance.yearly > 0 ? '+' : ''}{vault.performance.yearly.toFixed(1)}%</Text>
        </View>
      </View>
      
      <View style={styles.vaultFooter}>
        <Text style={styles.vaultInvestors}>{vault.totalInvestors} investors</Text>
          <Text style={styles.investButtonTextLink}>Invest Now →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderExploreTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Featured Vaults */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Vaults</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredVaults.map((vault) => (
            <View key={vault.id} style={styles.featuredVaultCard}>
              {renderVaultCard(vault)}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* New Vaults */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New Vaults</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {newVaults.map((vault) => (
            <View key={vault.id} style={styles.featuredVaultCard}>
              {renderVaultCard(vault)}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* All Vaults */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Vaults</Text>
        {vaults.map((vault) => renderVaultCard(vault))}
      </View>
    </ScrollView>
  );

  const renderMyVaultsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Investments</Text>
        
        {myInvestments.map((investment) => (
          <View key={investment.id} style={styles.investmentCard}>
            <View style={styles.investmentHeader}>
              <Text style={styles.investmentVaultName}>Vault Name</Text>
              <Text style={[
                styles.investmentGain,
                { color: investment.gainLoss >= 0 ? colors.success : colors.error }
              ]}>
                {investment.gainLoss >= 0 ? '+' : ''}₵{investment.gainLoss.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.investmentDetails}>
              <Text style={styles.investmentAmount}>₵{investment.currentValue.toFixed(2)}</Text>
              <Text style={styles.investmentShares}>{investment.shares.toFixed(4)} shares</Text>
            </View>
            
            <View style={styles.investmentFooter}>
              <Text style={styles.investmentGainPercent}>
                {investment.gainLossPercentage >= 0 ? '+' : ''}{investment.gainLossPercentage.toFixed(2)}%
              </Text>
              <Text style={styles.investmentStatus}>{investment.status.toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderPerformanceTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        
        <View style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>Total Portfolio Value</Text>
          <Text style={styles.performanceAmount}>
            ₵{myInvestments.reduce((sum, inv) => sum + inv.currentValue, 0).toFixed(2)}
          </Text>
          <Text style={styles.performanceChange}>
            {myInvestments.reduce((sum, inv) => sum + inv.gainLoss, 0) >= 0 ? '+' : ''}
            ₵{myInvestments.reduce((sum, inv) => sum + inv.gainLoss, 0).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.performanceGrid}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>
              {myInvestments.length}
            </Text>
            <Text style={styles.performanceGridLabel}>Active Vaults</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>
              ₵{myInvestments.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
            </Text>
            <Text style={styles.performanceGridLabel}>Total Invested</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderInvestModal = () => (
    <Modal
      visible={showInvestModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowInvestModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowInvestModal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Invest in Vault</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {selectedVault && (
            <>
              <View style={styles.vaultSummary}>
                <Text style={styles.vaultSummaryName}>{selectedVault.name}</Text>
                <Text style={styles.vaultSummaryDescription}>{selectedVault.description}</Text>
                
                <View style={styles.vaultSummaryStats}>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryStatValue}>{selectedVault.expectedReturn.target}%</Text>
                    <Text style={styles.summaryStatLabel}>Expected Return</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryStatValue}>{selectedVault.riskLevel}/5</Text>
                    <Text style={styles.summaryStatLabel}>Risk Level</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Investment Amount (₵)</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="1000"
                  value={investmentAmount}
                  onChangeText={setInvestmentAmount}
                  keyboardType="numeric"
                />
                <Text style={styles.inputHint}>
                  Minimum: ₵{selectedVault.minimumInvestment} | Maximum: ₵{selectedVault.maximumInvestment}
                </Text>
              </View>
              
              <View style={styles.feeBreakdown}>
                <Text style={styles.feeTitle}>Fee Breakdown</Text>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Management Fee</Text>
                  <Text style={styles.feeValue}>{selectedVault.managementFee}% p.a.</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Performance Fee</Text>
                  <Text style={styles.feeValue}>{selectedVault.performanceFee}%</Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.investButton, (!investmentAmount || loading) && styles.investButtonDisabled]}
                onPress={handleInvest}
                disabled={!investmentAmount || loading}
              >
                <Text style={styles.investButtonText}>
                  {loading ? 'Processing...' : 'Invest Now'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading && activeTab === 'explore') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading vaults...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Investment Vaults</Text>
        <Text style={styles.subtitle}>Diversified investment portfolios managed by experts</Text>
      </View>

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Category Selector */}
      {renderCategorySelector()}

      {/* Tab Selector */}
      {renderTabSelector()}

      {/* Content */}
      {activeTab === 'explore' && renderExploreTab()}
      {activeTab === 'my_vaults' && renderMyVaultsTab()}
      {activeTab === 'performance' && renderPerformanceTab()}

      {/* Invest Modal */}
      {renderInvestModal()}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    color: colors.textWhite,
  },
  categoryContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.textWhite,
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
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  vaultCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  featuredVaultCard: {
    width: screenWidth * 0.8,
    marginRight: spacing.md,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  vaultInfo: {
    flex: 1,
  },
  vaultName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  vaultCategory: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  vaultBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  vaultDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  vaultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  vaultPerformance: {
    marginBottom: spacing.md,
  },
  // Note: renamed to performanceGridLabel below to avoid duplicate key
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    alignItems: 'center',
  },
  vaultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaultInvestors: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  investButtonTextLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  investmentCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  investmentVaultName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  investmentGain: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  investmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  investmentAmount: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  investmentShares: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  investmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  investmentGainPercent: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  investmentStatus: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  performanceCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  performanceTitle: {
    ...typography.body,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  performanceAmount: {
    ...typography.h2,
    color: colors.textWhite,
    fontWeight: '700',
  },
  performanceChange: {
    ...typography.body,
    color: colors.textWhite,
    marginTop: spacing.xs,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceValue: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  performanceGridLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  vaultSummary: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  vaultSummaryName: {
    ...typography.h5,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  vaultSummaryDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  vaultSummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  summaryStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  amountInput: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  inputHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  feeBreakdown: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  feeTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  feeLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  feeValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  investButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  investButtonDisabled: {
    backgroundColor: colors.border,
  },
  investButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontSize: 18,
  },
});