/**
 * WebSocket Service
 * Handles real-time connections for live price updates, order execution, and market alerts
 */

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export interface OrderUpdate {
  orderId: string;
  status: 'pending' | 'filled' | 'partial' | 'cancelled' | 'rejected';
  filledQuantity?: number;
  averagePrice?: number;
  timestamp: Date;
}

export type WebSocketEventType =
  | 'price_update'
  | 'order_update'
  | 'trade_executed'
  | 'market_alert'
  | 'connection_status'
  | 'error';

export type WebSocketEventHandler = (data: any) => void;

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();
  private isConnecting: boolean = false;
  private isConnected: boolean = false;
  private subscriptions: Set<string> = new Set();

  // Get WebSocket URL from environment or config
  private getWebSocketUrl(): string {
    // In production, this would come from environment variables
    const wsUrl = process.env.WEBSOCKET_URL || 'wss://api.trustmint.com/ws';
    return wsUrl;
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  constructor() {
    // Initialize event handler maps
    const eventTypes: WebSocketEventType[] = [
      'price_update',
      'order_update',
      'trade_executed',
      'market_alert',
      'connection_status',
      'error',
    ];
    eventTypes.forEach(type => {
      this.eventHandlers.set(type, new Set());
    });
  }

  // ============================================
  // Connection Management
  // ============================================

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      const wsUrl = this.getWebSocketUrl();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { connected: true });

        // Resubscribe to all previous subscriptions
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.emit('error', { error: 'WebSocket error occurred' });
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        this.isConnected = false;
        this.isConnecting = false;
        this.emit('connection_status', { connected: false });
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.isConnecting = false;
      this.emit('error', { error: 'Failed to connect' });
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.subscriptions.clear();
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * this.reconnectAttempts;

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // ============================================
  // Message Handling
  // ============================================

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'price_update':
        this.emit('price_update', message.data as PriceUpdate);
        break;
      case 'order_update':
        this.emit('order_update', message.data as OrderUpdate);
        break;
      case 'trade_executed':
        this.emit('trade_executed', message.data);
        break;
      case 'market_alert':
        this.emit('market_alert', message.data);
        break;
      default:
        console.warn('[WebSocket] Unknown message type:', message.type);
    }
  }

  /**
   * Send message to server
   */
  private send(message: any): void {
    if (this.ws && this.isConnected) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error);
      }
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }

  // ============================================
  // Subscriptions
  // ============================================

  /**
   * Subscribe to price updates for a symbol
   */
  subscribeToPrice(symbol: string): void {
    if (this.subscriptions.has(`price:${symbol}`)) {
      return;
    }

    this.subscriptions.add(`price:${symbol}`);
    this.send({
      type: 'subscribe',
      channel: 'price',
      symbol,
    });
  }

  /**
   * Unsubscribe from price updates for a symbol
   */
  unsubscribeFromPrice(symbol: string): void {
    if (!this.subscriptions.has(`price:${symbol}`)) {
      return;
    }

    this.subscriptions.delete(`price:${symbol}`);
    this.send({
      type: 'unsubscribe',
      channel: 'price',
      symbol,
    });
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrders(userId: string): void {
    if (this.subscriptions.has(`orders:${userId}`)) {
      return;
    }

    this.subscriptions.add(`orders:${userId}`);
    this.send({
      type: 'subscribe',
      channel: 'orders',
      userId,
    });
  }

  /**
   * Unsubscribe from order updates
   */
  unsubscribeFromOrders(userId: string): void {
    if (!this.subscriptions.has(`orders:${userId}`)) {
      return;
    }

    this.subscriptions.delete(`orders:${userId}`);
    this.send({
      type: 'unsubscribe',
      channel: 'orders',
      userId,
    });
  }

  /**
   * Subscribe to market alerts
   */
  subscribeToMarketAlerts(): void {
    if (this.subscriptions.has('market_alerts')) {
      return;
    }

    this.subscriptions.add('market_alerts');
    this.send({
      type: 'subscribe',
      channel: 'market_alerts',
    });
  }

  /**
   * Resubscribe to all previous subscriptions
   */
  private resubscribeAll(): void {
    this.subscriptions.forEach(sub => {
      const [channel, ...rest] = sub.split(':');
      const identifier = rest.join(':');

      this.send({
        type: 'subscribe',
        channel,
        ...(identifier && { [channel === 'price' ? 'symbol' : 'userId']: identifier }),
      });
    });
  }

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Subscribe to WebSocket events
   */
  on(event: WebSocketEventType, handler: WebSocketEventHandler): () => void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.add(handler);
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Unsubscribe from WebSocket events
   */
  off(event: WebSocketEventType, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to all handlers
   */
  private emit(event: WebSocketEventType, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocket] Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions(): void {
    this.subscriptions.forEach(sub => {
      const [channel, ...rest] = sub.split(':');
      const identifier = rest.join(':');

      this.send({
        type: 'unsubscribe',
        channel,
        ...(identifier && { [channel === 'price' ? 'symbol' : 'userId']: identifier }),
      });
    });

    this.subscriptions.clear();
  }
}

