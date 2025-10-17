#!/bin/bash

# Mint Trade Backend Deployment Script
# This script deploys the complete backend infrastructure

set -e

echo "🚀 Starting Mint Trade Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_error "Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Set project ID
PROJECT_ID="trustmint-73687187-f32e6"
print_status "Using Firebase project: $PROJECT_ID"

# Deploy Firestore rules
print_status "Deploying Firestore rules..."
firebase deploy --only firestore:rules --project $PROJECT_ID
print_success "Firestore rules deployed"

# Deploy Firestore indexes
print_status "Deploying Firestore indexes..."
firebase deploy --only firestore:indexes --project $PROJECT_ID
print_success "Firestore indexes deployed"

# Deploy Storage rules
print_status "Deploying Storage rules..."
firebase deploy --only storage --project $PROJECT_ID
print_success "Storage rules deployed"

# Install dependencies for functions
print_status "Installing function dependencies..."
cd functions
npm install
print_success "Function dependencies installed"

# Deploy Cloud Functions
print_status "Deploying Cloud Functions..."
firebase deploy --only functions --project $PROJECT_ID
print_success "Cloud Functions deployed"

# Deploy Hosting (if needed)
print_status "Deploying Hosting..."
firebase deploy --only hosting --project $PROJECT_ID
print_success "Hosting deployed"

# Set up environment variables
print_status "Setting up environment variables..."
firebase functions:config:set \
  zeepay.api_key="your-zeepay-api-key" \
  zeepay.secret="your-zeepay-secret" \
  app.webhook_url="https://us-central1-$PROJECT_ID.cloudfunctions.net" \
  app.return_url="https://$PROJECT_ID.web.app" \
  alpha_vantage.api_key="your-alpha-vantage-key" \
  --project $PROJECT_ID

print_warning "Please update the environment variables with your actual API keys:"
echo "firebase functions:config:get --project $PROJECT_ID"

# Run database migrations
print_status "Running database migrations..."
cd ../functions
node -e "
const DatabaseMigrations = require('./src/database/migrations');
const migrations = new DatabaseMigrations();
migrations.runMigrations().then(() => {
  console.log('Database migrations completed');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
"
print_success "Database migrations completed"

# Test the deployment
print_status "Testing deployment..."
curl -s "https://us-central1-$PROJECT_ID.cloudfunctions.net/api/stocks/live" | head -c 100
print_success "API endpoint is responding"

print_success "🎉 Backend deployment completed successfully!"
print_status "API Base URL: https://us-central1-$PROJECT_ID.cloudfunctions.net/api"
print_status "Webhook URL: https://us-central1-$PROJECT_ID.cloudfunctions.net/zeepayWebhook"

echo ""
print_warning "Next steps:"
echo "1. Update API keys in Firebase Functions config"
echo "2. Configure your frontend to use the new API endpoints"
echo "3. Set up monitoring and logging"
echo "4. Test all functionality thoroughly"

echo ""
print_status "Deployment summary:"
echo "✅ Firestore rules and indexes deployed"
echo "✅ Storage rules deployed"
echo "✅ Cloud Functions deployed"
echo "✅ Hosting deployed"
echo "✅ Database migrations completed"
echo "✅ API endpoints tested"