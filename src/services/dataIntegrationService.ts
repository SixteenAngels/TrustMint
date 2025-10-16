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
      
      // TODO: Implement actual GSE-API integration
      // This should make real API calls to fetch live stock data
      throw new Error('GSE-API integration not implemented - requires production API key');
    } catch (error) {
      console.error('Error fetching GSE-API data:', error);
      throw new Error('Failed to fetch data from GSE-API');
    }
  }

  // GSE Data Services Integration (Official Licensed)
  async fetchGSEDataServicesData(): Promise<Stock[]> {
    try {
      console.log('Fetching data from GSE Data Services...');
      
      // TODO: Implement actual GSE Data Services integration
      // This should make real API calls to the official GSE data service
      throw new Error('GSE Data Services integration not implemented - requires production API key');
    } catch (error) {
      console.error('Error fetching GSE Data Services data:', error);
      throw new Error('Failed to fetch data from GSE Data Services');
    }
  }

  // EODHD Integration (Fallback/Historical)
  async fetchEODHDData(): Promise<Stock[]> {
    try {
      console.log('Fetching data from EODHD...');
      
      // TODO: Implement actual EODHD integration
      // This should make real API calls to EODHD API
      throw new Error('EODHD integration not implemented - requires production API key');
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
    // TODO: Implement actual EODHD historical data API call
    throw new Error('EODHD historical data API not implemented - requires production integration');
  }

  private async fetchGSEAPIHistoricalData(symbol: string, period: string): Promise<any[]> {
    // TODO: Implement actual GSE-API historical data API call
    throw new Error('GSE-API historical data API not implemented - requires production integration');
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
    // TODO: Implement real accuracy calculation
    // This should compare data with known good sources or validate data integrity
    return 95; // Placeholder - should be calculated from actual data validation
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