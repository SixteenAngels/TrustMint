import React, { createContext, useContext } from 'react';
import { Stock } from '../types';

interface NavigationContextValue {
  switchTab: (tabId: string) => void;
  openTrading?: (stock: Stock, type?: 'buy' | 'sell') => void;
}

const defaultContextValue: NavigationContextValue = {
  switchTab: () => {
    console.warn('[NavigationContext] switchTab called but context not initialized');
  },
  openTrading: () => {
    console.warn('[NavigationContext] openTrading called but context not initialized');
  },
};

const NavigationContext = createContext<NavigationContextValue>(defaultContextValue);

export const NavigationProvider = NavigationContext.Provider;

export const useNavigationContext = (): NavigationContextValue => {
  // Hooks must be called unconditionally - can't wrap in try-catch
  const context = useContext(NavigationContext);
  // If context is not provided, it will use the default value from createContext
  return context || defaultContextValue;
};

