import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
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
  
  // Handle bypass user - create a mock wallet (memoized to prevent recreation)
  const bypassUserRef = useRef({
    uid: 'dev-bypass-user',
    id: 'dev-bypass-user',
    name: 'Dev User',
    phone: '+233XXXXXXXXX',
    email: 'dev@trustmint.com',
    verified: true,
    balance: 10000,
    createdAt: new Date(),
  });
  
  const effectiveUser = user || (__DEV__ ? bypassUserRef.current : null);

  // Load wallet data
  const {
    data: walletData,
    loading: walletLoading,
    error: walletError,
    execute: loadWallet,
  } = useAsync(async () => {
    if (!effectiveUser) return null;
    
    // For bypass user, return a mock wallet
    if (effectiveUser.uid === 'dev-bypass-user') {
      return {
        id: 'dev-wallet',
        userId: 'dev-bypass-user',
        balance: 10000,
        currency: 'GHS',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    let wallet = await walletService.getWallet(effectiveUser.uid);
    if (!wallet) {
      wallet = await walletService.createWallet(effectiveUser.uid, {
        name: effectiveUser.name || 'User',
        phone: effectiveUser.phone,
      });
    }
    return wallet;
  }, { immediate: false });

  // Load transactions
  const {
    data: transactionsData,
    loading: transactionsLoading,
    execute: loadTransactions,
  } = useAsync(async () => {
    if (!effectiveUser) return [];
    if (effectiveUser.uid === 'dev-bypass-user') return [];
    return await walletService.getTransactions(effectiveUser.uid, 50);
  }, { immediate: false });

  // Load settings
  const {
    data: settingsData,
    loading: settingsLoading,
    execute: loadSettings,
  } = useAsync(async () => {
    if (!effectiveUser) return null;
    if (effectiveUser.uid === 'dev-bypass-user') {
      return {
        userId: 'dev-bypass-user',
        currency: 'GHS',
        notifications: true,
        autoSave: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return await walletService.getWalletSettings(effectiveUser.uid);
  }, { immediate: false });

  // Load all wallet data when user changes
  useEffect(() => {
    if (effectiveUser) {
      loadWallet();
      loadTransactions();
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUser?.uid]);

  // Refresh wallet
  const refreshWallet = useCallback(async () => {
    if (!effectiveUser) return;
    try {
      await loadWallet();
    } catch (error) {
      handleError(error, 'WalletContext.refreshWallet');
    }
  }, [effectiveUser, loadWallet]);

  // Refresh transactions
  const refreshTransactions = useCallback(async () => {
    if (!effectiveUser) return;
    try {
      await loadTransactions();
    } catch (error) {
      handleError(error, 'WalletContext.refreshTransactions');
    }
  }, [effectiveUser, loadTransactions]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<WalletSettings>) => {
    if (!effectiveUser || effectiveUser.uid === 'dev-bypass-user') return;
    try {
      await walletService.updateWalletSettings(effectiveUser.uid, newSettings);
      await loadSettings();
    } catch (error) {
      handleError(error, 'WalletContext.updateSettings');
      throw error;
    }
  }, [effectiveUser, walletService, loadSettings]);

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