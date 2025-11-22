/**
 * Trade Service
 * Handles order management, trade execution, and portfolio tracking
 */

import { firestore } from '../core/firebase/firestoreAdapter';
import { functions } from '../core/firebase/functionsAdapter';
import { OrderType, TradeOrder, TradeStatus, TradeResult } from '../types/trade';
import { Stock } from '../types';

const db = firestore();

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  stockId: string;
  type: 'buy' | 'sell';
  orderType: OrderType;
  quantity: number;
  price?: number; // For limit/stop orders
  stopPrice?: number; // For stop orders
  status: TradeStatus;
  filledQuantity?: number;
  averageFillPrice?: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // For GTC (Good Till Cancel) vs Day orders
  reason?: string;
}

export interface Position {
  symbol: string;
  stockId: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  lastUpdated: Date;
}

export interface TradeHistory {
  id: string;
  userId: string;
  orderId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  fees: number;
  executedAt: Date;
}

export class TradeService {
  private static instance: TradeService;

  static getInstance(): TradeService {
    if (!TradeService.instance) {
      TradeService.instance = new TradeService();
    }
    return TradeService.instance;
  }

  // ============================================
  // Order Management
  // ============================================

  /**
   * Create a new order
   */
  async createOrder(userId: string, orderData: Omit<Order, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const orderRef = db.collection('orders').doc();
      const order: Order = {
        id: orderRef.id,
        userId,
        ...orderData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await orderRef.set(order);

      // If it's a market order, try to execute immediately
      if (order.orderType === 'market') {
        await this.executeOrder(order.id);
      }

      return order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: string, status?: TradeStatus, limit: number = 50): Promise<Order[]> {
    try {
      let query = db.collection('orders').where('userId', '==', userId);

      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate(),
      } as Order));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const doc = await db.collection('orders').doc(orderId).get();
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate(),
      } as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string): Promise<void> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.userId !== userId) {
        throw new Error('Unauthorized');
      }

      if (order.status !== 'pending') {
        throw new Error('Order cannot be cancelled');
      }

      await db.collection('orders').doc(orderId).update({
        status: 'cancelled',
        updatedAt: new Date(),
        reason: 'Cancelled by user',
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: TradeStatus, data?: Partial<Order>): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
        ...data,
      };

      await db.collection('orders').doc(orderId).update(updateData);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // ============================================
  // Order Execution
  // ============================================

  /**
   * Execute a market order immediately
   */
  async executeOrder(orderId: string): Promise<TradeResult> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'pending') {
        throw new Error('Order is not pending');
      }

      // Get current market price
      const { StockService } = await import('./stockService');
      const stockService = StockService.getInstance();
      const stock = await stockService.getStock(order.stockId);

      if (!stock) {
        throw new Error('Stock not found');
      }

      // For market orders, use current price
      // For limit orders, check if price is acceptable
      let executionPrice = stock.price;

      if (order.orderType === 'limit' && order.price) {
        if (order.type === 'buy' && stock.price > order.price) {
          // Price too high, don't execute
          await this.updateOrderStatus(orderId, 'pending', {
            reason: 'Limit price not reached',
          });
          return {
            orderId,
            status: 'pending',
            reason: 'Limit price not reached',
          };
        } else if (order.type === 'sell' && stock.price < order.price) {
          // Price too low, don't execute
          await this.updateOrderStatus(orderId, 'pending', {
            reason: 'Limit price not reached',
          });
          return {
            orderId,
            status: 'pending',
            reason: 'Limit price not reached',
          };
        }
        executionPrice = order.price;
      }

      // Check if user has sufficient balance/stock
      if (order.type === 'buy') {
        const totalCost = executionPrice * order.quantity;
        const { useAuth } = await import('../contexts/AuthContext');
        // This would need to be passed in or fetched
        // For now, we'll assume validation happens elsewhere
      }

      // Execute the trade via cloud function
      const executeTrade = functions().httpsCallable('executeTrade');
      const result = await executeTrade({
        orderId: order.id,
        symbol: order.symbol,
        type: order.type,
        quantity: order.quantity,
        price: executionPrice,
      });

      // Update order with execution details
      await this.updateOrderStatus(orderId, 'filled', {
        filledQuantity: order.quantity,
        averageFillPrice: executionPrice,
      });

      return {
        orderId,
        status: 'filled',
        filledQuantity: order.quantity,
        avgFillPrice: executionPrice,
      };
    } catch (error) {
      console.error('Error executing order:', error);
      await this.updateOrderStatus(orderId, 'rejected', {
        reason: error instanceof Error ? error.message : 'Execution failed',
      });
      throw error;
    }
  }

  /**
   * Check and execute pending limit/stop orders
   * This would be called periodically by a cloud function
   */
  async checkPendingOrders(symbol: string, currentPrice: number): Promise<void> {
    try {
      const snapshot = await db
        .collection('orders')
        .where('symbol', '==', symbol)
        .where('status', '==', 'pending')
        .where('orderType', 'in', ['limit', 'stop'])
        .get();

      for (const doc of snapshot.docs) {
        const order = doc.data() as Order;

        let shouldExecute = false;

        if (order.orderType === 'limit' && order.price) {
          if (order.type === 'buy' && currentPrice <= order.price) {
            shouldExecute = true;
          } else if (order.type === 'sell' && currentPrice >= order.price) {
            shouldExecute = true;
          }
        } else if (order.orderType === 'stop' && order.stopPrice) {
          if (order.type === 'buy' && currentPrice >= order.stopPrice) {
            shouldExecute = true;
          } else if (order.type === 'sell' && currentPrice <= order.stopPrice) {
            shouldExecute = true;
          }
        }

        if (shouldExecute) {
          await this.executeOrder(order.id);
        }
      }
    } catch (error) {
      console.error('Error checking pending orders:', error);
    }
  }

  // ============================================
  // Position Management
  // ============================================

  /**
   * Get user positions
   */
  async getUserPositions(userId: string): Promise<Position[]> {
    try {
      // Get all filled buy orders
      const buyOrders = await db
        .collection('orders')
        .where('userId', '==', userId)
        .where('type', '==', 'buy')
        .where('status', '==', 'filled')
        .get();

      // Get all filled sell orders
      const sellOrders = await db
        .collection('orders')
        .where('userId', '==', userId)
        .where('type', '==', 'sell')
        .where('status', '==', 'filled')
        .get();

      // Calculate positions
      const positionsMap = new Map<string, Position>();

      // Process buy orders
      buyOrders.docs.forEach(doc => {
        const order = doc.data() as Order;
        const existing = positionsMap.get(order.symbol) || {
          symbol: order.symbol,
          stockId: order.stockId,
          quantity: 0,
          averagePrice: 0,
          currentPrice: 0,
          totalCost: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercent: 0,
          lastUpdated: new Date(),
        };

        const orderCost = (order.averageFillPrice || order.price || 0) * order.quantity;
        const totalCost = existing.totalCost + orderCost;
        const totalQuantity = existing.quantity + order.quantity;
        const newAveragePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;

        existing.quantity = totalQuantity;
        existing.averagePrice = newAveragePrice;
        existing.totalCost = totalCost;
        positionsMap.set(order.symbol, existing);
      });

      // Process sell orders
      sellOrders.docs.forEach(doc => {
        const order = doc.data() as Order;
        const existing = positionsMap.get(order.symbol);

        if (existing) {
          existing.quantity -= order.quantity;
          if (existing.quantity <= 0) {
            positionsMap.delete(order.symbol);
          }
        }
      });

      // Get current prices and calculate P&L
      const { StockService } = await import('./stockService');
      const stockService = StockService.getInstance();
      const positions: Position[] = [];

      for (const [symbol, position] of positionsMap.entries()) {
        const stock = await stockService.getStock(position.stockId);
        if (stock) {
          position.currentPrice = stock.price;
          position.currentValue = position.quantity * stock.price;
          position.profitLoss = position.currentValue - position.totalCost;
          position.profitLossPercent = position.totalCost > 0
            ? (position.profitLoss / position.totalCost) * 100
            : 0;
          position.lastUpdated = new Date();
          positions.push(position);
        }
      }

      return positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  /**
   * Get position for a specific symbol
   */
  async getPosition(userId: string, symbol: string): Promise<Position | null> {
    const positions = await this.getUserPositions(userId);
    return positions.find(p => p.symbol === symbol) || null;
  }

  // ============================================
  // Trade History
  // ============================================

  /**
   * Get trade history
   */
  async getTradeHistory(userId: string, limit: number = 100): Promise<TradeHistory[]> {
    try {
      const snapshot = await db
        .collection('trades')
        .where('userId', '==', userId)
        .orderBy('executedAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        executedAt: doc.data().executedAt?.toDate() || new Date(),
      } as TradeHistory));
    } catch (error) {
      console.error('Error fetching trade history:', error);
      return [];
    }
  }

  /**
   * Record a trade execution
   */
  async recordTrade(trade: Omit<TradeHistory, 'id'>): Promise<string> {
    try {
      const tradeRef = db.collection('trades').doc();
      await tradeRef.set({
        ...trade,
        id: tradeRef.id,
      });

      return tradeRef.id;
    } catch (error) {
      console.error('Error recording trade:', error);
      throw error;
    }
  }

  // ============================================
  // Real-time P&L Calculation
  // ============================================

  /**
   * Calculate real-time P&L for user
   */
  async calculateRealTimePnL(userId: string): Promise<{
    totalValue: number;
    totalCost: number;
    profitLoss: number;
    profitLossPercent: number;
  }> {
    const positions = await this.getUserPositions(userId);

    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalCost = positions.reduce((sum, p) => sum + p.totalCost, 0);
    const profitLoss = totalValue - totalCost;
    const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      profitLoss,
      profitLossPercent,
    };
  }

  // ============================================
  // Order Types
  // ============================================

  /**
   * Create market order
   */
  async createMarketOrder(
    userId: string,
    symbol: string,
    stockId: string,
    type: 'buy' | 'sell',
    quantity: number
  ): Promise<string> {
    return this.createOrder(userId, {
      symbol,
      stockId,
      type,
      orderType: 'market',
      quantity,
    });
  }

  /**
   * Create limit order
   */
  async createLimitOrder(
    userId: string,
    symbol: string,
    stockId: string,
    type: 'buy' | 'sell',
    quantity: number,
    price: number
  ): Promise<string> {
    return this.createOrder(userId, {
      symbol,
      stockId,
      type,
      orderType: 'limit',
      quantity,
      price,
    });
  }

  /**
   * Create stop-loss order
   */
  async createStopOrder(
    userId: string,
    symbol: string,
    stockId: string,
    type: 'buy' | 'sell',
    quantity: number,
    stopPrice: number
  ): Promise<string> {
    return this.createOrder(userId, {
      symbol,
      stockId,
      type,
      orderType: 'stop',
      quantity,
      stopPrice,
    });
  }

  /**
   * Create trailing stop order
   */
  async createTrailingStopOrder(
    userId: string,
    symbol: string,
    stockId: string,
    type: 'buy' | 'sell',
    quantity: number,
    trailingPercent: number
  ): Promise<string> {
    // Trailing stop would need additional logic to track price movement
    // For now, create as regular stop order
    const { StockService } = await import('./stockService');
    const stockService = StockService.getInstance();
    const stock = await stockService.getStock(stockId);

    if (!stock) {
      throw new Error('Stock not found');
    }

    const stopPrice = type === 'sell'
      ? stock.price * (1 - trailingPercent / 100)
      : stock.price * (1 + trailingPercent / 100);

    return this.createOrder(userId, {
      symbol,
      stockId,
      type,
      orderType: 'stop',
      quantity,
      stopPrice,
    });
  }
}
