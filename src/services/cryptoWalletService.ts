// src/services/cryptoWalletService.ts
import { CryptoAsset, CryptoAssetType } from '../../TrustMint/src/types/crypto';

export interface UserCryptoWallet {
  userId: string;
  assets: CryptoAsset[];
}

const wallets: Record<string, UserCryptoWallet> = {};

export const getWallet = (userId: string): UserCryptoWallet => {
  if (!wallets[userId]) {
    wallets[userId] = { userId, assets: [] };
  }
  return wallets[userId];
};

export const addAssetToWallet = (userId: string, asset: CryptoAsset) => {
  const wallet = getWallet(userId);
  const existing = wallet.assets.find(a => a.symbol === asset.symbol);
  if (existing) {
    existing.amount += asset.amount;
  } else {
    wallet.assets.push(asset);
  }
};

export const removeAssetFromWallet = (userId: string, symbol: CryptoAssetType, amount: number) => {
  const wallet = getWallet(userId);
  const asset = wallet.assets.find(a => a.symbol === symbol);
  if (asset && asset.amount >= amount) {
    asset.amount -= amount;
    if (asset.amount === 0) {
      wallet.assets = wallet.assets.filter(a => a.symbol !== symbol);
    }
    return true;
  }
  return false;
};

export const getAssetBalance = (userId: string, symbol: CryptoAssetType): number => {
  const wallet = getWallet(userId);
  const asset = wallet.assets.find(a => a.symbol === symbol);
  return asset ? asset.amount : 0;
};
