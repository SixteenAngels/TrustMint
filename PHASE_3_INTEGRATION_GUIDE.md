# 🎬 Phase 3: Screen Integration Guide

**Status:** Starting  
**Date:** November 13, 2025  
**Objective:** Integrate Phase 1 (Components) + Phase 2 (Hooks/Utils/Theme) into all 27 screens  
**Estimated Duration:** 2-3 days

---

## 🎯 Phase 3 Objectives

### Main Goals
1. ✅ Create ThemeProvider wrapper
2. Integrate new components into screens
3. Replace old styling with new theme system
4. Add form validation to inputs
5. Add error handling to API calls
6. Add loading states with useAsync
7. Persist user preferences

### Screens to Update (27 total)
```
Priority 1 (Core):
- [ ] HomeScreen (dashboard/portfolio view)
- [ ] TradingScreen (trading interface)
- [ ] WalletScreen (wallet management)
- [ ] PortfolioScreen (portfolio view)

Priority 2 (Secondary):
- [ ] MarketsScreen
- [ ] StockDetailScreen
- [ ] ProfileScreen
- [ ] SettingsScreen (if exists)

Priority 3 (Others):
- [ ] SignInScreen
- [ ] SignUpScreen
- [ ] AuthenticationScreen
- [ ] 14+ additional screens
```

---

## 📋 Integration Checklist

### Step 1: Setup (15 min)
- [x] Create ThemeProvider component
- [ ] Wrap App.tsx with ThemeProvider
- [ ] Test theme access in components

### Step 2: Update Core Screens (1-2 hours)
- [ ] HomeScreen
  - [ ] Replace colors with useTheme
  - [ ] Add useAsync for data loading
  - [ ] Replace custom components with new ones
  - [ ] Add error boundaries

- [ ] TradingScreen
  - [ ] Add form validation with validators
  - [ ] Replace Input components
  - [ ] Add error handling
  - [ ] Add loading states

- [ ] PortfolioScreen
  - [ ] Replace PortfolioChart component
  - [ ] Use formatters for display
  - [ ] Add useAsync for loading

- [ ] WalletScreen
  - [ ] Replace custom components
  - [ ] Add currency formatting
  - [ ] Implement persistence with useLocalStorage

### Step 3: Update Supporting Screens (1-2 hours)
- [ ] MarketsScreen
- [ ] StockDetailScreen
- [ ] ProfileScreen
- [ ] And others

### Step 4: Testing (1 hour)
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test theme switching
- [ ] Test error handling

---

## 🔄 Common Integration Patterns

### Pattern 1: Replace Colors

**Before:**
```typescript
import { colors } from '../styles/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark,
    borderColor: colors.primary
  }
});
```

**After:**
```typescript
import { useColors } from '@/ui/theme';

const MyScreen = () => {
  const colors = useColors();
  
  return (
    <View style={{ 
      backgroundColor: colors.bg.primary,
      borderColor: colors.primary[600]
    }} />
  );
};
```

---

### Pattern 2: Use Async Loading

**Before:**
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

**After:**
```typescript
const { data, loading, error } = useAsync(() => fetchData());
```

---

### Pattern 3: Add Form Validation

**Before:**
```typescript
const handleSubmit = () => {
  if (!email) Alert.alert('Error', 'Email required');
  if (!password) Alert.alert('Error', 'Password required');
  // ... more manual validation
};
```

**After:**
```typescript
import { validate, validators } from '@/utils';

const handleSubmit = () => {
  const errors = validate(formData, {
    email: [validators.required('Email'), validators.email('Email')],
    password: [validators.required('Password'), validators.minLength('Password', 8)]
  });
  
  if (errors.length > 0) {
    errors.forEach(err => showAlert(err.message));
    return;
  }
  // Submit
};
```

---

### Pattern 4: Use Formatters

**Before:**
```typescript
const priceDisplay = '$' + stock.price.toFixed(2);
const dateDisplay = new Date(stock.lastUpdate).toLocaleDateString();
const changeDisplay = (stock.change > 0 ? '+' : '') + stock.change.toFixed(2) + '%';
```

**After:**
```typescript
import { formatCurrency, formatDate, formatPercentage } from '@/utils';

const priceDisplay = formatCurrency(stock.price);
const dateDisplay = formatDate(stock.lastUpdate);
const changeDisplay = formatPercentage(stock.change);
```

---

### Pattern 5: Use New Components

**Before:**
```typescript
const CustomInput = ({ value, onChange }) => (
  <TextInput
    style={{ 
      borderWidth: 1,
      borderColor: 'gray',
      padding: 10,
      // ...
    }}
    value={value}
    onChangeText={onChange}
  />
);
```

**After:**
```typescript
import { Input } from '@/components/ui';

const MyScreen = () => {
  return (
    <Input
      label="Username"
      placeholder="Enter username"
      value={username}
      onChangeText={setUsername}
      error={errors.username}
    />
  );
};
```

---

### Pattern 6: Add Error Handling

**Before:**
```typescript
try {
  const result = await executeAction();
  // use result
} catch (err) {
  console.error('Error:', err);
  Alert.alert('Error', 'Something went wrong');
}
```

**After:**
```typescript
import { useErrorHandler } from '@/hooks';

const { handleError, getErrorMessage } = useErrorHandler(
  (error) => showToast(error.message)
);

try {
  const result = await executeAction();
  // use result
} catch (err) {
  handleError(err, 'ActionContext');
  // Already logged and user notified
}
```

---

### Pattern 7: Add Persistence

**Before:**
```typescript
// Manual AsyncStorage handling
useEffect(() => {
  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem('settings');
    if (saved) setSettings(JSON.parse(saved));
  };
  loadSettings();
}, []);

const saveSettings = async (newSettings) => {
  await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
  setSettings(newSettings);
};
```

**After:**
```typescript
import { useLocalStorageObject } from '@/hooks';

const [settings, updateSettings, clearSettings, loading] = 
  useLocalStorageObject('settings', defaultSettings);

// Updates are automatically persisted!
await updateSettings({ theme: 'light' });
```

---

## 📱 HomeScreen Integration Example

Here's how HomeScreen should be refactored:

```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useAsync, useErrorHandler } from '@/hooks';
import { useColors, useSpacing } from '@/ui/theme';
import { formatCurrency, formatPercentage } from '@/utils';
import { StockService } from '../services/stockService';
import { 
  Card, 
  PortfolioChart, 
  StockCard, 
  Alert 
} from '@/components/ui';
import { useAuth } from '../contexts/AuthContext';

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const colors = useColors();
  const spacing = useSpacing();
  const { handleError } = useErrorHandler();
  
  const stockService = StockService.getInstance();
  
  // Load data
  const { 
    data: portfolio, 
    loading: portfolioLoading, 
    error: portfolioError 
  } = useAsync(
    () => user ? stockService.getPortfolio(user.uid) : Promise.resolve([]),
    { immediate: true }
  );
  
  // Load stocks
  const { 
    data: stocks, 
    loading: stocksLoading 
  } = useAsync(
    () => stockService.getStocks(),
    { immediate: true }
  );
  
  const handleRefresh = async () => {
    try {
      // Re-execute both async operations
    } catch (err) {
      handleError(err, 'HomeScreen.refresh');
    }
  };
  
  const totalValue = portfolio?.reduce((sum, item) => sum + item.value, 0) || 0;
  const totalChange = portfolio?.reduce((sum, item) => sum + item.change, 0) || 0;
  
  return (
    <ScrollView 
      style={{ backgroundColor: colors.bg.primary }}
      onScroll={handleRefresh}
    >
      {portfolioError && (
        <Alert 
          title="Error Loading Portfolio"
          description={portfolioError.message}
          variant="destructive"
          dismissible
        />
      )}
      
      {/* Portfolio Card */}
      <Card style={{ margin: spacing.md }}>
        <PortfolioChart
          totalValue={formatCurrency(totalValue)}
          change={parseFloat(formatPercentage(totalChange))}
        />
      </Card>
      
      {/* Stock List */}
      {stocks && stocks.map(stock => (
        <StockCard
          key={stock.id}
          symbol={stock.symbol}
          name={stock.name}
          price={formatCurrency(stock.price)}
          change={stock.changePercent}
          onPress={() => navigateToDetail(stock.id)}
        />
      ))}
    </ScrollView>
  );
};
```

---

## 🛠️ Integration Tools Available

### From Phase 2 - Hooks
```typescript
import {
  useAsync,              // Load data
  useDebounce,           // Search optimization
  useThrottle,           // Scroll optimization
  useLocalStorage,       // Persist data
  useErrorHandler        // Handle errors
} from '@/hooks';
```

### From Phase 2 - Utilities
```typescript
import {
  formatCurrency,        // Display money
  formatDate,            // Display dates
  formatPercentage,      // Display changes
  validate,              // Validate forms
  isValidEmail,          // Validate email
  isValidPhoneNumber,    // Validate phone
  retry                  // Retry on failure
} from '@/utils';
```

### From Phase 1 - Components
```typescript
import {
  Button,                // Action button
  Card,                  // Container
  Input,                 // Form input
  Alert,                 // Alert message
  Badge,                 // Tag/label
  Select,                // Dropdown
  StockCard,             // Stock display
  PortfolioChart,        // Portfolio viz
  InsightCard            // Insight
} from '@/components/ui';
```

### From Phase 2 - Theme
```typescript
import {
  useTheme,              // Full theme
  useColors,             // Colors
  useSpacing,            // Spacing
  useTypography          // Typography
} from '@/ui/theme';
```

---

## ⚡ Quick Integration Steps

For each screen, follow these 5 steps:

### Step 1: Import New Dependencies
```typescript
import { useAsync, useErrorHandler } from '@/hooks';
import { useColors, useSpacing } from '@/ui/theme';
import { formatCurrency, validate, validators } from '@/utils';
import { Button, Input, Card, Alert } from '@/components/ui';
```

### Step 2: Replace Colors
```typescript
const colors = useColors();
// Replace all hardcoded colors with colors.* values
```

### Step 3: Replace Components
```typescript
// Old TextInput → New Input component
// Old TouchableOpacity → New Button component
// Old View → New Card component (where appropriate)
```

### Step 4: Add Data Loading
```typescript
const { data, loading, error } = useAsync(() => fetchData());

// Show loading/error/data states
```

### Step 5: Add Validation
```typescript
const errors = validate(formData, {
  email: [validators.required('Email'), validators.email('Email')]
});
```

---

## 📊 Expected Outcomes

After Phase 3 completion, each screen will have:
- ✅ Consistent theming via useTheme
- ✅ New component library components
- ✅ Better error handling
- ✅ Loading states with useAsync
- ✅ Form validation
- ✅ Formatted displays (currency, date, etc.)
- ✅ Better performance (debounce, throttle)
- ✅ Data persistence options

---

## 🚀 Implementation Order

### Day 1 (4-5 hours)
1. Create ThemeProvider ✅
2. Update HomeScreen (1.5 hours)
3. Update TradingScreen (1.5 hours)
4. Update WalletScreen (1 hour)

### Day 2 (4-5 hours)
1. Update PortfolioScreen (1 hour)
2. Update MarketsScreen (1 hour)
3. Update StockDetailScreen (1 hour)
4. Update ProfileScreen (0.5 hour)
5. Test and fix (1-2 hours)

### Day 3 (2-3 hours)
1. Update remaining screens (1-2 hours)
2. Full app testing (1 hour)
3. Fix any issues (0.5 hour)

---

## ✅ Testing Checklist

After integrating each screen:
- [ ] Theme loads correctly (colors, fonts, spacing)
- [ ] Components render without errors
- [ ] Data loads with useAsync
- [ ] Errors display correctly
- [ ] Forms validate inputs
- [ ] Formatters display values correctly
- [ ] Loading states work
- [ ] Navigation works
- [ ] Styles look consistent

---

## 📞 Troubleshooting

### Issue: Theme values undefined
**Solution:** Make sure app is wrapped with ThemeProvider

### Issue: Component not rendering
**Solution:** Check all imports are from `@/components/ui`

### Issue: Validation not working
**Solution:** Ensure schema passed to `validate()` function

### Issue: Data not loading
**Solution:** Check `useAsync` is being called with correct function

### Issue: Old styles still showing
**Solution:** Remove old StyleSheet.create() calls, use theme colors

---

## 🎉 Next Steps

After Phase 3:
- [ ] Move to Phase 4: Service Layer Refactoring
- [ ] Create BaseService class
- [ ] Add retry logic to all services
- [ ] Implement centralized error handling

---

**Phase 3 Status:** Starting  
**Objective:** Integrate all utilities into 27 screens  
**Duration:** 2-3 days  
**Next Phase:** Phase 4 - Service Layer Refactoring

Ready to start? Let me know which screen to update first!
