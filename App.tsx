
// IMPORTANT: Initialize Firebase FIRST before any other imports
import './src/core/firebase';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { WalletProvider } from './src/contexts/WalletContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { WelcomeSlidesScreen } from './src/screens/WelcomeSlidesScreen';
import { AuthenticationScreen } from './src/screens/AuthenticationScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MarketsScreen } from './src/screens/MarketsScreen';
import { TradingScreen } from './src/screens/TradingScreen';
import { LearningScreen } from './src/screens/LearningScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { ManagerScreen } from './src/screens/ManagerScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PortfolioScreen } from './src/screens/PortfolioScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { SocialTradingScreen } from './src/screens/SocialTradingScreen';
import { AIInsightsScreen } from './src/screens/AIInsightsScreen';
import { BottomTabNavigator } from './src/components/BottomTabNavigator';
import { BYPASS_AUTH } from './src/config';
import { typography } from './src/styles/typography';
import { Stock, User } from './src/types';
import { NavigationProvider } from './src/contexts/NavigationContext';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTrading, setShowTrading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>(undefined);
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | undefined>(undefined);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [bypassUser, setBypassUser] = useState<User | null>(null);

  // Development bypass: Create a mock user if BYPASS_AUTH is enabled
  // Use useMemo to prevent recreation of mock user object
  const mockUserRef = React.useRef<User>({
    uid: 'dev-bypass-user',
    id: 'dev-bypass-user',
    name: 'Dev User',
    email: 'dev@trustmint.com',
    phone: '+233XXXXXXXXX',
    verified: true,
    balance: 10000,
    createdAt: new Date(),
  });

  useEffect(() => {
    if (BYPASS_AUTH && !user && !loading) {
      setBypassUser(mockUserRef.current);
    } else if (!BYPASS_AUTH) {
      setBypassUser(null);
    }
  }, [user, loading]);

  // Memoize effectiveUser to prevent unnecessary re-renders
  const effectiveUser = React.useMemo(() => {
    return BYPASS_AUTH ? (user || bypassUser) : user;
  }, [BYPASS_AUTH, user, bypassUser]);

  // Check if user is admin
  const isAdmin = React.useMemo(() => {
    if (!effectiveUser) return false;
    return effectiveUser.isAdmin === true || effectiveUser.role === 'admin';
  }, [effectiveUser]);

  // Check if user is manager
  const isManager = React.useMemo(() => {
    if (!effectiveUser) return false;
    return effectiveUser.isManager === true || effectiveUser.role === 'manager';
  }, [effectiveUser]);

  const navigateToTab = useCallback((tabId: string) => {
    if (tabId === 'trade') {
      setShowTrading(true);
      return;
    }
    setActiveTab(tabId);
    setShowTrading(false);
  }, []);

  const openTrading = useCallback((stock: Stock, type?: 'buy' | 'sell') => {
    setSelectedStock(stock);
    setTradeType(type);
    setShowTrading(true);
  }, []);

  const renderScreen = () => {
    if (showTrading) {
      return (
        <TradingScreen
          stock={selectedStock}
          tradeType={tradeType}
          onClose={() => {
            setShowTrading(false);
            setSelectedStock(undefined);
            setTradeType(undefined);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <HomeScreen />;
      case 'trading':
        return <MarketsScreen />;
      case 'portfolio':
        return <PortfolioScreen />;
      case 'learning':
        return <LearningScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'admin':
        return <AdminScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'social':
        return <SocialTradingScreen />;
      case 'ai':
        return <AIInsightsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Show splash screen first
  if (showSplash) {
    return (
      <SplashScreen onAnimationComplete={() => setShowSplash(false)} />
    );
  }

  // Show loading state
  if (loading && !BYPASS_AUTH) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.primary }]}>Loading Mint Trade...</Text>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  // Show authentication screen if no user
  if (!effectiveUser && !BYPASS_AUTH) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AuthenticationScreen 
          onComplete={() => {
            // After authentication, show welcome slides for new users
            setShowWelcome(true);
          }} 
        />
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  // Show welcome slides for new users (after authentication)
  if (showWelcome && effectiveUser && !isAdmin && !isManager) {
    return (
      <WelcomeSlidesScreen onComplete={() => setShowWelcome(false)} />
    );
  }

  // Show Admin Screen directly for admin users (no bottom tabs, no user UI)
  if (isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AdminScreen />
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  // Show Manager Screen directly for manager users (no bottom tabs, no user UI)
  if (isManager) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ManagerScreen />
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  // Regular user UI with bottom tabs
  return (
    <NavigationProvider value={{ switchTab: navigateToTab, openTrading }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderScreen()}
        {!showTrading && (
          <BottomTabNavigator
            activeTab={activeTab}
            onTabPress={navigateToTab}
          />
        )}
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        {BYPASS_AUTH && (
          <View style={styles.bypassBanner}>
            <Text style={styles.bypassText}>DEV MODE: Auth Bypassed</Text>
          </View>
        )}
      </View>
    </NavigationProvider>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...typography.h1,
    },
    bypassBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FF9500',
        padding: 4,
        alignItems: 'center',
        zIndex: 9999,
    },
    bypassText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
