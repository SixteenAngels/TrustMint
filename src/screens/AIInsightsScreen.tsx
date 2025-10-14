import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { AIService } from '../services/aiService';
import { LanguageService } from '../services/languageService';
import { AIInsight, AIPrediction, AIRecommendation } from '../types/ai';
import { Stock } from '../types';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const AIInsightsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'recommendations' | 'portfolio'>('insights');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const aiService = AIService.getInstance();
  const languageService = LanguageService.getInstance();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'insights') {
      loadInsights();
    } else if (activeTab === 'predictions') {
      loadPredictions();
    } else if (activeTab === 'recommendations') {
      loadRecommendations();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadInsights(),
        loadPredictions(),
        loadRecommendations(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      // Mock stock data for insights
      const mockStock: Stock = {
        id: 'mtn-ghana-mock-id',
        symbol: 'MTN',
        name: 'MTN Ghana',
        price: 1.20,
        change: 0.05,
        changePercent: 4.35,
        volume: 1250000,
        updatedAt: new Date(),
      };

      const stockInsights = await aiService.generateStockInsights('MTN', mockStock);
      setInsights(stockInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const loadPredictions = async () => {
    try {
      const stockPredictions = await aiService.generatePredictions('MTN', 'all');
      setPredictions(stockPredictions);
    } catch (error) {
      console.error('Error loading predictions:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      // Mock user ID
      const userId = 'current_user_id';
      const userRecommendations = await aiService.generateRecommendations(userId);
      setRecommendations(userRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleInsightAction = (insight: AIInsight, action: 'buy' | 'sell' | 'hold') => {
    Alert.alert(
      'AI Insight Action',
      `You chose to ${action} ${insight.symbol} based on AI analysis. This is a simulated action.`,
      [{ text: 'OK' }]
    );
  };

  const handlePredictionAction = (prediction: AIPrediction) => {
    Alert.alert(
      'AI Prediction',
      `AI predicts ${prediction.symbol} will go ${prediction.prediction.direction} to ₵${prediction.prediction.price.toFixed(2)} with ${prediction.prediction.confidence}% confidence.`,
      [{ text: 'OK' }]
    );
  };

  const handleRecommendationAction = (recommendation: AIRecommendation) => {
    Alert.alert(
      'AI Recommendation',
      recommendation.description,
      [
        { text: 'View Details', onPress: () => console.log('View details') },
        { text: 'Dismiss', style: 'cancel' }
      ]
    );
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'insights', label: 'Insights', icon: '🧠' },
        { id: 'predictions', label: 'Predictions', icon: '🔮' },
        { id: 'recommendations', label: 'Recommendations', icon: '💡' },
        { id: 'portfolio', label: 'Portfolio', icon: '📊' },
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

  const renderInsights = () => (
    <ScrollView 
      style={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {insights.map((insight) => (
        <View key={insight.id} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightTitleContainer}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightSymbol}>{insight.symbol}</Text>
            </View>
            <View style={[
              styles.confidenceBadge,
              { backgroundColor: getConfidenceColor(insight.confidence) }
            ]}>
              <Text style={styles.confidenceText}>{insight.confidence}%</Text>
            </View>
          </View>
          
          <Text style={styles.insightDescription}>{insight.description}</Text>
          
          <View style={styles.dataPointsContainer}>
            {insight.dataPoints.map((dataPoint, index) => (
              <View key={index} style={styles.dataPoint}>
                <Text style={styles.dataPointName}>{dataPoint.name}</Text>
                <Text style={styles.dataPointValue}>
                  {dataPoint.value.toFixed(2)}
                  {dataPoint.change !== 0 && (
                    <Text style={[
                      styles.dataPointChange,
                      { color: dataPoint.change > 0 ? colors.success : colors.error }
                    ]}>
                      {dataPoint.change > 0 ? '+' : ''}{dataPoint.change.toFixed(2)}
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.reasoningContainer}>
            <Text style={styles.reasoningTitle}>AI Reasoning:</Text>
            {insight.reasoning.map((reason, index) => (
              <Text key={index} style={styles.reasoningItem}>• {reason}</Text>
            ))}
          </View>
          
          <View style={styles.insightActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.buyButton]}
              onPress={() => handleInsightAction(insight, 'buy')}
            >
              <Text style={styles.actionButtonText}>Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.sellButton]}
              onPress={() => handleInsightAction(insight, 'sell')}
            >
              <Text style={styles.actionButtonText}>Sell</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.holdButton]}
              onPress={() => handleInsightAction(insight, 'hold')}
            >
              <Text style={styles.actionButtonText}>Hold</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.insightFooter}>
            <Text style={styles.insightSource}>Source: {insight.source}</Text>
            <Text style={styles.insightTimeframe}>Timeframe: {insight.timeframe}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderPredictions = () => (
    <ScrollView 
      style={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {predictions.map((prediction) => (
        <View key={prediction.id} style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <Text style={styles.predictionTitle}>{prediction.symbol} Prediction</Text>
            <Text style={styles.predictionTimeframe}>{prediction.timeframe}</Text>
          </View>
          
          <View style={styles.predictionContent}>
            <View style={styles.predictionPrice}>
              <Text style={styles.predictionPriceLabel}>Predicted Price</Text>
              <Text style={styles.predictionPriceValue}>
                ₵{prediction.prediction.price.toFixed(2)}
              </Text>
              <Text style={[
                styles.predictionDirection,
                { color: prediction.prediction.direction === 'up' ? colors.success : colors.error }
              ]}>
                {prediction.prediction.direction === 'up' ? '↗' : '↘'} {prediction.prediction.direction.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.predictionConfidence}>
              <Text style={styles.predictionConfidenceLabel}>Confidence</Text>
              <Text style={styles.predictionConfidenceValue}>
                {prediction.prediction.confidence}%
              </Text>
            </View>
          </View>
          
          <View style={styles.factorsContainer}>
            <Text style={styles.factorsTitle}>Key Factors:</Text>
            {prediction.factors.map((factor, index) => (
              <View key={index} style={styles.factorItem}>
                <Text style={styles.factorName}>{factor.name}</Text>
                <Text style={styles.factorDescription}>{factor.description}</Text>
                <Text style={styles.factorWeight}>Weight: {factor.weight}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.predictionActionButton}
            onPress={() => handlePredictionAction(prediction)}
          >
            <Text style={styles.predictionActionText}>View Full Analysis</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderRecommendations = () => (
    <ScrollView 
      style={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {recommendations.map((recommendation) => (
        <View key={recommendation.id} style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(recommendation.priority) }
            ]}>
              <Text style={styles.priorityText}>{recommendation.priority.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
          
          <View style={styles.recommendationDetails}>
            <View style={styles.recommendationDetail}>
              <Text style={styles.recommendationDetailLabel}>Category</Text>
              <Text style={styles.recommendationDetailValue}>{recommendation.category}</Text>
            </View>
            <View style={styles.recommendationDetail}>
              <Text style={styles.recommendationDetailLabel}>Impact</Text>
              <Text style={styles.recommendationDetailValue}>{recommendation.estimatedImpact}/10</Text>
            </View>
            <View style={styles.recommendationDetail}>
              <Text style={styles.recommendationDetailLabel}>Time to Implement</Text>
              <Text style={styles.recommendationDetailValue}>{recommendation.timeToImplement}</Text>
            </View>
          </View>
          
          <View style={styles.actionItemsContainer}>
            <Text style={styles.actionItemsTitle}>Action Items:</Text>
            {recommendation.actionItems.map((item, index) => (
              <Text key={index} style={styles.actionItem}>• {item}</Text>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.recommendationActionButton}
            onPress={() => handleRecommendationAction(recommendation)}
          >
            <Text style={styles.recommendationActionText}>View Details</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderPortfolio = () => (
    <View style={styles.portfolioContainer}>
      <Text style={styles.comingSoonText}>Portfolio AI Analysis coming soon!</Text>
    </View>
  );

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return colors.success;
    if (confidence >= 60) return colors.warning;
    return colors.error;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading AI insights...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AI Insights</Text>
        <Text style={styles.subtitle}>Powered by artificial intelligence</Text>
      </View>

      {/* Tab Selector */}
      {renderTabSelector()}

      {/* Content */}
      {activeTab === 'insights' && renderInsights()}
      {activeTab === 'predictions' && renderPredictions()}
      {activeTab === 'recommendations' && renderRecommendations()}
      {activeTab === 'portfolio' && renderPortfolio()}
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
  insightCard: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  insightSymbol: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  insightDescription: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  dataPointsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  dataPoint: {
    width: '50%',
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
  },
  dataPointName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dataPointValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dataPointChange: {
    ...typography.caption,
    marginLeft: spacing.xs,
  },
  reasoningContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  reasoningTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  reasoningItem: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  insightActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: colors.success,
  },
  sellButton: {
    backgroundColor: colors.error,
  },
  holdButton: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  insightSource: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  insightTimeframe: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  predictionCard: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  predictionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  predictionTimeframe: {
    ...typography.body,
    color: colors.textSecondary,
  },
  predictionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  predictionPrice: {
    flex: 1,
    alignItems: 'center',
  },
  predictionPriceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  predictionPriceValue: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  predictionDirection: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  predictionConfidence: {
    flex: 1,
    alignItems: 'center',
  },
  predictionConfidenceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  predictionConfidenceValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  factorsContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  factorsTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  factorItem: {
    marginBottom: spacing.sm,
  },
  factorName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  factorDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  factorWeight: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  predictionActionButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  predictionActionText: {
    ...typography.bodyMedium,
    color: colors.textWhite,
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recommendationTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  priorityText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  recommendationDescription: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  recommendationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  recommendationDetail: {
    flex: 1,
    alignItems: 'center',
  },
  recommendationDetailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  recommendationDetailValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionItemsContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  actionItemsTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  actionItem: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  recommendationActionButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  recommendationActionText: {
    ...typography.bodyMedium,
    color: colors.textWhite,
    fontWeight: '600',
  },
  portfolioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    ...typography.h4,
    color: colors.textSecondary,
  },
});
