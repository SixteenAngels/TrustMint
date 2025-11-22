# NeonDB Backup Setup Guide

## Overview

NeonDB (PostgreSQL) is configured as a **backup database** to keep copies of all Firestore data. This provides:

- ✅ **Data redundancy** - Complete backup of Firestore
- ✅ **Disaster recovery** - Restore data if Firestore fails
- ✅ **Analytics** - Query backup data with SQL
- ✅ **Compliance** - Long-term data retention
- ✅ **Auto-sync** - Automatic backup on every Firestore change

---

## 🗄️ Database Structure

### How It Works

1. **Auto-Sync Trigger**: Every Firestore write automatically syncs to NeonDB
2. **Table Structure**: Each Firestore collection becomes a PostgreSQL table
3. **Data Format**: Firestore documents stored as JSONB in PostgreSQL

### Table Naming Convention

```
Firestore Collection → PostgreSQL Table
users/               → firestore_users
stocks/              → firestore_stocks
transactions/        → firestore_transactions
```

### Table Schema

Each backup table has this structure:

```sql
CREATE TABLE firestore_{collection} (
  id VARCHAR(255) PRIMARY KEY,           -- Firestore document ID
  data JSONB NOT NULL,                    -- Full document data
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Setup Instructions

### 1. Get NeonDB Connection String

1. Sign up at [NeonDB](https://neon.tech/)
2. Create a new project
3. Copy your connection string (looks like):
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

### 2. Configure in Firebase Functions

#### Option A: Using Firebase Secrets (Recommended)

```bash
cd functions
firebase functions:secrets:set NEON_DB_URL
# Paste your connection string when prompted
```

#### Option B: Using Environment Variables

Add to `.env` or Firebase Functions config:

```bash
# In .env file
NEON_DB_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Or in Firebase config
firebase functions:config:set neondb.url="postgresql://..."
```

### 3. Install Dependencies

```bash
cd functions
npm install pg
npm run build
```

### 4. Deploy Functions

```bash
firebase deploy --only functions
```

---

## 📊 Available Functions

### 1. **Auto-Sync** (Automatic)
- **Trigger**: `onFirestoreWrite`
- **When**: Every Firestore document create/update/delete
- **Action**: Automatically syncs to NeonDB
- **No manual call needed** - works automatically

### 2. **Manual Sync Single Document**
```typescript
const syncFunction = functions().httpsCallable('syncToNeonDb');
await syncFunction({
  collection: 'users',
  documentId: 'user123',
  data: { name: 'John', email: 'john@example.com' }
});
```

### 3. **Batch Sync**
```typescript
const batchSync = functions().httpsCallable('syncBatchToNeonDb');
await batchSync({
  collection: 'stocks',
  documents: [
    { id: 'stock1', data: {...} },
    { id: 'stock2', data: {...} }
  ]
});
```

### 4. **Sync Entire Collection**
```typescript
const syncCollection = functions().httpsCallable('syncCollectionToNeonDb');
await syncCollection({
  collection: 'transactions'
});
```

### 5. **Get Sync Status**
```typescript
const getStatus = functions().httpsCallable('getNeonDbSyncStatus');
const result = await getStatus({
  collection: 'users',
  documentId: 'user123'
});
```

### 6. **Get Backup Statistics**
```typescript
const getStats = functions().httpsCallable('getNeonDbBackupStats');
const stats = await getStats({});
// Returns: { totalCollections, totalDocuments, lastSyncTime, syncEnabled }
```

---

## 🔍 Monitoring & Logs

### Backup Logs

All sync operations are logged in Firestore:

```
backup_logs/
  └── {logId}/
      ├── collection: string
      ├── documentId: string
      ├── status: 'success' | 'error'
      ├── syncedAt: timestamp
      ├── trigger: 'auto' | 'manual'
      └── error?: string
```

### Query Backup Logs

```typescript
const logs = await db.collection('backup_logs')
  .where('status', '==', 'error')
  .orderBy('syncedAt', 'desc')
  .limit(10)
  .get();
```

---

## 📈 Using the Client Service

### Import Service

```typescript
import { NeonDbService } from '../services/neonDbService';

const neonDb = NeonDbService.getInstance();
```

### Check if Configured

```typescript
if (neonDb.isConfigured()) {
  // NeonDB is ready
}
```

### Sync Document

```typescript
const status = await neonDb.syncDocument('users', 'user123', {
  name: 'John',
  email: 'john@example.com'
});

console.log(status.synced); // true/false
console.log(status.error);  // error message if failed
```

### Get Backup Stats

```typescript
const stats = await neonDb.getBackupStats();
console.log(`Total collections: ${stats.totalCollections}`);
console.log(`Total documents: ${stats.totalDocuments}`);
console.log(`Last sync: ${stats.lastSyncTime}`);
```

---

## 🔐 Security

### Access Control

- **Auto-sync**: Runs automatically (no auth required for triggers)
- **Manual syncs**: Require admin privileges
- **Read operations**: Require admin privileges

### Connection Security

- Uses SSL/TLS for all connections
- Connection string stored in Firebase Secrets
- Never exposed to client-side code

---

## 🚨 Troubleshooting

### Sync Not Working

1. **Check NeonDB connection**:
   ```bash
   # Test connection
   psql "your-neon-connection-string"
   ```

2. **Check Firebase Functions logs**:
   ```bash
   firebase functions:log
   ```

3. **Verify secret is set**:
   ```bash
   firebase functions:secrets:access NEON_DB_URL
   ```

### Common Errors

**Error: "NeonDB not configured"**
- Solution: Set `NEON_DB_URL` in Firebase Secrets

**Error: "Connection refused"**
- Solution: Check NeonDB connection string and network access

**Error: "Table does not exist"**
- Solution: Tables are auto-created on first sync

---

## 📊 Querying Backup Data

### Using SQL in NeonDB Console

```sql
-- Get all users
SELECT * FROM firestore_users;

-- Count documents in a collection
SELECT COUNT(*) FROM firestore_transactions;

-- Find specific document
SELECT * FROM firestore_users WHERE id = 'user123';

-- Query JSONB data
SELECT * FROM firestore_users 
WHERE data->>'email' = 'john@example.com';

-- Get recent syncs
SELECT * FROM firestore_users 
ORDER BY updated_at DESC 
LIMIT 10;
```

### Using pgAdmin or DBeaver

Connect to NeonDB using your connection string and explore the `firestore_*` tables.

---

## 🔄 Restore from Backup

### Manual Restore Process

1. **Query from NeonDB**:
   ```sql
   SELECT data FROM firestore_users WHERE id = 'user123';
   ```

2. **Restore to Firestore**:
   ```typescript
   await db.collection('users').doc('user123').set(backupData);
   ```

### Bulk Restore

Create a Cloud Function to restore entire collections from NeonDB backup.

---

## 📝 Notes

- **Auto-sync is enabled by default** - Every Firestore change is backed up
- **Soft deletes** - Deleted documents are marked as deleted, not removed
- **JSONB format** - All Firestore data stored as JSONB for flexible querying
- **No impact on Firestore** - Backup runs asynchronously, doesn't slow down writes
- **Cost** - NeonDB free tier: 0.5GB storage, 1 project

---

## ✅ Status

- ✅ Auto-sync trigger implemented
- ✅ Manual sync functions implemented
- ✅ Client service created
- ✅ Backup statistics available
- ✅ Error logging enabled

**Ready to use!** Just add your NeonDB connection string.

---

**Last Updated**: 2024
**Database**: NeonDB (PostgreSQL)
**Primary DB**: Firebase Firestore
**Backup Status**: Auto-sync enabled

