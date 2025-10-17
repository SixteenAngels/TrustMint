const admin = require('firebase-admin');
const axios = require('axios');

const db = admin.firestore();

// GSE API Configuration
const GSE_API_BASE_URL = 'https://dev.kwayisi.org/apis/gse';
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'your-alpha-vantage-key';
const YAHOO_FINANCE_API_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

class StockService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Fetch live stock data from multiple sources
  async fetchLiveStockData() {
    try {
      const sources = [
        this.fetchGSEData(),
        this.fetchAlphaVantageData(),
        this.fetchYahooFinanceData()
      ];

      const results = await Promise.allSettled(sources);
      const allStocks = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allStocks.push(...result.value);
        } else {
          console.error(`Source ${index} failed:`, result.reason);
        }
      });

      // Merge and deduplicate stocks
      const mergedStocks = this.mergeStockData(allStocks);
      
      // Update Firestore
      await this.updateFirestoreStocks(mergedStocks);
      
      return mergedStocks;
    } catch (error) {
      console.error('Error fetching live stock data:', error);
      throw error;
    }
  }

  // Fetch GSE data
  async fetchGSEData() {
    try {
      const response = await axios.get(`${GSE_API_BASE_URL}/live`, {
        timeout: 10000,
        headers: { 'User-Agent': 'MintTrade/1.0' }
      });

      return response.data.map((stock, index) => ({
        id: `gse_${stock.symbol || index}`,
        symbol: stock.symbol || 'UNK',
        name: stock.name || 'Unknown',
        price: parseFloat(stock.price) || 0,
        change: parseFloat(stock.change) || 0,
        changePercent: parseFloat(stock.changePercent) || 0,
        volume: parseInt(stock.volume) || 0,
        high: parseFloat(stock.high) || 0,
        low: parseFloat(stock.low) || 0,
        open: parseFloat(stock.open) || 0,
        previousClose: parseFloat(stock.previousClose) || 0,
        marketCap: parseFloat(stock.marketCap) || 0,
        pe: parseFloat(stock.pe) || 0,
        dividend: parseFloat(stock.dividend) || 0,
        sector: stock.sector || 'Unknown',
        source: 'GSE',
        updatedAt: new Date(),
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching GSE data:', error);
      return [];
    }
  }

  // Fetch Alpha Vantage data
  async fetchAlphaVantageData() {
    try {
      const symbols = ['MTN', 'GCB', 'SCB', 'CAL', 'EGL', 'FML', 'TOTAL', 'GOIL'];
      const stocks = [];

      for (const symbol of symbols) {
        try {
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.GSE&apikey=${ALPHA_VANTAGE_API_KEY}`,
            { timeout: 5000 }
          );

          const data = response.data['Global Quote'];
          if (data && data['01. symbol']) {
            stocks.push({
              id: `av_${symbol}`,
              symbol: symbol,
              name: this.getStockName(symbol),
              price: parseFloat(data['05. price']) || 0,
              change: parseFloat(data['09. change']) || 0,
              changePercent: parseFloat(data['10. change percent'].replace('%', '')) || 0,
              volume: parseInt(data['06. volume']) || 0,
              high: parseFloat(data['03. high']) || 0,
              low: parseFloat(data['04. low']) || 0,
              open: parseFloat(data['02. open']) || 0,
              previousClose: parseFloat(data['08. previous close']) || 0,
              source: 'Alpha Vantage',
              updatedAt: new Date(),
              lastUpdated: new Date()
            });
          }
        } catch (error) {
          console.error(`Error fetching Alpha Vantage data for ${symbol}:`, error);
        }
      }

      return stocks;
    } catch (error) {
      console.error('Error fetching Alpha Vantage data:', error);
      return [];
    }
  }

  // Fetch Yahoo Finance data
  async fetchYahooFinanceData() {
    try {
      const symbols = ['MTN', 'GCB', 'SCB', 'CAL', 'EGL', 'FML', 'TOTAL', 'GOIL'];
      const stocks = [];

      for (const symbol of symbols) {
        try {
          const response = await axios.get(
            `${YAHOO_FINANCE_API_URL}/${symbol}.GSE`,
            { timeout: 5000 }
          );

          const data = response.data.chart.result[0];
          if (data && data.meta) {
            const meta = data.meta;
            const currentPrice = meta.regularMarketPrice || 0;
            const previousClose = meta.previousClose || 0;
            const change = currentPrice - previousClose;
            const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

            stocks.push({
              id: `yahoo_${symbol}`,
              symbol: symbol,
              name: this.getStockName(symbol),
              price: currentPrice,
              change: change,
              changePercent: changePercent,
              volume: meta.regularMarketVolume || 0,
              high: meta.regularMarketDayHigh || 0,
              low: meta.regularMarketDayLow || 0,
              open: meta.regularMarketOpen || 0,
              previousClose: previousClose,
              marketCap: meta.marketCap || 0,
              source: 'Yahoo Finance',
              updatedAt: new Date(),
              lastUpdated: new Date()
            });
          }
        } catch (error) {
          console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
        }
      }

      return stocks;
    } catch (error) {
      console.error('Error fetching Yahoo Finance data:', error);
      return [];
    }
  }

  // Merge stock data from multiple sources
  mergeStockData(allStocks) {
    const stockMap = new Map();

    allStocks.forEach(stock => {
      const key = stock.symbol;
      if (!stockMap.has(key)) {
        stockMap.set(key, {
          ...stock,
          sources: [stock.source],
          confidence: 1
        });
      } else {
        const existing = stockMap.get(key);
        // Average the prices and increase confidence
        const totalSources = existing.sources.length + 1;
        existing.price = (existing.price * existing.sources.length + stock.price) / totalSources;
        existing.change = (existing.change * existing.sources.length + stock.change) / totalSources;
        existing.changePercent = (existing.changePercent * existing.sources.length + stock.changePercent) / totalSources;
        existing.volume = Math.max(existing.volume, stock.volume);
        existing.high = Math.max(existing.high, stock.high);
        existing.low = Math.min(existing.low, stock.low);
        existing.sources.push(stock.source);
        existing.confidence = totalSources;
      }
    });

    return Array.from(stockMap.values());
  }

  // Update Firestore with stock data
  async updateFirestoreStocks(stocks) {
    const batch = db.batch();
    
    stocks.forEach(stock => {
      const stockRef = db.collection('stocks').doc(stock.id);
      batch.set(stockRef, {
        ...stock,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    await batch.commit();
    console.log(`Updated ${stocks.length} stocks in Firestore`);
  }

  // Get historical data
  async getHistoricalData(symbol, period = '1M') {
    try {
      const cacheKey = `historical_${symbol}_${period}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      // Try multiple sources for historical data
      let historicalData = [];
      
      try {
        // Try Alpha Vantage first
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}.GSE&apikey=${ALPHA_VANTAGE_API_KEY}`,
          { timeout: 10000 }
        );

        const timeSeries = response.data['Time Series (Daily)'];
        if (timeSeries) {
          historicalData = Object.entries(timeSeries).map(([date, data]) => ({
            date: new Date(date),
            open: parseFloat(data['1. open']),
            high: parseFloat(data['2. high']),
            low: parseFloat(data['3. low']),
            close: parseFloat(data['4. close']),
            volume: parseInt(data['5. volume'])
          })).sort((a, b) => a.date - b.date);
        }
      } catch (error) {
        console.error('Error fetching historical data from Alpha Vantage:', error);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: historicalData,
        timestamp: Date.now()
      });

      return historicalData;
    } catch (error) {
      console.error('Error getting historical data:', error);
      return [];
    }
  }

  // Get stock name by symbol
  getStockName(symbol) {
    const names = {
      'MTN': 'MTN Ghana',
      'GCB': 'GCB Bank',
      'SCB': 'Standard Chartered Bank',
      'CAL': 'CAL Bank',
      'EGL': 'Enterprise Group',
      'FML': 'Fan Milk',
      'TOTAL': 'Total Petroleum',
      'GOIL': 'Ghana Oil Company'
    };
    return names[symbol] || symbol;
  }

  // Calculate technical indicators
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return [];

    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const rsi = [];
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push({
        date: new Date(prices[i].date),
        value: rsiValue
      });
    }

    return rsi;
  }

  // Calculate moving averages
  calculateSMA(prices, period) {
    if (prices.length < period) return [];

    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b.close, 0);
      sma.push({
        date: new Date(prices[i].date),
        value: sum / period
      });
    }

    return sma;
  }
}

module.exports = new StockService();