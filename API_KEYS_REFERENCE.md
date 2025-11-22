# API Keys Reference - Complete List

## Quick Reference: All API Keys Needed

### 🔴 Critical (Required for Core Features)

| Service | Key Name | Purpose | Get From |
|---------|----------|---------|----------|
| **Flutterwave** | `FLUTTERWAVE_PUBLIC_KEY`<br>`FLUTTERWAVE_SECRET_KEY` | Payment processing (Africa) | https://dashboard.flutterwave.com/ |
| **Stripe** | `STRIPE_PUBLIC_KEY`<br>`STRIPE_SECRET_KEY` | International payments | https://dashboard.stripe.com/ |
| **Twelve Data** | `TWELVE_DATA_API_KEY` | Stock market data (US/Crypto) | https://twelvedata.com/ |
| **Alpha Vantage** | `ALPHA_VANTAGE_API_KEY` | Stock market data (Global) | https://www.alphavantage.co/ |
| **FCM** | `FCM_SERVER_KEY` | Push notifications | Firebase Console |

### 🟡 Important (Enhance User Experience)

| Service | Key Name | Purpose | Get From |
|---------|----------|---------|----------|
| **SendGrid** | `SENDGRID_API_KEY` | Email notifications | https://app.sendgrid.com/ |
| **Twilio** | `TWILIO_ACCOUNT_SID`<br>`TWILIO_AUTH_TOKEN` | SMS notifications | https://console.twilio.com/ |
| **Finnhub** | `FINNHUB_API_KEY` | Stock data & news | https://finnhub.io/ |
| **EODHD** | `EODHD_API_KEY` | Historical stock data | https://eodhistoricaldata.com/ |
| **Smile ID** | `SMILE_ID_API_KEY` | KYC verification (Africa) | https://portal.smileidentity.com/ |
| **Jumio** | `JUMIO_API_KEY` | KYC verification (Global) | https://www.jumio.com/ |

### 🟢 Optional (Nice to Have)

| Service | Key Name | Purpose | Get From |
|---------|----------|---------|----------|
| **Google Analytics** | `GOOGLE_ANALYTICS_TRACKING_ID` | Analytics tracking | https://analytics.google.com/ |
| **Mixpanel** | `MIXPANEL_TOKEN` | Event tracking | https://mixpanel.com/ |
| **Sentry** | `SENTRY_DSN` | Error tracking | https://sentry.io/ |
| **OpenAI** | `OPENAI_API_KEY` | AI insights | https://platform.openai.com/ |
| **GSE Data Services** | `GSE_DATA_SERVICES_API_KEY` | Official GSE data | GSE Data Services |
| **MTN Mobile Money** | `MTN_MOMO_API_KEY` | Mobile money payments | MTN Developer Portal |
| **Vodafone Cash** | `VODAFONE_CASH_API_KEY` | Mobile money payments | Vodafone Developer Portal |
| **AirtelTigo Money** | `AIRTELTIGO_MONEY_API_KEY` | Mobile money payments | AirtelTigo Developer Portal |
| **Zeepay** | `ZEEPAY_API_KEY` | Payment aggregation | Zeepay Developer Portal |
| **WebSocket** | `WEBSOCKET_URL` | Real-time updates | Your WebSocket server |

---

## Environment Variable Format

### For Client-Side (Expo/React Native)
```bash
# Prefix with EXPO_PUBLIC_ for client-side access
EXPO_PUBLIC_TWELVE_DATA_API_KEY=your_key_here
EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY=your_key_here
EXPO_PUBLIC_GSE_API_BASE_URL=https://dev.kwayisi.org/apis/gse
```

### For Server-Side (Cloud Functions)
```bash
# No prefix needed, accessed via functions.config()
FLUTTERWAVE_SECRET_KEY=your_secret_here
SENDGRID_API_KEY=your_key_here
```

---

## Priority Order for Integration

### Phase 1: Core Functionality
1. **Stock Market Data** (at least one)
   - Twelve Data OR Alpha Vantage
   - GSE API (free, no key needed)

2. **Payment Gateway** (at least one)
   - Flutterwave (Africa)
   - Stripe (International)

3. **Push Notifications**
   - FCM (automatically configured with Firebase)

### Phase 2: Enhanced Features
4. **Email Notifications**
   - SendGrid

5. **SMS Notifications**
   - Twilio

6. **KYC Verification**
   - Smile ID (Africa) OR Jumio (Global)

### Phase 3: Analytics & Monitoring
7. **Analytics**
   - Google Analytics
   - Mixpanel
   - Sentry

### Phase 4: Advanced Features
8. **AI Services**
   - OpenAI

9. **Real-time Updates**
   - WebSocket server

---

## Cost Estimates (Free Tiers)

| Service | Free Tier | Paid Plans Start At |
|---------|-----------|---------------------|
| Twelve Data | 800 calls/day | $9.99/month |
| Alpha Vantage | 5 calls/min, 500/day | $49.99/month |
| Finnhub | 60 calls/min | $0.10/call |
| SendGrid | 100 emails/day | $19.95/month |
| Twilio | Trial credits | $0.0075/SMS |
| Stripe | No monthly fee | 2.9% + $0.30 per transaction |
| Flutterwave | No monthly fee | 1.4% + $0.20 per transaction |
| Sentry | 5,000 events/month | $26/month |
| OpenAI | $5 credit | $0.002/1K tokens |

---

## Testing Without API Keys

**All functions work without API keys!**

- Functions return mock data when keys are missing
- App remains fully functional for development
- Real data requires API keys for production

---

**Total API Keys**: 25+ keys across 15+ services
**Critical Keys**: 6 (Payment + Stock Data + Notifications)
**Optional Keys**: 19 (Analytics, AI, Mobile Money, etc.)

