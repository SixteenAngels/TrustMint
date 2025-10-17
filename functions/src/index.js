const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Import services
const stockService = require('./services/stockService');
const analyticsService = require('./services/analyticsService');
const notificationService = require('./services/notificationService');
const walletFunctions = require('./walletFunctions');
const zeepayIntegration = require('./zeepayIntegration');

// Create Express app for REST API
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Middleware to verify Firebase Auth token
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== STOCK DATA ENDPOINTS ====================

// Get live stock data
app.get('/api/stocks/live', async (req, res) => {
  try {
    const stocks = await stockService.fetchLiveStockData();
    res.json({ success: true, data: stocks });
  } catch (error) {
    console.error('Error fetching live stocks:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Get historical data
app.get('/api/stocks/:symbol/historical', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query;
    
    const historicalData = await stockService.getHistoricalData(symbol, period);
    res.json({ success: true, data: historicalData });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get stock details
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const stockSnapshot = await db.collection('stocks')
      .where('symbol', '==', symbol)
      .limit(1)
      .get();

    if (stockSnapshot.empty) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const stock = stockSnapshot.docs[0].data();
    res.json({ success: true, data: stock });
  } catch (error) {
    console.error('Error fetching stock details:', error);
    res.status(500).json({ error: 'Failed to fetch stock details' });
  }
});

// ==================== PORTFOLIO ENDPOINTS ====================

// Get user portfolio
app.get('/api/portfolio', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const portfolioSnapshot = await db.collection('users').doc(userId).collection('portfolio').get();
    const portfolio = portfolioSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get current stock prices
    const stockIds = portfolio.map(item => item.stockId);
    const stocksSnapshot = await db.collection('stocks').where('id', 'in', stockIds).get();
    const stocks = {};
    stocksSnapshot.docs.forEach(doc => {
      stocks[doc.id] = doc.data();
    });

    // Calculate current values
    const portfolioWithValues = portfolio.map(item => {
      const stock = stocks[item.stockId];
      if (stock) {
        return {
          ...item,
          currentPrice: stock.price,
          currentValue: item.quantity * stock.price,
          gainLoss: (item.quantity * stock.price) - (item.quantity * item.avgPrice),
          gainLossPercent: item.avgPrice > 0 ? 
            (((item.quantity * stock.price) - (item.quantity * item.avgPrice)) / (item.quantity * item.avgPrice)) * 100 : 0,
          stockName: stock.name,
          stockSymbol: stock.symbol
        };
      }
      return item;
    });

    res.json({ success: true, data: portfolioWithValues });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Get portfolio analytics
app.get('/api/portfolio/analytics', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { period = '30d' } = req.query;
    
    const analytics = await analyticsService.getPortfolioAnalytics(userId, period);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching portfolio analytics:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio analytics' });
  }
});

// ==================== TRADING ENDPOINTS ====================

// Execute trade
app.post('/api/trades', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { stockId, type, quantity, price } = req.body;

    // Validate input
    if (!stockId || !type || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (type !== 'buy' && type !== 'sell') {
      return res.status(400).json({ error: 'Invalid trade type' });
    }

    if (quantity <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Quantity and price must be positive' });
    }

    const totalAmount = quantity * price;
    
    // Get user data
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const currentBalance = userData.balance || 0;

    // Check balance for buy orders
    if (type === 'buy' && currentBalance < totalAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get stock data
    const stockRef = db.collection('stocks').doc(stockId);
    const stockDoc = await stockRef.get();
    
    if (!stockDoc.exists) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const stockData = stockDoc.data();

    // Get current portfolio
    const portfolioRef = userRef.collection('portfolio').doc(stockId);
    const portfolioDoc = await portfolioRef.get();
    
    let currentQuantity = 0;
    let currentAvgPrice = 0;
    
    if (portfolioDoc.exists) {
      const portfolioData = portfolioDoc.data();
      currentQuantity = portfolioData.quantity || 0;
      currentAvgPrice = portfolioData.avgPrice || 0;
    }

    // Check quantity for sell orders
    if (type === 'sell' && currentQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient shares to sell' });
    }

    // Calculate new values
    let newQuantity, newAvgPrice, newBalance;
    
    if (type === 'buy') {
      newQuantity = currentQuantity + quantity;
      newAvgPrice = currentQuantity > 0 
        ? ((currentQuantity * currentAvgPrice) + (quantity * price)) / newQuantity
        : price;
      newBalance = currentBalance - totalAmount;
    } else {
      newQuantity = currentQuantity - quantity;
      newAvgPrice = currentAvgPrice; // Keep same average price
      newBalance = currentBalance + totalAmount;
    }

    // Update user balance
    await userRef.update({
      balance: newBalance,
      lastTradeAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update portfolio
    if (newQuantity > 0) {
      await portfolioRef.set({
        stockId,
        quantity: newQuantity,
        avgPrice: newAvgPrice,
        totalValue: newQuantity * price,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Remove from portfolio if quantity is 0
      await portfolioRef.delete();
    }

    // Create transaction record
    const transactionRef = userRef.collection('transactions').doc();
    const transaction = {
      id: transactionRef.id,
      userId,
      stockId,
      type,
      quantity,
      price,
      total: totalAmount,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      stockName: stockData.name,
      stockSymbol: stockData.symbol,
    };

    await transactionRef.set(transaction);

    // Send notification
    await notificationService.sendTradeConfirmation(userId, transaction);

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({ error: 'Failed to execute trade' });
  }
});

// Get user transactions
app.get('/api/transactions', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 50, offset = 0 } = req.query;
    
    const transactionsSnapshot = await db.collection('users').doc(userId)
      .collection('transactions')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Get trading analytics
app.get('/api/analytics/trading', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { period = '30d' } = req.query;
    
    const analytics = await analyticsService.getTradingAnalytics(userId, period);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching trading analytics:', error);
    res.status(500).json({ error: 'Failed to fetch trading analytics' });
  }
});

// Get market analytics
app.get('/api/analytics/market', async (req, res) => {
  try {
    const analytics = await analyticsService.getMarketAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching market analytics:', error);
    res.status(500).json({ error: 'Failed to fetch market analytics' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { period = '30d', limit = 50 } = req.query;
    
    const leaderboard = await analyticsService.getLeaderboard(period, parseInt(limit));
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ==================== NOTIFICATION ENDPOINTS ====================

// Get user notifications
app.get('/api/notifications', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 50 } = req.query;
    
    const notifications = await notificationService.getUserNotifications(userId, parseInt(limit));
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const success = await notificationService.markNotificationAsRead(userId, id);
    res.json({ success });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const success = await notificationService.markAllNotificationsAsRead(userId);
    res.json({ success });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// ==================== PRICE ALERTS ====================

// Create price alert
app.post('/api/price-alerts', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { stockId, targetPrice, condition } = req.body;

    if (!stockId || !targetPrice || !condition) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (condition !== 'above' && condition !== 'below') {
      return res.status(400).json({ error: 'Invalid condition' });
    }

    const alertRef = db.collection('priceAlerts').doc();
    const alert = {
      id: alertRef.id,
      userId,
      stockId,
      targetPrice: parseFloat(targetPrice),
      condition,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await alertRef.set(alert);
    res.json({ success: true, data: alert });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({ error: 'Failed to create price alert' });
  }
});

// Get user price alerts
app.get('/api/price-alerts', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const alertsSnapshot = await db.collection('priceAlerts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const alerts = alertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    res.status(500).json({ error: 'Failed to fetch price alerts' });
  }
});

// ==================== CLOUD FUNCTIONS ====================

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);

// Export existing Cloud Functions
exports.fetchGSEData = functions.https.onCall(async (data, context) => {
  try {
    const stocks = await stockService.fetchLiveStockData();
    return stocks;
  } catch (error) {
    console.error('Error fetching GSE data:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch stock data');
  }
});

// Process price alerts (scheduled function)
exports.processPriceAlerts = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  try {
    const alertsSnapshot = await db.collection('priceAlerts')
      .where('active', '==', true)
      .get();

    if (alertsSnapshot.empty) {
      console.log('No active price alerts');
      return null;
    }

    const stocksSnapshot = await db.collection('stocks').get();
    const stocks = {};
    stocksSnapshot.docs.forEach(doc => {
      stocks[doc.id] = doc.data();
    });

    const batch = db.batch();
    const notifications = [];

    for (const alertDoc of alertsSnapshot.docs) {
      const alert = alertDoc.data();
      const stock = stocks[alert.stockId];
      
      if (!stock) continue;

      const shouldTrigger = alert.condition === 'above' 
        ? stock.price >= alert.targetPrice
        : stock.price <= alert.targetPrice;

      if (shouldTrigger) {
        // Send notification
        await notificationService.sendPriceAlert(
          alert.userId,
          stock.symbol,
          stock.price,
          alert.targetPrice,
          alert.condition
        );

        // Deactivate alert
        batch.update(alertDoc.ref, { active: false });
      }
    }

    await batch.commit();
    console.log(`Processed ${alertsSnapshot.size} alerts`);

    return null;
  } catch (error) {
    console.error('Error processing price alerts:', error);
    return null;
  }
});

// Process scheduled notifications
exports.processScheduledNotifications = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  try {
    const count = await notificationService.processScheduledNotifications();
    console.log(`Processed ${count} scheduled notifications`);
    return null;
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
    return null;
  }
});

// Clean up old data
exports.cleanupOldData = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const oldNotifications = await db.collectionGroup('notifications')
      .where('createdAt', '<', cutoffDate)
      .get();

    const batch = db.batch();
    oldNotifications.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleaned up ${oldNotifications.size} old notifications`);

    return null;
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    return null;
  }
});

// Export wallet functions
exports.createWallet = walletFunctions.createWallet;
exports.generateVirtualAccount = walletFunctions.generateVirtualAccount;
exports.sendMoney = walletFunctions.sendMoney;
exports.payBill = walletFunctions.payBill;
exports.getWalletAnalytics = walletFunctions.getWalletAnalytics;

// Export Zeepay functions
exports.zeepayInitiatePayment = zeepayIntegration.zeepayInitiatePayment;
exports.zeepayVerifyPayment = zeepayIntegration.zeepayVerifyPayment;
exports.zeepayWebhook = zeepayIntegration.zeepayWebhook;
exports.getPaymentMethods = zeepayIntegration.getPaymentMethods;