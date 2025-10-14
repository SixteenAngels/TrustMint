import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase.config';
import { Stock, Transaction, PortfolioItem } from '../types';

export class StockService {
  private static instance: StockService;
  private stocks: Stock[] = [];
  private lastUpdate: Date | null = null;

  static getInstance(): StockService {
    if (!StockService.instance) {
      StockService.instance = new StockService();
    }
    return StockService.instance;
  }

  // Fetch live GSE data via Cloud Function
  async fetchLiveData(): Promise<Stock[]> {
    try {
      const fetchGSEData = httpsCallable(functions, 'fetchGSEData');
      const result = await fetchGSEData();
      const stocks = result.data as Stock[];
      
      // Update local cache
      this.stocks = stocks;
      this.lastUpdate = new Date();
      
      // Update Firestore
      await this.updateStocksInFirestore(stocks);
      
      return stocks;
    } catch (error) {
      console.error('Error fetching live data:', error);
      // Fallback to cached data
      return this.stocks;
    }
  }

  // Get stocks from Firestore
  async getStocks(): Promise<Stock[]> {
    try {
      const stocksRef = collection(db, 'stocks');
      const snapshot = await getDocs(stocksRef);
      const stocks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Stock));
      
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
      const stockRef = doc(db, 'stocks', stockId);
      const stockDoc = await getDoc(stockRef);
      
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
    const batch = stocks.map(stock => 
      setDoc(doc(db, 'stocks', stock.id), {
        ...stock,
        updatedAt: new Date()
      })
    );
    await Promise.all(batch);
  }

  // Get user's portfolio
  async getPortfolio(userId: string): Promise<PortfolioItem[]> {
    try {
      const portfolioRef = collection(db, 'users', userId, 'portfolio');
      const snapshot = await getDocs(portfolioRef);
      const portfolio = snapshot.docs.map(doc => doc.data() as PortfolioItem);
      
      // Calculate current values
      const updatedPortfolio = await Promise.all(
        portfolio.map(async (item) => {
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
      const tradeFunction = httpsCallable(functions, 'executeTrade');
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
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      const q = query(transactionsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
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