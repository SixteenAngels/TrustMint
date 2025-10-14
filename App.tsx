import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { WalletProvider } from './src/contexts/WalletContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { WelcomeSlidesScreen } from './src/screens/WelcomeSlidesScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MarketsScreen } from './src/screens/MarketsScreen';
import { TradingScreen } from './src/screens/TradingScreen';
import { LearningScreen } from './src/screens/LearningScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PortfolioScreen } from './src/screens/PortfolioScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { SocialTradingScreen } from './src/screens/SocialTradingScreen';
import { AIInsightsScreen } from './src/screens/AIInsightsScreen';
import { BottomTabNavigator } from './src/components/BottomTabNavigator';
import { colors } from './src/styles/colors';
import { typography } from './src/styles/typography';
import { Stock } from './src/types';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTrading, setShowTrading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>();
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

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
      case 'trading':
        return <MarketsScreen />;
      case 'portfolio':
        return <PortfolioScreen />;
      case 'learning':
        return <LearningScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'admin':
        return <ProfileScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'social':
        return <SocialTradingScreen />;
      case 'ai':
        return <AIInsightsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  // Show splash screen first
  if (showSplash) {
    return (
      <SplashScreen onAnimationComplete={() => setShowSplash(false)} />
    );
  }

  // Show welcome slides for new users
  if (showWelcome && !user) {
    return (
      <WelcomeSlidesScreen onComplete={() => setShowWelcome(false)} />
    );
  }

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
        <OnboardingScreen onComplete={() => setShowWelcome(true)} />
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
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
  },
});
