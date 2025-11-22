// src/models/order.ts
import { OrderType, TradeOrder, TradeStatus, TradeResult } from '../types/trade';

export class OrderModel {
  order: TradeOrder;
  status: TradeStatus;
  result?: TradeResult;

  constructor(order: TradeOrder) {
    this.order = order;
    this.status = 'pending';
  }

  updateStatus(status: TradeStatus, result?: TradeResult) {
    this.status = status;
    if (result) this.result = result;
  }
}

// Example usage:
// const order = new OrderModel({ symbol: 'AAPL', quantity: 10, orderType: 'market', type: 'buy' });
