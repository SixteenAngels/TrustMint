import React, { createContext, useContext, useEffect, useState } from 'react';
import { WalletService } from '../services/walletService';
import { Wallet, WalletTransaction, WalletSettings } from '../types/wallet';
import { useAuth } from './AuthContext';

interface WalletContextType {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  settings: WalletSettings | null;
  loading: boolean;
  refreshWallet: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  updateSettings: (settings: Partial<WalletSettings>) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [settings, setSettings] = useState<WalletSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const walletService = WalletService.getInstance();

  useEffect(() => {
    if (user) {
      loadWalletData();
    } else {
      setWallet(null);
      setTransactions([]);
      setSettings(null);
      setLoading(false);
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load wallet
      let walletData = await walletService.getWallet(user.uid);
      if (!walletData) {
        walletData = await walletService.createWallet(user.uid, {
          name: user.name || 'User',
          phone: user.phone,
        });
      }

      // Load transactions
      const transactionsData = await walletService.getTransactions(user.uid, 50);

      // Load settings
      const settingsData = await walletService.getWalletSettings(user.uid);

      setWallet(walletData);
      setTransactions(transactionsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    if (!user) return;

    try {
      const walletData = await walletService.getWallet(user.uid);
      if (walletData) {
        setWallet(walletData);
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    }
  };

  const refreshTransactions = async () => {
    if (!user) return;

    try {
      const transactionsData = await walletService.getTransactions(user.uid, 50);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<WalletSettings>) => {
    if (!user) return;

    try {
      await walletService.updateWalletSettings(user.uid, newSettings);
      const updatedSettings = await walletService.getWalletSettings(user.uid);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating wallet settings:', error);
      throw error;
    }
  };

  const value: WalletContextType = {
    wallet,
    transactions,
    settings,
    loading,
    refreshWallet,
    refreshTransactions,
    updateSettings,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};