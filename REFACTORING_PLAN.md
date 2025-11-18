# 🔄 TrustMint App - Comprehensive Refactoring Plan

**Status:** Phase 1 - Analysis & Planning  
**Date:** November 13, 2025

---

## 📋 Executive Summary

This document outlines a **complete architectural refactoring** of the TrustMint app to improve code quality, maintainability, performance, and scalability. The refactoring will modernize the codebase while maintaining all existing functionality.

### Goals
- ✅ Improve code organization and architecture
- ✅ Reduce technical debt and code duplication
- ✅ Enhance error handling and resilience
- ✅ Add comprehensive testing infrastructure
- ✅ Optimize performance and bundle size
- ✅ Improve developer experience (DX)

### Scope
- **Core Services:** Auth, Wallet, Stock Trading, Portfolio
- **State Management:** Context API improvements
- **UI/Components:** Component extraction and optimization
- **Testing:** Unit, Integration, E2E tests
- **Documentation:** Architecture guides and setup instructions
- **DevOps:** Build optimization, CI/CD improvements

---

## 🏗️ Phase 1: Architecture Analysis & Framework

### Current Issues Identified

#### 1. **Service Layer Issues**
- Services are independent with no base class
- No error handling standardization
- Missing retry logic for failed requests
- No caching mechanism
- Direct Firebase calls scattered across components

#### 2. **State Management**
- Heavy reliance on multiple contexts
- Prop drilling in deep component trees
- No centralized error state
- Missing loading state management
- No optimistic updates

#### 3. **Component Structure**
- 27 screens with potential code duplication
- Limited component reusability
- Missing prop types in some components
- No error boundary implementation
- Inconsistent styling approach

#### 4. **Error Handling**
- Try-catch without proper logging
- No user-friendly error messages
- Missing error recovery mechanisms
- No global error handling
- No crash reporting

#### 5. **Testing**
- Zero test coverage
- No testing infrastructure
- No test utilities
- No mock services

#### 6. **Performance**
- No code splitting
- No lazy loading for screens
- Image optimization missing
- Bundle size not monitored

---

## 🛠️ Phase 2: New Architecture Framework

### 2.1 Project Structure (Improved)

```
src/
├── app/                          # App entry & configuration
│   ├── AppNavigator.tsx
│   ├── RootProvider.tsx          # All providers wrapper
│   └── setupEnv.ts
│
├── core/                         # Core utilities & services
│   ├── api/                      # API clients & config
│   │   ├── baseClient.ts         # Base HTTP client
│   │   ├── firebaseClient.ts     # Firebase wrapper
│   │   └── retry.ts              # Retry logic
│   │
│   ├── services/                 # Business logic services
│   │   ├── base.service.ts       # Base service class
│   │   ├── auth.service.ts
│   │   ├── stock.service.ts
│   │   ├── wallet.service.ts
│   │   ├── trading.service.ts
│   │   ├── portfolio.service.ts
│   │   └── payment.service.ts
│   │
│   ├── storage/                  # Storage abstraction
│   │   ├── localStorage.ts
│   │   ├── secureStorage.ts
│   │   └── firebaseStorage.ts
│   │
│   └── logger/                   # Logging service
│       ├── logger.ts
│       └── errorReporter.ts
│
├── state/                        # State management
│   ├── store.ts                  # Redux/Zustand store
│   ├── slices/
│   │   ├── auth.slice.ts
│   │   ├── wallet.slice.ts
│   │   ├── stocks.slice.ts
│   │   ├── portfolio.slice.ts
│   │   └── ui.slice.ts
│   └── hooks/                    # Custom hooks
│       ├── useAuth.ts
│       ├── useWallet.ts
│       ├── useStocks.ts
│       └── useAsync.ts
│
├── ui/                           # UI layer
│   ├── components/               # Reusable components
│   │   ├── common/               # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── forms/                # Form components
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormPicker.tsx
│   │   │   └── FormValidator.tsx
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── Container.tsx
│   │   │   ├── Stack.tsx
│   │   │   └── SafeArea.tsx
│   │   │
│   │   └── features/             # Feature-specific components
│   │       ├── StockCard.tsx
│   │       ├── PortfolioCard.tsx
│   │       └── TransactionItem.tsx
│   │
│   ├── screens/                  # App screens (lazy loaded)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── trading/
│   │   ├── portfolio/
│   │   └── [other features]
│   │
│   ├── theme/                    # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── theme.ts
│   │   └── useTheme.ts
│   │
│   └── styles/                   # Global styles
│       └── global.ts
│
├── hooks/                        # Custom hooks
│   ├── useAsync.ts
│   ├── useDebounce.ts
│   ├── useThrottle.ts
│   ├── useLocalStorage.ts
│   └── useErrorHandler.ts
│
├── utils/                        # Utility functions
│   ├── validators.ts
│   ├── formatters.ts
│   ├── helpers.ts
│   ├── constants.ts
│   └── enums.ts
│
├── types/                        # TypeScript definitions
│   ├── index.ts
│   ├── auth.ts
│   ├── wallet.ts
│   ├── stock.ts
│   ├── portfolio.ts
│   ├── api.ts
│   └── common.ts
│
├── constants/                    # App constants
│   ├── config.ts
│   ├── routes.ts
│   ├── messages.ts
│   └── endpoints.ts
│
├── __tests__/                    # Tests
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── mocks/
│
├── assets/                       # Images, fonts, etc.
│
└── App.tsx                       # Main entry point
```

### 2.2 Key Architectural Improvements

#### A. Service Layer Pattern
```typescript
// core/services/base.service.ts
abstract class BaseService {
  protected logger = Logger.getLogger();
  protected retryConfig = { maxRetries: 3, delay: 1000 };

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: string
  ): Promise<T> {
    // Retry logic with exponential backoff
  }

  protected handleError(error: any, context: string): never {
    // Centralized error handling
  }
}
```

#### B. State Management (Switch to Zustand/Redux Toolkit)
```typescript
// state/slices/auth.slice.ts
interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  actions: {
    login: (credentials) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
  };
}
```

#### C. Error Handling & Logging
```typescript
// core/logger/errorReporter.ts
class ErrorReporter {
  static report(error: Error, context: string, metadata?: any): void {
    // Log to console (dev)
    // Send to Sentry (prod)
    // Store in local DB
  }
}
```

#### D. Custom Hooks for Common Patterns
```typescript
// hooks/useAsync.ts
function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  return { data, loading, error };
}
```

---

## 📊 Phase 3: Service Layer Refactoring

### 3.1 Base Service Class

**File:** `src/core/services/base.service.ts`

```typescript
export abstract class BaseService {
  protected logger = Logger.getLogger(this.constructor.name);

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: string,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const retryConfig = { ...this.retryConfig, ...config };
    let lastError: any;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < retryConfig.maxRetries) {
          const delay = retryConfig.delay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.handleError(lastError, context);
  }

  protected handleError(error: any, context: string): never {
    const appError = new AppError(
      error.message,
      error.code || 'UNKNOWN_ERROR',
      context
    );
    ErrorReporter.report(error, context);
    throw appError;
  }
}
```

### 3.2 Unified Services

**File:** `src/core/services/stock.service.ts`

```typescript
export class StockService extends BaseService {
  private cache = new Map<string, { data: Stock[]; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getStocks(): Promise<Stock[]> {
    return this.executeWithRetry(
      () => this._getStocksFromAPI(),
      'StockService.getStocks'
    );
  }

  private _getStocksFromAPI(): Promise<Stock[]> {
    const cached = this.cache.get('all_stocks');
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return Promise.resolve(cached.data);
    }

    return firebaseClient.callFunction('fetchGSEData').then(stocks => {
      this.cache.set('all_stocks', { data: stocks, timestamp: Date.now() });
      return stocks;
    });
  }
}
```

---

## 💾 Phase 4: State Management Refactoring

### 4.1 Migrate to Zustand/Redux Toolkit

**File:** `src/state/slices/auth.slice.ts`

```typescript
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: AppError | null;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    subscribeWithSelector((set) => ({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const user = await authService.login(credentials);
          set({ user, isAuthenticated: true });
        } catch (error) {
          set({ error: error as AppError });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await authService.logout();
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }))
  )
);
```

---

## 🎨 Phase 5: UI/Component Refactoring

### 5.1 Common Components

**File:** `src/ui/components/common/ErrorBoundary.tsx`

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
  fallback?: (error: Error, retry: () => void) => React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    ErrorReporter.report(error, 'ErrorBoundary');
    this.props.onError?.(error);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.retry) || (
          <DefaultErrorFallback error={this.state.error} retry={this.retry} />
        )
      );
    }

    return this.props.children;
  }
}
```

### 5.2 Reusable Form Components

**File:** `src/ui/components/forms/FormInput.tsx`

```typescript
interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  icon,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.errorBorder]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
```

### 5.3 Screen Structure Pattern

**File:** `src/ui/screens/dashboard/DashboardScreen.tsx`

```typescript
const DashboardScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuthStore();
  const { wallet, loading: walletLoading } = useWalletStore();
  const stocks = useStocksStore();

  const loading = authLoading || walletLoading || stocks.loading;
  const error = user?.error || wallet?.error || stocks.error;

  if (loading) return <LoadingScreen />;

  return (
    <ErrorBoundary fallback={(error) => <ErrorScreen error={error} />}>
      <SafeAreaView style={styles.container}>
        <Header title="Dashboard" />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <PortfolioSection />
          <MarketsSection />
          <QuickActionsSection />
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
};
```

---

## ✅ Phase 6: Error Handling & Logging

### 6.1 Error Types

**File:** `src/core/errors/AppError.ts`

```typescript
export enum ErrorCode {
  AUTH_FAILED = 'AUTH_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN = 'UNKNOWN',
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCode.UNKNOWN,
    public context: string = 'Unknown',
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  getUserMessage(): string {
    // User-friendly error messages based on code
  }
}
```

### 6.2 Error Reporter

**File:** `src/core/logger/errorReporter.ts`

```typescript
export class ErrorReporter {
  static report(error: any, context: string, metadata?: any): void {
    const appError = error instanceof AppError ? error : new AppError(
      error.message,
      ErrorCode.UNKNOWN,
      context
    );

    // Log locally
    Logger.getLogger().error(`[${context}] ${appError.message}`, {
      code: appError.code,
      details: appError.details,
      metadata,
    });

    // Send to Sentry (production)
    if (__DEV__ === false) {
      Sentry.captureException(appError, { contexts: { appContext: { context, metadata } } });
    }

    // Store in local database for debugging
    this.storeErrorLog(appError, context, metadata);
  }

  private static storeErrorLog(
    error: AppError,
    context: string,
    metadata?: any
  ): void {
    // Store in SQLite or Firestore for later analysis
  }
}
```

---

## 🧪 Phase 7: Testing Infrastructure

### 7.1 Setup Jest & React Native Testing Library

**File:** `jest.config.js`

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### 7.2 Test Utils

**File:** `src/__tests__/utils/testUtils.tsx`

```typescript
export const renderWithProviders = (
  component: React.ReactElement,
  { store = createTestStore(), ...renderOptions } = {}
) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <StoreProvider store={store}>
        {children}
      </StoreProvider>
    );
  }

  return { store, ...render(component, { wrapper: Wrapper, ...renderOptions }) };
};

export const createMockStock = (overrides?: Partial<Stock>): Stock => ({
  id: 'test-stock-1',
  symbol: 'TST',
  name: 'Test Stock',
  price: 100,
  change: 5,
  changePercent: 5,
  volume: 1000000,
  ...overrides,
});
```

### 7.3 Example Test

**File:** `src/__tests__/services/stock.service.test.ts`

```typescript
describe('StockService', () => {
  let stockService: StockService;
  let firebaseClientMock: jest.MockedFunction<any>;

  beforeEach(() => {
    firebaseClientMock = jest.fn();
    stockService = new StockService();
  });

  describe('getStocks', () => {
    it('should fetch stocks from API', async () => {
      const mockStocks = [createMockStock()];
      firebaseClientMock.mockResolvedValue(mockStocks);

      const stocks = await stockService.getStocks();

      expect(stocks).toEqual(mockStocks);
    });

    it('should retry on network failure', async () => {
      firebaseClientMock
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([createMockStock()]);

      const stocks = await stockService.getStocks();

      expect(firebaseClientMock).toHaveBeenCalledTimes(2);
      expect(stocks).toHaveLength(1);
    });

    it('should use cached data within cache duration', async () => {
      const mockStocks = [createMockStock()];
      firebaseClientMock.mockResolvedValue(mockStocks);

      await stockService.getStocks();
      await stockService.getStocks();

      expect(firebaseClientMock).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## 📈 Phase 8: Performance Optimization

### 8.1 Code Splitting & Lazy Loading

**File:** `src/app/navigation.tsx`

```typescript
const DashboardScreen = lazy(() =>
  import('../ui/screens/dashboard/DashboardScreen').then(mod => ({
    default: mod.DashboardScreen
  }))
);

const TradingScreen = lazy(() =>
  import('../ui/screens/trading/TradingScreen').then(mod => ({
    default: mod.TradingScreen
  }))
);

// With error boundary and loading state
const LazyScreen = ({ Component }: { Component: React.LazyExoticComponent<any> }) => (
  <Suspense fallback={<LoadingScreen />}>
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  </Suspense>
);
```

### 8.2 Bundle Analysis

**File:** `package.json` (add script)

```json
{
  "scripts": {
    "analyze-bundle": "bundle-buddy --help && expo build:web --analyze"
  }
}
```

---

## 📚 Phase 9: Documentation Updates

### 9.1 Architecture Guide

**File:** `docs/ARCHITECTURE.md`

- Detailed system architecture diagram
- Service layer overview
- State management flow
- Data flow diagrams
- Error handling strategy

### 9.2 Development Guide

**File:** `docs/DEVELOPMENT.md`

- Setup instructions
- Development workflow
- Code style guidelines
- Testing guidelines
- Debugging tips

### 9.3 API Documentation

**File:** `docs/API.md`

- Service API documentation
- Hook documentation
- Component API reference

---

## 📝 Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 1-2 days | Analysis & Planning |
| **Phase 2** | 2-3 days | Set up new directory structure |
| **Phase 3** | 5-7 days | Refactor services layer |
| **Phase 4** | 3-5 days | Implement new state management |
| **Phase 5** | 5-7 days | Refactor UI components |
| **Phase 6** | 2-3 days | Error handling & logging |
| **Phase 7** | 3-4 days | Testing infrastructure |
| **Phase 8** | 2-3 days | Performance optimization |
| **Phase 9** | 2-3 days | Documentation |
| **Phase 10** | 1-2 days | Testing & QA |
| **Total** | **28-40 days** | |

---

## ✨ Key Improvements Summary

### Code Quality
- ✅ Type-safe across entire codebase
- ✅ Consistent error handling
- ✅ Proper dependency injection
- ✅ Reduced code duplication

### Maintainability
- ✅ Clear separation of concerns
- ✅ Improved code organization
- ✅ Better test coverage
- ✅ Comprehensive documentation

### Performance
- ✅ Code splitting & lazy loading
- ✅ Optimized bundle size
- ✅ Caching strategies
- ✅ Efficient state management

### Developer Experience
- ✅ Better debugging tools
- ✅ Clear patterns and conventions
- ✅ Easy onboarding for new developers
- ✅ Reusable utilities and hooks

---

## 🚀 Next Steps

1. **Review & Approve** this refactoring plan
2. **Create Feature Branch** for refactoring
3. **Start with Phase 2** (Directory Structure)
4. **Implement Phases** sequentially
5. **Run Tests** continuously
6. **Create Pull Request** with full documentation

---

## 📞 Questions & Discussion

This is a comprehensive refactoring plan. Before implementation, we should discuss:

1. State management tool preference (Zustand vs Redux Toolkit)?
2. Testing framework preferences (Jest vs Vitest)?
3. Priority on phases (which to do first)?
4. Breaking change tolerance level?
5. Timeline constraints?

---

**Document Status:** ✅ Ready for Review  
**Last Updated:** November 13, 2025
