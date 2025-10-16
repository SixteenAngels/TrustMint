import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, AccessibilityInfo } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { Stock } from '../types';

interface MarketTickerProps {
  stocks: Stock[];
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ stocks }) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    const start = async () => {
      const reduce = await AccessibilityInfo.isReduceMotionEnabled();
      if (reduce) return;
      animation = Animated.loop(
        Animated.timing(scrollX, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      );
      animation.start();
    };
    start();
    return () => {
      animation?.stop();
    };
  }, []);

  const formatPrice = (price: number) => {
    return `₵${price.toFixed(2)}`;
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '▲' : '▼';
    const color = change >= 0 ? colors.success : colors.error;
    return { sign, color, text: `${sign}${changePercent.toFixed(2)}%` };
  };

  const renderTickerItem = (stock: Stock, index: number) => {
    const change = formatChange(stock.change, stock.changePercent);
    
    return (
      <View key={stock.id} style={styles.tickerItem}>
        <Text style={styles.stockSymbol}>{stock.symbol}</Text>
        <Text style={styles.stockPrice}>{formatPrice(stock.price)}</Text>
        <Text style={[styles.stockChange, { color: change.color }]}>
          {change.text}
        </Text>
      </View>
    );
  };

  const translateX = scrollX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -400], // Adjust based on content width
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Market</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      
      <View style={styles.tickerContainer}>
        <Animated.View
          style={[
            styles.tickerContent,
            { transform: [{ translateX }] }
          ]}
        >
          {stocks.map(renderTickerItem)}
          {/* Duplicate for seamless loop */}
          {stocks.map(renderTickerItem)}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h6,
    color: colors.textPrimary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  liveText: {
    ...typography.captionMedium,
    color: colors.success,
    fontWeight: '600',
  },
  tickerContainer: {
    height: 40,
    overflow: 'hidden',
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    minWidth: 120,
  },
  stockSymbol: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  stockPrice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  stockChange: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
});