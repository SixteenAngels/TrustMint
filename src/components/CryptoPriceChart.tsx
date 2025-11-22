// src/components/CryptoPriceChart.tsx
import React from 'react';
import { View, Text } from 'react-native';
// You can use a chart library like Victory or Recharts for real charts
// This is a placeholder for integration
const CryptoPriceChart = ({ symbol, prices }: { symbol: string; prices: number[] }) => (
  <View>
    <Text>{symbol} Price Chart</Text>
    {/* Render chart here */}
    <Text>Prices: {prices.join(', ')}</Text>
  </View>
);
export default CryptoPriceChart;
