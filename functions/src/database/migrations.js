const admin = require('firebase-admin');
const db = admin.firestore();

class DatabaseMigrations {
  constructor() {
    this.version = 1;
  }

  // Run all migrations
  async runMigrations() {
    console.log('Starting database migrations...');
    
    try {
      await this.migrateToV1();
      console.log('Database migrations completed successfully');
    } catch (error) {
      console.error('Database migration failed:', error);
      throw error;
    }
  }

  // Migration to version 1: Initial setup
  async migrateToV1() {
    console.log('Running migration to version 1...');
    
    // Create collections with initial data
    await this.createInitialCollections();
    await this.createIndexes();
    await this.seedInitialData();
    
    console.log('Migration to version 1 completed');
  }

  // Create initial collections structure
  async createInitialCollections() {
    console.log('Creating initial collections...');
    
    // Create users collection with sample structure
    const usersRef = db.collection('users').doc('sample');
    await usersRef.set({
      id: 'sample',
      email: 'sample@example.com',
      displayName: 'Sample User',
      username: 'sample_user',
      phone: '+233XXXXXXXXX',
      verified: false,
      balance: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create stocks collection with sample data
    const stocksRef = db.collection('stocks').doc('sample');
    await stocksRef.set({
      id: 'sample',
      symbol: 'SAMPLE',
      name: 'Sample Stock',
      price: 1.00,
      change: 0.00,
      changePercent: 0.00,
      volume: 0,
      high: 1.00,
      low: 1.00,
      open: 1.00,
      previousClose: 1.00,
      sector: 'Technology',
      marketCap: 1000000,
      pe: 15.0,
      dividend: 0.05,
      source: 'Sample',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create wallets collection
    const walletsRef = db.collection('wallets').doc('sample');
    await walletsRef.set({
      userId: 'sample',
      accountNumber: '1234567890',
      bankCode: 'CALB',
      bankName: 'CalBank',
      accountName: 'Sample Account',
      balance: 0,
      lockedBalance: 0,
      totalBalance: 0,
      currency: 'GHS',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create price alerts collection
    const alertsRef = db.collection('priceAlerts').doc('sample');
    await alertsRef.set({
      id: 'sample',
      userId: 'sample',
      stockId: 'sample',
      targetPrice: 1.50,
      condition: 'above',
      active: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Initial collections created');
  }

  // Create Firestore indexes
  async createIndexes() {
    console.log('Creating Firestore indexes...');
    
    // Note: Firestore indexes are typically created through the Firebase Console
    // or firestore.indexes.json file. This is just for documentation.
    
    const indexes = [
      {
        collectionGroup: 'transactions',
        fields: [
          { fieldPath: 'userId', order: 'ASCENDING' },
          { fieldPath: 'timestamp', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'notifications',
        fields: [
          { fieldPath: 'userId', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'stocks',
        fields: [
          { fieldPath: 'symbol', order: 'ASCENDING' }
        ]
      },
      {
        collectionGroup: 'priceAlerts',
        fields: [
          { fieldPath: 'active', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'ASCENDING' }
        ]
      }
    ];

    console.log('Firestore indexes configuration:', JSON.stringify(indexes, null, 2));
    console.log('Note: Create these indexes in Firebase Console or firestore.indexes.json');
  }

  // Seed initial data
  async seedInitialData() {
    console.log('Seeding initial data...');
    
    // Seed GSE stocks
    const gseStocks = [
      {
        id: 'MTN',
        symbol: 'MTN',
        name: 'MTN Ghana',
        price: 1.20,
        change: 0.05,
        changePercent: 4.35,
        volume: 1250000,
        high: 1.25,
        low: 1.15,
        open: 1.18,
        previousClose: 1.15,
        sector: 'Telecommunications',
        marketCap: 2500000000,
        pe: 15.2,
        dividend: 0.08,
        source: 'GSE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'GCB',
        symbol: 'GCB',
        name: 'GCB Bank',
        price: 4.10,
        change: 0.10,
        changePercent: 2.50,
        volume: 2100000,
        high: 4.15,
        low: 4.00,
        open: 4.05,
        previousClose: 4.00,
        sector: 'Banking',
        marketCap: 4100000000,
        pe: 18.5,
        dividend: 0.25,
        source: 'GSE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'SCB',
        symbol: 'SCB',
        name: 'Standard Chartered Bank',
        price: 2.50,
        change: 0.05,
        changePercent: 2.04,
        volume: 750000,
        high: 2.55,
        low: 2.45,
        open: 2.48,
        previousClose: 2.45,
        sector: 'Banking',
        marketCap: 1250000000,
        pe: 14.2,
        dividend: 0.15,
        source: 'GSE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'CAL',
        symbol: 'CAL',
        name: 'CAL Bank',
        price: 0.85,
        change: -0.02,
        changePercent: -2.30,
        volume: 890000,
        high: 0.88,
        low: 0.83,
        open: 0.87,
        previousClose: 0.87,
        sector: 'Banking',
        marketCap: 850000000,
        pe: 12.8,
        dividend: 0.05,
        source: 'GSE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'EGL',
        symbol: 'EGL',
        name: 'Enterprise Group',
        price: 0.95,
        change: -0.03,
        changePercent: -3.06,
        volume: 450000,
        high: 0.98,
        low: 0.92,
        open: 0.97,
        previousClose: 0.98,
        sector: 'Insurance',
        marketCap: 475000000,
        pe: 11.8,
        dividend: 0.06,
        source: 'GSE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    const batch = db.batch();
    gseStocks.forEach(stock => {
      const stockRef = db.collection('stocks').doc(stock.id);
      batch.set(stockRef, stock);
    });
    await batch.commit();

    console.log(`Seeded ${gseStocks.length} GSE stocks`);
  }

  // Clean up sample data
  async cleanupSampleData() {
    console.log('Cleaning up sample data...');
    
    const batch = db.batch();
    
    // Delete sample documents
    batch.delete(db.collection('users').doc('sample'));
    batch.delete(db.collection('stocks').doc('sample'));
    batch.delete(db.collection('wallets').doc('sample'));
    batch.delete(db.collection('priceAlerts').doc('sample'));
    
    await batch.commit();
    console.log('Sample data cleaned up');
  }

  // Get migration status
  async getMigrationStatus() {
    try {
      const statusRef = db.collection('_migrations').doc('status');
      const statusDoc = await statusRef.get();
      
      if (statusDoc.exists) {
        return statusDoc.data();
      }
      
      return { version: 0, lastRun: null };
    } catch (error) {
      console.error('Error getting migration status:', error);
      return { version: 0, lastRun: null };
    }
  }

  // Update migration status
  async updateMigrationStatus(version) {
    try {
      const statusRef = db.collection('_migrations').doc('status');
      await statusRef.set({
        version,
        lastRun: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating migration status:', error);
    }
  }
}

module.exports = DatabaseMigrations;