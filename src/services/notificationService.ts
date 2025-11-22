/**
 * Notification Service
 * Handles push notifications, in-app notifications, and email notifications
 */

import { firestore } from '../core/firebase/firestoreAdapter';
import { functions } from '../core/firebase/functionsAdapter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = firestore();

export interface Notification {
  id: string;
  userId: string;
  type: 'price_alert' | 'trade_confirmation' | 'market_news' | 'system' | 'social' | 'kyc';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  condition: 'above' | 'below' | 'change_percent';
  targetPrice?: number;
  changePercent?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  priceAlerts: boolean;
  tradeConfirmations: boolean;
  marketNews: boolean;
  socialUpdates: boolean;
  kycUpdates: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private notificationQueue: Notification[] = [];
  private isOnline: boolean = true;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.checkOnlineStatus();
  }

  private async checkOnlineStatus() {
    // Check network status
    // This would use NetInfo in a real implementation
    this.isOnline = true;
  }

  // ============================================
  // In-App Notifications
  // ============================================

  /**
   * Create and store a notification
   */
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<string> {
    try {
      const notificationRef = db.collection('notifications').doc();
      const newNotification: Notification = {
        id: notificationRef.id,
        ...notification,
        read: false,
        createdAt: new Date(),
      };

      await notificationRef.set(newNotification);

      // If offline, queue for later
      if (!this.isOnline) {
        this.notificationQueue.push(newNotification);
        await this.saveQueueToStorage();
      }

      // Trigger push notification if enabled
      if (this.isOnline) {
        await this.sendPushNotification(newNotification);
      }

      return notificationRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const snapshot = await db
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Notification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const snapshot = await db
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await db.collection('notifications').doc(notificationId).update({
        read: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const snapshot = await db
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await db.collection('notifications').doc(notificationId).delete();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  // ============================================
  // Price Alerts
  // ============================================

  /**
   * Create price alert
   */
  async createPriceAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): Promise<string> {
    try {
      const alertRef = db.collection('price_alerts').doc();
      const newAlert: PriceAlert = {
        id: alertRef.id,
        ...alert,
        createdAt: new Date(),
      };

      await alertRef.set(newAlert);
      return alertRef.id;
    } catch (error) {
      console.error('Error creating price alert:', error);
      throw error;
    }
  }

  /**
   * Get user price alerts
   */
  async getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
    try {
      const snapshot = await db
        .collection('price_alerts')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as PriceAlert));
    } catch (error) {
      console.error('Error fetching price alerts:', error);
      return [];
    }
  }

  /**
   * Delete price alert
   */
  async deletePriceAlert(alertId: string): Promise<void> {
    try {
      await db.collection('price_alerts').doc(alertId).update({
        isActive: false,
      });
    } catch (error) {
      console.error('Error deleting price alert:', error);
    }
  }

  /**
   * Check and trigger price alerts
   * This would be called by a cloud function when prices update
   */
  async checkPriceAlerts(symbol: string, currentPrice: number, changePercent: number): Promise<void> {
    try {
      const snapshot = await db
        .collection('price_alerts')
        .where('symbol', '==', symbol)
        .where('isActive', '==', true)
        .get();

      for (const doc of snapshot.docs) {
        const alert = doc.data() as PriceAlert;
        let shouldTrigger = false;

        if (alert.condition === 'above' && alert.targetPrice && currentPrice >= alert.targetPrice) {
          shouldTrigger = true;
        } else if (alert.condition === 'below' && alert.targetPrice && currentPrice <= alert.targetPrice) {
          shouldTrigger = true;
        } else if (alert.condition === 'change_percent' && alert.changePercent) {
          if (Math.abs(changePercent) >= Math.abs(alert.changePercent)) {
            shouldTrigger = true;
          }
        }

        if (shouldTrigger) {
          await this.createNotification({
            userId: alert.userId,
            type: 'price_alert',
            title: `Price Alert: ${symbol}`,
            message: `${symbol} is now ₵${currentPrice.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`,
            data: { symbol, price: currentPrice, changePercent },
            priority: 'medium',
          });

          // Deactivate alert after triggering
          await doc.ref.update({ isActive: false });
        }
      }
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }

  // ============================================
  // Push Notifications
  // ============================================

  /**
   * Send push notification via FCM
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // This would call a cloud function to send FCM push notification
      const sendPush = functions().httpsCallable('sendPushNotification');
      await sendPush({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Don't throw - notification is still saved
    }
  }

  /**
   * Register device for push notifications
   */
  async registerDevice(userId: string, deviceToken: string, platform: 'ios' | 'android'): Promise<void> {
    try {
      await db.collection('user_devices').doc(`${userId}_${deviceToken}`).set({
        userId,
        deviceToken,
        platform,
        registeredAt: new Date(),
        lastActive: new Date(),
      });
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  // ============================================
  // Email Notifications
  // ============================================

  /**
   * Send email notification
   */
  async sendEmailNotification(userId: string, subject: string, body: string, htmlBody?: string): Promise<void> {
    try {
      // Get user email
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const email = userData?.email;

      if (!email) {
        console.warn('User has no email address');
        return;
      }

      // Check preferences
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences.emailEnabled) {
        return;
      }

      // Call cloud function to send email
      const sendEmail = functions().httpsCallable('sendEmail');
      await sendEmail({
        to: email,
        subject,
        text: body,
        html: htmlBody,
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // ============================================
  // SMS Notifications
  // ============================================

  /**
   * Send SMS notification
   */
  async sendSMSNotification(userId: string, message: string): Promise<void> {
    try {
      // Get user phone
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const phone = userData?.phone;

      if (!phone) {
        console.warn('User has no phone number');
        return;
      }

      // Check preferences
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences.smsEnabled) {
        return;
      }

      // Call cloud function to send SMS
      const sendSMS = functions().httpsCallable('sendSMS');
      await sendSMS({
        to: phone,
        message,
      });
    } catch (error) {
      console.error('Error sending SMS notification:', error);
    }
  }

  // ============================================
  // Notification Preferences
  // ============================================

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const doc = await db.collection('notification_preferences').doc(userId).get();
      if (doc.exists) {
        return doc.data() as NotificationPreferences;
      }

      // Return defaults
      return {
        userId,
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        priceAlerts: true,
        tradeConfirmations: true,
        marketNews: true,
        socialUpdates: true,
        kycUpdates: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      // Return defaults on error
      return {
        userId,
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        priceAlerts: true,
        tradeConfirmations: true,
        marketNews: true,
        socialUpdates: true,
        kycUpdates: true,
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await db.collection('notification_preferences').doc(userId).set(
        {
          userId,
          ...preferences,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // ============================================
  // Offline Support
  // ============================================

  /**
   * Save notification queue to local storage
   */
  private async saveQueueToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_queue', JSON.stringify(this.notificationQueue));
    } catch (error) {
      console.error('Error saving notification queue:', error);
    }
  }

  /**
   * Sync queued notifications when coming back online
   */
  async syncQueuedNotifications(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem('notification_queue');
      if (queueData) {
        const queue: Notification[] = JSON.parse(queueData);
        for (const notification of queue) {
          try {
            await db.collection('notifications').doc(notification.id).set(notification);
            await this.sendPushNotification(notification);
          } catch (error) {
            console.error('Error syncing notification:', error);
          }
        }
        await AsyncStorage.removeItem('notification_queue');
        this.notificationQueue = [];
      }
    } catch (error) {
      console.error('Error syncing queued notifications:', error);
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Create trade confirmation notification
   */
  async notifyTradeConfirmation(
    userId: string,
    tradeDetails: {
      symbol: string;
      type: 'buy' | 'sell';
      quantity: number;
      price: number;
      total: number;
    }
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'trade_confirmation',
      title: `Trade ${tradeDetails.type === 'buy' ? 'Purchased' : 'Sold'}`,
      message: `${tradeDetails.type === 'buy' ? 'Bought' : 'Sold'} ${tradeDetails.quantity} shares of ${tradeDetails.symbol} at ₵${tradeDetails.price.toFixed(2)}`,
      data: tradeDetails,
      priority: 'high',
    });
  }

  /**
   * Create market news notification
   */
  async notifyMarketNews(userId: string, news: { title: string; summary: string; url?: string }): Promise<void> {
    await this.createNotification({
      userId,
      type: 'market_news',
      title: 'Market News',
      message: news.title,
      data: news,
      actionUrl: news.url,
      priority: 'low',
    });
  }

  /**
   * Create KYC status notification
   */
  async notifyKYCStatus(userId: string, status: 'approved' | 'rejected' | 'pending', message: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'kyc',
      title: `KYC Verification ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message,
      data: { status },
      priority: status === 'approved' ? 'high' : 'medium',
    });
  }
}

