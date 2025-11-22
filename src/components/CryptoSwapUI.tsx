// src/components/CryptoSwapUI.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

interface Props {
  fromSymbol: string;
  toSymbol: string;
  onSwap: (fromAmount: number, toSymbol: string) => void;
}

const CryptoSwapUI: React.FC<Props> = ({ fromSymbol, toSymbol, onSwap }) => {
  const [amount, setAmount] = useState('');
  return (
    <View>
      <Text>Swap {fromSymbol} to {toSymbol}</Text>
      <TextInput
        placeholder={`Amount of ${fromSymbol}`}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title={`Swap to ${toSymbol}`} onPress={() => onSwap(Number(amount), toSymbol)} />
    </View>
  );
};
export default CryptoSwapUI;
