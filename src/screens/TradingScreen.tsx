import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { StockService } from '../services/stockService';
import { Stock } from '../types';

interface TradingScreenProps {
  stock?: Stock;
  onClose: () => void;
}

export const TradingScreen: React.FC<TradingScreenProps> = ({ stock, onClose }) => {
  const { user } = useAuth();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(stock || null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);

  const stockService = StockService.getInstance();

  useEffect(() => {
    loadStocks();
    if (selectedStock) {
      setPrice(selectedStock.price.toString());
    }
  }, []);

  const loadStocks = async () => {
    try {
      const stocksData = await stockService.getStocks();
      setStocks(stocksData);
    } catch (error) {
      console.error('Error loading stocks:', error);
    }
  };

  const handleStockSelect = (selectedStock: Stock) => {
    setSelectedStock(selectedStock);
    setPrice(selectedStock.price.toString());
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const priceValue = parseFloat(price) || 0;
    return qty * priceValue;
  };

  const calculateMaxQuantity = () => {
    if (!user || !selectedStock) return 0;
    
    if (tradeType === 'buy') {
      return Math.floor(user.balance / selectedStock.price);
    } else {
      // For sell, we need to check portfolio
      // This would require portfolio data - simplified for now
      return 0;
    }
  };

  const handleTrade = async () => {
    if (!selectedStock || !user) {
      Alert.alert('Error', 'Please select a stock and ensure you are logged in');
      return;
    }

    const qty = parseFloat(quantity);
    const priceValue = parseFloat(price);

    if (qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const total = calculateTotal();

    if (tradeType === 'buy' && total > user.balance) {
      Alert.alert('Error', 'Insufficient balance for this trade');
      return;
    }

    setLoading(true);
    try {
      await stockService.executeTrade(
        user.uid,
        selectedStock.id,
        tradeType,
        qty,
        priceValue
      );

      Alert.alert(
        'Trade Successful',
        `${tradeType.toUpperCase()} order placed for ${qty} shares of ${selectedStock.symbol} at ₵${priceValue.toFixed(2)}`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Error executing trade:', error);
      Alert.alert('Error', 'Failed to execute trade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStockSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Stock</Text>
      <ScrollView style={styles.stockList} showsVerticalScrollIndicator={false}>
        {stocks.map((stockItem) => (
          <TouchableOpacity
            key={stockItem.id}
            style={[
              styles.stockItem,
              selectedStock?.id === stockItem.id && styles.selectedStockItem
            ]}
            onPress={() => handleStockSelect(stockItem)}
          >
            <View style={styles.stockInfo}>
              <Text style={styles.stockSymbol}>{stockItem.symbol}</Text>
              <Text style={styles.stockName}>{stockItem.name}</Text>
            </View>
            <View style={styles.stockPrice}>
              <Text style={styles.price}>₵{stockItem.price.toFixed(2)}</Text>
              <Text style={[
                styles.change,
                { color: stockItem.change >= 0 ? '#34C759' : '#FF3B30' }
              ]}>
                {stockItem.change >= 0 ? '+' : ''}{stockItem.changePercent.toFixed(2)}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTradeForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trade Details</Text>
      
      {/* Trade Type Toggle */}
      <View style={styles.tradeTypeContainer}>
        <TouchableOpacity
          style={[
            styles.tradeTypeButton,
            tradeType === 'buy' && styles.tradeTypeButtonActive
          ]}
          onPress={() => setTradeType('buy')}
        >
          <Text style={[
            styles.tradeTypeText,
            tradeType === 'buy' && styles.tradeTypeTextActive
          ]}>
            BUY
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tradeTypeButton,
            tradeType === 'sell' && styles.tradeTypeButtonActive
          ]}
          onPress={() => setTradeType('sell')}
        >
          <Text style={[
            styles.tradeTypeText,
            tradeType === 'sell' && styles.tradeTypeTextActive
          ]}>
            SELL
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quantity Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <Text style={styles.helperText}>
          Max: {calculateMaxQuantity()} shares
        </Text>
      </View>

      {/* Price Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Price per Share</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>

      {/* Total Calculation */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>₵{calculateTotal().toFixed(2)}</Text>
      </View>

      {/* Balance Info */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₵{user?.balance.toFixed(2) || '0.00'}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Trade Stocks</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {renderStockSelector()}
        {selectedStock && renderTradeForm()}
      </ScrollView>

      {selectedStock && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.tradeButton,
              loading && styles.tradeButtonDisabled
            ]}
            onPress={handleTrade}
            disabled={loading || !quantity || !price}
          >
            <Text style={styles.tradeButtonText}>
              {loading ? 'Processing...' : `${tradeType.toUpperCase()} ${selectedStock.symbol}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  stockList: {
    maxHeight: 200,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedStockItem: {
    backgroundColor: '#e3f2fd',
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  stockName: {
    fontSize: 14,
    color: '#666',
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  tradeTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tradeTypeButtonActive: {
    backgroundColor: '#007AFF',
  },
  tradeTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tradeTypeTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tradeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  tradeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  tradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});