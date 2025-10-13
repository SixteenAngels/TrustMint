import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TradingScreen } from './src/screens/TradingScreen';
import { LearningScreen } from './src/screens/LearningScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { BottomTabNavigator } from './src/components/BottomTabNavigator';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTrading, setShowTrading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const handleTabPress = (tabId: string) => {
    if (tabId === 'trading') {
      setShowTrading(true);
    } else {
      setActiveTab(tabId);
      setShowTrading(false);
    }
  };

  const renderScreen = () => {
    if (showTrading) {
      return (
        <TradingScreen
          stock={selectedStock}
          onClose={() => setShowTrading(false)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'learning':
        return <LearningScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'admin':
        return <AdminScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Mint Trade...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <OnboardingScreen onComplete={() => {}} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderScreen()}
      {!showTrading && (
        <BottomTabNavigator
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});
