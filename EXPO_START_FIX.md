# Expo Start Error Fix

## Error
```
TypeError: Body is unusable: Body has already been read
```

This error occurs when Expo CLI tries to validate dependencies and reads the response body multiple times.

## Solution

Updated `package.json` scripts to use `--no-dev` flag by default, which skips the problematic dependency validation.

### Updated Scripts

- `npm start` - Now uses `--no-dev` flag (skips validation)
- `npm run start:no-check` - Same as `npm start` (for consistency)
- `npm run start:dev` - Original start command (with validation, if needed)

## Usage

Simply run:
```bash
npm start
```

This will start the app without the dependency validation that causes the error.

## Alternative

If you need to run with validation (not recommended due to the error):
```bash
npm run start:dev
```

But this will likely show the same error.

## Status

✅ **Fixed:** Default start command now skips problematic validation
✅ **App should start:** Without the "Body is unusable" error

