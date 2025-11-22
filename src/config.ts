/**
 * App Configuration
 * Update these values based on your environment
 */

// API Configuration
// For local development, use: http://localhost:4000
// For production, update to your backend URL
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = '158719931457-s613okm1hgvo9qm81skomtd72isltl23.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID = '158719931457-6lbc2hmjuqlnu41q4mf2q8jevib87di9.apps.googleusercontent.com';

// App deep link scheme (must match app.json -> scheme)
export const APP_SCHEME = 'trustmint';

// Feature flags / flow configuration
export const ENABLE_PHONE_VERIFICATION = false;

// Apple OAuth Configuration
export const APPLE_CLIENT_ID = 'com.trustmint.app';

// Environment
export const IS_DEV = __DEV__;
export const IS_PRODUCTION = !__DEV__;

// Development Bypass - Set to true to skip authentication in development
export const BYPASS_AUTH = false; // Set to true to bypass auth in development

// Environment variable helper
const env = (name: string, fallback?: string) =>
  process.env[name] ??
  process.env[`EXPO_PUBLIC_${name}`] ??
  fallback;

// API Keys (loaded from environment)
export const API_KEYS = {
  // Stock Market Data
  TWELVE_DATA_API_KEY: env('TWELVE_DATA_API_KEY'),
  ALPHA_VANTAGE_API_KEY: env('ALPHA_VANTAGE_API_KEY'),
  FINNHUB_API_KEY: env('FINNHUB_API_KEY'),
  EODHD_API_KEY: env('EODHD_API_KEY'),
  GSE_API_KEY: env('GSE_API_KEY'),
  GSE_DATA_SERVICES_API_KEY: env('GSE_DATA_SERVICES_API_KEY'),
  
  // Payment Gateways
  FLUTTERWAVE_PUBLIC_KEY: env('FLUTTERWAVE_PUBLIC_KEY'),
  FLUTTERWAVE_SECRET_KEY: env('FLUTTERWAVE_SECRET_KEY'),
  STRIPE_PUBLIC_KEY: env('STRIPE_PUBLIC_KEY'),
  STRIPE_SECRET_KEY: env('STRIPE_SECRET_KEY'),
  ZEEPAY_API_KEY: env('ZEEPAY_API_KEY'),
  MTN_MOMO_API_KEY: env('MTN_MOMO_API_KEY'),
  VODAFONE_CASH_API_KEY: env('VODAFONE_CASH_API_KEY'),
  AIRTELTIGO_MONEY_API_KEY: env('AIRTELTIGO_MONEY_API_KEY'),
  
  // KYC Services
  SMILE_ID_PARTNER_ID: env('SMILE_ID_PARTNER_ID'),
  SMILE_ID_API_KEY: env('SMILE_ID_API_KEY'),
  
  // Analytics
  GOOGLE_ANALYTICS_TRACKING_ID: env('GOOGLE_ANALYTICS_TRACKING_ID'),
  MIXPANEL_TOKEN: env('MIXPANEL_TOKEN'),
  SENTRY_DSN: env('SENTRY_DSN'),
  
  // Notifications
  FCM_SERVER_KEY: env('FCM_SERVER_KEY'),
  TWILIO_ACCOUNT_SID: env('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: env('TWILIO_AUTH_TOKEN'),
  SENDGRID_API_KEY: env('SENDGRID_API_KEY'),
  
  // WebSocket
  WEBSOCKET_URL: env('WEBSOCKET_URL', 'wss://api.trustmint.com/ws'),
  
  // GSE API
  GSE_API_BASE_URL: env('GSE_API_BASE_URL') || env('EXPO_PUBLIC_GSE_API_BASE_URL', 'https://dev.kwayisi.org/apis/gse'),
  
  // Backup Database (NeonDB)
  NEON_DB_URL: env('NEON_DB_URL') || env('DATABASE_URL'),
} as const;