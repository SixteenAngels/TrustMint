/**
 * NeonDB Service
 * Handles syncing Firestore data to NeonDB (PostgreSQL) as backup
 */

import { firestore } from '../core/firebase/firestoreAdapter';
import { functions } from '../core/firebase/functionsAdapter';

const env = (name: string, fallback?: string) =>
  process.env[name] ??
  process.env[`EXPO_PUBLIC_${name}`] ??
  fallback;

// NeonDB Connection String
const NEON_DB_URL = env('NEON_DB_URL') || env('DATABASE_URL');

export interface NeonDbConfig {
  connectionString: string;
  enabled: boolean;
}

export interface SyncStatus {
  collection: string;
  documentId: string;
  synced: boolean;
  syncedAt?: Date;
  error?: string;
}

export class NeonDbService {
  private static instance: NeonDbService;
  private config: NeonDbConfig;

  static getInstance(): NeonDbService {
    if (!NeonDbService.instance) {
      NeonDbService.instance = new NeonDbService();
    }
    return NeonDbService.instance;
  }

  constructor() {
    this.config = {
      connectionString: NEON_DB_URL || '',
      enabled: !!NEON_DB_URL && !NEON_DB_URL.includes('your_'),
    };
  }

  /**
   * Check if NeonDB is configured
   */
  isConfigured(): boolean {
    return this.config.enabled;
  }

  /**
   * Sync a document from Firestore to NeonDB
   */
  async syncDocument(
    collection: string,
    documentId: string,
    data: any
  ): Promise<SyncStatus> {
    if (!this.config.enabled) {
      return {
        collection,
        documentId,
        synced: false,
        error: 'NeonDB not configured',
      };
    }

    try {
      const syncFunction = functions().httpsCallable('syncToNeonDb');
      const result = await syncFunction({
        collection,
        documentId,
        data,
      });

      return {
        collection,
        documentId,
        synced: result.data.success || false,
        syncedAt: new Date(),
        error: result.data.error,
      };
    } catch (error: any) {
      console.error('Error syncing to NeonDB:', error);
      return {
        collection,
        documentId,
        synced: false,
        error: error.message || 'Sync failed',
      };
    }
  }

  /**
   * Sync multiple documents
   */
  async syncBatch(
    collection: string,
    documents: Array<{ id: string; data: any }>
  ): Promise<SyncStatus[]> {
    if (!this.config.enabled) {
      return documents.map((doc) => ({
        collection,
        documentId: doc.id,
        synced: false,
        error: 'NeonDB not configured',
      }));
    }

    try {
      const syncFunction = functions().httpsCallable('syncBatchToNeonDb');
      const result = await syncFunction({
        collection,
        documents,
      });

      return result.data.results || [];
    } catch (error: any) {
      console.error('Error batch syncing to NeonDB:', error);
      return documents.map((doc) => ({
        collection,
        documentId: doc.id,
        synced: false,
        error: error.message || 'Batch sync failed',
      }));
    }
  }

  /**
   * Get sync status for a document
   */
  async getSyncStatus(
    collection: string,
    documentId: string
  ): Promise<SyncStatus | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      const statusFunction = functions().httpsCallable('getNeonDbSyncStatus');
      const result = await statusFunction({
        collection,
        documentId,
      });

      return result.data.status || null;
    } catch (error: any) {
      console.error('Error getting sync status:', error);
      return null;
    }
  }

  /**
   * Manually trigger full sync of a collection
   */
  async syncCollection(collection: string): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors?: string[];
  }> {
    if (!this.config.enabled) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['NeonDB not configured'],
      };
    }

    try {
      const syncFunction = functions().httpsCallable('syncCollectionToNeonDb');
      const result = await syncFunction({
        collection,
      });

      return result.data;
    } catch (error: any) {
      console.error('Error syncing collection:', error);
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: [error.message || 'Collection sync failed'],
      };
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalCollections: number;
    totalDocuments: number;
    lastSyncTime?: Date;
    syncEnabled: boolean;
  }> {
    if (!this.config.enabled) {
      return {
        totalCollections: 0,
        totalDocuments: 0,
        syncEnabled: false,
      };
    }

    try {
      const statsFunction = functions().httpsCallable('getNeonDbBackupStats');
      const result = await statsFunction({});

      return {
        totalCollections: result.data.totalCollections || 0,
        totalDocuments: result.data.totalDocuments || 0,
        lastSyncTime: result.data.lastSyncTime
          ? new Date(result.data.lastSyncTime)
          : undefined,
        syncEnabled: true,
      };
    } catch (error: any) {
      console.error('Error getting backup stats:', error);
      return {
        totalCollections: 0,
        totalDocuments: 0,
        syncEnabled: false,
      };
    }
  }
}

