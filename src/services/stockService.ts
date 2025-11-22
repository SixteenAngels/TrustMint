// Use compatibility layer for Expo (web SDK)
import { firestore } from '../core/firebase/firestoreAdapter';
import { functions } from '../core/firebase/functionsAdapter';
import { Stock, Transaction, PortfolioItem } from '../types';
import { getCurrencyForCountry, convertToUserCurrency, Currency } from './currencyService';
import { fetchMarketData } from './marketDataService';
import { CacheService } from './cacheService';

const db = firestore();
const CACHE_TTL = 30000; // 30 seconds cache for live data

export class StockService {
  private static instances: Record<string, StockService> = {};
  private stocks: Stock[] = [];
  private lastUpdate: Date | null = null;
  private country: string;

  static getInstance(country: string = 'Ghana'): StockService {
    if (!StockService.instances[country]) {
      StockService.instances[country] = new StockService(country);
    }
    return StockService.instances[country];
  }

  constructor(country: string) {
    this.country = country;
  }

  // Fetch live stock data for selected country (with caching)
  async fetchLiveData(forceRefresh: boolean = false): Promise<Stock[]> {
    const cacheService = CacheService.getInstance();

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = cacheService.getCachedStockList(this.country);
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    try {
      let stocks = await fetchMarketData(this.country);
      
      // fetchMarketData now always returns data (real or mock), so we don't need to throw
      if (!stocks || stocks.length === 0) {
        console.warn('[StockService] No stocks returned, using last known stocks');
        return this.stocks.length > 0 ? this.stocks : [];
      }

      stocks = await this.convertPrices(stocks);

      // Cache the results
      cacheService.cacheStockList(this.country, stocks, CACHE_TTL);

      this.stocks = stocks;
      this.lastUpdate = new Date();

      // Update Firestore in background (don't wait for it)
      this.updateStocksInFirestore(stocks).catch(err => {
        console.error('Error updating stocks in Firestore:', err);
      });

      return stocks;
    } catch (error) {
      console.error('Error fetching live data:', error);
      
      // Try to return cached data even if expired
      const cached = cacheService.getCachedStockList(this.country);
      if (cached && cached.length > 0) {
        return cached;
      }

      // Return last known stocks if available
      if (this.stocks.length > 0) {
        console.log('[StockService] Returning last known stocks as fallback');
        return this.stocks;
      }

      // Last resort: return empty array (app should handle this gracefully)
      console.warn('[StockService] No stocks available, returning empty array');
      return [];
    }
  }

  // Convert stock prices to user's currency
  async convertPrices(stocks: Stock[]): Promise<Stock[]> {
    const userCurrency: Currency = getCurrencyForCountry(this.country);
    return stocks.map(stock => {
      // Assume stock.price is in local market currency
      // Convert to userCurrency if needed
      const marketCurrency: Currency = getCurrencyForCountry(this.country);
      return {
        ...stock,
        price: convertToUserCurrency(stock.price, marketCurrency, userCurrency),
        currency: userCurrency,
      };
    });
  }

  // Get stocks from Firestore
  async getStocks(): Promise<Stock[]> {
    try {
      const stocksRef = db.collection('stocks');
      const snapshot = await stocksRef.get();
      const stocks = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as Stock));
      
      this.stocks = stocks;
      return stocks;
    } catch (error) {
      console.error('Error getting stocks:', error);
      return [];
    }
  }

  // Get single stock
  async getStock(stockId: string): Promise<Stock | null> {
    try {
      const stockRef = db.collection('stocks').doc(stockId);
      const stockDoc = await stockRef.get();
      
      if (stockDoc.exists()) {
        return { ...stockDoc.data(), id: stockDoc.id } as Stock;
      }
      return null;
    } catch (error) {
      console.error('Error getting stock:', error);
      return null;
    }
  }

  // Search stocks
  async searchStocks(query: string): Promise<Stock[]> {
    const allStocks = await this.getStocks();
    return allStocks.filter(stock => 
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Update stocks in Firestore
  private async updateStocksInFirestore(stocks: Stock[]): Promise<void> {
    const batch = stocks.map(async (stock: Stock) => {
      await db.collection('stocks').doc(stock.id).set({
        ...stock,
        updatedAt: new Date()
      });
    });
    await Promise.all(batch);
  }

  // Get user's portfolio
  async getPortfolio(userId: string): Promise<PortfolioItem[]> {
    try {
      const portfolioRef = db.collection('users').doc(userId).collection('portfolio');
      const snapshot = await portfolioRef.get();
      const portfolio = snapshot.docs.map((doc: any) => doc.data() as PortfolioItem);
      
      // Calculate current values
      const updatedPortfolio = await Promise.all(
        portfolio.map(async (item: PortfolioItem) => {
          const stock = await this.getStock(item.stockId);
          if (stock) {
            const currentPrice = stock.price;
            const totalValue = item.quantity * currentPrice;
            const profitLoss = totalValue - (item.quantity * item.avgPrice);
            const profitLossPercent = (profitLoss / (item.quantity * item.avgPrice)) * 100;
            
            return {
              ...item,
              currentPrice,
              totalValue,
              profitLoss,
              profitLossPercent
            };
          }
          return item;
        })
      );
      
      return updatedPortfolio;
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return [];
    }
  }

  // Execute trade
  async executeTrade(
    userId: string, 
    stockId: string, 
    type: 'buy' | 'sell', 
    quantity: number, 
    price: number
  ): Promise<Transaction> {
    try {
      const tradeFunction = functions().httpsCallable('executeTrade');
      const result = await tradeFunction({
        userId,
        stockId,
        type,
        quantity,
        price
      });
      
      return result.data as Transaction;
    } catch (error) {
      console.error('Error executing trade:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactionsRef = db.collection('users').doc(userId).collection('transactions');
      const q = transactionsRef.orderBy('timestamp', 'desc');
      const snapshot = await q.get();
      
      return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as Transaction));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  // Get market data freshness
  isDataFresh(): boolean {
    if (!this.lastUpdate) return false;
    const now = new Date();
    const diffMinutes = (now.getTime() - this.lastUpdate.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Data is fresh if less than 5 minutes old
  }
}
