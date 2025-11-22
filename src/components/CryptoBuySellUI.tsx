// src/components/CryptoBuySellUI.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { CryptoAsset } from '../types/crypto';

interface Props {
  asset: CryptoAsset;
  onBuy: (amount: number) => void;
  onSell: (amount: number) => void;
}

const CryptoBuySellUI: React.FC<Props> = ({ asset, onBuy, onSell }) => {
  const [amount, setAmount] = useState('');
  return (
    <View>
      <Text>{asset.name} ({asset.symbol})</Text>
      <Text>Balance: {asset.amount}</Text>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Buy" onPress={() => onBuy(Number(amount))} />
      <Button title="Sell" onPress={() => onSell(Number(amount))} />
    </View>
  );
};
export default CryptoBuySellUI;
