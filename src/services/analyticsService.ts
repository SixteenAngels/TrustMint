/**
 * Analytics Service
 * Handles user analytics, business analytics, and crash reporting
 */

import { firestore } from '../core/firebase/firestoreAdapter';
import { functions } from '../core/firebase/functionsAdapter';

const db = firestore();

const env = (name: string, fallback?: string) =>
  process.env[name] ??
  process.env[`EXPO_PUBLIC_${name}`] ??
  fallback;

// Analytics API Keys (with placeholders)
const GOOGLE_ANALYTICS_TRACKING_ID = env('GOOGLE_ANALYTICS_TRACKING_ID') || 'your_google_analytics_tracking_id_here';
const MIXPANEL_TOKEN = env('MIXPANEL_TOKEN') || 'your_mixpanel_token_here';
const SENTRY_DSN = env('SENTRY_DSN') || 'your_sentry_dsn_here';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

export interface UserBehavior {
  userId: string;
  screen: string;
  action: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

export interface BusinessMetric {
  date: string;
  revenue: number;
  activeUsers: number;
  newUsers: number;
  trades: number;
  deposits: number;
  withdrawals: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private eventQueue: AnalyticsEvent[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // ============================================
  // Event Tracking
  // ============================================

  /**
   * Track an event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const eventData = {
        ...event,
        timestamp: event.timestamp || new Date(),
      };

      // Store in Firestore
      await db.collection('analytics_events').add(eventData);

      // Send to external analytics services
      await this.sendToGoogleAnalytics(eventData);
      await this.sendToMixpanel(eventData);

      // Queue for batch processing if needed
      this.eventQueue.push(eventData);
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string, userId?: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      name: 'screen_view',
      properties: {
        screen_name: screenName,
        ...properties,
      },
      userId,
    });
  }

  /**
   * Track user action
   */
  async trackUserAction(action: string, userId?: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      name: 'user_action',
      properties: {
        action,
        ...properties,
      },
      userId,
    });
  }

  /**
   * Track trade event
   */
  async trackTrade(userId: string, tradeData: {
    symbol: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    total: number;
  }): Promise<void> {
    await this.trackEvent({
      name: 'trade_executed',
      properties: {
        ...tradeData,
        currency: 'GHS',
      },
      userId,
    });
  }

  /**
   * Track payment event
   */
  async trackPayment(userId: string, paymentData: {
    amount: number;
    method: string;
    currency: string;
    status: 'success' | 'failed' | 'pending';
  }): Promise<void> {
    await this.trackEvent({
      name: 'payment_processed',
      properties: paymentData,
      userId,
    });
  }

  // ============================================
  // User Behavior Tracking
  // ============================================

  /**
   * Record user behavior
   */
  async recordUserBehavior(behavior: UserBehavior): Promise<void> {
    try {
      await db.collection('user_behaviors').add(behavior);
    } catch (error) {
      console.error('Error recording user behavior:', error);
    }
  }

  /**
   * Get user behavior analytics
   */
  async getUserBehaviorAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<UserBehavior[]> {
    try {
      let query = db.collection('user_behaviors').where('userId', '==', userId);

      if (startDate) {
        query = query.where('timestamp', '>=', startDate);
      }
      if (endDate) {
        query = query.where('timestamp', '<=', endDate);
      }

      const snapshot = await query.orderBy('timestamp', 'desc').limit(1000).get();
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      } as UserBehavior));
    } catch (error) {
      console.error('Error fetching user behavior analytics:', error);
      return [];
    }
  }

  // ============================================
  // Business Analytics
  // ============================================

  /**
   * Get business metrics
   */
  async getBusinessMetrics(startDate: Date, endDate: Date): Promise<BusinessMetric[]> {
    try {
      const metricsFunction = functions().httpsCallable('getBusinessMetrics');
      const result = await metricsFunction({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return result.data as BusinessMetric[];
    } catch (error) {
      console.error('Error fetching business metrics:', error);
      return [];
    }
  }

  /**
   * Track revenue
   */
  async trackRevenue(amount: number, source: string, userId?: string): Promise<void> {
    await this.trackEvent({
      name: 'revenue',
      properties: {
        amount,
        source,
        currency: 'GHS',
      },
      userId,
    });
  }

  /**
   * Track user acquisition
   */
  async trackUserAcquisition(userId: string, source: string, campaign?: string): Promise<void> {
    await this.trackEvent({
      name: 'user_acquisition',
      properties: {
        source,
        campaign,
      },
      userId,
    });
  }

  /**
   * Track user retention
   */
  async trackUserRetention(userId: string, daysSinceSignup: number): Promise<void> {
    await this.trackEvent({
      name: 'user_retention',
      properties: {
        days_since_signup: daysSinceSignup,
      },
      userId,
    });
  }

  // ============================================
  // External Analytics Services
  // ============================================

  /**
   * Send event to Google Analytics
   */
  private async sendToGoogleAnalytics(event: AnalyticsEvent): Promise<void> {
    if (!GOOGLE_ANALYTICS_TRACKING_ID || GOOGLE_ANALYTICS_TRACKING_ID.includes('your_')) {
      return; // Skip if not configured
    }

    try {
      const gaFunction = functions().httpsCallable('sendToGoogleAnalytics');
      await gaFunction({
        trackingId: GOOGLE_ANALYTICS_TRACKING_ID,
        event: event.name,
        properties: event.properties,
        userId: event.userId,
      });
    } catch (error) {
      console.error('Error sending to Google Analytics:', error);
    }
  }

  /**
   * Send event to Mixpanel
   */
  private async sendToMixpanel(event: AnalyticsEvent): Promise<void> {
    if (!MIXPANEL_TOKEN || MIXPANEL_TOKEN.includes('your_')) {
      return; // Skip if not configured
    }

    try {
      const mixpanelFunction = functions().httpsCallable('sendToMixpanel');
      await mixpanelFunction({
        token: MIXPANEL_TOKEN,
        event: event.name,
        properties: event.properties,
        distinctId: event.userId,
      });
    } catch (error) {
      console.error('Error sending to Mixpanel:', error);
    }
  }

  // ============================================
  // Crash Reporting
  // ============================================

  /**
   * Report error/crash
   */
  async reportError(error: Error, context?: Record<string, any>, userId?: string): Promise<void> {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        context,
        userId,
        timestamp: new Date(),
        platform: 'react-native',
      };

      // Store in Firestore
      await db.collection('error_reports').add(errorData);

      // Send to Sentry if configured
      if (SENTRY_DSN && !SENTRY_DSN.includes('your_')) {
        const sentryFunction = functions().httpsCallable('reportToSentry');
        await sentryFunction({
          dsn: SENTRY_DSN,
          error: errorData,
        });
      }
    } catch (err) {
      console.error('Error reporting error:', err);
    }
  }

  /**
   * Track performance metric
   */
  async trackPerformance(metricName: string, value: number, userId?: string): Promise<void> {
    await this.trackEvent({
      name: 'performance_metric',
      properties: {
        metric_name: metricName,
        value,
      },
      userId,
    });
  }

  // ============================================
  // Conversion Funnels
  // ============================================

  /**
   * Track funnel step
   */
  async trackFunnelStep(funnelName: string, step: string, userId?: string): Promise<void> {
    await this.trackEvent({
      name: 'funnel_step',
      properties: {
        funnel_name: funnelName,
        step,
      },
      userId,
    });
  }

  /**
   * Track conversion
   */
  async trackConversion(conversionName: string, value?: number, userId?: string): Promise<void> {
    await this.trackEvent({
      name: 'conversion',
      properties: {
        conversion_name: conversionName,
        value,
      },
      userId,
    });
  }
}

