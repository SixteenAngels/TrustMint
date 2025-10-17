const admin = require('firebase-admin');
const db = admin.firestore();

class NotificationService {
  constructor() {
    this.fcm = admin.messaging();
  }

  // Send push notification
  async sendPushNotification(userId, notification) {
    try {
      // Get user's FCM token
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const fcmToken = userData.fcmToken;

      if (!fcmToken) {
        console.log('No FCM token for user:', userId);
        return false;
      }

      // Create notification record
      const notificationRef = db.collection('users').doc(userId).collection('notifications').doc();
      const notificationData = {
        id: notificationRef.id,
        userId,
        title: notification.title,
        body: notification.body,
        type: notification.type || 'general',
        data: notification.data || {},
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        ...notification
      };

      await notificationRef.set(notificationData);

      // Send FCM notification
      const message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          type: notification.type || 'general',
          ...notification.data
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#FF6B35',
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.fcm.send(message);
      console.log('Successfully sent message:', response);

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Send price alert notification
  async sendPriceAlert(userId, stockSymbol, currentPrice, targetPrice, condition) {
    const title = 'Price Alert';
    const body = `${stockSymbol} is now ₵${currentPrice.toFixed(2)} (${condition} ₵${targetPrice})`;
    
    return await this.sendPushNotification(userId, {
      title,
      body,
      type: 'price_alert',
      data: {
        stockSymbol,
        currentPrice,
        targetPrice,
        condition
      }
    });
  }

  // Send trade confirmation notification
  async sendTradeConfirmation(userId, trade) {
    const title = 'Trade Executed';
    const body = `${trade.type.toUpperCase()} ${trade.quantity} shares of ${trade.stockSymbol} at ₵${trade.price.toFixed(2)}`;
    
    return await this.sendPushNotification(userId, {
      title,
      body,
      type: 'trade_confirmation',
      data: {
        tradeId: trade.id,
        stockSymbol: trade.stockSymbol,
        type: trade.type,
        quantity: trade.quantity,
        price: trade.price
      }
    });
  }

  // Send wallet transaction notification
  async sendWalletTransaction(userId, transaction) {
    const title = 'Wallet Transaction';
    const body = transaction.amount > 0 
      ? `Received ₵${Math.abs(transaction.amount).toFixed(2)}`
      : `Sent ₵${Math.abs(transaction.amount).toFixed(2)}`;
    
    return await this.sendPushNotification(userId, {
      title,
      body,
      type: 'wallet_transaction',
      data: {
        transactionId: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description
      }
    });
  }

  // Send bill payment notification
  async sendBillPaymentConfirmation(userId, billPayment) {
    const title = 'Bill Payment Successful';
    const body = `Paid ₵${billPayment.amount.toFixed(2)} to ${billPayment.provider}`;
    
    return await this.sendPushNotification(userId, {
      title,
      body,
      type: 'bill_payment',
      data: {
        billPaymentId: billPayment.id,
        provider: billPayment.provider,
        amount: billPayment.amount,
        billType: billPayment.billType
      }
    });
  }

  // Send P2P transfer notification
  async sendP2PTransfer(userId, transfer) {
    const title = 'Money Received';
    const body = `Received ₵${transfer.amount.toFixed(2)} from ${transfer.senderName || 'Unknown'}`;
    
    return await this.sendPushNotification(userId, {
      title,
      body,
      type: 'p2p_transfer',
      data: {
        transferId: transfer.id,
        amount: transfer.amount,
        senderId: transfer.senderId,
        senderName: transfer.senderName
      }
    });
  }

  // Send market update notification
  async sendMarketUpdate(userId, marketData) {
    const title = 'Market Update';
    const body = `Market ${marketData.status}: ${marketData.gainers} gainers, ${marketData.losers} losers`;
    
    return await this.sendPushNotification(userId, {
      title,
      body,
      type: 'market_update',
      data: {
        gainers: marketData.gainers,
        losers: marketData.losers,
        totalStocks: marketData.totalStocks
      }
    });
  }

  // Send educational content notification
  async sendEducationalContent(userId, content) {
    const title = 'New Learning Content';
    const body = `Check out: ${content.title}`;
    
    return await this.sendPushNotification(userId, {
      title,
      body,
      type: 'educational',
      data: {
        contentId: content.id,
        contentType: content.type,
        title: content.title
      }
    });
  }

  // Send security alert
  async sendSecurityAlert(userId, alert) {
    const title = 'Security Alert';
    const body = alert.message;
    
    return await this.sendPushNotification(userId, {
      title,
      body,
      type: 'security_alert',
      data: {
        alertType: alert.type,
        severity: alert.severity,
        message: alert.message
      }
    });
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 50) {
    try {
      const notificationsSnapshot = await db.collection('users').doc(userId)
        .collection('notifications')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(userId, notificationId) {
    try {
      await db.collection('users').doc(userId)
        .collection('notifications')
        .doc(notificationId)
        .update({
          read: true,
          readAt: admin.firestore.FieldValue.serverTimestamp()
        });

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId) {
    try {
      const notificationsSnapshot = await db.collection('users').doc(userId)
        .collection('notifications')
        .where('read', '==', false)
        .get();

      const batch = db.batch();
      notificationsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Get notification count
  async getNotificationCount(userId) {
    try {
      const notificationsSnapshot = await db.collection('users').doc(userId)
        .collection('notifications')
        .where('read', '==', false)
        .get();

      return notificationsSnapshot.size;
    } catch (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(userIds, notification) {
    try {
      const promises = userIds.map(userId => 
        this.sendPushNotification(userId, notification)
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      console.log(`Sent ${successful}/${userIds.length} notifications successfully`);
      return successful;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return 0;
    }
  }

  // Schedule notification
  async scheduleNotification(userId, notification, scheduledTime) {
    try {
      const notificationRef = db.collection('scheduledNotifications').doc();
      await notificationRef.set({
        userId,
        notification,
        scheduledTime: admin.firestore.Timestamp.fromDate(scheduledTime),
        status: 'scheduled',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return notificationRef.id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Process scheduled notifications
  async processScheduledNotifications() {
    try {
      const now = admin.firestore.Timestamp.now();
      const scheduledSnapshot = await db.collection('scheduledNotifications')
        .where('scheduledTime', '<=', now)
        .where('status', '==', 'scheduled')
        .get();

      const batch = db.batch();
      const notifications = [];

      scheduledSnapshot.docs.forEach(doc => {
        const data = doc.data();
        notifications.push({
          userId: data.userId,
          notification: data.notification
        });

        batch.update(doc.ref, {
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();

      // Send notifications
      for (const { userId, notification } of notifications) {
        await this.sendPushNotification(userId, notification);
      }

      console.log(`Processed ${notifications.length} scheduled notifications`);
      return notifications.length;
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      return 0;
    }
  }
}

module.exports = new NotificationService();