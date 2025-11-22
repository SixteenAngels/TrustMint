# Firebase Native Module Fix

## Problem
The app was using `@react-native-firebase/*` which requires native modules that aren't properly linked in Expo, causing:
```
Error: Native module RNFBAppModule not found
```

## Solution
Created a compatibility layer that uses the Firebase web SDK (which works in Expo) while maintaining the same API as the native modules.

## Files Created
1. `src/core/firebase/index.ts` - Main Firebase initialization using web SDK
2. `src/core/firebase/firestoreAdapter.ts` - Firestore adapter with native-like API
3. `src/core/firebase/functionsAdapter.ts` - Functions adapter
4. `src/core/firebase/authAdapter.ts` - Auth adapter
5. `src/core/firebase/compat.ts` - Compatibility exports

## How to Use

### For New Services
Import from the compatibility layer:
```typescript
import firestore from '../core/firebase/firestoreAdapter';
import functions from '../core/firebase/functionsAdapter';

const db = firestore();
```

### For Existing Services
Replace imports:
```typescript
// OLD (doesn't work in Expo)
import firestore from '@react-native-firebase/firestore';

// NEW (works in Expo)
import firestore from '../core/firebase/firestoreAdapter';
```

### FieldValue Usage
Use with type assertion:
```typescript
(firestore as any).FieldValue.serverTimestamp()
```

## Next Steps
1. Update all service files to use the new adapters
2. Test on iOS/Android to ensure everything works
3. Consider removing `@react-native-firebase/*` dependencies if not needed

## Services to Update
- [x] walletService.ts (partially updated)
- [ ] stockService.ts
- [ ] billPaymentService.ts
- [ ] kycService.ts
- [ ] investmentVaultService.ts
- [ ] p2pService.ts
- [ ] autoSaveService.ts
- [ ] adminService.ts
- [ ] socialService.ts
- [ ] paymentService.ts
- [ ] authService.ts

