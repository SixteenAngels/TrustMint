import { Platform } from 'react-native';

// Font families
export const fonts = {
  heading: Platform.OS === 'ios' ? 'Poppins-Bold' : 'Poppins-Bold',
  body: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter-Regular',
  bodyMedium: Platform.OS === 'ios' ? 'Inter-Medium' : 'Inter-Medium',
  bodySemiBold: Platform.OS === 'ios' ? 'Inter-SemiBold' : 'Inter-SemiBold',
  caption: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter-Regular',
};

// Typography scale
export const typography = {
  // Headings
  h1: {
    fontFamily: fonts.heading,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
  },
  h3: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  h4: {
    fontFamily: fonts.heading,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h5: {
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  h6: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  
  // Body text
  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  bodySmall: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  
  // Captions and labels
  caption: {
    fontFamily: fonts.caption,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  captionMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  
  // Special text
  button: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  buttonSmall: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  
  // Numbers and prices
  price: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  priceLarge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  priceXLarge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
};