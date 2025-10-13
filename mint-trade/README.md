# 💹 Mint Trade - Ghana's Smart Stock Trading App

A modern React Native app for simulated stock trading using real Ghana Stock Exchange (GSE) data. Built with Expo, Firebase, and TypeScript.

## 🚀 Features

- **Phone Number Verification**: Compulsory Firebase Auth with OTP
- **Real GSE Data**: Live market data from Ghana Stock Exchange
- **Virtual Trading**: Simulated trading with ₵10,000 demo credits
- **Portfolio Management**: Track investments and performance
- **Learning Hub**: Educational content for beginners
- **Price Alerts**: Get notified of price movements
- **Modern UI**: Clean, intuitive interface

## 🛠 Tech Stack

- **Frontend**: Expo (React Native + TypeScript)
- **Backend**: Firebase Cloud Functions
- **Database**: Firestore
- **Authentication**: Firebase Auth (Phone)
- **Storage**: Firebase Storage
- **Notifications**: Firebase Cloud Messaging
- **Charts**: Victory Native

## 📱 Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Firebase account
- Android Studio / Xcode (for device testing)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd mint-trade
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Phone), Firestore, Storage, and Cloud Functions
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Place them in the appropriate directories

### 3. Configure Firebase

Update `src/firebase.config.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

### 5. Run the App

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 📊 Data Setup

### 1. Seed Initial Data

Run this script to populate Firestore with initial stock data and lessons:

```javascript
// scripts/seedData.js
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Seed stocks
const stocks = [
  {
    id: 'gse_mtn',
    name: 'MTN Ghana',
    symbol: 'MTN',
    price: 0.85,
    change: 0.02,
    changePercent: 2.41,
    volume: 1000000,
    updatedAt: new Date()
  },
  // Add more stocks...
];

// Seed lessons
const lessons = [
  {
    id: 'lesson_1',
    title: 'What are Stocks?',
    content: 'Stocks represent ownership in a company...',
    order: 1,
    completed: false
  },
  // Add more lessons...
];

// Add to Firestore
stocks.forEach(stock => {
  db.collection('stocks').doc(stock.id).set(stock);
});

lessons.forEach(lesson => {
  db.collection('lessons').doc(lesson.id).set(lesson);
});
```

## 🏗 Project Structure

```
mint-trade/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── screens/            # App screens
│   ├── services/           # API services
│   └── types/              # TypeScript type definitions
├── functions/              # Firebase Cloud Functions
├── assets/                 # Images, icons, etc.
└── docs/                   # Documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### GSE API Configuration

The app uses the GSE API at `https://dev.kwayisi.org/apis/gse/live`. Update the URL in `functions/index.js` if needed.

## 📱 App Screens

1. **Onboarding**: Phone verification and profile setup
2. **Dashboard**: Portfolio overview and market data
3. **Trading**: Buy/sell stocks interface
4. **Learning**: Educational content and quizzes
5. **Notifications**: Price alerts and updates
6. **Portfolio**: Detailed investment tracking

## 🔐 Security

- Phone number verification required
- Firestore security rules enforce user data isolation
- Cloud Functions validate all trading operations
- No sensitive data stored client-side

## 🚀 Deployment

### Android

```bash
# Build APK
expo build:android

# Or build with EAS
eas build --platform android
```

### iOS

```bash
# Build for iOS
expo build:ios

# Or build with EAS
eas build --platform ios
```

## 📈 Monitoring

- Firebase Analytics for user engagement
- Cloud Functions logs for debugging
- Firestore usage monitoring
- Performance monitoring with Firebase Performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@minttrade.gh or create an issue in the repository.

## 🗺 Roadmap

- [ ] Real money integration
- [ ] Advanced charting
- [ ] Social trading features
- [ ] AI-powered insights
- [ ] Multi-language support

---

**Built with ❤️ for Ghana's growing investor community**