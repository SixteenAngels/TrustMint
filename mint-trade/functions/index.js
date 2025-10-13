const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

const db = admin.firestore();

// Import wallet functions
const walletFunctions = require('./walletFunctions');

// GSE API endpoint
const GSE_API_URL = 'https://dev.kwayisi.org/apis/gse/live';

// Fetch live GSE data
exports.fetchGSEData = functions.https.onCall(async (data, context) => {
  try {
    // Fetch data from GSE API
    const response = await axios.get(GSE_API_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'MintTrade/1.0',
      }
    });

    const stocks = response.data.map((stock, index) => ({
      id: `gse_${stock.symbol || index}`,
      name: stock.name || 'Unknown',
      symbol: stock.symbol || 'UNK',
      price: parseFloat(stock.price) || 0,
      change: parseFloat(stock.change) || 0,
      changePercent: parseFloat(stock.changePercent) || 0,
      volume: parseInt(stock.volume) || 0,
      updatedAt: new Date(),
    }));

    // Update Firestore with fresh data
    const batch = db.batch();
    stocks.forEach(stock => {
      const stockRef = db.collection('stocks').doc(stock.id);
      batch.set(stockRef, {
        ...stock,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();

    return stocks;
  } catch (error) {
    console.error('Error fetching GSE data:', error);
    
    // Fallback to cached data
    const snapshot = await db.collection('stocks').get();
    const cachedStocks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return cachedStocks;
  }
});

// Execute trade
exports.executeTrade = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, stockId, type, quantity, price } = data;

  // Validate input
  if (!userId || !stockId || !type || !quantity || !price) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  if (type !== 'buy' && type !== 'sell') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid trade type');
  }

  if (quantity <= 0 || price <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Quantity and price must be positive');
  }

  try {
    const totalAmount = quantity * price;
    
    // Get user data
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const currentBalance = userData.balance || 0;

    // Check balance for buy orders
    if (type === 'buy' && currentBalance < totalAmount) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance');
    }

    // Get stock data
    const stockRef = db.collection('stocks').doc(stockId);
    const stockDoc = await stockRef.get();
    
    if (!stockDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Stock not found');
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
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient shares to sell');
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

    return transaction;
  } catch (error) {
    console.error('Error executing trade:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to execute trade');
  }
});

// Send price alerts
exports.sendPriceAlerts = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  try {
    // Get all active price alerts
    const alertsSnapshot = await db.collection('priceAlerts')
      .where('active', '==', true)
      .get();

    if (alertsSnapshot.empty) {
      console.log('No active price alerts');
      return null;
    }

    // Get current stock prices
    const stocksSnapshot = await db.collection('stocks').get();
    const stocks = {};
    stocksSnapshot.docs.forEach(doc => {
      stocks[doc.id] = doc.data();
    });

    // Check each alert
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
        // Create notification
        const notificationRef = db.collection('users').doc(alert.userId).collection('notifications').doc();
        const notification = {
          id: notificationRef.id,
          userId: alert.userId,
          title: 'Price Alert',
          body: `${stock.symbol} is now ₵${stock.price.toFixed(2)} (${alert.condition} ₵${alert.targetPrice})`,
          type: 'price_alert',
          data: {
            stockId: alert.stockId,
            currentPrice: stock.price,
            targetPrice: alert.targetPrice,
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        batch.set(notificationRef, notification);
        notifications.push(notification);

        // Deactivate alert
        batch.update(alertDoc.ref, { active: false });
      }
    }

    await batch.commit();
    console.log(`Processed ${alertsSnapshot.size} alerts, triggered ${notifications.length} notifications`);

    return null;
  } catch (error) {
    console.error('Error processing price alerts:', error);
    return null;
  }
});

// Clean up old data
exports.cleanupOldData = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days of data

    // Clean up old notifications
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