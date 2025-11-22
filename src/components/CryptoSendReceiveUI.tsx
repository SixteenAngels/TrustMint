// src/components/CryptoSendReceiveUI.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

interface Props {
  symbol: string;
  onSend: (amount: number, address: string) => void;
  onReceive: () => void;
}

const CryptoSendReceiveUI: React.FC<Props> = ({ symbol, onSend, onReceive }) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  return (
    <View>
      <Text>Send {symbol}</Text>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Recipient Address"
        value={address}
        onChangeText={setAddress}
      />
      <Button title="Send" onPress={() => onSend(Number(amount), address)} />
      <Text>Receive {symbol}</Text>
      <Button title="Show Receive Info" onPress={onReceive} />
    </View>
  );
};
export default CryptoSendReceiveUI;
