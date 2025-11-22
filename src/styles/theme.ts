// Theme-aware color exports
// This file re-exports colors from ThemeContext for easy access
import { useTheme } from '../contexts/ThemeContext';

// Export the hook for components to use
export { useTheme } from '../contexts/ThemeContext';

// Legacy color export for backward compatibility
// Components should migrate to useTheme() hook
export { colors } from './colors';

