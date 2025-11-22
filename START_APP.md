# How to Start the App

## The Issue
Expo CLI has a bug where it tries to validate dependencies and reads the response body multiple times, causing:
```
TypeError: Body is unusable: Body has already been read
```

## Solution
Use the `--offline` flag which prevents Expo from trying to fetch dependency versions from the network.

## Commands

### Recommended (No Errors)
```bash
npm start
```
or
```bash
npx expo start --clear --no-dev --offline
```

### Alternative Commands
```bash
# With offline mode (recommended)
npm run start:no-check

# Original command (may show errors)
npm run start:dev
```

## What the Flags Do

- `--clear` - Clears Metro bundler cache
- `--no-dev` - Skips development-only checks
- `--offline` - Prevents network requests for dependency validation (fixes the error)

## Status

✅ **Fixed:** Using `--offline` flag prevents the network request that causes the error
✅ **App should start:** Without the "Body is unusable" error

The app is now starting with these flags. You should see Metro bundler starting successfully!

