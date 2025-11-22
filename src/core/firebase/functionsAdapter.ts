/**
 * Functions Adapter - Provides native-like API using web SDK
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions as functionsInstance } from './index';

/**
 * Functions adapter that mimics @react-native-firebase/functions API
 */
export class FunctionsAdapter {
  httpsCallable(name: string) {
    const callable = httpsCallable(functionsInstance, name);
    
    return async (data?: any) => {
      try {
        const result = await callable(data);
        return {
          data: result.data,
        };
      } catch (error: any) {
        throw {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Function call failed',
          details: error.details,
        };
      }
    };
  }
}

// Create singleton instance
const functionsAdapter = new FunctionsAdapter();

// Create function that matches @react-native-firebase/functions API
const functionsFunction = () => functionsAdapter;

// Export function that matches @react-native-firebase/functions API
export const functions = functionsFunction;

export default functionsFunction;

