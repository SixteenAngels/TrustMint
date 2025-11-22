import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { WalletService } from '../services/walletService';
import { Wallet, WalletTransaction, WalletSettings } from '../types/wallet';
import { useAuth } from './AuthContext';
import { useAsync } from '../core/hooks/useAsync';
import { handleError } from '../core/utils/errorHandler';

interface WalletContextType {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  settings: WalletSettings | null;
  loading: boolean;
  error: Error | null;
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
  const walletService = WalletService.getInstance();

  // Load wallet data
  const {
    data: walletData,
    loading: walletLoading,
    error: walletError,
    execute: loadWallet,
  } = useAsync(async () => {
    if (!user) return null;
    
    let wallet = await walletService.getWallet(user.uid);
    if (!wallet) {
      wallet = await walletService.createWallet(user.uid, {
        name: user.name || 'User',
        phone: user.phone,
      });
    }
    return wallet;
  }, false);

  // Load transactions
  const {
    data: transactionsData,
    loading: transactionsLoading,
    execute: loadTransactions,
  } = useAsync(async () => {
    if (!user) return [];
    return await walletService.getTransactions(user.uid, 50);
  }, false);

  // Load settings
  const {
    data: settingsData,
    loading: settingsLoading,
    execute: loadSettings,
  } = useAsync(async () => {
    if (!user) return null;
    return await walletService.getWalletSettings(user.uid);
  }, false);

  // Load all wallet data when user changes
  useEffect(() => {
    if (user) {
      loadWallet();
      loadTransactions();
      loadSettings();
    }
  }, [user]);

  // Refresh wallet
  const refreshWallet = useCallback(async () => {
    if (!user) return;
    try {
      await loadWallet();
    } catch (error) {
      handleError(error, 'WalletContext.refreshWallet');
    }
  }, [user, loadWallet]);

  // Refresh transactions
  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    try {
      await loadTransactions();
    } catch (error) {
      handleError(error, 'WalletContext.refreshTransactions');
    }
  }, [user, loadTransactions]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<WalletSettings>) => {
    if (!user) return;
    try {
      await walletService.updateWalletSettings(user.uid, newSettings);
      await loadSettings();
    } catch (error) {
      handleError(error, 'WalletContext.updateSettings');
      throw error;
    }
  }, [user, walletService, loadSettings]);

  const value: WalletContextType = {
    wallet: walletData || null,
    transactions: transactionsData || [],
    settings: settingsData || null,
    loading: walletLoading || transactionsLoading || settingsLoading,
    error: walletError,
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

