import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

interface TabletLayoutProps {
  children: React.ReactNode;
  orientation?: 'portrait' | 'landscape';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const TabletLayout: React.FC<TabletLayoutProps> = ({
  children,
  orientation = 'portrait',
}) => {
  const isTablet = screenWidth >= 768 || screenHeight >= 1024;
  const isLandscape = screenWidth > screenHeight;

  if (!isTablet) {
    return <>{children}</>;
  }

  const containerStyle = [
    styles.container,
    isLandscape && styles.landscapeContainer,
  ];

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    maxWidth: 1200, // Max width for very large tablets
    alignSelf: 'center',
    width: '100%',
  },
  landscapeContainer: {
    flexDirection: 'row',
  },
});

// Tablet-specific constants
export const TABLET_CONSTANTS = {
  // Breakpoints
  SMALL_TABLET: 768,
  LARGE_TABLET: 1024,
  DESKTOP: 1200,
  
  // Spacing
  SIDEBAR_WIDTH: 280,
  CONTENT_PADDING: spacing.xl,
  CARD_SPACING: spacing.lg,
  
  // Grid
  COLUMNS_PORTRAIT: 2,
  COLUMNS_LANDSCAPE: 3,
  COLUMNS_DESKTOP: 4,
  
  // Typography
  HEADER_SIZE: 32,
  TITLE_SIZE: 24,
  BODY_SIZE: 18,
  CAPTION_SIZE: 14,
} as const;

// Responsive hook
export const useTabletLayout = () => {
  const { width, height } = Dimensions.get('window');
  
  const isTablet = width >= TABLET_CONSTANTS.SMALL_TABLET;
  const isLargeTablet = width >= TABLET_CONSTANTS.LARGE_TABLET;
  const isDesktop = width >= TABLET_CONSTANTS.DESKTOP;
  const isLandscape = width > height;
  
  const getColumns = () => {
    if (isDesktop) return TABLET_CONSTANTS.COLUMNS_DESKTOP;
    if (isLandscape) return TABLET_CONSTANTS.COLUMNS_LANDSCAPE;
    return TABLET_CONSTANTS.COLUMNS_PORTRAIT;
  };
  
  const getSidebarWidth = () => {
    return isTablet ? TABLET_CONSTANTS.SIDEBAR_WIDTH : 0;
  };
  
  const getContentWidth = () => {
    return width - getSidebarWidth();
  };
  
  return {
    isTablet,
    isLargeTablet,
    isDesktop,
    isLandscape,
    columns: getColumns(),
    sidebarWidth: getSidebarWidth(),
    contentWidth: getContentWidth(),
    screenWidth: width,
    screenHeight: height,
  };
};