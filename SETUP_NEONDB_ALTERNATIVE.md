# NeonDB Setup - Alternative Method

## ⚠️ Firebase Secrets Requires Blaze Plan

Your Firebase project needs to be on the **Blaze (pay-as-you-go) plan** to use Firebase Secrets.

## Option 1: Upgrade to Blaze Plan (Recommended)

1. Visit: https://console.firebase.google.com/project/minttrade-e8410/usage/details
2. Upgrade to Blaze plan (free tier available, only pay for what you use)
3. Then run:
   ```powershell
   cd functions
   firebase functions:secrets:set NEON_DB_URL
   # Paste: postgresql://neondb_owner:npg_WE2GXadx4Ujo@ep-rapid-cloud-a407c4um-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

## Option 2: Use Firebase Config (Works on Free Plan)

If you prefer not to upgrade, use Firebase Config instead:

```powershell
cd functions
firebase functions:config:set neondb.url="postgresql://neondb_owner:npg_WE2GXadx4Ujo@ep-rapid-cloud-a407c4um-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Note**: Config values are less secure than Secrets, but work on the free plan.

## Option 3: Use Environment Variable (Local Development)

For local testing, create a `.env` file in the `functions` directory:

```bash
# functions/.env
NEON_DB_URL=postgresql://neondb_owner:npg_WE2GXadx4Ujo@ep-rapid-cloud-a407c4um-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Then use the Firebase emulator:
```powershell
npm run serve
```

## After Setting the Connection String

1. **Build functions**:
   ```powershell
   npm run build
   ```

2. **Deploy functions**:
   ```powershell
   firebase deploy --only functions
   ```

## ✅ Verify Setup

After deployment, test by:
1. Creating a document in Firestore
2. Checking NeonDB for the backup
3. Viewing `backup_logs` collection in Firestore

---

**Recommended**: Upgrade to Blaze plan (it's free tier, you only pay for usage)

