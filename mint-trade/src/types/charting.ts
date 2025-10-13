// Chart Data Types
export interface ChartDataPoint {
  x: number | string | Date;
  y: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  timestamp?: number;
}

export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  type: 'moving_average' | 'oscillator' | 'trend' | 'volume' | 'momentum';
  data: ChartDataPoint[];
  color: string;
  period?: number;
}

// Chart Configuration
export interface ChartConfig {
  type: 'line' | 'candlestick' | 'bar' | 'area';
  timeRange: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';
  indicators: string[];
  showVolume: boolean;
  showGrid: boolean;
  showCrosshair: boolean;
  theme: 'light' | 'dark';
}

// Technical Analysis Types
export interface MovingAverage {
  period: number;
  type: 'SMA' | 'EMA' | 'WMA';
  data: ChartDataPoint[];
  color: string;
}

export interface RSI {
  period: number;
  data: ChartDataPoint[];
  overbought: number;
  oversold: number;
}

export interface MACD {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  macdLine: ChartDataPoint[];
  signalLine: ChartDataPoint[];
  histogram: ChartDataPoint[];
}

export interface BollingerBands {
  period: number;
  standardDeviation: number;
  upperBand: ChartDataPoint[];
  middleBand: ChartDataPoint[];
  lowerBand: ChartDataPoint[];
}

export interface VolumeProfile {
  data: ChartDataPoint[];
  color: string;
  opacity: number;
}

// Chart Interaction
export interface ChartInteraction {
  type: 'hover' | 'click' | 'zoom' | 'pan';
  data?: ChartDataPoint;
  position?: { x: number; y: number };
  timestamp?: number;
}

// Chart Performance Metrics
export interface ChartMetrics {
  currentPrice: number;
  change: number;
  changePercent: number;
  high52Week: number;
  low52Week: number;
  volume: number;
  avgVolume: number;
  marketCap?: number;
  pe?: number;
  dividend?: number;
}

// Chart Time Range Options
export const CHART_TIME_RANGES = [
  { label: '1D', value: '1D', days: 1 },
  { label: '5D', value: '5D', days: 5 },
  { label: '1M', value: '1M', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '6M', value: '6M', days: 180 },
  { label: '1Y', value: '1Y', days: 365 },
  { label: '5Y', value: '5Y', days: 1825 },
  { label: 'ALL', value: 'ALL', days: 0 },
] as const;

// Technical Indicators Available
export const TECHNICAL_INDICATORS = [
  { id: 'sma_20', name: 'SMA 20', type: 'moving_average', period: 20 },
  { id: 'sma_50', name: 'SMA 50', type: 'moving_average', period: 50 },
  { id: 'ema_12', name: 'EMA 12', type: 'moving_average', period: 12 },
  { id: 'ema_26', name: 'EMA 26', type: 'moving_average', period: 26 },
  { id: 'rsi', name: 'RSI', type: 'oscillator', period: 14 },
  { id: 'macd', name: 'MACD', type: 'oscillator', period: 12 },
  { id: 'bollinger', name: 'Bollinger Bands', type: 'trend', period: 20 },
  { id: 'volume', name: 'Volume', type: 'volume', period: 0 },
] as const;

// Chart Themes
export const CHART_THEMES = {
  light: {
    background: '#FFFFFF',
    grid: '#E5E7EB',
    text: '#1F2937',
    primary: '#00B67A',
    secondary: '#0F172A',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  dark: {
    background: '#0F172A',
    grid: '#374151',
    text: '#F9FAFB',
    primary: '#00B67A',
    secondary: '#F9FAFB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
} as const;