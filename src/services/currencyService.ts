// src/services/currencyService.ts
export type Currency = 'GHS' | 'USD' | 'INR' | 'KES' | 'NGN';

const currencyMap: Record<string, Currency> = {
  Ghana: 'GHS',
  US: 'USD',
  India: 'INR',
  Kenya: 'KES',
  Nigeria: 'NGN',
  Crypto: 'USD',
};

// Example static rates (replace with real API integration)
const rates: Record<Currency, number> = {
  GHS: 1,
  USD: 12.5,
  INR: 0.15,
  KES: 0.08,
  NGN: 0.007,
};

export const getCurrencyForCountry = (country: string): Currency => {
  return currencyMap[country] || 'USD';
};

export const convertToUserCurrency = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount;
  // Convert to base (GHS), then to target
  const baseAmount = amount / rates[from];
  return baseAmount * rates[to];
};
