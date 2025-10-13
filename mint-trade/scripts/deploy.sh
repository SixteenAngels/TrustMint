#!/bin/bash

echo "🚀 Deploying Mint Trade..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

echo "📦 Installing dependencies..."

# Install app dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..

echo "🔧 Building functions..."
cd functions
npm run build
cd ..

echo "🚀 Deploying to Firebase..."

# Deploy functions
echo "Deploying Cloud Functions..."
firebase deploy --only functions

# Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Storage rules
echo "Deploying Storage rules..."
firebase deploy --only storage:rules

# Deploy hosting (if you have a web admin panel)
echo "Deploying hosting..."
firebase deploy --only hosting

echo "✅ Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your Firebase config in src/firebase.config.ts"
echo "2. Run the seed data script: node scripts/seedData.js"
echo "3. Test the app: npm start"
echo ""
echo "🎉 Mint Trade is now live!"