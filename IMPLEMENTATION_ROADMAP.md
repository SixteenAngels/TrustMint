# TrustMint Implementation Roadmap

Complete guide to implement all core features for a production-ready fintech trading app.

---

## Phase 1: Authentication & KYC (Foundation)

### 1.1 Email + Password Authentication
**Status**: ✅ Partially Done
**What's Working**:
- Firebase Auth integration
- Email/password signup
- Local user creation

**What's Needed**:
```typescript
// src/services/authService.ts
- Proper Firebase signup with email verification
- Password reset flow
- Session management with tokens
- Secure credential storage
```

**Implementation Steps**:
1. Enable Email/Password in Firebase Console
2. Setup email verification
3. Implement password reset UI screens
4. Add session persistence with AsyncStorage

---

### 1.2 OTP Authentication (Optional)
**Status**: ⏳ Partial
**Current**: Phone auth started in AuthContext

**What's Needed**:
```typescript
// Phone number verification
- Validate phone format for Ghana (+233)
- Rate limiting on OTP requests
- OTP expiry (5-10 minutes)
- Retry mechanism
```

**Key Config**:
```json
{
  "phoneAuth": {
    "enabled": true,
    "verificationTimeout": 600,
    "maxRetries": 3,
    "ottExpirySeconds": 300
  }
}
```

---

### 1.3 KYC Verification Flow
**Status**: ❌ Not Started
**Required Screens**:

```
KYCVerificationScreen (parent)
├── PersonalInfoStep
│   ├── Full Name
│   ├── Email
│   ├── Phone Number
│   ├── Date of Birth
│   └── Nationality
├── IDDocumentStep
│   ├── ID Type (Passport, National ID, Driver License)
│   ├── Document Number
│   ├── Issuance Date
│   └── Expiry Date
├── DocumentUploadStep
│   ├── Front photo
│   ├── Back photo
│   └── Selfie with document
└── VerificationStep
    ├── Show submitted data
    ├── Pending status
    └── Approval/Rejection message
```

**Backend Requirements** (Firebase):
```typescript
// Firestore Collection: /kyc/{userId}
{
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_needed';
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    nationality: string;
  };
  idDocument: {
    type: 'passport' | 'national_id' | 'drivers_license';
    number: string;
    issuanceDate: Date;
    expiryDate: Date;
  };
  documents: {
    frontId: string; // Firebase Storage URL
    backId: string;
    selfie: string;
  };
  adminNotes?: string;
  rejectionReason?: string;
}
```

---

## Phase 2: Database Schema

### 2.1 Firebase Firestore Collections

```typescript
// 1. Users Collection
db.collection('users/{userId}')
{
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'manager' | 'admin';
  verified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    notifications: boolean;
    autoTrade: boolean;
    twoFactorEnabled: boolean;
  };
}

// 2. Portfolio Collection
db.collection('users/{userId}/portfolio/{stockId}')
{
  stockId: string;
  quantity: number;
  avgPurchasePrice: number;
  totalCost: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  purchaseDate: Timestamp;
}

// 3. Transactions Collection
db.collection('users/{userId}/transactions/{transactionId}')
{
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  stockId?: string;
  quantity?: number;
  price?: number;
  total: number;
  brokerOrderId?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Timestamp;
  aiExecuted: boolean;
  aiSignalId?: string;
}

// 4. Wallet Collection
db.collection('users/{userId}/wallet')
{
  balance: number;
  currency: 'GHS' | 'USD';
  lastUpdated: Timestamp;
  transactions: Transaction[];
}

// 5. AI Signals Collection
db.collection('ai_signals/{signalId}')
{
  stockId: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  reasoning: string;
  targetPrice?: number;
  stopLoss?: number;
  createdAt: Timestamp;
  modelVersion: string;
  performance?: {
    actualReturn: number;
    predictedReturn: number;
    accuracy: boolean;
  };
}

// 6. Stocks Master Data
db.collection('stocks/{stockId}')
{
  symbol: string;
  name: string;
  exchange: 'GSE' | 'NASDAQ' | 'NYSE';
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe?: number;
  dividend?: number;
  lastUpdated: Timestamp;
  fundamentals?: {
    eps: number;
    revenue: number;
    netIncome: number;
  };
}

// 7. Auto-Trade Rules Collection
db.collection('users/{userId}/autoTradRules/{ruleId}')
{
  enabled: boolean;
  stockIds: string[];
  condition: 'ai_signal' | 'price_alert' | 'schedule';
  signal?: 'BUY' | 'SELL';
  minConfidence?: number;
  maxPositionSize: number;
  createdAt: Timestamp;
}

// 8. Notifications Collection
db.collection('users/{userId}/notifications/{notificationId}')
{
  type: 'signal' | 'trade' | 'alert' | 'milestone';
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Timestamp;
}

// 9. Admin - KYC Reviews
db.collection('admin/kyc_reviews/{userId}')
{
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
  reviewedBy: string;
  reviewedAt: Timestamp;
  notes: string;
}

// 10. Admin - Audit Logs
db.collection('admin/audit_logs/{logId}')
{
  userId: string;
  action: string;
  resource: string;
  changes: Record<string, any>;
  timestamp: Timestamp;
  ipAddress?: string;
}
```

### 2.2 Firebase Firestore Indexes (Required)

```yaml
# These indexes are needed for efficient queries

- collectionId: users
  fields:
    - fieldPath: role
      order: ASCENDING
    - fieldPath: kycStatus
      order: ASCENDING

- collectionId: ai_signals
  fields:
    - fieldPath: stockId
      order: ASCENDING
    - fieldPath: createdAt
      order: DESCENDING

- collectionId: 'users/{userId}/transactions'
  fields:
    - fieldPath: type
      order: ASCENDING
    - fieldPath: timestamp
      order: DESCENDING

- collectionId: 'users/{userId}/portfolio'
  fields:
    - fieldPath: currentValue
      order: DESCENDING

- collectionId: stocks
  fields:
    - fieldPath: exchange
      order: ASCENDING
    - fieldPath: lastUpdated
      order: DESCENDING
```

---

## Phase 3: Live Stock Price Feeds

### 3.1 Ghana Stock Exchange (GSE)
**Provider**: [Ghana Stock Exchange API](https://www.gse.com.gh)

**Setup**:
```typescript
// src/services/gseService.ts
import axios from 'axios';

interface GSEStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
}

class GSEService {
  private apiKey = process.env.GSE_API_KEY;
  private baseUrl = 'https://api.gse.com.gh/v1';

  async getStocks(): Promise<GSEStock[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/stocks`, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });
      return response.data;
    } catch (error) {
      console.error('GSE API Error:', error);
      throw error;
    }
  }

  async getStockDetails(symbol: string): Promise<GSEStock> {
    const response = await axios.get(
      `${this.baseUrl}/stocks/${symbol}`,
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );
    return response.data;
  }

  async getMarketData() {
    const response = await axios.get(`${this.baseUrl}/market/data`);
    return response.data;
  }
}

export const gseService = new GSEService();
```

### 3.2 US Stock Feeds (Twelve Data)
**Provider**: [Twelve Data](https://twelvedata.com/)

**Setup**:
```typescript
// src/services/twelveDataService.ts
import axios from 'axios';

class TwelveDataService {
  private apiKey = process.env.TWELVE_DATA_API_KEY;
  private baseUrl = 'https://api.twelvedata.com';

  async getPrice(symbol: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/price`, {
        params: {
          symbol,
          apikey: this.apiKey,
          format: 'JSON'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Twelve Data Error:', error);
      throw error;
    }
  }

  async getIntraday(symbol: string, interval: string = '15min') {
    const response = await axios.get(`${this.baseUrl}/time_series`, {
      params: {
        symbol,
        interval,
        apikey: this.apiKey,
        outputsize: 100
      }
    });
    return response.data;
  }

  async getTechnicalIndicators(symbol: string) {
    const response = await axios.get(`${this.baseUrl}/ta/bbands`, {
      params: {
        symbol,
        interval: '1day',
        apikey: this.apiKey
      }
    });
    return response.data;
  }
}

export const twelveDataService = new TwelveDataService();
```

### 3.3 Price Cache & Update Strategy

```typescript
// src/services/priceService.ts
class PriceService {
  private cache = new Map<string, { price: number; timestamp: number }>();
  private cacheExpiry = 60000; // 1 minute

  async getPriceWithCache(symbol: string): Promise<number> {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.price;
    }

    // Fetch from source
    const price = await this.fetchPrice(symbol);
    this.cache.set(symbol, { price, timestamp: Date.now() });
    return price;
  }

  private async fetchPrice(symbol: string): Promise<number> {
    if (symbol.includes('.GH')) {
      return (await gseService.getStockDetails(symbol)).price;
    } else {
      return (await twelveDataService.getPrice(symbol)).price;
    }
  }

  // Update all stocks in Firebase
  async syncPricesToFirebase() {
    const stocks = await db.collection('stocks').get();
    const updates: Promise<any>[] = [];

    for (const doc of stocks.docs) {
      const symbol = doc.data().symbol;
      const price = await this.getPriceWithCache(symbol);
      updates.push(
        db.collection('stocks').doc(doc.id).update({
          price,
          lastUpdated: new Date()
        })
      );
    }

    await Promise.all(updates);
  }
}

export const priceService = new PriceService();
```

---

## Phase 4: Broker API Integration

### 4.1 Broker Connection Setup

**Supported Brokers**:
- [ ] Interactive Brokers (IBKR)
- [ ] Alpha Trading (local Ghana broker)
- [ ] Tradestation
- [ ] Custom API

**Generic Broker Interface**:

```typescript
// src/types/broker.ts
interface BrokerAccount {
  accountId: string;
  broker: string;
  balance: number;
  buyingPower: number;
  positions: Position[];
}

interface BrokerTrade {
  orderId: string;
  symbol: string;
  quantity: number;
  price: number;
  side: 'BUY' | 'SELL';
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  timestamp: Date;
}

interface IBrokerAdapter {
  connect(): Promise<void>;
  getAccount(): Promise<BrokerAccount>;
  placeTrade(trade: BrokerTrade): Promise<{ orderId: string }>;
  cancelTrade(orderId: string): Promise<void>;
  getTradeStatus(orderId: string): Promise<BrokerTrade>;
}
```

### 4.2 Broker Service Implementation

```typescript
// src/services/brokerService.ts
import { IBrokerAdapter } from '../types/broker';
import { InteractiveBrokersAdapter } from './brokers/ibkrAdapter';

class BrokerService {
  private adapter: IBrokerAdapter;

  async initializeBroker(brokerType: string, credentials: any) {
    switch (brokerType) {
      case 'ibkr':
        this.adapter = new InteractiveBrokersAdapter(credentials);
        break;
      default:
        throw new Error(`Unsupported broker: ${brokerType}`);
    }
    await this.adapter.connect();
  }

  async executeTrade(userId: string, trade: any) {
    try {
      const result = await this.adapter.placeTrade(trade);
      
      // Log in Firebase
      await db.collection('users').doc(userId)
        .collection('transactions').add({
          brokerOrderId: result.orderId,
          ...trade,
          status: 'pending',
          timestamp: new Date()
        });

      return result;
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw error;
    }
  }

  async syncTradeStatus(userId: string, orderId: string) {
    const trade = await this.adapter.getTradeStatus(orderId);
    await db.collection('users').doc(userId)
      .collection('transactions').doc(orderId).update({
        status: trade.status.toLowerCase()
      });
    return trade;
  }
}

export const brokerService = new BrokerService();
```

### 4.3 Interactive Brokers Adapter

```typescript
// src/services/brokers/ibkrAdapter.ts
import { IBrokerAdapter, BrokerTrade, BrokerAccount } from '../../types/broker';
import { Client } from '@ibkr/client'; // IBKR SDK

export class InteractiveBrokersAdapter implements IBrokerAdapter {
  private client: Client;

  constructor(credentials: { accountId: string; apiKey: string }) {
    this.client = new Client({
      accountId: credentials.accountId,
      apiKey: credentials.apiKey
    });
  }

  async connect(): Promise<void> {
    await this.client.authenticate();
  }

  async getAccount(): Promise<BrokerAccount> {
    const account = await this.client.getAccountSummary();
    return {
      accountId: account.accountId,
      broker: 'IBKR',
      balance: account.totalCashValue,
      buyingPower: account.buyingPower,
      positions: account.positions
    };
  }

  async placeTrade(trade: BrokerTrade): Promise<{ orderId: string }> {
    const order = {
      action: trade.side,
      quantity: trade.quantity,
      orderType: 'LMT', // Limit order
      lmtPrice: trade.price,
      tIf: 'DAY'
    };

    const result = await this.client.placeOrder(trade.symbol, order);
    return { orderId: result.orderId };
  }

  async cancelTrade(orderId: string): Promise<void> {
    await this.client.cancelOrder(orderId);
  }

  async getTradeStatus(orderId: string): Promise<BrokerTrade> {
    const order = await this.client.getOrder(orderId);
    return {
      orderId,
      symbol: order.symbol,
      quantity: order.quantity,
      price: order.lmtPrice,
      side: order.action as 'BUY' | 'SELL',
      status: order.status as 'PENDING' | 'FILLED' | 'CANCELLED',
      timestamp: new Date(order.createTime)
    };
  }
}
```

---

## Phase 5: AI Engine

### 5.1 AI Model Architecture

```typescript
// src/services/aiEngine/aiModel.ts
interface StockAnalysis {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  targetPrice: number;
  stopLoss: number;
  reasoning: {
    technicalScore: number;
    fundamentalScore: number;
    sentimentScore: number;
  };
}

class AIModel {
  // Simple ML model (can be upgraded to TensorFlow.js)
  
  async analyzeStock(symbol: string): Promise<StockAnalysis> {
    const [technicals, fundamentals, sentiment] = await Promise.all([
      this.analyzeTechnicals(symbol),
      this.analyzeFundamentals(symbol),
      this.analyzeSentiment(symbol)
    ]);

    const confidence = (technicals + fundamentals + sentiment) / 3;
    const signal = this.getSignal(confidence, technicals, fundamentals);

    return {
      symbol,
      signal,
      confidence,
      targetPrice: await this.calculateTargetPrice(symbol, signal),
      stopLoss: await this.calculateStopLoss(symbol),
      reasoning: {
        technicalScore: technicals,
        fundamentalScore: fundamentals,
        sentimentScore: sentiment
      }
    };
  }

  private async analyzeTechnicals(symbol: string): Promise<number> {
    // RSI, MACD, Bollinger Bands, Moving Averages
    const data = await twelveDataService.getTechnicalIndicators(symbol);
    // Score 0-1 based on indicators
    return this.scoreTechnicals(data);
  }

  private async analyzeFundamentals(symbol: string): Promise<number> {
    // P/E ratio, earnings growth, revenue
    const stock = await db.collection('stocks').doc(symbol).get();
    const data = stock.data();
    
    let score = 0.5; // neutral
    if (data.pe && data.pe < 15) score += 0.3;
    if (data.revenue > 0) score += 0.2;
    return Math.min(score, 1);
  }

  private async analyzeSentiment(symbol: string): Promise<number> {
    // Analyze news sentiment (use NewsAPI or similar)
    // For now, return neutral
    return 0.5;
  }

  private getSignal(
    confidence: number,
    technicals: number,
    fundamentals: number
  ): 'BUY' | 'SELL' | 'HOLD' {
    if (confidence > 0.7 && technicals > 0.6) return 'BUY';
    if (confidence > 0.7 && technicals < 0.4) return 'SELL';
    return 'HOLD';
  }

  private async calculateTargetPrice(symbol: string, signal: string): Promise<number> {
    const stock = await db.collection('stocks').doc(symbol).get();
    const currentPrice = stock.data().price;
    
    if (signal === 'BUY') {
      return currentPrice * 1.15; // 15% upside target
    } else if (signal === 'SELL') {
      return currentPrice * 0.85; // 15% downside target
    }
    return currentPrice;
  }

  private async calculateStopLoss(symbol: string): Promise<number> {
    const stock = await db.collection('stocks').doc(symbol).get();
    const currentPrice = stock.data().price;
    return currentPrice * 0.92; // 8% stop loss
  }

  private scoreTechnicals(data: any): number {
    // Implement technical analysis scoring
    // This is a simplified version
    return 0.5;
  }
}

export const aiModel = new AIModel();
```

### 5.2 AI Signal Generation

```typescript
// src/services/aiEngine/signalService.ts
class AISignalService {
  async generateSignals(): Promise<void> {
    const stocks = await db.collection('stocks').get();
    
    for (const doc of stocks.docs) {
      try {
        const symbol = doc.data().symbol;
        const analysis = await aiModel.analyzeStock(symbol);

        // Save signal to Firebase
        await db.collection('ai_signals').add({
          stockId: symbol,
          signal: analysis.signal,
          confidence: analysis.confidence,
          targetPrice: analysis.targetPrice,
          stopLoss: analysis.stopLoss,
          reasoning: analysis.reasoning,
          createdAt: new Date(),
          modelVersion: '1.0'
        });

        // Notify users interested in this stock
        await this.notifyUsers(symbol, analysis);
      } catch (error) {
        console.error(`Failed to analyze ${doc.data().symbol}:`, error);
      }
    }
  }

  private async notifyUsers(symbol: string, analysis: any): Promise<void> {
    // Find users interested in this stock
    const followers = await db.collectionGroup('portfolio')
      .where('stockId', '==', symbol)
      .get();

    const notifications = followers.docs.map(doc => ({
      userId: doc.ref.path.split('/')[1],
      type: 'signal',
      title: `AI Signal for ${symbol}`,
      body: `${analysis.signal} signal with ${(analysis.confidence * 100).toFixed(0)}% confidence`,
      data: {
        symbol,
        signal: analysis.signal,
        confidence: analysis.confidence
      }
    }));

    for (const notif of notifications) {
      await db.collection('users').doc(notif.userId)
        .collection('notifications').add({
          ...notif,
          read: false,
          createdAt: new Date()
        });
    }
  }

  async evaluateSignal(signalId: string, actualReturn: number): Promise<void> {
    // Track signal accuracy
    const signal = await db.collection('ai_signals').doc(signalId).get();
    const targetPrice = signal.data().targetPrice;
    const currentPrice = await this.getCurrentPrice(signal.data().stockId);
    
    const predictedReturn = (targetPrice - currentPrice) / currentPrice;
    const accuracy = Math.sign(predictedReturn) === Math.sign(actualReturn);

    await db.collection('ai_signals').doc(signalId).update({
      performance: {
        actualReturn,
        predictedReturn,
        accuracy
      }
    });
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    const stock = await db.collection('stocks').doc(symbol).get();
    return stock.data().price;
  }
}

export const aiSignalService = new AISignalService();
```

---

## Phase 6: Auto-Trading System

### 6.1 Auto-Trade Rules Engine

```typescript
// src/services/autoTradeService.ts
interface AutoTradeRule {
  ruleId: string;
  userId: string;
  enabled: boolean;
  stockIds: string[];
  condition: 'ai_signal' | 'price_alert' | 'schedule';
  signal?: 'BUY' | 'SELL';
  minConfidence: number;
  maxPositionSize: number;
  createdAt: Date;
}

class AutoTradeService {
  async processAISignals(): Promise<void> {
    // Get all active signals
    const signals = await db.collection('ai_signals')
      .where('createdAt', '>', new Date(Date.now() - 3600000))
      .get();

    for (const signalDoc of signals.docs) {
      const signal = signalDoc.data();
      
      // Find users with matching rules
      const users = await db.collection('users')
        .where('settings.autoTrade', '==', true)
        .get();

      for (const userDoc of users.docs) {
        const rules = await db.collection('users').doc(userDoc.id)
          .collection('autoTradeRules')
          .where('enabled', '==', true)
          .where('stockIds', 'array-contains', signal.stockId)
          .where('minConfidence', '<=', signal.confidence)
          .get();

        for (const ruleDoc of rules.docs) {
          const rule = ruleDoc.data();
          
          if (rule.condition === 'ai_signal' && rule.signal === signal.signal) {
            await this.executeTrade(userDoc.id, signal, rule, signalDoc.id);
          }
        }
      }
    }
  }

  private async executeTrade(
    userId: string,
    signal: any,
    rule: AutoTradeRule,
    signalId: string
  ): Promise<void> {
    try {
      const user = await db.collection('users').doc(userId).get();
      const account = await brokerService.getAccount();

      // Calculate position size (max 10% of portfolio per trade)
      const tradeSize = Math.min(
        account.buyingPower * 0.1,
        rule.maxPositionSize
      );

      // Get current price
      const price = await priceService.getPriceWithCache(signal.stockId);
      const quantity = Math.floor(tradeSize / price);

      if (quantity === 0) {
        console.log(`Insufficient funds for ${signal.stockId}`);
        return;
      }

      // Execute trade
      const trade = await brokerService.executeTrade(userId, {
        symbol: signal.stockId,
        quantity,
        side: signal.signal,
        price
      });

      // Log AI execution
      await db.collection('users').doc(userId)
        .collection('transactions').add({
          type: signal.signal.toLowerCase(),
          stockId: signal.stockId,
          quantity,
          price,
          total: quantity * price,
          brokerOrderId: trade.orderId,
          status: 'pending',
          aiExecuted: true,
          aiSignalId: signalId,
          autoRuleId: rule.ruleId,
          timestamp: new Date()
        });

      // Notify user
      await db.collection('users').doc(userId)
        .collection('notifications').add({
          type: 'trade',
          title: `Auto-Trade Executed: ${signal.signal} ${signal.stockId}`,
          body: `${quantity} shares at GHS ${price.toFixed(2)}`,
          data: {
            symbol: signal.stockId,
            quantity,
            price,
            orderId: trade.orderId
          },
          read: false,
          createdAt: new Date()
        });

    } catch (error) {
      console.error(`Auto-trade failed for user ${userId}:`, error);
      // Notify user of failure
      await db.collection('users').doc(userId)
        .collection('notifications').add({
          type: 'trade',
          title: 'Auto-Trade Failed',
          body: `Failed to execute trade for ${signal.stockId}`,
          read: false,
          createdAt: new Date()
        });
    }
  }

  async getUserAutoTradeRules(userId: string): Promise<AutoTradeRule[]> {
    const snap = await db.collection('users').doc(userId)
      .collection('autoTradeRules').get();
    return snap.docs.map(doc => ({ ...doc.data(), ruleId: doc.id } as AutoTradeRule));
  }

  async createAutoTradeRule(userId: string, rule: Partial<AutoTradeRule>): Promise<string> {
    const docRef = await db.collection('users').doc(userId)
      .collection('autoTradeRules').add({
        ...rule,
        createdAt: new Date()
      });
    return docRef.id;
  }

  async updateAutoTradeRule(userId: string, ruleId: string, updates: Partial<AutoTradeRule>): Promise<void> {
    await db.collection('users').doc(userId)
      .collection('autoTradeRules').doc(ruleId).update(updates);
  }

  async deleteAutoTradeRule(userId: string, ruleId: string): Promise<void> {
    await db.collection('users').doc(userId)
      .collection('autoTradeRules').doc(ruleId).delete();
  }
}

export const autoTradeService = new AutoTradeService();
```

### 6.2 Cloud Functions for Auto-Trade (Firebase)

```typescript
// functions/src/autoTrade.ts
import * as functions from 'firebase-functions';
import { autoTradeService } from './services/autoTradeService';
import { aiSignalService } from './services/aiEngine/signalService';
import { priceService } from './services/priceService';

// Run every 30 minutes
export const processAutoTrades = functions.pubsub
  .schedule('every 30 minutes')
  .onRun(async (context) => {
    console.log('Processing auto-trades...');
    try {
      await autoTradeService.processAISignals();
      console.log('Auto-trade processing completed');
    } catch (error) {
      console.error('Auto-trade processing failed:', error);
    }
  });

// Run every hour
export const generateAISignals = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    console.log('Generating AI signals...');
    try {
      await aiSignalService.generateSignals();
      console.log('AI signal generation completed');
    } catch (error) {
      console.error('AI signal generation failed:', error);
    }
  });

// Run every 5 minutes
export const syncPrices = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    console.log('Syncing prices...');
    try {
      await priceService.syncPricesToFirebase();
      console.log('Price sync completed');
    } catch (error) {
      console.error('Price sync failed:', error);
    }
  });
```

---

## Phase 7: Wallet & Payment Integration

### 7.1 Payment Provider Setup

**Supported Providers**:
- [ ] Flutterwave (Ghana)
- [ ] Stripe
- [ ] Momo Payment (Ghana)

**Example: Flutterwave Integration**

```typescript
// src/services/paymentService.ts
import axios from 'axios';

class PaymentService {
  private apiKey = process.env.FLUTTERWAVE_API_KEY;
  private baseUrl = 'https://api.flutterwave.com/v3';

  async initiateDeposit(userId: string, amount: number): Promise<{
    paymentLink: string;
    transactionId: string;
  }> {
    const response = await axios.post(
      `${this.baseUrl}/payments`,
      {
        amount,
        currency: 'GHS',
        customer: {
          email: 'user@example.com',
          name: 'User Name'
        },
        customizations: {
          title: 'TrustMint Deposit',
          description: `Deposit GHS ${amount}`
        },
        redirect_url: 'app://deposit-callback'
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save transaction record
    await db.collection('users').doc(userId)
      .collection('transactions').add({
        type: 'deposit',
        amount,
        paymentProvider: 'flutterwave',
        transactionId: response.data.data.id,
        status: 'pending',
        timestamp: new Date()
      });

    return {
      paymentLink: response.data.data.link,
      transactionId: response.data.data.id
    };
  }

  async verifyPayment(transactionId: string): Promise<{
    status: 'successful' | 'failed';
    amount: number;
  }> {
    const response = await axios.get(
      `${this.baseUrl}/transactions/${transactionId}/verify`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      }
    );

    return {
      status: response.data.data.status,
      amount: response.data.data.amount
    };
  }

  async initiateWithdrawal(
    userId: string,
    amount: number,
    bankDetails: any
  ): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/transfers`,
      {
        account_bank: bankDetails.bankCode,
        account_number: bankDetails.accountNumber,
        amount,
        currency: 'GHS',
        narration: 'Withdrawal from TrustMint'
      },
      {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      }
    );

    const transactionId = response.data.data.id;

    // Log withdrawal
    await db.collection('users').doc(userId)
      .collection('transactions').add({
        type: 'withdrawal',
        amount,
        paymentProvider: 'flutterwave',
        transactionId,
        status: 'pending',
        bankDetails,
        timestamp: new Date()
      });

    return transactionId;
  }
}

export const paymentService = new PaymentService();
```

### 7.2 Wallet Service

```typescript
// src/services/walletService.ts (Enhanced)
class WalletService {
  async getBalance(userId: string): Promise<number> {
    const wallet = await db.collection('users').doc(userId)
      .collection('wallet').doc('main').get();
    return wallet.data()?.balance || 0;
  }

  async updateBalance(userId: string, amount: number, type: 'deposit' | 'withdrawal' | 'trade'): Promise<void> {
    const walletRef = db.collection('users').doc(userId)
      .collection('wallet').doc('main');

    const wallet = await walletRef.get();
    const currentBalance = wallet.data()?.balance || 0;
    const newBalance = currentBalance + amount;

    await walletRef.update({
      balance: newBalance,
      lastUpdated: new Date()
    });

    // Log transaction
    await db.collection('users').doc(userId)
      .collection('transactions').add({
        type,
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        timestamp: new Date()
      });
  }

  async processDepositCallback(transactionId: string, status: string, amount: number): Promise<void> {
    // Find the transaction
    const transaction = await db.collectionGroup('transactions')
      .where('transactionId', '==', transactionId)
      .get();

    if (transaction.empty) return;

    const userDoc = transaction.docs[0].ref.parent.parent;
    const userId = userDoc?.id;

    if (status === 'successful') {
      await this.updateBalance(userId, amount, 'deposit');
      
      // Update transaction status
      await transaction.docs[0].ref.update({ status: 'completed' });
    } else {
      await transaction.docs[0].ref.update({ status: 'failed' });
    }
  }
}
```

---

## Phase 8: Push Notifications

### 8.1 Firebase Cloud Messaging Setup

```typescript
// src/services/notificationService.ts
import * as messaging from 'firebase-messaging';

class NotificationService {
  private messaging = messaging.getMessaging();

  async requestPermission(): Promise<string | null> {
    try {
      const token = await this.messaging.getToken({
        vapidKey: process.env.FIREBASE_VAPID_KEY
      });
      return token;
    } catch (error) {
      console.error('Notification permission denied:', error);
      return null;
    }
  }

  async saveFcmToken(userId: string, token: string): Promise<void> {
    await db.collection('users').doc(userId)
      .update({
        fcmToken: token,
        tokenUpdatedAt: new Date()
      });
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    const user = await db.collection('users').doc(userId).get();
    const fcmToken = user.data()?.fcmToken;

    if (!fcmToken) {
      console.log(`No FCM token for user ${userId}`);
      return;
    }

    await messaging.send({
      token: fcmToken,
      notification: {
        title,
        body,
        imageUrl: 'https://example.com/logo.png'
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      webpush: {
        fcmOptions: {
          link: 'https://trustmint.app'
        }
      }
    });
  }

  async sendSignalNotification(signal: any): Promise<void> {
    // Find users following this stock
    const followers = await db.collectionGroup('portfolio')
      .where('stockId', '==', signal.stockId)
      .get();

    for (const doc of followers.docs) {
      const userId = doc.ref.parent.parent?.id;
      if (userId) {
        await this.sendNotification(
          userId,
          `AI Signal: ${signal.signal}`,
          `${signal.stockId} - ${(signal.confidence * 100).toFixed(0)}% confidence`,
          {
            type: 'signal',
            signal: signal.signal,
            symbol: signal.stockId,
            confidence: signal.confidence.toString()
          }
        );
      }
    }
  }

  async sendTradeNotification(userId: string, trade: any): Promise<void> {
    await this.sendNotification(
      userId,
      `Trade ${trade.type.toUpperCase()}`,
      `${trade.quantity} x ${trade.symbol} @ GHS ${trade.price}`,
      {
        type: 'trade',
        symbol: trade.symbol,
        orderId: trade.orderId
      }
    );
  }

  async sendPriceAlertNotification(userId: string, stock: string, price: number): Promise<void> {
    await this.sendNotification(
      userId,
      `Price Alert: ${stock}`,
      `Reached GHS ${price.toFixed(2)}`,
      {
        type: 'alert',
        symbol: stock,
        price: price.toString()
      }
    );
  }

  async sendMilestoneNotification(userId: string, milestone: string): Promise<void> {
    await this.sendNotification(
      userId,
      'Portfolio Milestone!',
      milestone,
      {
        type: 'milestone'
      }
    );
  }
}

export const notificationService = new NotificationService();
```

### 8.2 In-App Notification UI

```tsx
// src/screens/NotificationsScreen.tsx (Enhanced)
export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const setupNotificationListener = async () => {
      // Listen for notifications
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        console.log('Notification received:', remoteMessage);
        
        // Add to in-app notifications
        setNotifications(prev => [{
          id: Date.now().toString(),
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          data: remoteMessage.data,
          read: false,
          createdAt: new Date()
        }, ...prev]);
      });

      return unsubscribe;
    };

    setupNotificationListener();
  }, []);

  return (
    <ScrollView>
      {notifications.map(notification => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </ScrollView>
  );
};
```

---

## Phase 9: Admin Dashboard

### 9.1 Admin Dashboard Features

```typescript
// src/screens/AdminDashboardScreen.tsx (Enhanced)
interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTradeVolume: number;
  pendingKyc: number;
  completedKyc: number;
  systemHealth: {
    apiStatus: 'online' | 'warning' | 'offline';
    databaseStatus: 'online' | 'warning' | 'offline';
    brokerConnection: 'online' | 'offline';
  };
  aiMetrics: {
    totalSignals: number;
    signalAccuracy: number;
    autoTradesExecuted: number;
  };
}

class AdminService {
  async getAdminStats(): Promise<AdminStats> {
    const users = await db.collection('users').get();
    const transactions = await db.collectionGroup('transactions').get();
    const signals = await db.collection('ai_signals').get();
    const kycReviews = await db.collection('admin/kyc_reviews').get();

    const totalUsers = users.size;
    const activeUsers = users.docs.filter(d => 
      d.data().lastLogin > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const totalTradeVolume = transactions.docs.reduce((sum, doc) => 
      sum + (doc.data().total || 0), 0
    );

    const pendingKyc = kycReviews.docs.filter(d => d.data().status === 'pending').length;
    const completedKyc = kycReviews.docs.filter(d => d.data().status === 'approved').length;

    return {
      totalUsers,
      activeUsers,
      totalTradeVolume,
      pendingKyc,
      completedKyc,
      systemHealth: await this.checkSystemHealth(),
      aiMetrics: {
        totalSignals: signals.size,
        signalAccuracy: await this.calculateSignalAccuracy(),
        autoTradesExecuted: transactions.docs.filter(d => d.data().aiExecuted).length
      }
    };
  }

  async approveKyc(userId: string, adminNotes?: string): Promise<void> {
    const kycRef = db.collection('kyc').doc(userId);
    await kycRef.update({
      status: 'approved',
      reviewedAt: new Date(),
      adminNotes
    });

    // Update user
    await db.collection('users').doc(userId).update({
      kycStatus: 'approved'
    });

    // Notify user
    await db.collection('users').doc(userId)
      .collection('notifications').add({
        type: 'notification',
        title: 'KYC Approved',
        body: 'Your identity verification has been approved!',
        read: false,
        createdAt: new Date()
      });
  }

  async rejectKyc(userId: string, reason: string): Promise<void> {
    await db.collection('kyc').doc(userId).update({
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: new Date()
    });

    await db.collection('users').doc(userId).update({
      kycStatus: 'rejected'
    });

    // Notify user
    await db.collection('users').doc(userId)
      .collection('notifications').add({
        type: 'notification',
        title: 'KYC Rejected',
        body: `Your identity verification was rejected: ${reason}`,
        read: false,
        createdAt: new Date()
      });
  }

  private async checkSystemHealth() {
    // Check API and broker status
    try {
      await priceService.getPriceWithCache('AAPL');
      return {
        apiStatus: 'online' as const,
        databaseStatus: 'online' as const,
        brokerConnection: 'online' as const
      };
    } catch {
      return {
        apiStatus: 'offline' as const,
        databaseStatus: 'offline' as const,
        brokerConnection: 'offline' as const
      };
    }
  }

  private async calculateSignalAccuracy(): Promise<number> {
    const signals = await db.collection('ai_signals')
      .where('performance', '!=', null)
      .get();

    if (signals.empty) return 0;

    const accurate = signals.docs.filter(d => d.data().performance.accuracy).length;
    return accurate / signals.size;
  }
}

export const adminService = new AdminService();
```

---

## Environment Variables

Create `.env.example`:

```env
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_VAPID_KEY=your_vapid_key

# Stock Data Providers
GSE_API_KEY=your_gse_key
TWELVE_DATA_API_KEY=your_twelve_data_key

# Broker API
BROKER_TYPE=ibkr
BROKER_ACCOUNT_ID=your_account_id
BROKER_API_KEY=your_broker_api_key

# Payment Provider
FLUTTERWAVE_API_KEY=your_flutterwave_key
STRIPE_SECRET_KEY=your_stripe_key

# Google Auth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret

# NewsAPI (for sentiment)
NEWS_API_KEY=your_news_api_key

# Admin
ADMIN_EMAIL=admin@trustmint.app
```

---

## Implementation Checklist

### Phase 1: Auth & KYC
- [ ] Email/password authentication
- [ ] OTP verification
- [ ] KYC flow screens
- [ ] Document upload
- [ ] Admin KYC approval

### Phase 2: Database
- [ ] Create all Firestore collections
- [ ] Setup indexes
- [ ] Create data models
- [ ] Setup security rules

### Phase 3: Stock Feeds
- [ ] GSE API integration
- [ ] Twelve Data integration
- [ ] Price caching
- [ ] Real-time updates (Firestore listeners)

### Phase 4: Broker
- [ ] Choose broker
- [ ] Setup API credentials
- [ ] Implement trade execution
- [ ] Sync trade status

### Phase 5: AI
- [ ] Build initial model
- [ ] Integrate technical indicators
- [ ] Implement signal generation
- [ ] Track signal performance

### Phase 6: Auto-Trade
- [ ] Rule engine
- [ ] Trade execution
- [ ] Cloud functions
- [ ] Audit logging

### Phase 7: Wallet & Payments
- [ ] Payment provider setup
- [ ] Deposit flow
- [ ] Withdrawal flow
- [ ] Balance sync

### Phase 8: Notifications
- [ ] FCM setup
- [ ] Notification service
- [ ] Event triggers
- [ ] In-app UI

### Phase 9: Admin
- [ ] Dashboard stats
- [ ] KYC management
- [ ] System monitoring
- [ ] Audit logs

---

## Next Steps

1. **Start with Phase 1-2**: Get auth and database working
2. **Move to Phase 3**: Implement price feeds
3. **Implement Phase 4-5**: Core trading functionality
4. **Add Phase 6-7**: Auto-trading and wallet
5. **Polish with Phase 8-9**: Notifications and admin

Each phase builds on the previous, so complete them in order for best results.

