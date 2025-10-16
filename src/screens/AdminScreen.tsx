import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { Stock, User } from '../types';

export const AdminScreen: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stocks' | 'users'>('stocks');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stocksSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'stocks')),
        getDocs(collection(db, 'users'))
      ]);

      const stocksData = stocksSnapshot.docs.map(doc => ({
        id: doc.id,
        updatedAt: new Date(),
        ...(doc.data() as any),
      })) as Stock[];

      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...(doc.data() as any),
      })) as User[];

      setStocks(stocksData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addStock = async () => {
    Alert.prompt(
      'Add New Stock',
      'Enter stock symbol:',
      async (symbol) => {
        if (symbol) {
          try {
            await addDoc(collection(db, 'stocks'), {
              name: symbol,
              symbol: symbol.toUpperCase(),
              price: 0,
              change: 0,
              changePercent: 0,
              volume: 0,
              updatedAt: new Date(),
            });
            loadData();
            Alert.alert('Success', 'Stock added successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to add stock');
          }
        }
      }
    );
  };

  const updateStockPrice = async (stockId: string, newPrice: number) => {
    try {
      const stockRef = doc(db, 'stocks', stockId);
      await updateDoc(stockRef, {
        price: newPrice,
        updatedAt: new Date(),
      });
      loadData();
      Alert.alert('Success', 'Stock price updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update stock price');
    }
  };

  const renderStocksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Stocks</Text>
        <TouchableOpacity style={styles.addButton} onPress={addStock}>
          <Text style={styles.addButtonText}>+ Add Stock</Text>
        </TouchableOpacity>
      </View>

      {stocks.map((stock) => (
        <View key={stock.id} style={styles.stockCard}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockName}>{stock.name}</Text>
            <Text style={styles.stockPrice}>₵{stock.price.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => {
              Alert.prompt(
                'Update Price',
                `Enter new price for ${stock.symbol}:`,
                (priceText) => {
                  const price = parseFloat(priceText || '0');
                  if (price > 0) {
                    updateStockPrice(stock.id, price);
                  }
                }
              );
            }}
          >
            <Text style={styles.updateButtonText}>Update Price</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Users</Text>
        <Text style={styles.userCount}>{users.length} users</Text>
      </View>

      {users.map((user) => (
        <View key={user.uid} style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name || 'No name'}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
            <Text style={styles.userBalance}>
              Balance: ₵{user.balance?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View style={styles.userStatus}>
            <Text style={[
              styles.statusText,
              { color: user.verified ? '#34C759' : '#FF3B30' }
            ]}>
              {user.verified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Admin Panel</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stocks' && styles.activeTab]}
          onPress={() => setActiveTab('stocks')}
        >
          <Text style={[styles.tabText, activeTab === 'stocks' && styles.activeTabText]}>
            Stocks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'stocks' && renderStocksTab()}
        {activeTab === 'users' && renderUsersTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  userCount: {
    fontSize: 14,
    color: '#666',
  },
  stockCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  stockName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginTop: 4,
  },
  updateButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userBalance: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});