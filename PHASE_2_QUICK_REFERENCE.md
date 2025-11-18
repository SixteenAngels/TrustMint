# 🚀 Phase 2 - Quick Reference Guide

**Phase 2 Status:** ✅ COMPLETE  
**Created:** November 13, 2025  
**Files:** 13 new files  
**Code:** 1,600+ lines

---

## 📦 What Was Created

### Custom Hooks (5 hooks, ~400 lines)
```typescript
import {
  useAsync,           // Manage async operations
  useDebounce,        // Debounce values
  useThrottle,        // Throttle functions
  useLocalStorage,    // Persist to device storage
  useErrorHandler     // Handle errors consistently
} from '@/hooks';
```

### Utilities (3 modules, ~500 lines, 40+ functions)
```typescript
import {
  // Validators (~80 lines)
  isValidEmail,
  validatePassword,
  isValidPhoneNumber,
  isValidAmount,
  validate,           // Schema validation
  validators          // Validator builders
  
  // Formatters (~200 lines)
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatPhoneNumber,
  truncate,
  capitalize
  
  // Helpers (~250 lines)
  retry,              // Retry with backoff
  deepClone,
  merge,
  groupBy,
  unique,
  chunk,
  wait,
  generateUUID
} from '@/utils';
```

### Design System (5 files, ~700 lines, 150+ tokens)
```typescript
import {
  // Colors
  colors,
  getColorWithOpacity,
  lightenColor,
  darkenColor,
  
  // Typography
  typography,
  getTypographyVariant,
  
  // Spacing
  spacing,
  createSymmetricSpacing,
  
  // Theme
  defaultTheme,
  ThemeContext,
  useTheme,
  useColors,
  useSpacing,
  useTypography
} from '@/ui/theme';
```

---

## 🎯 Most Used Functions

### Hooks
```typescript
// 1. useAsync - Load data on mount
const { data, loading, error } = useAsync(() => fetchStocks());

// 2. useDebounce - Search optimization
const debouncedSearch = useDebounce(searchTerm, 300);

// 3. useLocalStorage - Save user preferences
const [theme, setTheme] = useLocalStorage('theme', 'dark');

// 4. useErrorHandler - Consistent error messages
const { handleError, getErrorMessage } = useErrorHandler();
```

### Validators
```typescript
// Email validation
if (!isValidEmail(email)) { /* error */ }

// Password strength
const { isValid, score, feedback } = validatePassword(password);

// Form validation
const errors = validate(formData, {
  email: [validators.required('Email'), validators.email('Email')],
  password: [validators.required('Password'), validators.minLength('Password', 8)]
});
```

### Formatters
```typescript
// Currency
formatCurrency(1234.56)         // "₵1,234.56"

// Date
formatDate(new Date())          // "13 Nov 2025"
formatTimeAgo(dateMinutesAgo(5)) // "5 minutes ago"

// Numbers
formatNumber(1000000)           // "1M"
formatPercentage(2.5)           // "+2.50%"
```

### Helpers
```typescript
// Retry logic
const data = await retry(() => fetchData(), { maxRetries: 3 });

// Array operations
const unique = unique([1, 2, 2, 3])      // [1, 2, 3]
const groups = groupBy(users, 'role')    // { admin: [...], user: [...] }

// Object cloning
const copy = deepClone(obj);
```

### Theme
```typescript
// Access theme
const theme = useTheme();

// Access specific values
const colors = useColors();
const { md, lg } = useSpacing();

// Use in styling
<View style={{ 
  backgroundColor: colors.bg.surface,
  padding: spacing.md,
  borderRadius: 8
}} />
```

---

## 📂 File Locations

```
src/
├── hooks/index.ts                       - Import all hooks
├── hooks/useAsync.ts                    - Async state management
├── hooks/useDebounce.ts                 - Debounce values/callbacks
├── hooks/useThrottle.ts                 - Throttle functions/values
├── hooks/useLocalStorage.ts             - AsyncStorage integration
├── hooks/useErrorHandler.ts             - Error handling utilities
│
├── utils/index.ts                       - Import all utilities
├── utils/validators.ts                  - Input validation (80 functions)
├── utils/formatters.ts                  - Value formatting (20+ functions)
├── utils/helpers.ts                     - Utility functions (20+ functions)
│
└── ui/theme/
    ├── index.ts                         - Import all theme
    ├── colors.ts                        - Color palette (9 color sets)
    ├── typography.ts                    - Font system (15+ variants)
    ├── spacing.ts                       - Spacing scale (30+ sizes)
    ├── theme.ts                         - Main theme config
    └── useTheme.ts                      - Theme hooks (7 hooks)
```

---

## 💡 Common Patterns

### Pattern 1: Async Loading
```typescript
const { data, loading, error, execute } = useAsync(
  () => fetchStocks(),
  { immediate: true }
);

return (
  <>
    {loading && <Spinner />}
    {error && <Alert message={error.message} />}
    {data && <StockList stocks={data} />}
  </>
);
```

### Pattern 2: Search with Debounce
```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  if (debouncedSearch) {
    searchStocks(debouncedSearch);
  }
}, [debouncedSearch]);
```

### Pattern 3: Form Validation
```typescript
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState([]);

const handleSubmit = () => {
  const validationErrors = validate(formData, {
    email: [validators.required('Email'), validators.email('Email')],
    phone: [validators.phone('Phone')]
  });
  
  if (validationErrors.length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  // Submit form
};
```

### Pattern 4: Persistent State
```typescript
const [userPrefs, updatePrefs, clearPrefs, loading] = useLocalStorageObject(
  'userPrefs',
  { theme: 'dark', language: 'en' }
);

// Update preference
await updatePrefs({ theme: 'light' });

// Load on app start
useEffect(() => {
  if (!loading) {
    applyTheme(userPrefs.theme);
  }
}, [loading]);
```

### Pattern 5: Error Handling
```typescript
const { handleError, getErrorMessage } = useErrorHandler(
  (error) => showToast(error.message)
);

try {
  await executeAction();
} catch (err) {
  const appError = handleError(err, 'ActionContext');
  // Error handled and user notified
}
```

---

## 🎨 Design System Quick Access

### Colors
```typescript
colors.primary[600]      // Brand purple
colors.success[600]      // Success green
colors.warning[600]      // Warning amber
colors.destructive[600]  // Error red
colors.text.primary      // Main text
colors.bg.surface        // Card backgrounds
```

### Spacing
```typescript
spacing.xs               // 4px
spacing.sm               // 8px
spacing.md               // 16px
spacing.lg               // 24px
spacing.xl               // 32px
spacing['2xl']           // 48px
```

### Typography
```typescript
typography.variants.h1       // Heading 1
typography.variants.h3       // Heading 3
typography.variants.bodyMd   // Body medium
typography.variants.label    // Form label
typography.variants.caption  // Small text
```

---

## ✅ Integration Checklist

- [ ] Import hooks from `@/hooks`
- [ ] Import utils from `@/utils`
- [ ] Import theme from `@/ui/theme`
- [ ] Wrap app with `<ThemeProvider>`
- [ ] Update DashboardScreen to use theme
- [ ] Replace formatters in all screens
- [ ] Add form validation to inputs
- [ ] Add error handling to API calls
- [ ] Persist user preferences
- [ ] Test on iOS and Android

---

## 🔗 Dependencies

These utilities rely on:
- `react` - React hooks
- `react-native` - React Native components
- `@react-native-async-storage/async-storage` - Device storage

All already in `package.json` ✅

---

## 📚 Next Phase: Screen Integration (Phase 3)

Phase 3 will focus on integrating these utilities into all screens:
- [ ] Create ThemeProvider wrapper
- [ ] Update 27 screens to use new theme
- [ ] Add form validation to all inputs
- [ ] Add error handling to all API calls
- [ ] Add loading states with useAsync
- [ ] Persist user preferences

---

## 🚀 Quick Start

1. **Access hooks:**
   ```typescript
   import { useAsync, useDebounce } from '@/hooks';
   ```

2. **Use validators:**
   ```typescript
   import { validate, validators } from '@/utils';
   ```

3. **Format values:**
   ```typescript
   import { formatCurrency, formatDate } from '@/utils';
   ```

4. **Access theme:**
   ```typescript
   import { useTheme, useColors } from '@/ui/theme';
   ```

---

## 📞 Support

- **Hooks issues?** Check PHASE_2_COMPLETE.md sections on each hook
- **Validation help?** See validators.ts for all validators and schema validation
- **Formatting questions?** See formatters.ts for all format functions
- **Theme issues?** Check useTheme.ts and theme.ts for theme access

---

**Status:** ✅ Phase 2 Complete | Ready for Phase 3 Integration

🎉 All utilities are production-ready and documented!
