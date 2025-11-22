/**
 * Metro bundler configuration
 * Configured for Firebase web SDK compatibility
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .cjs files (used by Firebase)
config.resolver.sourceExts.push('cjs');

// Disable package.json exports to avoid resolution issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

