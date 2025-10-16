import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AdminService } from '../services/adminService';
import { Stock, User } from '../types';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const AdminScreen: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stocks' | 'users'>('stocks');
  const adminService = AdminService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stocksData, usersData] = await Promise.all([
        adminService.getStocks(),
        adminService.getUsers(),
      ]);
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
    Alert.prompt('Add New Stock', 'Enter stock symbol:', async (symbol) => {
      if (symbol) {
        try {
          await adminService.addStock(symbol);
          loadData();
          Alert.alert('Success', 'Stock added successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to add stock');
        }
      }
    });
  };

  const updateStockPrice = async (stockId: string, newPrice: number) => {
    try {
      await adminService.updateStockPrice(stockId, newPrice);
      loadData();
      Alert.alert('Success', 'Stock price updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update stock price');
    }
  };

  const renderStocksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Manage Stocks</Text>
        <TouchableOpacity style={styles.addButton} onPress={addStock}>
          <Text style={styles.addButtonText}>+ Add Stock</Text>
        </TouchableOpacity>
      </View>

      {stocks.map((stock) => (
        <View key={stock.id} style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockName}>{stock.name}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.stockPrice}>₵{stock.price.toFixed(2)}</Text>
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
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Manage Users</Text>
        <Text style={styles.userCount}>{users.length} users</Text>
      </View>

      {users.map((user) => (
        <View key={user.uid} style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.userName}>{user.name || 'No name'}</Text>
            <Text style={[
              styles.userStatus,
              { color: user.verified ? colors.success : colors.error }
            ]}>
              {user.verified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.userPhone}>{user.phone}</Text>
            <Text style={styles.userBalance}>
              Balance: ₵{user.balance?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
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

      <ScrollView>
        {activeTab === 'stocks' ? renderStocksTab() : renderUsersTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.backgroundSecondary,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    ...shadows.card,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
  },
  tab: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    ...shadows.button,
  },
  addButtonText: {
    ...typography.bodySmall,
    color: '#fff',
    fontWeight: 'bold',
  },
  userCount: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stockSymbol: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  stockName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stockPrice: {
    ...typography.h5,
    color: colors.primary,
  },
  updateButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  updateButtonText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  userName: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  userStatus: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  userPhone: {
    ...typography.body,
    color: colors.textSecondary,
  },
  userBalance: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
});
