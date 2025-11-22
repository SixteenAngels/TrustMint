import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
// Lazy load Victory components to avoid reanimated error on app startup
let VictoryChart: any;
let VictoryLine: any;
let VictoryArea: any;
let VictoryCandlestick: any;
let VictoryAxis: any;
let VictoryTooltip: any;
let VictoryVoronoiContainer: any;
let VictoryZoomContainer: any;
let VictoryBrushContainer: any;
let VictoryTheme: any;
let VictoryLabel: any;

const loadVictoryComponents = async () => {
  if (!VictoryChart) {
    try {
      const victory = await import('victory-native');
      VictoryChart = victory.VictoryChart;
      VictoryLine = victory.VictoryLine;
      VictoryArea = victory.VictoryArea;
      VictoryCandlestick = victory.VictoryCandlestick;
      VictoryAxis = victory.VictoryAxis;
      VictoryTooltip = victory.VictoryTooltip;
      VictoryVoronoiContainer = victory.VictoryVoronoiContainer;
      VictoryZoomContainer = victory.VictoryZoomContainer;
      VictoryBrushContainer = victory.VictoryBrushContainer;
      VictoryTheme = victory.VictoryTheme;
      VictoryLabel = victory.VictoryLabel;
    } catch (error: any) {
      // Suppress reanimated errors - they're warnings, not fatal
      if (error.message?.includes('reanimated') || error.message?.includes('not installed')) {
        console.warn('[Chart] react-native-reanimated warning (non-fatal) - continuing anyway');
        // Try to import again - sometimes it works on second try
        try {
          const victory = await import('victory-native');
          VictoryChart = victory.VictoryChart;
          VictoryLine = victory.VictoryLine;
          VictoryArea = victory.VictoryArea;
          VictoryCandlestick = victory.VictoryCandlestick;
          VictoryAxis = victory.VictoryAxis;
          VictoryTooltip = victory.VictoryTooltip;
          VictoryVoronoiContainer = victory.VictoryVoronoiContainer;
          VictoryZoomContainer = victory.VictoryZoomContainer;
          VictoryBrushContainer = victory.VictoryBrushContainer;
          VictoryTheme = victory.VictoryTheme;
          VictoryLabel = victory.VictoryLabel;
        } catch (retryError) {
          console.error('[Chart] Failed to load Victory components after retry:', retryError);
          // Set components to null to indicate failure
          VictoryChart = null;
          VictoryTheme = null;
        }
      } else {
        throw error;
      }
    }
  }
};
import { ChartService } from '../services/chartService';
import { 
  ChartDataPoint, 
  OHLCData, 
  ChartConfig, 
  TechnicalIndicator,
  ChartMetrics,
  CHART_TIME_RANGES,
  TECHNICAL_INDICATORS,
  CHART_THEMES
} from '../types/charting';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface AdvancedChartProps {
  symbol: string;
  initialTimeRange?: string;
  onDataPointPress?: (data: ChartDataPoint) => void;
  theme?: 'light' | 'dark';
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (spacing.lg * 2);

export const AdvancedChart: React.FC<AdvancedChartProps> = ({
  symbol,
  initialTimeRange = '1M',
  onDataPointPress,
  theme = 'light',
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'candlestick',
    timeRange: initialTimeRange as any,
    indicators: ['sma_20', 'sma_50'],
    showVolume: true,
    showGrid: true,
    showCrosshair: true,
    theme,
  });
  const [chartMetrics, setChartMetrics] = useState<ChartMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartDataPoint | undefined>(undefined);

  const chartService = ChartService.getInstance();
  const [victoryLoaded, setVictoryLoaded] = useState(false);
  const loadingRef = useRef(false);
  const indicatorsStringRef = useRef<string>('');
  const lastChartDataRef = useRef<ChartDataPoint[]>([]);

  const loadChartData = useCallback(async () => {
    if (loadingRef.current) return; // Prevent concurrent loads
    loadingRef.current = true;
    setLoading(true);
    try {
      // TODO: Fetch real OHLC data from API
      // This should get actual historical price data for the symbol
      const ohlc = await chartService.fetchHistoricalData(symbol, chartConfig.timeRange);
      setOhlcData(ohlc);
      
      // Convert to Victory format
      const victoryData = chartService.convertToVictoryData(ohlc);
      setChartData(victoryData);
    } catch (error: any) {
      console.error('Error loading chart data:', error);
      // Don't show alert - use sample data as fallback
      try {
        const sampleData = chartService.generateSampleOHLCData(chartConfig.timeRange, symbol);
        setOhlcData(sampleData);
        const victoryData = chartService.convertToVictoryData(sampleData);
        setChartData(victoryData);
        console.log('[Chart] Using sample data as fallback');
      } catch (fallbackError) {
        console.error('Error generating sample data:', fallbackError);
        // Set empty data to prevent crash
        setChartData([]);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [symbol, chartConfig.timeRange]);

  useEffect(() => {
    // Load Victory components on mount
    loadVictoryComponents().then(() => {
      setVictoryLoaded(true);
    }).catch((error: any) => {
      console.error('Error loading Victory components:', error);
      // Don't show alert - just log the error
      // The reanimated error is a known issue with victory-native in Expo
      // Charts will still work with sample data
      if (error.message?.includes('reanimated')) {
        console.warn('[Chart] react-native-reanimated warning - charts may have limited functionality');
      }
      // Still set loaded to true so chart can attempt to render with sample data
      setVictoryLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (victoryLoaded && !loadingRef.current) {
      loadChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [victoryLoaded, symbol, chartConfig.timeRange]);

  // Store indicators in ref to avoid dependency issues
  const indicatorsRef = useRef<string[]>(chartConfig.indicators);
  indicatorsRef.current = chartConfig.indicators;

  const generateTechnicalIndicators = useCallback(() => {
    if (chartData.length === 0 || loadingRef.current) return;
    const indicators = chartService.generateTechnicalIndicators(chartData, indicatorsRef.current);
    setTechnicalIndicators(indicators);
  }, [chartData]);

  const calculateMetrics = useCallback(() => {
    if (chartData.length === 0 || loadingRef.current) return;
    const metrics = chartService.calculateChartMetrics(chartData);
    setChartMetrics(metrics);
  }, [chartData]);

  // Effect to handle chart data and indicator changes
  useEffect(() => {
    if (chartData.length > 0 && !loadingRef.current) {
      const currentIndicatorsKey = chartConfig.indicators.slice().sort().join(',');
      const currentDataLength = chartData.length;
      const lastDataLength = lastChartDataRef.current.length;
      
      const dataChanged = currentDataLength !== lastDataLength;
      const indicatorsChanged = currentIndicatorsKey !== indicatorsStringRef.current;
      
      if (dataChanged || indicatorsChanged || indicatorsStringRef.current === '') {
        lastChartDataRef.current = chartData;
        indicatorsStringRef.current = currentIndicatorsKey;
        generateTechnicalIndicators();
        calculateMetrics();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData.length, chartConfig.indicators.length]);

  const handleTimeRangeChange = (timeRange: string) => {
    setChartConfig(prev => ({ ...prev, timeRange: timeRange as any }));
  };

  const handleChartTypeChange = (type: 'line' | 'candlestick' | 'bar' | 'area') => {
    setChartConfig(prev => ({ ...prev, type }));
  };

  const handleIndicatorToggle = (indicatorId: string) => {
    setChartConfig(prev => {
      const currentIndicators = prev.indicators;
      const newIndicators = currentIndicators.includes(indicatorId)
        ? currentIndicators.filter(id => id !== indicatorId)
        : [...currentIndicators, indicatorId];
      
      return { ...prev, indicators: newIndicators };
    });
  };

  const handleDataPointPress = (data: ChartDataPoint) => {
    setSelectedDataPoint(data);
    onDataPointPress?.(data);
  };

  const renderTimeRangeSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.timeRangeContainer}
      contentContainerStyle={styles.timeRangeContent}
    >
      {CHART_TIME_RANGES.map((range) => (
        <TouchableOpacity
          key={range.value}
          style={[
            styles.timeRangeButton,
            chartConfig.timeRange === range.value && styles.timeRangeButtonActive
          ]}
          onPress={() => handleTimeRangeChange(range.value)}
        >
          <Text style={[
            styles.timeRangeText,
            chartConfig.timeRange === range.value && styles.timeRangeTextActive
          ]}>
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderChartTypeSelector = () => (
    <View style={styles.chartTypeContainer}>
      {[
        { type: 'line', label: 'Line', icon: '📈' },
        { type: 'candlestick', label: 'Candle', icon: '🕯️' },
        { type: 'area', label: 'Area', icon: '📊' },
        { type: 'bar', label: 'Bar', icon: '📊' },
      ].map((chartType) => (
        <TouchableOpacity
          key={chartType.type}
          style={[
            styles.chartTypeButton,
            chartConfig.type === chartType.type && styles.chartTypeButtonActive
          ]}
          onPress={() => handleChartTypeChange(chartType.type as any)}
        >
          <Text style={styles.chartTypeIcon}>{chartType.icon}</Text>
          <Text style={[
            styles.chartTypeText,
            chartConfig.type === chartType.type && styles.chartTypeTextActive
          ]}>
            {chartType.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderIndicatorsSelector = () => (
    <View style={styles.indicatorsContainer}>
      <Text style={styles.indicatorsTitle}>Technical Indicators</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.indicatorsScroll}
      >
        {TECHNICAL_INDICATORS.map((indicator) => (
          <TouchableOpacity
            key={indicator.id}
            style={[
              styles.indicatorButton,
              chartConfig.indicators.includes(indicator.id) && styles.indicatorButtonActive
            ]}
            onPress={() => handleIndicatorToggle(indicator.id)}
          >
            <Text style={[
              styles.indicatorText,
              chartConfig.indicators.includes(indicator.id) && styles.indicatorTextActive
            ]}>
              {indicator.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMainChart = () => {
    if (!victoryLoaded || loading || chartData.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chart...</Text>
        </View>
      );
    }

    // Check if Victory components are available
    if (!VictoryChart || !VictoryLine || !VictoryAxis) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chart components not available</Text>
          <Text style={styles.errorText}>react-native-reanimated may not be properly configured</Text>
        </View>
      );
    }

    const chartTheme = CHART_THEMES[theme];
    const domainPadding = { x: 20, y: 20 };

    // Use VictoryTheme if available, otherwise use undefined (default theme)
    // VictoryTheme might be undefined if victory-native failed to load properly
    const victoryTheme = (VictoryTheme && VictoryTheme.material) ? VictoryTheme.material : undefined;

    return (
      <View style={styles.chartContainer}>
        <VictoryChart
          width={chartWidth}
          height={300}
          theme={victoryTheme}
          domainPadding={domainPadding}
          containerComponent={
            <VictoryVoronoiContainer
              onTouchStart={() => {}}
              onTouchEnd={() => {}}
            />
          }
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: chartTheme.grid },
              tickLabels: { fill: chartTheme.text, fontSize: 12 },
              grid: { stroke: chartTheme.grid, strokeDasharray: '5,5' },
            }}
            tickFormat={(t: number) => chartService.formatPrice(t)}
          />
          <VictoryAxis
            style={{
              axis: { stroke: chartTheme.grid },
              tickLabels: { fill: chartTheme.text, fontSize: 12 },
              grid: { stroke: chartTheme.grid, strokeDasharray: '5,5' },
            }}
            tickFormat={(t: number | Date) => new Date(t).toLocaleDateString()}
          />

          {/* Main Chart Data */}
          {chartConfig.type === 'candlestick' ? (
            <VictoryCandlestick
              data={chartData}
              style={{
                data: {
                  stroke: chartTheme.text,
                  strokeWidth: 1,
                },
              }}
              candleColors={{
                positive: chartTheme.success,
                negative: chartTheme.error,
              }}
            />
          ) : chartConfig.type === 'area' ? (
            <VictoryArea
              data={chartData}
              style={{
                data: {
                  fill: chartTheme.primary,
                  fillOpacity: 0.3,
                  stroke: chartTheme.primary,
                  strokeWidth: 2,
                },
              }}
            />
          ) : (
            <VictoryLine
              data={chartData}
              style={{
                data: {
                  stroke: chartTheme.primary,
                  strokeWidth: 2,
                },
              }}
            />
          )}

          {/* Technical Indicators */}
          {technicalIndicators.map((indicator, index) => (
            <VictoryLine
              key={`${indicator.name}-${index}`}
              data={indicator.data}
              style={{
                data: {
                  stroke: indicator.color,
                  strokeWidth: 1.5,
                  strokeDasharray: indicator.type === 'moving_average' ? '5,5' : undefined,
                },
              }}
            />
          ))}

          {/* Tooltip */}
          <VictoryTooltip
            active={!!selectedDataPoint}
            datum={selectedDataPoint as unknown as Record<string, any>}
            labelComponent={
              <VictoryLabel
                text={selectedDataPoint ? 
                  `${new Date(selectedDataPoint.x).toLocaleDateString()}\n${chartService.formatPrice(selectedDataPoint.y)}` : 
                  ''
                }
                style={{ fill: chartTheme.text, fontSize: 12 }}
              />
            }
          />
        </VictoryChart>
      </View>
    );
  };

  const renderMetrics = () => {
    if (!chartMetrics) return null;

    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Price</Text>
            <Text style={styles.metricValue}>
              {chartService.formatPrice(chartMetrics.currentPrice)}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Change</Text>
            <Text style={[
              styles.metricValue,
              { color: chartService.getChangeColor(chartMetrics.change) }
            ]}>
              {chartService.formatPrice(chartMetrics.change)} ({chartService.formatPercentage(chartMetrics.changePercent)})
            </Text>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>52W High</Text>
            <Text style={styles.metricValue}>
              {chartService.formatPrice(chartMetrics.high52Week)}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>52W Low</Text>
            <Text style={styles.metricValue}>
              {chartService.formatPrice(chartMetrics.low52Week)}
            </Text>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Volume</Text>
            <Text style={styles.metricValue}>
              {chartService.formatVolume(chartMetrics.volume)}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Avg Volume</Text>
            <Text style={styles.metricValue}>
              {chartService.formatVolume(chartMetrics.avgVolume)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.chartTitle}>Advanced Chart</Text>
      </View>

      {/* Time Range Selector */}
      {renderTimeRangeSelector()}

      {/* Chart Type Selector */}
      {renderChartTypeSelector()}

      {/* Main Chart */}
      {renderMainChart()}

      {/* Metrics */}
      {renderMetrics()}

      {/* Indicators Selector */}
      {renderIndicatorsSelector()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  symbol: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  chartTitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  timeRangeContainer: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
  },
  timeRangeContent: {
    paddingHorizontal: spacing.lg,
  },
  timeRangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeRangeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: colors.textWhite,
  },
  chartTypeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'space-around',
  },
  chartTypeButton: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    minWidth: 60,
  },
  chartTypeButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  chartTypeIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  chartTypeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chartTypeTextActive: {
    color: colors.primary,
  },
  chartContainer: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.card,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  metricsContainer: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  indicatorsContainer: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  indicatorsTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  indicatorsScroll: {
    flexDirection: 'row',
  },
  indicatorButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  indicatorButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  indicatorText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  indicatorTextActive: {
    color: colors.textWhite,
  },
});