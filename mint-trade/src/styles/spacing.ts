// Spacing scale based on 8px grid system
export const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 40,  // 40px
  xxxl: 48, // 48px
  huge: 64, // 64px
};

// Common spacing patterns
export const layout = {
  // Screen padding
  screenPadding: spacing.lg,
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.lg,
  
  // Card spacing
  cardPadding: spacing.lg,
  cardMargin: spacing.md,
  cardRadius: 16,
  
  // Button spacing
  buttonPadding: spacing.md,
  buttonPaddingLarge: spacing.lg,
  buttonRadius: 12,
  buttonRadiusSmall: 8,
  
  // Input spacing
  inputPadding: spacing.md,
  inputRadius: 12,
  inputMargin: spacing.sm,
  
  // List spacing
  listItemPadding: spacing.md,
  listItemMargin: spacing.sm,
  
  // Section spacing
  sectionMargin: spacing.xl,
  sectionPadding: spacing.lg,
};