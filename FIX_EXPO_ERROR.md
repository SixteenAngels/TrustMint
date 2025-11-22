# Fixing Expo "Body is unusable" Error

## Problem
```
TypeError: Body is unusable: Body has already been read
```

This error occurs when Expo CLI tries to validate dependencies and reads the response body multiple times.

## Solutions

### Solution 1: Skip Dependency Validation (Quick Fix)
```bash
npx expo start --clear --no-dev
```

### Solution 2: Use Environment Variable
```bash
$env:EXPO_NO_DOTENV="1"
npx expo start --clear
```

### Solution 3: Update Expo CLI
```bash
npm install -g expo-cli@latest
# or
npx expo@latest start --clear
```

### Solution 4: Clear All Caches
```bash
# Clear Expo cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Clear Metro bundler cache
rm -rf node_modules/.cache
# or on Windows:
rmdir /s /q node_modules\.cache

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Solution 5: Use Alternative Start Method
```bash
# Start without doctor checks
npx expo start --clear --no-dev --offline
```

## Recommended Fix

The quickest solution is to use:
```bash
npm run start:no-check
```

Or manually:
```bash
npx expo start --clear --no-dev
```

This skips the dependency validation that's causing the issue.

