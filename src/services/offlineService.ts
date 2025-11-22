/**
 * Offline Service
 * Handles offline mode, data synchronization, and queue management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingActions: number;
  lastSyncTime: Date | null;
  isSyncing: boolean;
}

export class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private actionQueue: QueuedAction[] = [];
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private unsubscribeNetInfo: (() => void) | null = null;

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  constructor() {
    this.initializeNetworkListener();
    this.loadQueueFromStorage();
  }

  // ============================================
  // Network Status
  // ============================================

  /**
   * Initialize network status listener
   */
  private initializeNetworkListener(): void {
    // Check initial status
    NetInfo.fetch().then(state => {
      this.isOnline = state.isConnected ?? false;
      this.notifyListeners();

      if (this.isOnline) {
        this.syncQueue();
      }
    });

    // Subscribe to network state changes
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        // Just came back online - sync queue
        this.syncQueue();
      }

      this.notifyListeners();
    });
  }

  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribe to network status changes
   */
  onNetworkStatusChange(callback: (isOnline: boolean) => void): () => void {
    const listener = (status: SyncStatus) => {
      callback(status.isOnline);
    };
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  // ============================================
  // Action Queue
  // ============================================

  /**
   * Queue an action for later execution
   */
  async queueAction(type: string, data: any, maxRetries: number = 3): Promise<string> {
    const action: QueuedAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries,
    };

    this.actionQueue.push(action);
    await this.saveQueueToStorage();
    this.notifyListeners();

    // If online, try to execute immediately
    if (this.isOnline) {
      this.processQueue();
    }

    return action.id;
  }

  /**
   * Remove action from queue
   */
  async removeQueuedAction(actionId: string): Promise<void> {
    this.actionQueue = this.actionQueue.filter(action => action.id !== actionId);
    await this.saveQueueToStorage();
    this.notifyListeners();
  }

  /**
   * Get all queued actions
   */
  getQueuedActions(): QueuedAction[] {
    return [...this.actionQueue];
  }

  /**
   * Clear action queue
   */
  async clearQueue(): Promise<void> {
    this.actionQueue = [];
    await this.saveQueueToStorage();
    this.notifyListeners();
  }

  // ============================================
  // Queue Processing
  // ============================================

  /**
   * Process queued actions
   */
  private async processQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.actionQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners();

    const actionsToProcess = [...this.actionQueue];
    const failedActions: QueuedAction[] = [];

    for (const action of actionsToProcess) {
      try {
        const success = await this.executeAction(action);
        if (success) {
          // Remove successful action
          this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
        } else {
          // Increment retry count
          action.retries++;
          if (action.retries >= action.maxRetries) {
            // Max retries reached - remove or mark as failed
            this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
            failedActions.push(action);
          }
        }
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
        action.retries++;
        if (action.retries >= action.maxRetries) {
          this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
          failedActions.push(action);
        }
      }
    }

    await this.saveQueueToStorage();
    this.syncInProgress = false;
    this.notifyListeners();

    // Handle failed actions
    if (failedActions.length > 0) {
      console.warn(`Failed to process ${failedActions.length} actions after max retries`);
      // Could emit an event or show notification to user
    }
  }

  /**
   * Execute a queued action
   */
  private async executeAction(action: QueuedAction): Promise<boolean> {
    try {
      switch (action.type) {
        case 'trade':
          return await this.executeTradeAction(action.data);
        case 'payment':
          return await this.executePaymentAction(action.data);
        case 'kyc_upload':
          return await this.executeKYCAction(action.data);
        case 'social_post':
          return await this.executeSocialAction(action.data);
        default:
          console.warn(`Unknown action type: ${action.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      return false;
    }
  }

  /**
   * Execute trade action
   */
  private async executeTradeAction(data: any): Promise<boolean> {
    // Import trade service dynamically to avoid circular dependencies
    const { StockService } = await import('./stockService');
    const stockService = StockService.getInstance();
    
    try {
      await stockService.executeTrade(
        data.userId,
        data.stockId,
        data.type,
        data.quantity,
        data.price
      );
      return true;
    } catch (error) {
      console.error('Error executing trade action:', error);
      return false;
    }
  }

  /**
   * Execute payment action
   */
  private async executePaymentAction(data: any): Promise<boolean> {
    const { PaymentService } = await import('./paymentService');
    const paymentService = PaymentService.getInstance();
    
    try {
      await paymentService.processPayment(data);
      return true;
    } catch (error) {
      console.error('Error executing payment action:', error);
      return false;
    }
  }

  /**
   * Execute KYC action
   */
  private async executeKYCAction(data: any): Promise<boolean> {
    const { KYCService } = await import('./kycService');
    const kycService = KYCService.getInstance();
    
    try {
      await kycService.uploadDocument(data.userId, data.documentType, data.imageData);
      return true;
    } catch (error) {
      console.error('Error executing KYC action:', error);
      return false;
    }
  }

  /**
   * Execute social action
   */
  private async executeSocialAction(data: any): Promise<boolean> {
    const { SocialService } = await import('./socialService');
    const socialService = SocialService.getInstance();
    
    try {
      await socialService.createPost(data.userId, data.content, data.data);
      return true;
    } catch (error) {
      console.error('Error executing social action:', error);
      return false;
    }
  }

  // ============================================
  // Sync Management
  // ============================================

  /**
   * Sync queue when coming back online
   */
  async syncQueue(): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    await this.processQueue();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      pendingActions: this.actionQueue.length,
      lastSyncTime: this.actionQueue.length > 0 && this.actionQueue[0]?.timestamp
        ? new Date(this.actionQueue[0].timestamp)
        : null,
      isSyncing: this.syncInProgress,
    };
  }

  // ============================================
  // Storage
  // ============================================

  /**
   * Save queue to storage
   */
  private async saveQueueToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_action_queue', JSON.stringify(this.actionQueue));
    } catch (error) {
      console.error('Error saving action queue:', error);
    }
  }

  /**
   * Load queue from storage
   */
  private async loadQueueFromStorage(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem('offline_action_queue');
      if (queueData) {
        this.actionQueue = JSON.parse(queueData);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading action queue:', error);
    }
  }

  // ============================================
  // Data Synchronization
  // ============================================

  /**
   * Sync local data with server
   */
  async syncData(): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    try {
      // Sync queued actions
      await this.syncQueue();

      // Sync cached data
      const { CacheService } = await import('./cacheService');
      const cacheService = CacheService.getInstance();
      
      // Could add more sync logic here
      console.log('Data sync completed');
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    this.listeners.clear();
  }
}

