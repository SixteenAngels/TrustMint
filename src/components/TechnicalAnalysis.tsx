import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import V from 'victory-native';
const {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
} = V;
import { ChartService } from '../services/chartService';
import { 
  ChartDataPoint, 
  RSI, 
  MACD, 
  BollingerBands,
  TECHNICAL_INDICATORS
} from '../types/charting';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface TechnicalAnalysisProps {
  symbol: string;
  timeRange?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (spacing.lg * 2);

export const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({
  symbol,
  timeRange = '1M',
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [rsi, setRsi] = useState<RSI | null>(null);
  const [macd, setMacd] = useState<MACD | null>(null);
  const [bollingerBands, setBollingerBands] = useState<BollingerBands | null>(null);
  const [activeIndicator, setActiveIndicator] = useState<string>('rsi');
  const [loading, setLoading] = useState(true);

  const chartService = ChartService.getInstance();

  useEffect(() => {
    loadTechnicalData();
  }, [symbol, timeRange]);

  const loadTechnicalData = async () => {
    setLoading(true);
    try {
      // TODO: Fetch real OHLC data from API
      // This should get actual historical price data for the symbol
      const ohlcData = await chartService.fetchHistoricalData(symbol, timeRange);
      const victoryData = chartService.convertToVictoryData(ohlcData);
      setChartData(victoryData);

      // Calculate technical indicators
      const rsiData = chartService.calculateRSI(victoryData, 14);
      setRsi(rsiData);

      const macdData = chartService.calculateMACD(victoryData, 12, 26, 9);
      setMacd(macdData);

      const bbData = chartService.calculateBollingerBands(victoryData, 20, 2);
      setBollingerBands(bbData);
    } catch (error) {
      console.error('Error loading technical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderIndicatorSelector = () => (
    <View style={styles.indicatorSelector}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.indicatorSelectorContent}
      >
        {[
          { id: 'rsi', name: 'RSI', description: 'Momentum Oscillator' },
          { id: 'macd', name: 'MACD', description: 'Trend Following' },
          { id: 'bollinger', name: 'Bollinger Bands', description: 'Volatility' },
        ].map((indicator) => (
          <TouchableOpacity
            key={indicator.id}
            style={[
              styles.indicatorButton,
              activeIndicator === indicator.id && styles.indicatorButtonActive
            ]}
            onPress={() => setActiveIndicator(indicator.id)}
          >
            <Text style={[
              styles.indicatorName,
              activeIndicator === indicator.id && styles.indicatorNameActive
            ]}>
              {indicator.name}
            </Text>
            <Text style={[
              styles.indicatorDescription,
              activeIndicator === indicator.id && styles.indicatorDescriptionActive
            ]}>
              {indicator.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRSIChart = () => {
    if (!rsi || rsi.data.length === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <VictoryChart
          width={chartWidth}
          height={200}
          theme={VictoryTheme.material}
          domain={{ y: [0, 100] }}
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
              grid: { stroke: colors.border, strokeDasharray: '5,5' },
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
            }}
          />

          {/* RSI Line */}
          <VictoryLine
            data={rsi.data}
            style={{
              data: {
                stroke: colors.primary,
                strokeWidth: 2,
              },
            }}
          />

          {/* Overbought Line */}
          <VictoryLine
            data={rsi.data.map(point => ({ ...point, y: rsi.overbought }))}
            style={{
              data: {
                stroke: colors.error,
                strokeWidth: 1,
                strokeDasharray: '5,5',
              },
            }}
          />

          {/* Oversold Line */}
          <VictoryLine
            data={rsi.data.map(point => ({ ...point, y: rsi.oversold }))}
            style={{
              data: {
                stroke: colors.success,
                strokeWidth: 1,
                strokeDasharray: '5,5',
              },
            }}
          />

          {/* Overbought Area */}
          <VictoryArea
            data={[
              { x: rsi.data[0]?.x, y: rsi.overbought },
              ...rsi.data.map(point => ({ x: point.x, y: rsi.overbought })),
              { x: rsi.data[rsi.data.length - 1]?.x, y: rsi.overbought },
            ]}
            style={{
              data: {
                fill: colors.error,
                fillOpacity: 0.1,
              },
            }}
          />

          {/* Oversold Area */}
          <VictoryArea
            data={[
              { x: rsi.data[0]?.x, y: 0 },
              ...rsi.data.map(point => ({ x: point.x, y: rsi.oversold })),
              { x: rsi.data[rsi.data.length - 1]?.x, y: rsi.oversold },
            ]}
            style={{
              data: {
                fill: colors.success,
                fillOpacity: 0.1,
              },
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  const renderMACDChart = () => {
    if (!macd || macd.macdLine.length === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <VictoryChart
          width={chartWidth}
          height={200}
          theme={VictoryTheme.material}
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
              grid: { stroke: colors.border, strokeDasharray: '5,5' },
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
            }}
          />

          {/* MACD Line */}
          <VictoryLine
            data={macd.macdLine}
            style={{
              data: {
                stroke: colors.primary,
                strokeWidth: 2,
              },
            }}
          />

          {/* Signal Line */}
          <VictoryLine
            data={macd.signalLine}
            style={{
              data: {
                stroke: colors.warning,
                strokeWidth: 2,
              },
            }}
          />

          {/* Histogram */}
          <VictoryArea
            data={macd.histogram}
            style={{
              data: {
                fill: colors.textSecondary,
                fillOpacity: 0.3,
              },
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  const renderBollingerBandsChart = () => {
    if (!bollingerBands || bollingerBands.upperBand.length === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <VictoryChart
          width={chartWidth}
          height={200}
          theme={VictoryTheme.material}
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
              grid: { stroke: colors.border, strokeDasharray: '5,5' },
            }}
            tickFormat={(t: any) => chartService.formatPrice(t)}
          />
          <VictoryAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
            }}
          />

          {/* Upper Band */}
          <VictoryLine
            data={bollingerBands.upperBand}
            style={{
              data: {
                stroke: colors.error,
                strokeWidth: 1,
              },
            }}
          />

          {/* Middle Band (SMA) */}
          <VictoryLine
            data={bollingerBands.middleBand}
            style={{
              data: {
                stroke: colors.primary,
                strokeWidth: 2,
              },
            }}
          />

          {/* Lower Band */}
          <VictoryLine
            data={bollingerBands.lowerBand}
            style={{
              data: {
                stroke: colors.success,
                strokeWidth: 1,
              },
            }}
          />

          {/* Price Line */}
          <VictoryLine
            data={chartData}
            style={{
              data: {
                stroke: colors.textPrimary,
                strokeWidth: 1.5,
              },
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  const renderAnalysisSummary = () => {
    if (!rsi || !macd || !bollingerBands) return null;

    const currentRSI = rsi.data[rsi.data.length - 1]?.y || 0;
    const currentMACD = macd.macdLine[macd.macdLine.length - 1]?.y || 0;
    const currentSignal = macd.signalLine[macd.signalLine.length - 1]?.y || 0;
    const currentPrice = chartData[chartData.length - 1]?.y || 0;
    const upperBand = bollingerBands.upperBand[bollingerBands.upperBand.length - 1]?.y || 0;
    const lowerBand = bollingerBands.lowerBand[bollingerBands.lowerBand.length - 1]?.y || 0;

    const rsiSignal = currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral';
    const macdSignal = currentMACD > currentSignal ? 'Bullish' : 'Bearish';
    const bbSignal = currentPrice > upperBand ? 'Overbought' : currentPrice < lowerBand ? 'Oversold' : 'Neutral';

    return (
      <View style={styles.analysisSummary}>
        <Text style={styles.summaryTitle}>Technical Analysis Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>RSI ({currentRSI.toFixed(1)})</Text>
            <Text style={[
              styles.summaryValue,
              { color: rsiSignal === 'Overbought' ? colors.error : 
                       rsiSignal === 'Oversold' ? colors.success : colors.textSecondary }
            ]}>
              {rsiSignal}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>MACD</Text>
            <Text style={[
              styles.summaryValue,
              { color: macdSignal === 'Bullish' ? colors.success : colors.error }
            ]}>
              {macdSignal}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Bollinger Bands</Text>
            <Text style={[
              styles.summaryValue,
              { color: bbSignal === 'Overbought' ? colors.error : 
                       bbSignal === 'Oversold' ? colors.success : colors.textSecondary }
            ]}>
              {bbSignal}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading technical analysis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Technical Analysis</Text>
      
      {renderIndicatorSelector()}
      
      {activeIndicator === 'rsi' && renderRSIChart()}
      {activeIndicator === 'macd' && renderMACDChart()}
      {activeIndicator === 'bollinger' && renderBollingerBandsChart()}
      
      {renderAnalysisSummary()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  indicatorSelector: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
  },
  indicatorSelectorContent: {
    paddingHorizontal: spacing.lg,
  },
  indicatorButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minWidth: 120,
  },
  indicatorButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  indicatorName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  indicatorNameActive: {
    color: colors.textWhite,
  },
  indicatorDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  indicatorDescriptionActive: {
    color: colors.textWhite,
  },
  chartContainer: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.card,
  },
  analysisSummary: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  summaryTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
});