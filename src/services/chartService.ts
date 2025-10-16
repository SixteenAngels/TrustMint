import { 
  ChartDataPoint, 
  OHLCData, 
  TechnicalIndicator, 
  MovingAverage, 
  RSI, 
  MACD, 
  BollingerBands,
  ChartMetrics,
  CHART_TIME_RANGES,
  TECHNICAL_INDICATORS
} from '../types/charting';

export class ChartService {
  private static instance: ChartService;

  static getInstance(): ChartService {
    if (!ChartService.instance) {
      ChartService.instance = new ChartService();
    }
    return ChartService.instance;
  }

  // Generate sample OHLC data for demonstration
  generateSampleOHLCData(timeRange: string, symbol: string): OHLCData[] {
    const days = CHART_TIME_RANGES.find(range => range.value === timeRange)?.days ?? 30;
    const dataPoints = days === 0 ? 1000 : Math.min(days * 24, 1000); // Max 1000 points
    const data: OHLCData[] = [];
    
    let basePrice = this.getBasePrice(symbol);
    let currentPrice = basePrice;
    const now = Date.now();
    const interval = days === 0 ? 24 * 60 * 60 * 1000 : (days * 24 * 60 * 60 * 1000) / dataPoints;

    for (let i = 0; i < dataPoints; i++) {
      const timestamp = now - (dataPoints - i) * interval;
      
      // Generate realistic price movement
      const volatility = 0.02; // 2% volatility
      const trend = Math.sin(i / 50) * 0.001; // Slight trend
      const random = (Math.random() - 0.5) * volatility;
      const change = trend + random;
      
      const open = currentPrice;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 1000000) + 100000;

      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      });

      currentPrice = close;
    }

    return data;
  }

  // Convert OHLC data to Victory Native format
  convertToVictoryData(ohlcData: OHLCData[]): ChartDataPoint[] {
    return ohlcData.map((point, index) => ({
      x: new Date(point.timestamp),
      y: point.close,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
      timestamp: point.timestamp,
    }));
  }

  // Calculate Simple Moving Average
  calculateSMA(data: ChartDataPoint[], period: number): ChartDataPoint[] {
    const sma: ChartDataPoint[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, point) => acc + point.y, 0);
      const average = sum / period;
      
      sma.push({
        x: data[i].x,
        y: average,
        timestamp: data[i].timestamp,
      });
    }
    
    return sma;
  }

  // Calculate Exponential Moving Average
  calculateEMA(data: ChartDataPoint[], period: number): ChartDataPoint[] {
    const ema: ChartDataPoint[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA value is the first data point
    ema.push({
      x: data[0].x,
      y: data[0].y,
      timestamp: data[0].timestamp,
    });
    
    for (let i = 1; i < data.length; i++) {
      const prevEMA = ema[i - 1].y;
      const currentPrice = data[i].y;
      const newEMA = (currentPrice - prevEMA) * multiplier + prevEMA;
      
      ema.push({
        x: data[i].x,
        y: newEMA,
        timestamp: data[i].timestamp,
      });
    }
    
    return ema;
  }

  // Calculate RSI (Relative Strength Index)
  calculateRSI(data: ChartDataPoint[], period: number = 14): RSI {
    const rsi: ChartDataPoint[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const change = data[i].y - data[i - 1].y;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
    
    // Calculate RSI for the first period
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiValue = 100 - (100 / (1 + rs));
    
    rsi.push({
      x: data[period].x,
      y: rsiValue,
      timestamp: data[period].timestamp,
    });
    
    // Calculate RSI for remaining periods
    for (let i = period + 1; i < data.length; i++) {
      const gain = gains[i - 1];
      const loss = losses[i - 1];
      
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      
      rsi.push({
        x: data[i].x,
        y: rsiValue,
        timestamp: data[i].timestamp,
      });
    }
    
    return {
      period,
      data: rsi,
      overbought: 70,
      oversold: 30,
    };
  }

  // Calculate MACD (Moving Average Convergence Divergence)
  calculateMACD(data: ChartDataPoint[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): MACD {
    const ema12 = this.calculateEMA(data, fastPeriod);
    const ema26 = this.calculateEMA(data, slowPeriod);
    
    // Calculate MACD line
    const macdLine: ChartDataPoint[] = [];
    const startIndex = Math.max(fastPeriod, slowPeriod) - 1;
    
    for (let i = startIndex; i < data.length; i++) {
      const macdValue = ema12[i - startIndex].y - ema26[i - startIndex].y;
      macdLine.push({
        x: data[i].x,
        y: macdValue,
        timestamp: data[i].timestamp,
      });
    }
    
    // Calculate signal line (EMA of MACD)
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    
    // Calculate histogram
    const histogram: ChartDataPoint[] = [];
    const signalStartIndex = signalPeriod - 1;
    
    for (let i = signalStartIndex; i < macdLine.length; i++) {
      const histogramValue = macdLine[i].y - signalLine[i - signalStartIndex].y;
      histogram.push({
        x: macdLine[i].x,
        y: histogramValue,
        timestamp: macdLine[i].timestamp,
      });
    }
    
    return {
      fastPeriod,
      slowPeriod,
      signalPeriod,
      macdLine,
      signalLine,
      histogram,
    };
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(data: ChartDataPoint[], period: number = 20, standardDeviation: number = 2): BollingerBands {
    const sma = this.calculateSMA(data, period);
    const upperBand: ChartDataPoint[] = [];
    const lowerBand: ChartDataPoint[] = [];
    
    for (let i = 0; i < sma.length; i++) {
      const dataIndex = i + period - 1;
      const slice = data.slice(dataIndex - period + 1, dataIndex + 1);
      
      // Calculate standard deviation
      const mean = sma[i].y;
      const variance = slice.reduce((sum, point) => sum + Math.pow(point.y - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      const upper = mean + (standardDeviation * stdDev);
      const lower = mean - (standardDeviation * stdDev);
      
      upperBand.push({
        x: sma[i].x,
        y: upper,
        timestamp: sma[i].timestamp,
      });
      
      lowerBand.push({
        x: sma[i].x,
        y: lower,
        timestamp: sma[i].timestamp,
      });
    }
    
    return {
      period,
      standardDeviation,
      upperBand,
      middleBand: sma,
      lowerBand,
    };
  }

  // Calculate chart metrics
  calculateChartMetrics(data: ChartDataPoint[]): ChartMetrics {
    if (data.length === 0) {
      return {
        currentPrice: 0,
        change: 0,
        changePercent: 0,
        high52Week: 0,
        low52Week: 0,
        volume: 0,
        avgVolume: 0,
      };
    }

    const currentPrice = data[data.length - 1].y;
    const previousPrice = data.length > 1 ? data[data.length - 2].y : currentPrice;
    const change = currentPrice - previousPrice;
    const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
    
    const prices = data.map(point => point.y);
    const high52Week = Math.max(...prices);
    const low52Week = Math.min(...prices);
    
    const volumes = data.map(point => point.volume || 0);
    const volume = volumes[volumes.length - 1];
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;

    return {
      currentPrice,
      change,
      changePercent,
      high52Week,
      low52Week,
      volume,
      avgVolume,
    };
  }

  // Get base price for different symbols
  private getBasePrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'MTN': 1.20,
      'CAL': 0.85,
      'GCB': 4.10,
      'SCB': 2.50,
      'EGL': 0.95,
      'FML': 0.45,
      'TOTAL': 3.20,
      'GOIL': 1.80,
    };
    
    return basePrices[symbol] || 1.00;
  }

  // Format price for display
  formatPrice(price: number): string {
    return `₵${price.toFixed(2)}`;
  }

  // Format percentage for display
  formatPercentage(percent: number): string {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  }

  // Format volume for display
  formatVolume(volume: number): string {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  }

  // Get color for price change
  getChangeColor(change: number): string {
    if (change > 0) return '#10B981'; // Green
    if (change < 0) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  }

  // Generate technical indicators based on configuration
  generateTechnicalIndicators(data: ChartDataPoint[], indicators: string[]): TechnicalIndicator[] {
    const result: TechnicalIndicator[] = [];
    
    indicators.forEach(indicatorId => {
      const indicator = TECHNICAL_INDICATORS.find(ind => ind.id === indicatorId);
      if (!indicator) return;
      
      let indicatorData: ChartDataPoint[] = [];
      let color = '#00B67A';
      
      switch (indicatorId) {
        case 'sma_20':
          indicatorData = this.calculateSMA(data, 20);
          color = '#3B82F6';
          break;
        case 'sma_50':
          indicatorData = this.calculateSMA(data, 50);
          color = '#8B5CF6';
          break;
        case 'ema_12':
          indicatorData = this.calculateEMA(data, 12);
          color = '#F59E0B';
          break;
        case 'ema_26':
          indicatorData = this.calculateEMA(data, 26);
          color = '#EF4444';
          break;
        case 'rsi':
          const rsi = this.calculateRSI(data, 14);
          indicatorData = rsi.data;
          color = '#10B981';
          break;
        case 'macd':
          const macd = this.calculateMACD(data, 12, 26, 9);
          indicatorData = macd.macdLine;
          color = '#8B5CF6';
          break;
        case 'bollinger':
          const bb = this.calculateBollingerBands(data, 20, 2);
          indicatorData = bb.upperBand;
          color = '#F59E0B';
          break;
        case 'volume':
          indicatorData = data.map(point => ({
            x: point.x,
            y: point.volume || 0,
            timestamp: point.timestamp,
          }));
          color = '#6B7280';
          break;
      }
      
      if (indicatorData.length > 0) {
        result.push({
          name: indicator.name,
          type: indicator.type as any,
          data: indicatorData,
          color,
          period: indicator.period,
        });
      }
    });
    
    return result;
  }
}