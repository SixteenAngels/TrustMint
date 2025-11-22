// src/types/trade.ts
export type OrderType = 'market' | 'limit' | 'stop';

export type TradeStatus = 'pending' | 'filled' | 'cancelled' | 'rejected';

export interface TradeOrder {
  orderId?: string;
  symbol: string;
  quantity: number;
  price?: number;
  orderType: OrderType;
  type: 'buy' | 'sell';
}

export interface TradeResult {
  orderId: string;
  status: TradeStatus;
  filledQuantity?: number;
  avgFillPrice?: number;
  reason?: string;
}
