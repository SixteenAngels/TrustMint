import { Stock } from '../types';

const env = (name: string, fallback?: string) =>
  process.env[name] ??
  process.env[`EXPO_PUBLIC_${name}`] ??
  fallback;

// API Keys from environment (with placeholders)
const TWELVEDATA_API_KEY = env('TWELVE_DATA_API_KEY') || env('TWELVEDATA_API_KEY') || 'your_twelve_data_api_key_here';
const ALPHAVANTAGE_API_KEY = env('ALPHA_VANTAGE_API_KEY') || env('ALPHAVANTAGE_API_KEY') || 'your_alpha_vantage_api_key_here';
const FINNHUB_API_KEY = env('FINNHUB_API_KEY') || 'your_finnhub_api_key_here';
const EODHD_API_KEY = env('EODHD_API_KEY') || 'your_eodhd_api_key_here';
const GSE_API_KEY = env('GSE_API_KEY') || 'your_gse_api_key_here';
const GSE_API_BASE_URL =
  env('GSE_API_BASE_URL') ||
  env('EXPO_PUBLIC_GSE_API_BASE_URL', 'https://dev.kwayisi.org/apis/gse');
const GSE_DATA_SERVICES_BASE_URL = env('GSE_DATA_SERVICES_BASE_URL') || 'https://api.gse.com.gh';
const GSE_DATA_SERVICES_API_KEY = env('GSE_DATA_SERVICES_API_KEY') || 'your_gse_data_services_api_key_here';

type Provider = 'gse' | 'twelvedata' | 'alphavantage' | 'finnhub';

interface CountryConfig {
  provider: Provider;
  symbols?: string[];
}

const COUNTRY_CONFIG: Record<string, CountryConfig> = {
  Ghana: {
    provider: 'gse',
  },
  US: {
    provider: 'twelvedata',
    symbols: [
      'AAPL',
      'MSFT',
      'GOOGL',
      'AMZN',
      'TSLA',
      'NVDA',
      'META',
      'NFLX',
      'AMD',
      'JPM',
      'V',
      'DIS',
    ],
  },
  India: {
    provider: 'alphavantage',
    symbols: [
      'RELIANCE.BSE',
      'TCS.BSE',
      'HDFCBANK.BSE',
      'INFY.BSE',
      'SBIN.BSE',
      'BHARTIARTL.BSE',
      'ITC.BSE',
      'KOTAKBANK.BSE',
    ],
  },
  Kenya: {
    provider: 'finnhub',
    symbols: [
      'EQTY.NSE',
      'KCB.NSE',
      'SCBK.NSE',
      'BAMB.NSE',
      'COOP.NSE',
      'ABSA.NSE',
    ],
  },
  Nigeria: {
    provider: 'finnhub',
    symbols: [
      'ZENITHBANK.NG',
      'GTCO.NG',
      'MTNN.NG',
      'NB.NG',
      'DANGCEM.NG',
      'SEPLAT.NG',
    ],
  },
  Crypto: {
    provider: 'twelvedata',
    symbols: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'MATIC/USD', 'USDC/USD'],
  },
};

const sanitizeSymbol = (symbol: string) => symbol.replace(/[^A-Za-z0-9]/g, '_');

const mapToStock = (
  symbol: string,
  name: string,
  price: number,
  change: number,
  changePercent: number,
  volume?: number,
): Stock => ({
  id: sanitizeSymbol(symbol),
  name,
  symbol,
  price: Number(price) || 0,
  change: Number(change) || 0,
  changePercent: Number(changePercent) || 0,
  volume,
  updatedAt: new Date().toISOString(),
});

// Helper function to create timeout promise
const createTimeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms);
  });
};

// Helper function to fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 10000): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    createTimeoutPromise(timeoutMs),
  ]);
};

// Mock GSE stocks for fallback
const getMockGSEStocks = (): Stock[] => {
  return [
    mapToStock('MTN', 'MTN Ghana', 1.50, 0.05, 3.45, 1000000),
    mapToStock('GCB', 'GCB Bank', 4.20, -0.10, -2.33, 500000),
    mapToStock('CAL', 'CAL Bank', 0.85, 0.02, 2.41, 300000),
    mapToStock('EGH', 'Ecobank Ghana', 6.50, 0.15, 2.36, 800000),
    mapToStock('SCB', 'Standard Chartered Bank', 18.00, -0.30, -1.64, 200000),
    mapToStock('TBL', 'Trust Bank Limited', 0.45, 0.01, 2.27, 150000),
    mapToStock('FML', 'Fan Milk Limited', 2.10, 0.05, 2.44, 400000),
    mapToStock('TOTAL', 'Total Petroleum', 3.80, -0.05, -1.30, 250000),
  ];
};

const fetchFromGSE = async (): Promise<Stock[]> => {
  try {
    // Use the GSE API base URL from environment or default
    const baseUrl = GSE_API_BASE_URL?.replace(/\/$/, '') || 'https://dev.kwayisi.org/apis/gse';
    const url = `${baseUrl}/live`;
    
    console.log(`[GSE API] Fetching from: ${url}`);
    
    // Fetch with 10 second timeout
    const response = await fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
      10000 // 10 second timeout
    );

    if (!response.ok) {
      throw new Error(`GSE API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('[GSE API] Response is not an array:', data);
      // Return mock data as fallback
      console.log('[GSE API] Using mock data as fallback');
      return getMockGSEStocks();
    }

    if (data.length === 0) {
      console.warn('[GSE API] No stocks returned, using mock data');
      return getMockGSEStocks();
    }

    const stocks = data.map((item: any, index: number) =>
      mapToStock(
        item.symbol || `GSE_${index}`,
        item.name || item.symbol || 'GSE Stock',
        parseFloat(item.price) || 0,
        parseFloat(item.change) || 0,
        parseFloat(item.changePercent) || 0,
        parseFloat(item.volume) || undefined,
      ),
    );

    console.log(`[GSE API] Successfully fetched ${stocks.length} stocks`);
    return stocks;
  } catch (error: any) {
    console.error('[GSE API] Error fetching data:', error.message || error);
    
    // Check if it's a timeout error
    if (error.message?.includes('timeout') || error.message?.includes('Network request timed out')) {
      console.warn('[GSE API] Request timed out, using mock data');
    } else {
      console.warn('[GSE API] Network error, using mock data as fallback');
    }
    
    // Return mock data instead of empty array to keep app functional
    return getMockGSEStocks();
  }
};

const fetchFromTwelveData = async (symbols: string[]): Promise<Stock[]> => {
  if (!TWELVEDATA_API_KEY || TWELVEDATA_API_KEY.includes('your_')) {
    console.warn('TwelveData API key not configured, using mock data');
    // Return mock data when API key is not configured
    return symbols.map(symbol => mapToStock(
      symbol,
      symbol,
      Math.random() * 100 + 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      Math.floor(Math.random() * 1000000),
    ));
  }

  try {
    const url = `https://api.twelvedata.com/quote?symbol=${symbols.join(',')}&apikey=${TWELVEDATA_API_KEY}`;
    const response = await fetch(url);
    const raw = await response.json();

    if (raw.status === 'error') {
      throw new Error(raw.message || 'TwelveData error');
    }

    const stocks: Stock[] = [];
    symbols.forEach((symbol) => {
      const entry = raw[symbol] || raw;
      if (entry && entry.symbol) {
        stocks.push(
          mapToStock(
            entry.symbol,
            entry.name || entry.symbol,
            parseFloat(entry.price),
            parseFloat(entry.change),
            parseFloat(entry.percent_change),
            parseFloat(entry.volume),
          ),
        );
      }
    });
    return stocks;
  } catch (error) {
    console.error('Error fetching from TwelveData:', error);
    // Return mock data on error
    return symbols.map(symbol => mapToStock(
      symbol,
      symbol,
      Math.random() * 100 + 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      Math.floor(Math.random() * 1000000),
    ));
  }
};

const fetchFromAlphaVantage = async (symbols: string[]): Promise<Stock[]> => {
  if (!ALPHAVANTAGE_API_KEY || ALPHAVANTAGE_API_KEY.includes('your_')) {
    console.warn('AlphaVantage API key not configured, using mock data');
    return symbols.map(symbol => mapToStock(
      symbol,
      symbol,
      Math.random() * 100 + 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      Math.floor(Math.random() * 1000000),
    ));
  }

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`;
        const response = await fetch(url);
        const json = await response.json();
        const quote = json['Global Quote'];
        if (!quote) return null;
        return mapToStock(
          symbol,
          symbol,
          parseFloat(quote['05. price']),
          parseFloat(quote['09. change']),
          parseFloat(quote['10. change percent']),
          parseFloat(quote['06. volume']),
        );
      }),
    );
    return results.filter(Boolean) as Stock[];
  } catch (error) {
    console.error('Error fetching from AlphaVantage:', error);
    return symbols.map(symbol => mapToStock(
      symbol,
      symbol,
      Math.random() * 100 + 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      Math.floor(Math.random() * 1000000),
    ));
  }
};

const fetchFromFinnhub = async (symbols: string[]): Promise<Stock[]> => {
  if (!FINNHUB_API_KEY || FINNHUB_API_KEY.includes('your_')) {
    console.warn('Finnhub API key not configured, using mock data');
    return symbols.map(symbol => mapToStock(
      symbol,
      symbol,
      Math.random() * 100 + 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      Math.floor(Math.random() * 1000000),
    ));
  }

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
        const response = await fetch(url);
        const quote = await response.json();
        if (!quote || typeof quote.c === 'undefined') return null;
        const change = quote.c - quote.pc;
        const changePercent = quote.pc ? (change / quote.pc) * 100 : 0;
        return mapToStock(
          symbol,
          symbol,
          parseFloat(quote.c),
          change,
          changePercent,
          quote.v,
        );
      }),
    );
    return results.filter(Boolean) as Stock[];
  } catch (error) {
    console.error('Error fetching from Finnhub:', error);
    return symbols.map(symbol => mapToStock(
      symbol,
      symbol,
      Math.random() * 100 + 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      Math.floor(Math.random() * 1000000),
    ));
  }
};

// EODHD Integration
const fetchFromEODHD = async (symbols: string[]): Promise<Stock[]> => {
  if (!EODHD_API_KEY || EODHD_API_KEY.includes('your_')) {
    console.warn('EODHD API key not configured, using mock data');
    return symbols.map(symbol => mapToStock(
      symbol,
      symbol,
      Math.random() * 100 + 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      Math.floor(Math.random() * 1000000),
    ));
  }

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const url = `https://eodhd.com/api/real-time/${symbol}?api_token=${EODHD_API_KEY}&fmt=json`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data || !data.close) return null;
        const change = data.close - data.previousClose;
        const changePercent = data.previousClose ? (change / data.previousClose) * 100 : 0;
        return mapToStock(
          symbol,
          data.name || symbol,
          parseFloat(data.close),
          change,
          changePercent,
          parseFloat(data.volume),
        );
      }),
    );
    return results.filter(Boolean) as Stock[];
  } catch (error) {
    console.error('Error fetching from EODHD:', error);
    return symbols.map(symbol => mapToStock(
      symbol,
      symbol,
      Math.random() * 100 + 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      Math.floor(Math.random() * 1000000),
    ));
  }
};

// GSE Data Services Integration (Official)
const fetchFromGSEDataServices = async (): Promise<Stock[]> => {
  if (!GSE_DATA_SERVICES_API_KEY || GSE_DATA_SERVICES_API_KEY.includes('your_')) {
    console.warn('GSE Data Services API key not configured, falling back to GSE-API');
    return fetchFromGSE();
  }

  try {
    const url = `${GSE_DATA_SERVICES_BASE_URL}/api/v1/stocks/live`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GSE_DATA_SERVICES_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data.map((item: any) => mapToStock(
      item.symbol,
      item.name || item.symbol,
      parseFloat(item.price) || 0,
      parseFloat(item.change) || 0,
      parseFloat(item.changePercent) || 0,
      parseFloat(item.volume) || undefined,
    ));
  } catch (error) {
    console.error('Error fetching from GSE Data Services:', error);
    return fetchFromGSE(); // Fallback to free API
  }
};

export const fetchMarketData = async (country: string): Promise<Stock[]> => {
  const config = COUNTRY_CONFIG[country] || COUNTRY_CONFIG['Ghana'];
  switch (config.provider) {
    case 'gse':
      // For Ghana, use the free GSE API (dev.kwayisi.org) as primary
      // Only try official GSE Data Services if API key is configured
      if (GSE_DATA_SERVICES_API_KEY && !GSE_DATA_SERVICES_API_KEY.includes('your_')) {
        try {
          const stocks = await fetchFromGSEDataServices();
          if (stocks && stocks.length > 0) {
            return stocks;
          }
        } catch (error) {
          console.warn('[GSE] Data Services failed, falling back to free API:', error);
        }
      }
      // Use free GSE API (dev.kwayisi.org)
      // This will return mock data if API fails
      const stocks = await fetchFromGSE();
      return stocks; // fetchFromGSE always returns data (real or mock)
    case 'twelvedata':
      return fetchFromTwelveData(config.symbols || []);
    case 'alphavantage':
      return fetchFromAlphaVantage(config.symbols || []);
    case 'finnhub':
      return fetchFromFinnhub(config.symbols || []);
    default:
      return [];
  }
};

// Additional helper functions for historical data and technical indicators
export const fetchHistoricalData = async (
  symbol: string,
  country: string,
  interval: '1d' | '1w' | '1m' = '1d',
  outputsize: number = 100
): Promise<any[]> => {
  const config = COUNTRY_CONFIG[country] || COUNTRY_CONFIG['Ghana'];
  
  if (config.provider === 'twelvedata' && TWELVEDATA_API_KEY && !TWELVEDATA_API_KEY.includes('your_')) {
    try {
      const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVEDATA_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  }
  
  // Return mock data if API not configured
  return Array.from({ length: outputsize }, (_, i) => ({
    datetime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    open: Math.random() * 100 + 10,
    high: Math.random() * 100 + 15,
    low: Math.random() * 100 + 5,
    close: Math.random() * 100 + 10,
    volume: Math.floor(Math.random() * 1000000),
  }));
};

// Export service class for better organization
export class MarketDataService {
  private static instance: MarketDataService;

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  async getLiveData(country: string): Promise<Stock[]> {
    return fetchMarketData(country);
  }

  async getHistoricalData(symbol: string, country: string, interval?: '1d' | '1w' | '1m', outputsize?: number): Promise<any[]> {
    return fetchHistoricalData(symbol, country, interval, outputsize);
  }
}

