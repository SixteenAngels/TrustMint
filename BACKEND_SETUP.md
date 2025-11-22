# Backend Setup Guide - TrustMint

## 📊 Database: Firebase Firestore (Primary) + NeonDB (Backup)

**We are using Firebase Firestore as our primary database, with NeonDB (PostgreSQL) as a backup.**

### What is Firestore?
- **NoSQL document database** by Google
- **Real-time synchronization** - data updates automatically
- **Scalable** - handles millions of documents
- **Secure** - built-in security rules
- **Offline support** - works without internet

### Firestore Collections Structure

```
Firestore Database
├── users/                    # User accounts
│   └── {userId}/
│       ├── name, email, phone
│       ├── balance, role
│       ├── kycStatus
│       └── createdAt
│
├── stocks/                   # Stock listings
│   └── {stockId}/
│       ├── symbol, name
│       ├── price, change
│       └── market
│
├── transactions/             # Trade history
│   └── {transactionId}/
│       ├── userId, symbol
│       ├── type (buy/sell)
│       ├── quantity, price
│       ├── total, fees
│       └── status
│
├── orders/                   # Trading orders
│   └── {orderId}/
│       ├── userId, symbol
│       ├── orderType (market/limit/stop)
│       ├── quantity, price
│       └── status
│
├── wallets/                  # User wallets
│   └── {walletId}/
│       ├── userId
│       ├── balance, currency
│       └── transactions
│
├── notifications/            # User notifications
│   └── {notificationId}/
│       ├── userId
│       ├── type, title, message
│       └── read
│
├── supportTickets/           # Support tickets
│   └── {ticketId}/
│       ├── userId
│       ├── subject, description
│       └── status
│
├── kyc_submissions/          # KYC documents
│   └── {kycId}/
│       ├── userId
│       ├── documentType
│       └── status
│
├── announcements/            # System announcements
│   └── {announcementId}/
│       ├── title, message
│       └── status
│
├── adminLogs/                # Admin activity logs
│   └── {logId}/
│       ├── action
│       ├── adminId
│       └── timestamp
│
└── analytics_events/         # Analytics tracking
    └── {eventId}/
        ├── userId
        ├── eventName
        └── properties
```

### Firestore Security Rules
- Located in: `firestore.rules`
- Enforces role-based access control
- Users can only read/write their own data
- Admins/Managers have elevated permissions

---

## 🔑 API Keys Required for Real Integration

### 1. **Payment Gateways** (Required for real payments)

#### Flutterwave
- **Public Key**: `FLUTTERWAVE_PUBLIC_KEY`
- **Secret Key**: `FLUTTERWAVE_SECRET_KEY`
- **Get from**: https://dashboard.flutterwave.com/
- **Used for**: Card payments, bank transfers (Africa)

#### Stripe
- **Public Key**: `STRIPE_PUBLIC_KEY`
- **Secret Key**: `STRIPE_SECRET_KEY`
- **Get from**: https://dashboard.stripe.com/
- **Used for**: International card payments

#### Mobile Money APIs
- **MTN Mobile Money**: `MTN_MOMO_API_KEY`
  - Get from: MTN Developer Portal
- **Vodafone Cash**: `VODAFONE_CASH_API_KEY`
  - Get from: Vodafone Developer Portal
- **AirtelTigo Money**: `AIRTELTIGO_MONEY_API_KEY`
  - Get from: AirtelTigo Developer Portal

#### Zeepay
- **API Key**: `ZEEPAY_API_KEY`
- **Get from**: Zeepay Developer Portal
- **Used for**: Mobile money aggregation

---

### 2. **Stock Market Data APIs** (Required for real stock prices)

#### Twelve Data
- **API Key**: `TWELVE_DATA_API_KEY` or `TWELVEDATA_API_KEY`
- **Get from**: https://twelvedata.com/
- **Used for**: US stocks, crypto prices
- **Free tier**: 800 requests/day

#### Alpha Vantage
- **API Key**: `ALPHA_VANTAGE_API_KEY` or `ALPHAVANTAGE_API_KEY`
- **Get from**: https://www.alphavantage.co/support/#api-key
- **Used for**: International stocks, technical indicators
- **Free tier**: 5 API calls/minute, 500 calls/day

#### Finnhub
- **API Key**: `FINNHUB_API_KEY`
- **Get from**: https://finnhub.io/
- **Used for**: Global stocks, news, sentiment
- **Free tier**: 60 calls/minute

#### EODHD (End of Day Historical Data)
- **API Key**: `EODHD_API_KEY`
- **Get from**: https://eodhistoricaldata.com/
- **Used for**: Historical stock data
- **Free tier**: 20 calls/day

#### GSE (Ghana Stock Exchange)
- **API Base URL**: `GSE_API_BASE_URL` (default: `https://dev.kwayisi.org/apis/gse`)
- **API Key**: `GSE_API_KEY` (if required)
- **Used for**: Ghana stock prices
- **Note**: Public API, may not require key

#### GSE Data Services (Official)
- **API Base URL**: `GSE_DATA_SERVICES_BASE_URL`
- **API Key**: `GSE_DATA_SERVICES_API_KEY`
- **Get from**: GSE Data Services
- **Used for**: Official GSE market data

---

### 3. **Notifications** (Required for push/email/SMS)

#### Firebase Cloud Messaging (FCM)
- **Server Key**: `FCM_SERVER_KEY`
- **Get from**: Firebase Console → Project Settings → Cloud Messaging
- **Used for**: Push notifications
- **Note**: Automatically configured with Firebase

#### SendGrid
- **API Key**: `SENDGRID_API_KEY`
- **Get from**: https://app.sendgrid.com/settings/api_keys
- **Used for**: Email notifications
- **Free tier**: 100 emails/day

#### Twilio
- **Account SID**: `TWILIO_ACCOUNT_SID`
- **Auth Token**: `TWILIO_AUTH_TOKEN`
- **Get from**: https://console.twilio.com/
- **Used for**: SMS notifications
- **Free tier**: Trial credits

---

### 4. **KYC Verification** (Required for identity verification)

#### Smile ID
- **API Key**: `SMILE_ID_API_KEY`
- **Get from**: https://portal.smileidentity.com/
- **Used for**: Document verification, face matching
- **Note**: Africa-focused KYC provider

#### Jumio
- **API Key**: `JUMIO_API_KEY`
- **Get from**: https://www.jumio.com/
- **Used for**: Global KYC verification
- **Note**: Enterprise solution

#### Onfido
- **API Key**: `ONFIDO_API_KEY`
- **Get from**: https://onfido.com/
- **Used for**: Document and biometric verification

---

### 5. **Analytics** (Optional but recommended)

#### Google Analytics
- **Tracking ID**: `GOOGLE_ANALYTICS_TRACKING_ID`
- **Get from**: https://analytics.google.com/
- **Used for**: User behavior tracking

#### Mixpanel
- **Token**: `MIXPANEL_TOKEN`
- **Get from**: https://mixpanel.com/
- **Used for**: Event tracking, funnels

#### Sentry
- **DSN**: `SENTRY_DSN`
- **Get from**: https://sentry.io/
- **Used for**: Error tracking, crash reporting
- **Free tier**: 5,000 events/month

---

### 6. **AI Services** (Optional)

#### OpenAI
- **API Key**: `OPENAI_API_KEY`
- **Get from**: https://platform.openai.com/
- **Used for**: AI insights, portfolio analysis
- **Free tier**: $5 credit

---

### 7. **WebSocket Server** (For real-time updates)

#### Custom WebSocket Server
- **URL**: `WEBSOCKET_URL`
- **Used for**: Real-time price updates, live order execution
- **Note**: You need to deploy your own WebSocket server or use a service like Pusher, Ably, or Socket.io

---

## 🚀 How to Configure API Keys

### Option 1: Environment Variables (Development)

1. Create a `.env` file in the project root:
```bash
# Payment Gateways
FLUTTERWAVE_PUBLIC_KEY=your_key_here
FLUTTERWAVE_SECRET_KEY=your_secret_here

# Stock Market Data
TWELVE_DATA_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here

# Notifications
FCM_SERVER_KEY=your_key_here
SENDGRID_API_KEY=your_key_here
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
```

2. For Expo, prefix client-side variables with `EXPO_PUBLIC_`:
```bash
EXPO_PUBLIC_TWELVE_DATA_API_KEY=your_key_here
```

### Option 2: Firebase Functions Config (Production)

For Cloud Functions, use Firebase config:

```bash
# Set secrets (recommended for sensitive keys)
firebase functions:secrets:set FLUTTERWAVE_SECRET_KEY
firebase functions:secrets:set STRIPE_SECRET_KEY

# Or use config (less secure)
firebase functions:config:set flutterwave.secret_key="your_key"
```

### Option 3: Firebase Secrets (Most Secure)

```bash
# Set secrets
firebase functions:secrets:set FLUTTERWAVE_SECRET_KEY

# Access in functions
const FLUTTERWAVE_SECRET_KEY = functions.config().flutterwave?.secret_key;
```

---

## 📝 Current Status

### ✅ **Working Without API Keys** (Mock Data)
- All backend functions work with mock data
- App is fully functional for development/testing
- Functions return mock responses when API keys are missing

### ⚠️ **Requires API Keys for Production**
- Real stock prices
- Real payment processing
- Real notifications (push/email/SMS)
- Real KYC verification
- Real analytics tracking

---

## 🔒 Security Best Practices

1. **Never commit API keys to Git**
   - Add `.env` to `.gitignore`
   - Use `.env.example` as a template

2. **Use Firebase Secrets for sensitive keys**
   - Secret keys should only be in Cloud Functions
   - Public keys can be in client code

3. **Rotate keys regularly**
   - Change keys if compromised
   - Use different keys for dev/staging/prod

4. **Monitor API usage**
   - Set up rate limiting
   - Track API costs
   - Alert on unusual activity

---

## 📚 Additional Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **Cloud Functions**: https://firebase.google.com/docs/functions
- **Environment Variables**: https://docs.expo.dev/guides/environment-variables/

---

---

## 💾 Backup Database: NeonDB (PostgreSQL)

**NeonDB is configured as a backup database** to keep copies of all Firestore data.

### Features
- ✅ **Auto-sync**: Every Firestore change automatically backs up to NeonDB
- ✅ **Manual sync**: Admin can trigger manual syncs via Cloud Functions
- ✅ **Complete redundancy**: All Firestore collections backed up
- ✅ **SQL querying**: Query backup data with standard SQL
- ✅ **Disaster recovery**: Restore data if Firestore fails

### Setup
1. Get NeonDB connection string from [neon.tech](https://neon.tech/)
2. Set `NEON_DB_URL` in Firebase Secrets:
   ```bash
   firebase functions:secrets:set NEON_DB_URL
   ```
3. Install PostgreSQL client:
   ```bash
   cd functions
   npm install pg
   ```
4. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

### Documentation
See `NEONDB_BACKUP_SETUP.md` for complete setup and usage instructions.

---

**Last Updated**: 2024
**Primary Database**: Firebase Firestore
**Backup Database**: NeonDB (PostgreSQL)
**Backend**: Firebase Cloud Functions
**Status**: All functions complete, ready for API key integration

