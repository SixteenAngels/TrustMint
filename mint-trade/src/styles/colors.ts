// Mint Trade Design System Colors
export const colors = {
  // Primary Colors
  primary: '#00B67A',        // Mint Green - growth, wealth, freshness
  primaryDark: '#00A86B',    // Darker mint for pressed states
  primaryLight: '#E6F7F2',   // Light mint for backgrounds
  
  // Secondary Colors
  secondary: '#0F172A',      // Deep Navy - trust, professionalism
  secondaryLight: '#1E293B', // Lighter navy for cards
  
  // Accent Colors
  accent: '#FFD700',         // Gold - financial success
  accentDark: '#E6C200',     // Darker gold for text
  
  // Background Colors
  background: '#F9FAFB',     // Off-white - clean background
  backgroundSecondary: '#FFFFFF', // Pure white for cards
  backgroundDark: '#0F172A', // Dark mode background
  
  // Text Colors
  textPrimary: '#0F172A',    // Deep navy for headings
  textSecondary: '#64748B',  // Slate for body text
  textLight: '#94A3B8',      // Light slate for captions
  textWhite: '#FFFFFF',      // White text
  
  // Status Colors
  success: '#10B981',        // Green 500 - success states
  successLight: '#D1FAE5',   // Light green background
  error: '#EF4444',          // Red 500 - error states
  errorLight: '#FEE2E2',     // Light red background
  warning: '#F59E0B',        // Amber 500 - warnings
  warningLight: '#FEF3C7',   // Light amber background
  
  // Border Colors
  border: '#E2E8F0',         // Light border
  borderDark: '#CBD5E1',     // Darker border
  borderFocus: '#00B67A',    // Focus border (mint)
  
  // Shadow Colors
  shadow: 'rgba(15, 23, 42, 0.1)',
  shadowDark: 'rgba(15, 23, 42, 0.2)',
  
  // Chart Colors
  chartGreen: '#00B67A',     // Positive changes
  chartRed: '#EF4444',       // Negative changes
  chartBlue: '#3B82F6',      // Neutral data
  chartGold: '#FFD700',      // Special highlights
};

// Color utilities
export const getStatusColor = (isPositive: boolean) => 
  isPositive ? colors.success : colors.error;

export const getStatusBackground = (isPositive: boolean) => 
  isPositive ? colors.successLight : colors.errorLight;