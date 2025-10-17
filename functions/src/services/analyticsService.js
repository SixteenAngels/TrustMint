const admin = require('firebase-admin');
const db = admin.firestore();

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Get portfolio analytics for a user
  async getPortfolioAnalytics(userId, period = '30d') {
    try {
      const cacheKey = `portfolio_analytics_${userId}_${period}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const startDate = this.getStartDate(period);
      
      // Get user's portfolio
      const portfolioSnapshot = await db.collection('users').doc(userId).collection('portfolio').get();
      const portfolio = portfolioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get current stock prices
      const stockIds = portfolio.map(item => item.stockId);
      const stocksSnapshot = await db.collection('stocks').where('id', 'in', stockIds).get();
      const stocks = {};
      stocksSnapshot.docs.forEach(doc => {
        stocks[doc.id] = doc.data();
      });

      // Calculate portfolio value
      let totalValue = 0;
      let totalCost = 0;
      let totalGainLoss = 0;
      const portfolioItems = [];

      portfolio.forEach(item => {
        const stock = stocks[item.stockId];
        if (stock) {
          const currentValue = item.quantity * stock.price;
          const costBasis = item.quantity * item.avgPrice;
          const gainLoss = currentValue - costBasis;
          const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

          totalValue += currentValue;
          totalCost += costBasis;
          totalGainLoss += gainLoss;

          portfolioItems.push({
            ...item,
            currentPrice: stock.price,
            currentValue,
            costBasis,
            gainLoss,
            gainLossPercent,
            stockName: stock.name,
            stockSymbol: stock.symbol
          });
        }
      });

      // Get historical portfolio values
      const historicalValues = await this.getHistoricalPortfolioValues(userId, startDate);

      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(historicalValues, totalValue);

      // Get top performers and losers
      const topPerformers = portfolioItems
        .filter(item => item.gainLoss > 0)
        .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
        .slice(0, 5);

      const topLosers = portfolioItems
        .filter(item => item.gainLoss < 0)
        .sort((a, b) => a.gainLossPercent - b.gainLossPercent)
        .slice(0, 5);

      // Get sector allocation
      const sectorAllocation = this.calculateSectorAllocation(portfolioItems, stocks);

      const analytics = {
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainLossPercent: totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0,
        portfolioItems,
        historicalValues,
        performance,
        topPerformers,
        topLosers,
        sectorAllocation,
        period,
        lastUpdated: new Date()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      });

      return analytics;
    } catch (error) {
      console.error('Error getting portfolio analytics:', error);
      throw error;
    }
  }

  // Get trading analytics
  async getTradingAnalytics(userId, period = '30d') {
    try {
      const startDate = this.getStartDate(period);
      
      // Get user's transactions
      const transactionsSnapshot = await db.collection('users').doc(userId)
        .collection('transactions')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
        .orderBy('timestamp', 'desc')
        .get();

      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate trading metrics
      const totalTrades = transactions.length;
      const buyTrades = transactions.filter(t => t.type === 'buy');
      const sellTrades = transactions.filter(t => t.type === 'sell');
      
      const totalVolume = transactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
      const totalFees = transactions.reduce((sum, t) => sum + (t.fee || 0), 0);
      
      const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;
      const buyVolume = buyTrades.reduce((sum, t) => sum + (t.quantity * t.price), 0);
      const sellVolume = sellTrades.reduce((sum, t) => sum + (t.quantity * t.price), 0);

      // Get most traded stocks
      const stockTrades = {};
      transactions.forEach(t => {
        if (!stockTrades[t.stockId]) {
          stockTrades[t.stockId] = {
            stockId: t.stockId,
            stockName: t.stockName,
            stockSymbol: t.stockSymbol,
            totalTrades: 0,
            totalVolume: 0,
            buyTrades: 0,
            sellTrades: 0
          };
        }
        stockTrades[t.stockId].totalTrades++;
        stockTrades[t.stockId].totalVolume += t.quantity * t.price;
        if (t.type === 'buy') stockTrades[t.stockId].buyTrades++;
        else stockTrades[t.stockId].sellTrades++;
      });

      const mostTradedStocks = Object.values(stockTrades)
        .sort((a, b) => b.totalTrades - a.totalTrades)
        .slice(0, 10);

      // Calculate win rate (simplified)
      const winRate = this.calculateWinRate(transactions);

      return {
        totalTrades,
        buyTrades: buyTrades.length,
        sellTrades: sellTrades.length,
        totalVolume,
        totalFees,
        avgTradeSize,
        buyVolume,
        sellVolume,
        mostTradedStocks,
        winRate,
        period,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting trading analytics:', error);
      throw error;
    }
  }

  // Get market analytics
  async getMarketAnalytics() {
    try {
      const cacheKey = 'market_analytics';
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      // Get all stocks
      const stocksSnapshot = await db.collection('stocks').get();
      const stocks = stocksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate market metrics
      const totalStocks = stocks.length;
      const gainers = stocks.filter(s => s.change > 0).length;
      const losers = stocks.filter(s => s.change < 0).length;
      const unchanged = stocks.filter(s => s.change === 0).length;

      const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);
      const avgVolume = totalVolume / totalStocks;

      const totalMarketCap = stocks.reduce((sum, s) => sum + (s.marketCap || 0), 0);

      // Get top gainers and losers
      const topGainers = stocks
        .filter(s => s.change > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 10);

      const topLosers = stocks
        .filter(s => s.change < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 10);

      // Get most active stocks
      const mostActive = stocks
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10);

      // Get sector performance
      const sectorPerformance = this.calculateSectorPerformance(stocks);

      const analytics = {
        totalStocks,
        gainers,
        losers,
        unchanged,
        totalVolume,
        avgVolume,
        totalMarketCap,
        topGainers,
        topLosers,
        mostActive,
        sectorPerformance,
        lastUpdated: new Date()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      });

      return analytics;
    } catch (error) {
      console.error('Error getting market analytics:', error);
      throw error;
    }
  }

  // Get user performance leaderboard
  async getLeaderboard(period = '30d', limit = 50) {
    try {
      const startDate = this.getStartDate(period);
      
      // Get all users with portfolio data
      const usersSnapshot = await db.collection('users').get();
      const leaderboard = [];

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Get portfolio analytics for this user
        const portfolioAnalytics = await this.getPortfolioAnalytics(userId, period);
        
        if (portfolioAnalytics.totalValue > 0) {
          leaderboard.push({
            userId,
            username: userData.username || 'Unknown',
            displayName: userData.displayName || userData.name || 'Unknown User',
            totalValue: portfolioAnalytics.totalValue,
            totalGainLoss: portfolioAnalytics.totalGainLoss,
            totalGainLossPercent: portfolioAnalytics.totalGainLossPercent,
            verified: userData.verified || false,
            badges: userData.badges || []
          });
        }
      }

      // Sort by total gain/loss percentage
      leaderboard.sort((a, b) => b.totalGainLossPercent - a.totalGainLossPercent);

      // Add ranks
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return leaderboard.slice(0, limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Helper methods
  getStartDate(period) {
    const now = new Date();
    switch (period) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  async getHistoricalPortfolioValues(userId, startDate) {
    // This would typically query historical portfolio snapshots
    // For now, return mock data
    const values = [];
    const days = Math.ceil((new Date() - startDate) / (24 * 60 * 60 * 1000));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      values.push({
        date,
        value: 10000 + Math.random() * 5000 // Mock data
      });
    }
    
    return values;
  }

  calculatePerformanceMetrics(historicalValues, currentValue) {
    if (historicalValues.length < 2) {
      return {
        totalReturn: 0,
        dailyReturn: 0,
        volatility: 0,
        sharpeRatio: 0
      };
    }

    const firstValue = historicalValues[0].value;
    const totalReturn = ((currentValue - firstValue) / firstValue) * 100;

    const returns = [];
    for (let i = 1; i < historicalValues.length; i++) {
      const dailyReturn = ((historicalValues[i].value - historicalValues[i - 1].value) / historicalValues[i - 1].value) * 100;
      returns.push(dailyReturn);
    }

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0;

    return {
      totalReturn,
      dailyReturn: avgReturn,
      volatility,
      sharpeRatio
    };
  }

  calculateSectorAllocation(portfolioItems, stocks) {
    const sectorTotals = {};
    let totalValue = 0;

    portfolioItems.forEach(item => {
      const stock = stocks[item.stockId];
      if (stock && stock.sector) {
        const value = item.currentValue;
        totalValue += value;
        
        if (!sectorTotals[stock.sector]) {
          sectorTotals[stock.sector] = 0;
        }
        sectorTotals[stock.sector] += value;
      }
    });

    return Object.entries(sectorTotals).map(([sector, value]) => ({
      sector,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }

  calculateSectorPerformance(stocks) {
    const sectorData = {};
    
    stocks.forEach(stock => {
      if (stock.sector) {
        if (!sectorData[stock.sector]) {
          sectorData[stock.sector] = {
            sector: stock.sector,
            stocks: [],
            totalChange: 0,
            avgChange: 0
          };
        }
        sectorData[stock.sector].stocks.push(stock);
        sectorData[stock.sector].totalChange += stock.changePercent;
      }
    });

    Object.values(sectorData).forEach(sector => {
      sector.avgChange = sector.totalChange / sector.stocks.length;
    });

    return Object.values(sectorData).sort((a, b) => b.avgChange - a.avgChange);
  }

  calculateWinRate(transactions) {
    // Simplified win rate calculation
    // In a real implementation, this would track actual P&L
    const buyTrades = transactions.filter(t => t.type === 'buy');
    const sellTrades = transactions.filter(t => t.type === 'sell');
    
    if (buyTrades.length === 0 || sellTrades.length === 0) return 0;
    
    // Mock calculation - in reality, you'd track actual gains/losses
    return Math.random() * 100;
  }
}

module.exports = new AnalyticsService();