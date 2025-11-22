/**
 * Biometric Authentication Service
 * Handles Face ID, Fingerprint, and PIN code authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricType {
  available: boolean;
  type: 'face' | 'fingerprint' | 'iris' | 'none';
}

export interface BiometricResult {
  success: boolean;
  error?: string;
}

export class BiometricService {
  private static instance: BiometricService;
  private static BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
  private static PIN_CODE_KEY = 'pin_code_hash';

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  // ============================================
  // Biometric Availability
  // ============================================

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<BiometricType> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        return { available: false, type: 'none' };
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        return { available: false, type: 'none' };
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return { available: true, type: 'face' };
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return { available: true, type: 'fingerprint' };
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return { available: true, type: 'iris' };
      }

      return { available: false, type: 'none' };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false, type: 'none' };
    }
  }

  /**
   * Get biometric type name
   */
  async getBiometricTypeName(): Promise<string> {
    const biometric = await this.isBiometricAvailable();
    
    switch (biometric.type) {
      case 'face':
        return 'Face ID';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris';
      default:
        return 'Biometric';
    }
  }

  // ============================================
  // Biometric Authentication
  // ============================================

  /**
   * Authenticate using biometrics
   */
  async authenticate(reason?: string): Promise<BiometricResult> {
    try {
      const biometric = await this.isBiometricAvailable();
      if (!biometric.available) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Authenticate to continue',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication error',
      };
    }
  }

  /**
   * Check if biometric is enabled for the app
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(BiometricService.BIOMETRIC_ENABLED_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometric(): Promise<BiometricResult> {
    try {
      const biometric = await this.isBiometricAvailable();
      if (!biometric.available) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      // Test authentication first
      const testResult = await this.authenticate('Enable biometric authentication');
      if (!testResult.success) {
        return testResult;
      }

      await AsyncStorage.setItem(BiometricService.BIOMETRIC_ENABLED_KEY, 'true');
      return { success: true };
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable biometric',
      };
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BiometricService.BIOMETRIC_ENABLED_KEY);
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  }

  // ============================================
  // PIN Code Authentication
  // ============================================

  /**
   * Set PIN code
   */
  async setPINCode(pin: string): Promise<BiometricResult> {
    try {
      if (pin.length < 4 || pin.length > 6) {
        return {
          success: false,
          error: 'PIN must be 4-6 digits',
        };
      }

      // In production, hash the PIN before storing
      // For now, we'll use a simple hash (NOT SECURE - use proper hashing in production)
      const hash = await this.hashPIN(pin);
      await AsyncStorage.setItem(BiometricService.PIN_CODE_KEY, hash);
      
      return { success: true };
    } catch (error) {
      console.error('Error setting PIN code:', error);
      return {
        success: false,
        error: 'Failed to set PIN code',
      };
    }
  }

  /**
   * Verify PIN code
   */
  async verifyPINCode(pin: string): Promise<BiometricResult> {
    try {
      const storedHash = await AsyncStorage.getItem(BiometricService.PIN_CODE_KEY);
      if (!storedHash) {
        return {
          success: false,
          error: 'PIN code not set',
        };
      }

      const inputHash = await this.hashPIN(pin);
      if (inputHash === storedHash) {
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Incorrect PIN code',
        };
      }
    } catch (error) {
      console.error('Error verifying PIN code:', error);
      return {
        success: false,
        error: 'Failed to verify PIN code',
      };
    }
  }

  /**
   * Check if PIN code is set
   */
  async isPINCodeSet(): Promise<boolean> {
    try {
      const hash = await AsyncStorage.getItem(BiometricService.PIN_CODE_KEY);
      return hash !== null;
    } catch (error) {
      console.error('Error checking PIN code:', error);
      return false;
    }
  }

  /**
   * Remove PIN code
   */
  async removePINCode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BiometricService.PIN_CODE_KEY);
    } catch (error) {
      console.error('Error removing PIN code:', error);
    }
  }

  /**
   * Hash PIN code (simple implementation - use proper crypto in production)
   */
  private async hashPIN(pin: string): Promise<string> {
    // WARNING: This is a simple hash for demo purposes
    // In production, use a proper cryptographic hash (e.g., bcrypt, argon2)
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // ============================================
  // Combined Authentication
  // ============================================

  /**
   * Authenticate with biometric or PIN
   */
  async authenticateWithBiometricOrPIN(reason?: string): Promise<BiometricResult> {
    // Try biometric first if enabled
    const biometricEnabled = await this.isBiometricEnabled();
    if (biometricEnabled) {
      const biometricResult = await this.authenticate(reason);
      if (biometricResult.success) {
        return biometricResult;
      }
    }

    // Fallback to PIN if biometric fails or not enabled
    const pinSet = await this.isPINCodeSet();
    if (pinSet) {
      // In a real implementation, you would show a PIN input screen
      // For now, we'll return an error indicating PIN input is needed
      return {
        success: false,
        error: 'PIN input required',
      };
    }

    return {
      success: false,
      error: 'No authentication method available',
    };
  }

  // ============================================
  // Security Settings
  // ============================================

  /**
   * Get authentication methods available
   */
  async getAvailableAuthMethods(): Promise<{
    biometric: boolean;
    pin: boolean;
  }> {
    const biometric = await this.isBiometricAvailable();
    const pin = await this.isPINCodeSet();

    return {
      biometric: biometric.available,
      pin,
    };
  }
}

