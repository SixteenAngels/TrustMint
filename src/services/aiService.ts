import {
  AIInsight,
  AIPrediction,
  AIPortfolioAnalysis,
  AINewsAnalysis,
  AISentimentAnalysis,
  AIRecommendation,
  DataPoint,
  PredictionFactor,
  SectorAnalysis,
  PortfolioRecommendation,
  SentimentTrend,
  AIConfig
} from '../types/ai';
import { Stock } from '../types';
import { ChartService } from './chartService';
import { SocialService } from './socialService';

const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  '';
const OPENAI_MODEL = 'gpt-4o-mini';

export class AIService {
  private static instance: AIService;
  private config: AIConfig;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async callOpenAI(prompt: string, opts?: { model?: string; maxTokens?: number }): Promise<string | null> {
    if (!OPENAI_API_KEY) {
      return null;
    }
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: opts?.model || OPENAI_MODEL,
          temperature: 0.4,
          max_tokens: opts?.maxTokens ?? 400,
          messages: [
            {
              role: 'system',
              content:
                'You are Mint Trade AI, a Ghana-focused investment analyst. Be concise, professional, and mention risk levels.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('OpenAI response error:', errorBody);
        return null;
      }

      const json = await response.json();
      return json.choices?.[0]?.message?.content?.trim() ?? null;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  private buildInsightPrompt(symbol: string, stock: Stock, heuristics: AIInsight[]): string {
    return [
      `Provide a 3-4 bullet investment summary for ${symbol}.`,
      `Current price: ${stock.price.toFixed(2)}.`,
      `24h change: ${(stock.changePercent ?? 0).toFixed(2)}%.`,
      'Use the analysis below as context:',
      JSON.stringify(
        heuristics.map((insight) => ({
          title: insight.title,
          reasoning: insight.reasoning,
          confidence: insight.confidence,
        })),
      ),
      'Mention risk level and suggested action.',
    ].join('\n');
  }

  constructor() {
    this.config = {
      enabled: true,
      models: {
        insights: 'gpt-4',
        predictions: 'gpt-4',
        sentiment: 'gpt-3.5-turbo',
        news: 'gpt-3.5-turbo',
      },
      thresholds: {
        confidence: 70,
        risk: 60,
        impact: 50,
      },
      updateFrequency: {
        insights: 15,
        predictions: 60,
        sentiment: 30,
        news: 10,
      },
    };
  }

  // Generate AI Insights for a stock
  async generateStockInsights(symbol: string, stock: Stock): Promise<AIInsight[]> {
    try {
      const insights: AIInsight[] = [];
      
      // Technical Analysis Insight
      const technicalInsight = await this.generateTechnicalInsight(symbol, stock);
      if (technicalInsight) insights.push(technicalInsight);

      // Fundamental Analysis Insight
      const fundamentalInsight = await this.generateFundamentalInsight(symbol, stock);
      if (fundamentalInsight) insights.push(fundamentalInsight);

      // Sentiment Analysis Insight
      const sentimentInsight = await this.generateSentimentInsight(symbol, stock);
      if (sentimentInsight) insights.push(sentimentInsight);

      // News Analysis Insight
      const newsInsight = await this.generateNewsInsight(symbol, stock);
      if (newsInsight) insights.push(newsInsight);

      const filteredInsights = insights.filter(insight => insight.confidence >= this.config.thresholds.confidence);

      if (filteredInsights.length && OPENAI_API_KEY) {
        const llmSummary = await this.callOpenAI(
          this.buildInsightPrompt(symbol, stock, filteredInsights),
          { model: this.config.models.insights, maxTokens: 300 },
        );

        if (llmSummary) {
          filteredInsights.push({
            id: `ai_llm_${symbol}_${Date.now()}`,
            type: 'analysis',
            symbol,
            title: 'AI Analyst Summary',
            description: llmSummary,
            confidence: 80,
            reasoning: ['LLM-generated contextual summary'],
            dataPoints: [],
            timeframe: 'short',
            riskLevel: 'medium',
            createdAt: new Date(),
            isActive: true,
            tags: ['ai', 'summary'],
            source: 'news',
          });
        }
      }

      return filteredInsights;
    } catch (error) {
      console.error('Error generating stock insights:', error);
      return [];
    }
  }

  // Generate Technical Analysis Insight
  private async generateTechnicalInsight(symbol: string, stock: Stock): Promise<AIInsight | null> {
    try {
      const chartService = ChartService.getInstance();
      
      // TODO: Fetch real historical data for analysis
      // This should get actual historical price data for the symbol
      const chartData = await chartService.fetchHistoricalData(symbol, '1M');
      const victoryData = chartService.convertToVictoryData(chartData);
      
      // Calculate technical indicators
      const rsi: { data: { x: any; y: any; }[]; } = chartService.calculateRSI(victoryData, 14);
      const macd: { macdLine: { x: any; y: any; }[]; signalLine: { x: any; y: any; }[]; } = chartService.calculateMACD(victoryData, 12, 26, 9);
      const sma20 = chartService.calculateSMA(victoryData, 20);
      const sma50 = chartService.calculateSMA(victoryData, 50);

      const currentPrice = stock.price;
      const currentRSI = rsi.data[rsi.data.length - 1]?.y || 50;
      const currentMACD = macd.macdLine[macd.macdLine.length - 1]?.y || 0;
      const currentSignal = macd.signalLine[macd.signalLine.length - 1]?.y || 0;
      const sma20Value = sma20[sma20.length - 1]?.y || currentPrice;
      const sma50Value = sma50[sma50.length - 1]?.y || currentPrice;

      let insightType: 'buy' | 'sell' | 'hold' = 'hold';
      let confidence = 50;
      let reasoning: string[] = [];
      let dataPoints: DataPoint[] = [];

      // RSI Analysis
      if (currentRSI < 30) {
        insightType = 'buy';
        confidence += 20;
        reasoning.push('RSI indicates oversold conditions');
        dataPoints.push({
          name: 'RSI',
          value: currentRSI,
          change: 0,
          significance: 'high',
          description: 'Oversold - potential buying opportunity',
        });
      } else if (currentRSI > 70) {
        insightType = 'sell';
        confidence += 20;
        reasoning.push('RSI indicates overbought conditions');
        dataPoints.push({
          name: 'RSI',
          value: currentRSI,
          change: 0,
          significance: 'high',
          description: 'Overbought - potential selling opportunity',
        });
      }

      // MACD Analysis
      if (currentMACD > currentSignal) {
        confidence += 15;
        reasoning.push('MACD bullish crossover detected');
        dataPoints.push({
          name: 'MACD',
          value: currentMACD,
          change: currentMACD - currentSignal,
          significance: 'medium',
          description: 'Bullish momentum building',
        });
      } else {
        confidence -= 10;
        reasoning.push('MACD bearish signal');
        dataPoints.push({
          name: 'MACD',
          value: currentMACD,
          change: currentMACD - currentSignal,
          significance: 'medium',
          description: 'Bearish momentum building',
        });
      }

      // Moving Average Analysis
      if (currentPrice > sma20Value && sma20Value > sma50Value) {
        confidence += 10;
        reasoning.push('Price above moving averages - bullish trend');
        dataPoints.push({
          name: 'SMA 20',
          value: sma20Value,
          change: 0,
          significance: 'medium',
          description: 'Price above 20-day average',
        });
      } else if (currentPrice < sma20Value && sma20Value < sma50Value) {
        confidence -= 10;
        reasoning.push('Price below moving averages - bearish trend');
      }

      // Price Change Analysis
      if (stock.changePercent > 5) {
        confidence += 10;
        reasoning.push('Strong positive momentum');
        dataPoints.push({
          name: 'Price Change',
          value: stock.changePercent,
          change: stock.changePercent,
          significance: 'high',
          description: 'Strong upward movement',
        });
      } else if (stock.changePercent < -5) {
        confidence -= 10;
        reasoning.push('Strong negative momentum');
        dataPoints.push({
          name: 'Price Change',
          value: stock.changePercent,
          change: stock.changePercent,
          significance: 'high',
          description: 'Strong downward movement',
        });
      }

      if (confidence < this.config.thresholds.confidence) {
        return null;
      }

      return {
        id: `tech_${symbol}_${Date.now()}`,
        type: insightType,
        symbol,
        title: `Technical Analysis: ${insightType.toUpperCase()} Signal`,
        description: `Based on technical indicators, ${symbol} shows ${insightType} signals with ${confidence}% confidence.`,
        confidence,
        reasoning,
        dataPoints,
        timeframe: 'short',
        riskLevel: confidence > 80 ? 'low' : confidence > 60 ? 'medium' : 'high',
        targetPrice: insightType === 'buy' ? currentPrice * 1.1 : insightType === 'sell' ? currentPrice * 0.9 : undefined,
        stopLoss: insightType === 'buy' ? currentPrice * 0.95 : insightType === 'sell' ? currentPrice * 1.05 : undefined,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true,
        tags: ['technical', 'analysis', symbol.toLowerCase()],
        source: 'technical',
      };
    } catch (error) {
      console.error('Error generating technical insight:', error);
      return null;
    }
  }

  // Generate Fundamental Analysis Insight
  private async generateFundamentalInsight(symbol: string, stock: Stock): Promise<AIInsight | null> {
    try {
      let confidence = 50;
      let reasoning: string[] = [];
      let dataPoints: DataPoint[] = [];

      // P/E Ratio Analysis
      if (stock.pe && stock.pe > 0) {
        if (stock.pe < 15) {
          confidence += 15;
          reasoning.push('Low P/E ratio indicates undervaluation');
          dataPoints.push({
            name: 'P/E Ratio',
            value: stock.pe,
            change: 0,
            significance: 'high',
            description: 'Undervalued based on P/E',
          });
        } else if (stock.pe > 25) {
          confidence -= 10;
          reasoning.push('High P/E ratio indicates overvaluation');
          dataPoints.push({
            name: 'P/E Ratio',
            value: stock.pe,
            change: 0,
            significance: 'high',
            description: 'Overvalued based on P/E',
          });
        }
      }

      // Dividend Analysis
      if (stock.dividend && stock.dividend > 0) {
        const dividendYield = (stock.dividend / stock.price) * 100;
        if (dividendYield > 4) {
          confidence += 10;
          reasoning.push('Attractive dividend yield');
          dataPoints.push({
            name: 'Dividend Yield',
            value: dividendYield,
            change: 0,
            significance: 'medium',
            description: 'High dividend yield',
          });
        }
      }

      // Market Cap Analysis
      if (stock.marketCap && stock.marketCap > 0) {
        if (stock.marketCap > 1000000000) { // > 1B
          confidence += 5;
          reasoning.push('Large cap stock - more stable');
          dataPoints.push({
            name: 'Market Cap',
            value: stock.marketCap / 1000000,
            change: 0,
            significance: 'low',
            description: 'Large cap company',
          });
        }
      }

      // Volume Analysis
      if (stock.volume && stock.volume > 0) {
        // TODO: Calculate real average volume from historical data
        const avgVolume = 1000000; // Placeholder - should be calculated from historical data
        if (stock.volume > avgVolume * 1.5) {
          confidence += 10;
          reasoning.push('High trading volume - increased interest');
          dataPoints.push({
            name: 'Volume',
            value: stock.volume,
            change: ((stock.volume - avgVolume) / avgVolume) * 100,
            significance: 'medium',
            description: 'Above average trading volume',
          });
        }
      }

      if (confidence < this.config.thresholds.confidence) {
        return null;
      }

      const insightType: 'buy' | 'sell' | 'hold' = confidence > 60 ? 'buy' : confidence < 40 ? 'sell' : 'hold';

      return {
        id: `fund_${symbol}_${Date.now()}`,
        type: insightType,
        symbol,
        title: `Fundamental Analysis: ${insightType.toUpperCase()} Recommendation`,
        description: `Based on fundamental metrics, ${symbol} shows ${insightType} potential with ${confidence}% confidence.`,
        confidence,
        reasoning,
        dataPoints,
        timeframe: 'long',
        riskLevel: 'low',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
        tags: ['fundamental', 'analysis', symbol.toLowerCase()],
        source: 'fundamental',
      };
    } catch (error) {
      console.error('Error generating fundamental insight:', error);
      return null;
    }
  }

  // Generate Sentiment Analysis Insight
  private async generateSentimentInsight(symbol: string, stock: Stock): Promise<AIInsight | null> {
    try {
      // TODO: Implement real sentiment analysis using news API or social media data
      // This should analyze actual news articles, social media posts, etc.
      const sentimentScore = Math.random() * 100 - 50; // Placeholder - should be real sentiment analysis
      const confidence = Math.random() * 30 + 70; // Placeholder - should be calculated from data quality

      let insightType: 'buy' | 'sell' | 'hold' = 'hold';
      let reasoning: string[] = [];
      let dataPoints: DataPoint[] = [];

      if (sentimentScore > 20) {
        insightType = 'buy';
        reasoning.push('Positive market sentiment');
        dataPoints.push({
          name: 'Sentiment Score',
          value: sentimentScore,
          change: 0,
          significance: 'high',
          description: 'Bullish market sentiment',
        });
      } else if (sentimentScore < -20) {
        insightType = 'sell';
        reasoning.push('Negative market sentiment');
        dataPoints.push({
          name: 'Sentiment Score',
          value: sentimentScore,
          change: 0,
          significance: 'high',
          description: 'Bearish market sentiment',
        });
      }

      if (confidence < this.config.thresholds.confidence) {
        return null;
      }

      return {
        id: `sent_${symbol}_${Date.now()}`,
        type: insightType,
        symbol,
        title: `Sentiment Analysis: ${insightType.toUpperCase()} Signal`,
        description: `Market sentiment analysis shows ${insightType} signals for ${symbol} with ${confidence}% confidence.`,
        confidence,
        reasoning,
        dataPoints,
        timeframe: 'short',
        riskLevel: 'medium',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
        isActive: true,
        tags: ['sentiment', 'analysis', symbol.toLowerCase()],
        source: 'sentiment',
      };
    } catch (error) {
      console.error('Error generating sentiment insight:', error);
      return null;
    }
  }

  // Generate News Analysis Insight
  private async generateNewsInsight(symbol: string, stock: Stock): Promise<AIInsight | null> {
    try {
      // TODO: Implement real news analysis using news API
      // This should fetch and analyze actual news articles about the stock
      const newsImpact = Math.random() * 100; // Placeholder - should be calculated from real news
      const confidence = Math.random() * 20 + 80; // Placeholder - should be calculated from data quality

      let insightType: 'buy' | 'sell' | 'hold' = 'hold';
      let reasoning: string[] = [];
      let dataPoints: DataPoint[] = [];

      if (newsImpact > 70) {
        insightType = 'buy';
        reasoning.push('Positive news impact detected');
        dataPoints.push({
          name: 'News Impact',
          value: newsImpact,
          change: 0,
          significance: 'high',
          description: 'Strong positive news sentiment',
        });
      } else if (newsImpact < 30) {
        insightType = 'sell';
        reasoning.push('Negative news impact detected');
        dataPoints.push({
          name: 'News Impact',
          value: newsImpact,
          change: 0,
          significance: 'high',
          description: 'Strong negative news sentiment',
        });
      }

      if (confidence < this.config.thresholds.confidence) {
        return null;
      }

      return {
        id: `news_${symbol}_${Date.now()}`,
        type: insightType,
        symbol,
        title: `News Analysis: ${insightType.toUpperCase()} Signal`,
        description: `Recent news analysis indicates ${insightType} signals for ${symbol} with ${confidence}% confidence.`,
        confidence,
        reasoning,
        dataPoints,
        timeframe: 'short',
        riskLevel: 'medium',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        isActive: true,
        tags: ['news', 'analysis', symbol.toLowerCase()],
        source: 'news',
      };
    } catch (error) {
      console.error('Error generating news insight:', error);
      return null;
    }
  }

  // Generate AI Predictions
  async generatePredictions(symbol: string, timeframe: string): Promise<AIPrediction[]> {
    try {
      const predictions: AIPrediction[] = [];
      
      // Short-term prediction (1-7 days)
      if (timeframe === 'short' || timeframe === 'all') {
        const shortTermPrediction = await this.generateShortTermPrediction(symbol);
        if (shortTermPrediction) predictions.push(shortTermPrediction);
      }

      // Medium-term prediction (1-4 weeks)
      if (timeframe === 'medium' || timeframe === 'all') {
        const mediumTermPrediction = await this.generateMediumTermPrediction(symbol);
        if (mediumTermPrediction) predictions.push(mediumTermPrediction);
      }

      // Long-term prediction (1-12 months)
      if (timeframe === 'long' || timeframe === 'all') {
        const longTermPrediction = await this.generateLongTermPrediction(symbol);
        if (longTermPrediction) predictions.push(longTermPrediction);
      }

      return predictions;
    } catch (error) {
      console.error('Error generating predictions:', error);
      return [];
    }
  }

  private async generateShortTermPrediction(symbol: string): Promise<AIPrediction | null> {
    // TODO: Implement real short-term prediction using ML models
    // This should use actual historical data and ML algorithms
    const currentPrice = 1.20; // Placeholder - should get real current price
    const priceChange = (Math.random() - 0.5) * 0.2; // Placeholder - should be ML prediction
    const predictedPrice = currentPrice + priceChange;
    const confidence = Math.random() * 20 + 70; // Placeholder - should be model confidence

    return {
      id: `pred_short_${symbol}_${Date.now()}`,
      symbol,
      timeframe: '1-7 days',
      prediction: {
        price: predictedPrice,
        confidence,
        direction: priceChange > 0 ? 'up' : 'down',
      },
      factors: [
        {
          name: 'Technical Indicators',
          impact: 'positive',
          weight: 0.4,
          description: 'RSI and MACD show bullish signals',
        },
        {
          name: 'Market Sentiment',
          impact: 'positive',
          weight: 0.3,
          description: 'Positive social media sentiment',
        },
        {
          name: 'Volume Analysis',
          impact: 'neutral',
          weight: 0.3,
          description: 'Average trading volume',
        },
      ],
      createdAt: new Date(),
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  private async generateMediumTermPrediction(symbol: string): Promise<AIPrediction | null> {
    // TODO: Implement real medium-term prediction using ML models
    const currentPrice = 1.20; // Placeholder - should get real current price
    const priceChange = (Math.random() - 0.5) * 0.4; // Placeholder - should be ML prediction
    const predictedPrice = currentPrice + priceChange;
    const confidence = Math.random() * 15 + 60; // Placeholder - should be model confidence

    return {
      id: `pred_medium_${symbol}_${Date.now()}`,
      symbol,
      timeframe: '1-4 weeks',
      prediction: {
        price: predictedPrice,
        confidence,
        direction: priceChange > 0 ? 'up' : 'down',
      },
      factors: [
        {
          name: 'Fundamental Analysis',
          impact: 'positive',
          weight: 0.5,
          description: 'Strong earnings growth expected',
        },
        {
          name: 'Sector Trends',
          impact: 'positive',
          weight: 0.3,
          description: 'Sector showing positive momentum',
        },
        {
          name: 'Economic Factors',
          impact: 'neutral',
          weight: 0.2,
          description: 'Stable economic environment',
        },
      ],
      createdAt: new Date(),
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  private async generateLongTermPrediction(symbol: string): Promise<AIPrediction | null> {
    // TODO: Implement real long-term prediction using ML models
    const currentPrice = 1.20; // Placeholder - should get real current price
    const priceChange = (Math.random() - 0.3) * 0.8; // Placeholder - should be ML prediction
    const predictedPrice = currentPrice + priceChange;
    const confidence = Math.random() * 10 + 50; // Placeholder - should be model confidence

    return {
      id: `pred_long_${symbol}_${Date.now()}`,
      symbol,
      timeframe: '1-12 months',
      prediction: {
        price: predictedPrice,
        confidence,
        direction: priceChange > 0 ? 'up' : 'down',
      },
      factors: [
        {
          name: 'Company Fundamentals',
          impact: 'positive',
          weight: 0.4,
          description: 'Strong business model and growth prospects',
        },
        {
          name: 'Market Position',
          impact: 'positive',
          weight: 0.3,
          description: 'Leading position in growing market',
        },
        {
          name: 'Macroeconomic Trends',
          impact: 'neutral',
          weight: 0.3,
          description: 'Favorable economic conditions',
        },
      ],
      createdAt: new Date(),
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }

  // Generate Portfolio Analysis
  async generatePortfolioAnalysis(userId: string): Promise<AIPortfolioAnalysis | null> {
    try {
      // Get real portfolio data
      const { StockService } = await import('./stockService');
      const stockService = StockService.getInstance();
      const portfolio = await stockService.getPortfolio(userId);
      const allStocks = await stockService.getStocks();

      if (portfolio.length === 0) {
        // Return a basic analysis for empty portfolio
        return {
          userId,
          overallScore: 50,
          riskAssessment: {
            level: 'low',
            score: 50,
            factors: ['No holdings yet - start building your portfolio'],
          },
          diversification: {
            score: 0,
            sectors: [],
            recommendations: ['Start by adding stocks from different sectors'],
          },
          performance: {
            score: 50,
            vsBenchmark: 0,
            trends: ['No performance data available'],
          },
          recommendations: [],
          createdAt: new Date(),
        };
      }

      // Calculate real portfolio metrics
      const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
      const totalGain = portfolio.reduce((sum, item) => sum + item.profitLoss, 0);
      const totalGainPercent = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0;

      // Analyze sectors
      const sectorMap: Record<string, { allocation: number; performance: number; items: PortfolioItem[] }> = {};
      portfolio.forEach((item) => {
        const stock = allStocks.find(s => s.id === item.stockId);
        const sector = stock?.sector || 'Other';
        if (!sectorMap[sector]) {
          sectorMap[sector] = { allocation: 0, performance: 0, items: [] };
        }
        sectorMap[sector].allocation += item.totalValue;
        sectorMap[sector].performance += item.profitLossPercent;
        sectorMap[sector].items.push(item);
      });

      // Calculate sector allocations and performance
      const sectors: SectorAnalysis[] = Object.entries(sectorMap).map(([sector, data]) => {
        const allocation = (data.allocation / totalValue) * 100;
        const avgPerformance = data.items.length > 0 ? data.performance / data.items.length : 0;
        let recommendation: 'overweight' | 'underweight' | 'neutral' = 'neutral';
        let reasoning = 'Balanced allocation';
        
        if (allocation > 40) {
          recommendation = 'overweight';
          reasoning = 'High concentration - consider diversifying';
        } else if (allocation < 10 && avgPerformance > 0) {
          recommendation = 'overweight';
          reasoning = 'Strong performer with low allocation - consider increasing';
        } else if (allocation > 30 && avgPerformance < -5) {
          recommendation = 'underweight';
          reasoning = 'Underperforming sector - consider reducing exposure';
        }

        return {
          sector,
          allocation: Math.round(allocation * 10) / 10,
          performance: Math.round(avgPerformance * 10) / 10,
          recommendation,
          reasoning,
        };
      });

      // Calculate diversification score (higher is better, max 100)
      const numSectors = sectors.length;
      const maxAllocation = Math.max(...sectors.map(s => s.allocation));
      const diversificationScore = Math.min(100, (numSectors * 15) + (maxAllocation < 50 ? 20 : 0));

      // Calculate risk score (lower is better)
      const riskScore = maxAllocation > 50 ? 30 : maxAllocation > 40 ? 50 : 70;
      const riskLevel: 'low' | 'medium' | 'high' = riskScore > 60 ? 'low' : riskScore > 40 ? 'medium' : 'high';

      // Calculate performance score
      const performanceScore = totalGainPercent > 10 ? 90 : totalGainPercent > 5 ? 80 : totalGainPercent > 0 ? 70 : 60;
      const overallScore = (diversificationScore * 0.3) + (riskScore * 0.3) + (performanceScore * 0.4);

      // Generate AI recommendations using OpenAI
      let aiRecommendations: PortfolioRecommendation[] = [];
      if (OPENAI_API_KEY && portfolio.length > 0) {
        const portfolioSummary = portfolio.map(item => {
          const stock = allStocks.find(s => s.id === item.stockId);
          return `${stock?.symbol || 'UNK'}: ${item.quantity} shares @ ₵${item.avgPrice.toFixed(2)} (Current: ₵${item.currentPrice.toFixed(2)}, P/L: ${item.profitLossPercent.toFixed(2)}%)`;
        }).join('\n');

        const sectorSummary = sectors.map(s => `${s.sector}: ${s.allocation.toFixed(1)}% allocation, ${s.performance.toFixed(1)}% performance`).join('\n');

        const aiPrompt = `Analyze this Ghana stock portfolio and provide 3-4 actionable recommendations:
Portfolio Holdings:
${portfolioSummary}

Sector Breakdown:
${sectorSummary}

Total Value: ₵${totalValue.toFixed(2)}
Total Gain/Loss: ₵${totalGain.toFixed(2)} (${totalGainPercent.toFixed(2)}%)

Provide recommendations in JSON format:
[
  {
    "type": "buy" | "sell" | "rebalance",
    "symbol": "STOCK_SYMBOL",
    "action": "specific action",
    "reasoning": "brief reasoning",
    "priority": "high" | "medium" | "low",
    "impact": 0-10
  }
]`;

        const aiResponse = await this.callOpenAI(aiPrompt, { maxTokens: 500 });
        if (aiResponse) {
          try {
            // Try to parse JSON from AI response
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              aiRecommendations = parsed.slice(0, 4).map((rec: any) => ({
                type: rec.type || 'rebalance',
                symbol: rec.symbol || 'PORTFOLIO',
                action: rec.action || 'Review allocation',
                reasoning: rec.reasoning || 'AI recommendation',
                priority: rec.priority || 'medium',
                impact: Math.min(10, Math.max(0, rec.impact || 5)),
              }));
            }
          } catch (e) {
            console.warn('Failed to parse AI recommendations:', e);
          }
        }
      }

      // Fallback recommendations if AI didn't provide any
      if (aiRecommendations.length === 0) {
        // Find best and worst performers
        const sortedByPerformance = [...portfolio].sort((a, b) => b.profitLossPercent - a.profitLossPercent);
        const bestPerformer = sortedByPerformance[0];
        const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];
        const bestStock = allStocks.find(s => s.id === bestPerformer?.stockId);
        const worstStock = allStocks.find(s => s.id === worstPerformer?.stockId);

        if (bestPerformer && bestStock && bestPerformer.profitLossPercent > 5) {
          aiRecommendations.push({
            type: 'buy',
            symbol: bestStock.symbol,
            action: `Consider adding more ${bestStock.symbol} shares`,
            reasoning: `Strong performer with ${bestPerformer.profitLossPercent.toFixed(2)}% gain`,
            priority: 'medium',
            impact: 7,
          });
        }

        if (worstPerformer && worstStock && worstPerformer.profitLossPercent < -5) {
          aiRecommendations.push({
            type: 'sell',
            symbol: worstStock.symbol,
            action: `Consider reducing ${worstStock.symbol} position`,
            reasoning: `Underperforming with ${worstPerformer.profitLossPercent.toFixed(2)}% loss`,
            priority: 'high',
            impact: 6,
          });
        }

        if (maxAllocation > 50) {
          aiRecommendations.push({
            type: 'rebalance',
            symbol: 'PORTFOLIO',
            action: 'Rebalance sector allocation',
            reasoning: `Highest sector allocation is ${maxAllocation.toFixed(1)}% - diversify risk`,
            priority: 'high',
            impact: 8,
          });
        }
      }

      return {
        userId,
        overallScore: Math.round(overallScore),
        riskAssessment: {
          level: riskLevel,
          score: Math.round(riskScore),
          factors: [
            maxAllocation > 50 ? 'High concentration in single sector' : 'Well-diversified',
            numSectors < 3 ? 'Limited sector diversification' : 'Good sector spread',
            totalGainPercent > 0 ? 'Positive performance' : 'Negative performance',
          ],
        },
        diversification: {
          score: Math.round(diversificationScore),
          sectors,
          recommendations: [
            maxAllocation > 50 ? 'Reduce concentration in largest sector' : 'Maintain current diversification',
            numSectors < 3 ? 'Consider adding stocks from other sectors' : 'Good sector coverage',
            ...sectors.filter(s => s.recommendation === 'underweight' && s.performance < -5).map(s => `Reduce ${s.sector} exposure`),
          ],
        },
        performance: {
          score: Math.round(performanceScore),
          vsBenchmark: Math.round(totalGainPercent * 10) / 10,
          trends: [
            totalGainPercent > 5 ? 'Strong outperformance' : totalGainPercent > 0 ? 'Positive returns' : 'Underperformance',
            portfolio.length > 5 ? 'Well-diversified holdings' : 'Focused portfolio',
            maxAllocation < 40 ? 'Balanced allocation' : 'Concentrated positions',
          ],
        },
        recommendations: aiRecommendations,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating portfolio analysis:', error);
      return null;
    }
  }

  // Generate Personalized Recommendations
  async generateRecommendations(userId: string): Promise<AIRecommendation[]> {
    try {
      const recommendations: AIRecommendation[] = [];

      // Stock recommendations
      recommendations.push({
        id: `rec_stock_${Date.now()}`,
        userId,
        type: 'stock',
        title: 'Consider MTN Ghana for Growth',
        description: 'MTN shows strong technical signals and positive fundamentals. Consider adding to your portfolio.',
        priority: 'high',
        category: 'Growth Stocks',
        actionItems: [
          'Research MTN financials',
          'Set price alerts',
          'Consider dollar-cost averaging',
        ],
        resources: [
          'MTN Annual Report',
          'Technical Analysis Guide',
          'Growth Investing Strategies',
        ],
        estimatedImpact: 8.5,
        timeToImplement: '1-2 days',
        isPersonalized: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Portfolio recommendations
      recommendations.push({
        id: `rec_portfolio_${Date.now()}`,
        userId,
        type: 'portfolio',
        title: 'Rebalance Your Portfolio',
        description: 'Your current allocation is overweight in volatile sectors. Consider rebalancing for better risk management.',
        priority: 'medium',
        category: 'Portfolio Management',
        actionItems: [
          'Review current allocation',
          'Identify overweight positions',
          'Plan rebalancing strategy',
        ],
        resources: [
          'Portfolio Rebalancing Guide',
          'Risk Management Strategies',
          'Asset Allocation Calculator',
        ],
        estimatedImpact: 6.2,
        timeToImplement: '1 week',
        isPersonalized: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });

      // Education recommendations
      recommendations.push({
        id: `rec_education_${Date.now()}`,
        userId,
        type: 'education',
        title: 'Learn About Technical Analysis',
        description: 'Understanding technical indicators can help you make better trading decisions.',
        priority: 'low',
        category: 'Education',
        actionItems: [
          'Complete Technical Analysis course',
          'Practice with paper trading',
          'Join trading community discussions',
        ],
        resources: [
          'Technical Analysis Course',
          'Trading Simulator',
          'Trading Community Forum',
        ],
        estimatedImpact: 9.0,
        timeToImplement: '2-4 weeks',
        isPersonalized: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      if (OPENAI_API_KEY) {
        const llmPrompt = [
          'Generate one personalized trading strategy idea for a Ghanaian investor.',
          'Consider mobile-money funding, local equities, and optional crypto exposure.',
          'Return 3 actionable steps and highlight risk.',
        ].join(' ');
        const llmRecommendation = await this.callOpenAI(llmPrompt, { model: this.config.models.predictions, maxTokens: 350 });
        if (llmRecommendation) {
          recommendations.push({
            id: `rec_ai_${Date.now()}`,
            userId,
            type: 'strategy',
            title: 'AI Trader Strategy',
            description: llmRecommendation,
            priority: 'medium',
            category: 'AI Trader',
            actionItems: ['Review AI plan', 'Allocate pilot capital', 'Track performance vs. benchmark'],
            resources: ['AI Insights Hub'],
            estimatedImpact: 7.5,
            timeToImplement: 'Immediate',
            isPersonalized: true,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Get AI Configuration
  getConfig(): AIConfig {
    return { ...this.config };
  }

  // Update AI Configuration
  updateConfig(updates: Partial<AIConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}