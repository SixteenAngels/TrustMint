# Mint Trade Backend API Documentation

## Overview

The Mint Trade backend is built on Firebase Cloud Functions with Express.js, providing a comprehensive API for stock trading, wallet management, and financial services.

## Base URL

```
https://us-central1-trustmint-73687187-f32e6.cloudfunctions.net/api
```

## Authentication

All API endpoints require Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## API Endpoints

### Stock Data

#### Get Live Stock Data
```http
GET /api/stocks/live
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "MTN",
      "symbol": "MTN",
      "name": "MTN Ghana",
      "price": 1.20,
      "change": 0.05,
      "changePercent": 4.35,
      "volume": 1250000,
      "high": 1.25,
      "low": 1.15,
      "open": 1.18,
      "previousClose": 1.15,
      "sector": "Telecommunications",
      "marketCap": 2500000000,
      "pe": 15.2,
      "dividend": 0.08,
      "source": "GSE",
      "updatedAt": "2024-01-15T10:30:00Z",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Historical Data
```http
GET /api/stocks/{symbol}/historical?period=1M
```

**Parameters:**
- `symbol`: Stock symbol (e.g., MTN, GCB)
- `period`: Time period (1d, 7d, 30d, 90d, 1y)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15T00:00:00Z",
      "open": 1.10,
      "high": 1.15,
      "low": 1.08,
      "close": 1.12,
      "volume": 1000000
    }
  ]
}
```

#### Get Stock Details
```http
GET /api/stocks/{symbol}
```

### Portfolio Management

#### Get User Portfolio
```http
GET /api/portfolio
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "MTN",
      "stockId": "MTN",
      "quantity": 100,
      "avgPrice": 1.15,
      "currentPrice": 1.20,
      "currentValue": 120.00,
      "gainLoss": 5.00,
      "gainLossPercent": 4.35,
      "stockName": "MTN Ghana",
      "stockSymbol": "MTN"
    }
  ]
}
```

#### Get Portfolio Analytics
```http
GET /api/portfolio/analytics?period=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": 10000.00,
    "totalCost": 9500.00,
    "totalGainLoss": 500.00,
    "totalGainLossPercent": 5.26,
    "portfolioItems": [...],
    "historicalValues": [...],
    "performance": {
      "totalReturn": 5.26,
      "dailyReturn": 0.17,
      "volatility": 2.5,
      "sharpeRatio": 0.68
    },
    "topPerformers": [...],
    "topLosers": [...],
    "sectorAllocation": [...]
  }
}
```

### Trading

#### Execute Trade
```http
POST /api/trades
```

**Request Body:**
```json
{
  "stockId": "MTN",
  "type": "buy",
  "quantity": 100,
  "price": 1.20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade_123",
    "userId": "user_123",
    "stockId": "MTN",
    "type": "buy",
    "quantity": 100,
    "price": 1.20,
    "total": 120.00,
    "timestamp": "2024-01-15T10:30:00Z",
    "stockName": "MTN Ghana",
    "stockSymbol": "MTN"
  }
}
```

#### Get User Transactions
```http
GET /api/transactions?limit=50&offset=0
```

### Analytics

#### Get Trading Analytics
```http
GET /api/analytics/trading?period=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTrades": 25,
    "buyTrades": 15,
    "sellTrades": 10,
    "totalVolume": 5000.00,
    "totalFees": 25.00,
    "avgTradeSize": 200.00,
    "buyVolume": 3000.00,
    "sellVolume": 2000.00,
    "mostTradedStocks": [...],
    "winRate": 68.5
  }
}
```

#### Get Market Analytics
```http
GET /api/analytics/market
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStocks": 50,
    "gainers": 25,
    "losers": 20,
    "unchanged": 5,
    "totalVolume": 1000000,
    "avgVolume": 20000,
    "totalMarketCap": 50000000000,
    "topGainers": [...],
    "topLosers": [...],
    "mostActive": [...],
    "sectorPerformance": [...]
  }
}
```

#### Get Leaderboard
```http
GET /api/leaderboard?period=30d&limit=50
```

### Notifications

#### Get User Notifications
```http
GET /api/notifications?limit=50
```

#### Mark Notification as Read
```http
PUT /api/notifications/{id}/read
```

#### Mark All Notifications as Read
```http
PUT /api/notifications/read-all
```

### Price Alerts

#### Create Price Alert
```http
POST /api/price-alerts
```

**Request Body:**
```json
{
  "stockId": "MTN",
  "targetPrice": 1.50,
  "condition": "above"
}
```

#### Get User Price Alerts
```http
GET /api/price-alerts
```

## Cloud Functions

### Stock Data Functions

#### fetchGSEData
Fetches live stock data from GSE API and updates Firestore.

**Trigger:** HTTP Callable Function

### Trading Functions

#### executeTrade
Executes buy/sell trades and updates user portfolio.

**Trigger:** HTTP Callable Function

### Scheduled Functions

#### processPriceAlerts
Processes price alerts every 5 minutes.

**Trigger:** Cloud Scheduler (every 5 minutes)

#### processScheduledNotifications
Processes scheduled notifications every minute.

**Trigger:** Cloud Scheduler (every 1 minute)

#### cleanupOldData
Cleans up old notifications and data every 24 hours.

**Trigger:** Cloud Scheduler (every 24 hours)

## Database Schema

### Firestore Collections

#### Users
```
users/{userId}
├── profile: UserProfile
├── portfolio/{stockId}: PortfolioItem
├── transactions/{transactionId}: Transaction
├── notifications/{notificationId}: Notification
└── settings: UserSettings
```

#### Stocks
```
stocks/{stockId}: Stock
```

#### Wallets
```
wallets/{userId}: Wallet
```

#### P2P Transfers
```
p2pTransfers/{transferId}: P2PTransfer
```

#### Bill Payments
```
billPayments/{paymentId}: BillPayment
```

#### Price Alerts
```
priceAlerts/{alertId}: PriceAlert
```

### Cloud SQL Tables

#### Portfolio Analytics
```sql
CREATE TABLE portfolio_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    daily_pnl DECIMAL(15,2) NOT NULL,
    total_pnl DECIMAL(15,2) NOT NULL,
    total_pnl_percent DECIMAL(8,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

### Common HTTP Status Codes

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

- API calls are limited to 1000 requests per hour per user
- Stock data updates are cached for 5 minutes
- Analytics data is cached for 10 minutes

## Security

- All endpoints require Firebase Authentication
- Firestore rules enforce data access permissions
- API keys are stored securely in Firebase Functions config
- All user data is encrypted in transit and at rest

## Monitoring

- Cloud Functions logs are available in Firebase Console
- Performance metrics are tracked in Cloud Monitoring
- Error tracking is integrated with Firebase Crashlytics

## Deployment

Use the provided deployment script:

```bash
./scripts/deploy.sh
```

This will deploy:
- Firestore rules and indexes
- Storage rules
- Cloud Functions
- Hosting
- Run database migrations

## Environment Variables

Configure the following environment variables in Firebase Functions:

```bash
firebase functions:config:set \
  zeepay.api_key="your-zeepay-api-key" \
  zeepay.secret="your-zeepay-secret" \
  alpha_vantage.api_key="your-alpha-vantage-key" \
  app.webhook_url="https://us-central1-trustmint-73687187-f32e6.cloudfunctions.net" \
  app.return_url="https://trustmint-73687187-f32e6.web.app"
```

## Support

For technical support or questions about the API, please contact the development team or create an issue in the project repository.