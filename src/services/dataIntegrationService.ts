import { Stock } from '../types';

// GSE-API Configuration
const GSE_API_BASE_URL = 'https://dev.kwayisi.org/apis/gse';
const GSE_API_ENDPOINTS = {
  live: '/live',
  historical: '/historical',
  companies: '/companies',
  sectors: '/sectors',
} as const;

// EODHD Configuration
const EODHD_API_BASE_URL = 'https://eodhd.com/api';
const EODHD_API_KEY = 'your-eodhd-api-key'; // Replace with actual API key

// GSE Data Services Configuration (Official)
const GSE_DATA_SERVICES_BASE_URL = 'https://api.gse.com.gh'; // Placeholder
const GSE_DATA_SERVICES_API_KEY = 'your-gse-data-services-key'; // Replace with actual API key

export interface DataSource {
  name: string;
  priority: number;
  isActive: boolean;
  lastUpdate: Date;
  reliability: number; // 0-100
}

export interface DataQuality {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  timeliness: number; // 0-100
  overall: number; // 0-100
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: Date;
  source: string;
  quality: DataQuality;
}

export class DataIntegrationService {
  private static instance: DataIntegrationService;
  private dataSources: DataSource[] = [];
  private fallbackOrder: string[] = ['gse-data-services', 'gse-api', 'eodhd'];

  static getInstance(): DataIntegrationService {
    if (!DataIntegrationService.instance) {
      DataIntegrationService.instance = new DataIntegrationService();
    }
    return DataIntegrationService.instance;
  }

  constructor() {
    this.initializeDataSources();
  }

  private initializeDataSources() {
    this.dataSources = [
      {
        name: 'gse-data-services',
        priority: 1,
        isActive: true,
        lastUpdate: new Date(),
        reliability: 95, // Official GSE data
      },
      {
        name: 'gse-api',
        priority: 2,
        isActive: true,
        lastUpdate: new Date(),
        reliability: 85, // Free API, good for MVP
      },
      {
        name: 'eodhd',
        priority: 3,
        isActive: true,
        lastUpdate: new Date(),
        reliability: 90, // Reliable fallback
      },
    ];
  }

  // GSE-API Integration (Free MVP/Prototyping)
  async fetchGSEAPIData(): Promise<Stock[]> {
    try {
      console.log('Fetching data from GSE-API...');
      
      // Mock implementation - replace with actual API call
      const mockData: Stock[] = [
        {
          id: 'MTN',
          symbol: 'MTN',
          name: 'MTN Ghana',
          price: 1.20,
          change: 0.05,
          changePercent: 4.35,
          volume: 1250000,
          high: 1.25,
          low: 1.15,
          open: 1.18,
          previousClose: 1.15,
          sector: 'Telecommunications',
          marketCap: 2500000000,
          pe: 15.2,
          dividend: 0.08,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        {
          id: 'CAL',
          symbol: 'CAL',
          name: 'CAL Bank',
          price: 0.85,
          change: -0.02,
          changePercent: -2.30,
          volume: 890000,
          high: 0.88,
          low: 0.83,
          open: 0.87,
          previousClose: 0.87,
          sector: 'Banking',
          marketCap: 850000000,
          pe: 12.8,
          dividend: 0.05,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        {
          id: 'GCB',
          symbol: 'GCB',
          name: 'GCB Bank',
          price: 4.10,
          change: 0.10,
          changePercent: 2.50,
          volume: 2100000,
          high: 4.15,
          low: 4.00,
          open: 4.05,
          previousClose: 4.00,
          sector: 'Banking',
          marketCap: 4100000000,
          pe: 18.5,
          dividend: 0.25,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        {
          id: 'SCB',
          symbol: 'SCB',
          name: 'Standard Chartered Bank',
          price: 2.50,
          change: 0.05,
          changePercent: 2.04,
          volume: 750000,
          high: 2.55,
          low: 2.45,
          open: 2.48,
          previousClose: 2.45,
          sector: 'Banking',
          marketCap: 1250000000,
          pe: 14.2,
          dividend: 0.15,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        {
          id: 'EGL',
          symbol: 'EGL',
          name: 'Enterprise Group',
          price: 0.95,
          change: -0.03,
          changePercent: -3.06,
          volume: 450000,
          high: 0.98,
          low: 0.92,
          open: 0.97,
          previousClose: 0.98,
          sector: 'Insurance',
          marketCap: 475000000,
          pe: 11.8,
          dividend: 0.06,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        {
          id: 'FML',
          symbol: 'FML',
          name: 'Fan Milk',
          price: 0.45,
          change: 0.02,
          changePercent: 4.65,
          volume: 320000,
          high: 0.47,
          low: 0.43,
          open: 0.44,
          previousClose: 0.43,
          sector: 'Manufacturing',
          marketCap: 225000000,
          pe: 9.5,
          dividend: 0.03,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        {
          id: 'TOTAL',
          symbol: 'TOTAL',
          name: 'Total Petroleum',
          price: 3.20,
          change: 0.08,
          changePercent: 2.56,
          volume: 680000,
          high: 3.25,
          low: 3.15,
          open: 3.18,
          previousClose: 3.12,
          sector: 'Oil & Gas',
          marketCap: 1600000000,
          pe: 16.8,
          dividend: 0.20,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        {
          id: 'GOIL',
          symbol: 'GOIL',
          name: 'Ghana Oil Company',
          price: 1.80,
          change: -0.05,
          changePercent: -2.70,
          volume: 540000,
          high: 1.85,
          low: 1.75,
          open: 1.82,
          previousClose: 1.85,
          sector: 'Oil & Gas',
          marketCap: 900000000,
          pe: 13.2,
          dividend: 0.12,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return mockData;
    } catch (error) {
      console.error('Error fetching GSE-API data:', error);
      throw new Error('Failed to fetch data from GSE-API');
    }
  }

  // GSE Data Services Integration (Official Licensed)
  async fetchGSEDataServicesData(): Promise<Stock[]> {
    try {
      console.log('Fetching data from GSE Data Services...');
      
      // This would be the actual implementation for official GSE data
      // For now, return enhanced mock data
      const officialData: Stock[] = [
        {
          id: 'MTN',
          symbol: 'MTN',
          name: 'MTN Ghana Limited',
          price: 1.20,
          change: 0.05,
          changePercent: 4.35,
          volume: 1250000,
          high: 1.25,
          low: 1.15,
          open: 1.18,
          previousClose: 1.15,
          sector: 'Telecommunications',
          marketCap: 2500000000,
          pe: 15.2,
          dividend: 0.08,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        // Add more official data...
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      return officialData;
    } catch (error) {
      console.error('Error fetching GSE Data Services data:', error);
      throw new Error('Failed to fetch data from GSE Data Services');
    }
  }

  // EODHD Integration (Fallback/Historical)
  async fetchEODHDData(): Promise<Stock[]> {
    try {
      console.log('Fetching data from EODHD...');
      
      // Mock implementation for EODHD
      const eodhdData: Stock[] = [
        {
          id: 'MTN',
          symbol: 'MTN',
          name: 'MTN Ghana',
          price: 1.19,
          change: 0.04,
          changePercent: 3.48,
          volume: 1200000,
          high: 1.24,
          low: 1.16,
          open: 1.17,
          previousClose: 1.15,
          sector: 'Telecommunications',
          marketCap: 2475000000,
          pe: 15.0,
          dividend: 0.08,
          updatedAt: new Date(),
          lastUpdated: new Date(),
        },
        // Add more EODHD data...
      ];

      await new Promise(resolve => setTimeout(resolve, 800));
      return eodhdData;
    } catch (error) {
      console.error('Error fetching EODHD data:', error);
      throw new Error('Failed to fetch data from EODHD');
    }
  }

  // Main data fetching method with fallback logic
  async fetchMarketData(): Promise<Stock[]> {
    const errors: string[] = [];
    
    for (const sourceName of this.fallbackOrder) {
      try {
        let data: Stock[] = [];
        
        switch (sourceName) {
          case 'gse-data-services':
            data = await this.fetchGSEDataServicesData();
            break;
          case 'gse-api':
            data = await this.fetchGSEAPIData();
            break;
          case 'eodhd':
            data = await this.fetchEODHDData();
            break;
          default:
            continue;
        }
        
        if (data && data.length > 0) {
          console.log(`Successfully fetched data from ${sourceName}`);
          this.updateDataSourceStatus(sourceName, true);
          return data;
        }
      } catch (error) {
        console.error(`Error fetching data from ${sourceName}:`, error);
        const message = (error as any)?.message || String(error);
        errors.push(`${sourceName}: ${message}`);
        this.updateDataSourceStatus(sourceName, false);
      }
    }
    
    throw new Error(`All data sources failed: ${errors.join(', ')}`);
  }

  // Historical data fetching
  async fetchHistoricalData(symbol: string, period: string): Promise<any[]> {
    try {
      // Try EODHD first for historical data
      const eodhdData = await this.fetchEODHDHistoricalData(symbol, period);
      if (eodhdData && eodhdData.length > 0) {
        return eodhdData;
      }
      
      // Fallback to GSE-API
      const gseData = await this.fetchGSEAPIHistoricalData(symbol, period);
      return gseData;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  private async fetchEODHDHistoricalData(symbol: string, period: string): Promise<any[]> {
    // Mock implementation
    const mockHistoricalData = [
      { date: '2024-01-01', open: 1.10, high: 1.15, low: 1.08, close: 1.12, volume: 1000000 },
      { date: '2024-01-02', open: 1.12, high: 1.18, low: 1.10, close: 1.16, volume: 1200000 },
      // Add more historical data...
    ];
    
    return mockHistoricalData;
  }

  private async fetchGSEAPIHistoricalData(symbol: string, period: string): Promise<any[]> {
    // Mock implementation
    const mockHistoricalData = [
      { date: '2024-01-01', open: 1.10, high: 1.15, low: 1.08, close: 1.12, volume: 1000000 },
      { date: '2024-01-02', open: 1.12, high: 1.18, low: 1.10, close: 1.16, volume: 1200000 },
      // Add more historical data...
    ];
    
    return mockHistoricalData;
  }

  // Data quality assessment
  assessDataQuality(data: Stock[]): DataQuality {
    if (!data || data.length === 0) {
      return {
        completeness: 0,
        accuracy: 0,
        timeliness: 0,
        overall: 0,
      };
    }

    const completeness = this.calculateCompleteness(data);
    const accuracy = this.calculateAccuracy(data);
    const timeliness = this.calculateTimeliness(data);
    
    const overall = (completeness + accuracy + timeliness) / 3;

    return {
      completeness,
      accuracy,
      timeliness,
      overall,
    };
  }

  private calculateCompleteness(data: Stock[]): number {
    const requiredFields = ['symbol', 'name', 'price', 'change', 'volume'];
    let totalFields = 0;
    let completeFields = 0;

    data.forEach(stock => {
      requiredFields.forEach(field => {
        totalFields++;
        if (stock[field as keyof Stock] !== undefined && stock[field as keyof Stock] !== null) {
          completeFields++;
        }
      });
    });

    return totalFields > 0 ? (completeFields / totalFields) * 100 : 0;
  }

  private calculateAccuracy(data: Stock[]): number {
    // Mock accuracy calculation
    // In real implementation, this would compare with known good data
    return 95;
  }

  private calculateTimeliness(data: Stock[]): number {
    const now = new Date();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    let timelyCount = 0;
    data.forEach(stock => {
      const last = stock.lastUpdated ?? stock.updatedAt ?? new Date();
      const age = now.getTime() - last.getTime();
      if (age <= maxAge) {
        timelyCount++;
      }
    });

    return data.length > 0 ? (timelyCount / data.length) * 100 : 0;
  }

  // Data source management
  private updateDataSourceStatus(sourceName: string, isActive: boolean) {
    const source = this.dataSources.find(s => s.name === sourceName);
    if (source) {
      source.isActive = isActive;
      source.lastUpdate = new Date();
    }
  }

  getDataSources(): DataSource[] {
    return [...this.dataSources];
  }

  getDataSourceStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.dataSources.forEach(source => {
      status[source.name] = source.isActive;
    });
    return status;
  }

  // Configuration methods
  setFallbackOrder(order: string[]) {
    this.fallbackOrder = order;
  }

  enableDataSource(sourceName: string) {
    const source = this.dataSources.find(s => s.name === sourceName);
    if (source) {
      source.isActive = true;
    }
  }

  disableDataSource(sourceName: string) {
    const source = this.dataSources.find(s => s.name === sourceName);
    if (source) {
      source.isActive = false;
    }
  }

  // API key management
  setEODHDAPIKey(apiKey: string) {
    // In real implementation, store securely
    console.log('EODHD API key updated');
  }

  setGSEDataServicesAPIKey(apiKey: string) {
    // In real implementation, store securely
    console.log('GSE Data Services API key updated');
  }
}