#!/bin/bash

# NeonDB Setup Script for TrustMint
# This script helps you configure NeonDB backup

echo "🔧 Setting up NeonDB backup for TrustMint..."
echo ""

# Check if we're in the functions directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Error: Please run this script from the functions directory"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found. Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "📦 Step 1: Installing PostgreSQL client..."
npm install pg

echo ""
echo "🔐 Step 2: Setting NeonDB connection string as Firebase Secret..."
echo "Paste your connection string when prompted:"
echo "postgresql://neondb_owner:npg_WE2GXadx4Ujo@ep-rapid-cloud-a407c4um-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo ""

firebase functions:secrets:set NEON_DB_URL

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ NeonDB connection string set successfully!"
    echo ""
    echo "🚀 Step 3: Building functions..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Build successful!"
        echo ""
        echo "📤 Step 4: Deploy functions? (y/n)"
        read -r deploy
        if [ "$deploy" = "y" ] || [ "$deploy" = "Y" ]; then
            firebase deploy --only functions
            if [ $? -eq 0 ]; then
                echo ""
                echo "🎉 NeonDB backup is now active!"
                echo ""
                echo "✅ Auto-sync is enabled - every Firestore change will backup to NeonDB"
                echo "📊 Check backup_logs collection in Firestore to monitor syncs"
            fi
        else
            echo ""
            echo "⚠️  Functions built but not deployed. Run 'firebase deploy --only functions' when ready."
        fi
    else
        echo "❌ Build failed. Check errors above."
        exit 1
    fi
else
    echo "❌ Failed to set secret. Check Firebase CLI setup."
    exit 1
fi

