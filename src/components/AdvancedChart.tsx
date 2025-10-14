import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryCandlestick,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryZoomContainer,
  VictoryBrushContainer,
  VictoryTheme,
  VictoryLabel,
} from 'victory-native';
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
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartDataPoint | undefined>();

  const chartService = ChartService.getInstance();

  useEffect(() => {
    loadChartData();
  }, [symbol, chartConfig.timeRange]);

  useEffect(() => {
    if (chartData.length > 0) {
      generateTechnicalIndicators();
      calculateMetrics();
    }
  }, [chartData, chartConfig.indicators]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      // Generate sample OHLC data
      const ohlc = chartService.generateSampleOHLCData(chartConfig.timeRange, symbol);
      setOhlcData(ohlc);
      
      // Convert to Victory format
      const victoryData = chartService.convertToVictoryData(ohlc);
      setChartData(victoryData);
    } catch (error) {
      console.error('Error loading chart data:', error);
      Alert.alert('Error', 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const generateTechnicalIndicators = () => {
    const indicators = chartService.generateTechnicalIndicators(chartData, chartConfig.indicators);
    setTechnicalIndicators(indicators);
  };

  const calculateMetrics = () => {
    const metrics = chartService.calculateChartMetrics(chartData);
    setChartMetrics(metrics);
  };

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
    if (loading || chartData.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chart...</Text>
        </View>
      );
    }

    const chartTheme = CHART_THEMES[theme];
    const domainPadding = { x: 20, y: 20 };

    return (
      <View style={styles.chartContainer}>
        <VictoryChart
          width={chartWidth}
          height={300}
          theme={VictoryTheme.material}
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
            tickFormat={(t) => chartService.formatPrice(t)}
          />
          <VictoryAxis
            style={{
              axis: { stroke: chartTheme.grid },
              tickLabels: { fill: chartTheme.text, fontSize: 12 },
              grid: { stroke: chartTheme.grid, strokeDasharray: '5,5' },
            }}
            tickFormat={(t) => new Date(t).toLocaleDateString()}
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
            datum={selectedDataPoint}
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
