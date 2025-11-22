/**
 * Cache Service
 * Handles caching of price data, API responses, and images
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
}

export class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  constructor() {
    // Clean up expired entries periodically
    this.startCleanupInterval();
  }

  // ============================================
  // Memory Cache
  // ============================================

  /**
   * Set data in memory cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
  }

  /**
   * Get data from memory cache
   */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete from memory cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
  }

  /**
   * Clear all memory cache
   */
  clear(): void {
    this.memoryCache.clear();
  }

  // ============================================
  // Persistent Cache (AsyncStorage)
  // ============================================

  /**
   * Set data in persistent cache
   */
  async setPersistent<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const expiry = Date.now() + (ttl || this.defaultTTL);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry,
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('Error setting persistent cache:', error);
    }
  }

  /**
   * Get data from persistent cache
   */
  async getPersistent<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Check if expired
      if (Date.now() > entry.expiry) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Error getting persistent cache:', error);
      return null;
    }
  }

  /**
   * Delete from persistent cache
   */
  async deletePersistent(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error deleting persistent cache:', error);
    }
  }

  /**
   * Clear all persistent cache
   */
  async clearPersistent(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing persistent cache:', error);
    }
  }

  // ============================================
  // Price Data Caching
  // ============================================

  /**
   * Cache stock price data
   */
  cacheStockPrice(symbol: string, priceData: any, ttl: number = 60000): void {
    this.set(`price_${symbol}`, priceData, ttl);
  }

  /**
   * Get cached stock price
   */
  getCachedStockPrice(symbol: string): any | null {
    return this.get(`price_${symbol}`);
  }

  /**
   * Cache stock list
   */
  cacheStockList(country: string, stocks: any[], ttl: number = 5 * 60 * 1000): void {
    this.set(`stocks_${country}`, stocks, ttl);
  }

  /**
   * Get cached stock list
   */
  getCachedStockList(country: string): any[] | null {
    return this.get(`stocks_${country}`);
  }

  /**
   * Cache historical data
   */
  async cacheHistoricalData(symbol: string, timeRange: string, data: any[]): Promise<void> {
    const key = `historical_${symbol}_${timeRange}`;
    // Historical data cached for longer (1 hour)
    await this.setPersistent(key, data, 60 * 60 * 1000);
  }

  /**
   * Get cached historical data
   */
  async getCachedHistoricalData(symbol: string, timeRange: string): Promise<any[] | null> {
    const key = `historical_${symbol}_${timeRange}`;
    return await this.getPersistent(key);
  }

  // ============================================
  // API Response Caching
  // ============================================

  /**
   * Cache API response
   */
  cacheAPIResponse(url: string, response: any, ttl?: number): void {
    const key = `api_${this.hashString(url)}`;
    this.set(key, response, ttl);
  }

  /**
   * Get cached API response
   */
  getCachedAPIResponse(url: string): any | null {
    const key = `api_${this.hashString(url)}`;
    return this.get(key);
  }

  /**
   * Simple string hash for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // ============================================
  // Image Caching
  // ============================================

  /**
   * Cache image URL
   * Note: React Native handles image caching automatically via Image component
   * This is for tracking cached image URLs
   */
  cacheImageUrl(url: string): void {
    this.set(`image_${this.hashString(url)}`, { url, cached: true }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Check if image is cached
   */
  isImageCached(url: string): boolean {
    return this.has(`image_${this.hashString(url)}`);
  }

  // ============================================
  // Cache Management
  // ============================================

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((entry, key) => {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.memoryCache.delete(key));
  }

  /**
   * Start periodic cleanup
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Clean up every minute
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memorySize: number;
    memoryEntries: number;
  } {
    return {
      memorySize: this.memoryCache.size,
      memoryEntries: this.memoryCache.size,
    };
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.memoryCache.delete(key));
  }

  /**
   * Invalidate all price caches
   */
  invalidatePriceCache(): void {
    this.invalidatePattern('^price_');
  }

  /**
   * Invalidate all stock list caches
   */
  invalidateStockListCache(): void {
    this.invalidatePattern('^stocks_');
  }
}

