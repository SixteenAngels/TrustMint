// src/types/crypto.ts
export interface CryptoAsset {
  symbol: string;
  name: string;
  amount: number;
  priceUsd?: number;
}

export interface CryptoTransaction {
  txId: string;
  userId: string;
  type: 'buy' | 'sell' | 'swap' | 'send' | 'receive';
  symbol: string;
  amount: number;
  priceUsd?: number;
  timestamp: number;
}
