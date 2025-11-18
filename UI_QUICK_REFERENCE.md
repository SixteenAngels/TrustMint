# 🚀 UI Components Quick Reference Guide

**For developers using the new TrustMint UI components library**

---

## 📦 Import All Components

```tsx
import {
  Card,
  Button,
  Badge,
  Input,
  Alert,
  Select,
  StockCard,
  PortfolioChart,
  InsightCard,
} from '@/components/ui';
```

---

## 🎨 Component Gallery

### 1. Card - Container Component

**Basic Usage:**
```tsx
<Card>
  <Text>Your content here</Text>
</Card>
```

**With Gradient:**
```tsx
<Card gradient>
  <Text style={{ color: '#fff' }}>Premium card</Text>
</Card>
```

**Hoverable/Tappable:**
```tsx
<Card
  hoverable
  onPress={() => console.log('Card tapped')}
>
  <Text>Tap me!</Text>
</Card>
```

---

### 2. Button - Action Component

**Primary Button:**
```tsx
<Button
  label="Buy Stock"
  variant="primary"
  onPress={() => buyStock()}
/>
```

**With Icon:**
```tsx
<Button
  label="Add to Cart"
  icon="plus"
  variant="primary"
  onPress={() => addCart()}
/>
```

**Loading State:**
```tsx
<Button
  label="Processing..."
  loading={true}
  onPress={() => {}}
/>
```

**All Variants:**
```tsx
<Button label="Primary" variant="primary" onPress={() => {}} />
<Button label="Secondary" variant="secondary" onPress={() => {}} />
<Button label="Outline" variant="outline" onPress={() => {}} />
<Button label="Ghost" variant="ghost" onPress={() => {}} />
<Button label="Delete" variant="destructive" onPress={() => {}} />
```

**All Sizes:**
```tsx
<Button label="Small" size="sm" onPress={() => {}} />
<Button label="Medium" size="md" onPress={() => {}} />
<Button label="Large" size="lg" onPress={() => {}} />
```

---

### 3. Badge - Label Component

**Basic Badges:**
```tsx
<Badge label="MTN" variant="default" />
<Badge label="Success" variant="success" />
<Badge label="Error" variant="destructive" />
<Badge label="Warning" variant="warning" />
<Badge label="Info" variant="outline" />
```

**Common Uses:**
```tsx
// Stock symbol
<Badge label="MTN" variant="default" />

// Status
<Badge label="Active" variant="success" />
<Badge label="Inactive" variant="destructive" />

// Priority
<Badge label="URGENT" variant="warning" />
```

---

### 4. Input - Text Field

**Basic Input:**
```tsx
<Input
  label="Amount"
  placeholder="₵1,000"
  value={amount}
  onChangeText={setAmount}
/>
```

**With Icon:**
```tsx
<Input
  label="Search"
  icon="magnify"
  placeholder="Search stocks..."
  value={search}
  onChangeText={setSearch}
/>
```

**Password Field:**
```tsx
<Input
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>
```

**With Error:**
```tsx
<Input
  label="Email"
  placeholder="your@email.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  keyboardType="email-address"
/>
```

**Multiline:**
```tsx
<Input
  label="Notes"
  placeholder="Add notes..."
  value={notes}
  onChangeText={setNotes}
  multiline
  numberOfLines={4}
/>
```

---

### 5. Alert - Notification Banner

**Success Alert:**
```tsx
<Alert
  title="Success!"
  description="Order placed successfully"
  variant="success"
  dismissible
  onDismiss={() => clearAlert()}
/>
```

**Error Alert:**
```tsx
<Alert
  title="Error"
  description="Failed to process order"
  variant="destructive"
/>
```

**With Action:**
```tsx
<Alert
  title="Confirm Action"
  description="Are you sure?"
  variant="warning"
  action={{
    label: 'Confirm',
    onPress: () => confirmAction(),
  }}
/>
```

**Alert Variants:**
```tsx
<Alert title="Default" variant="default" />
<Alert title="Success" variant="success" />
<Alert title="Error" variant="destructive" />
<Alert title="Warning" variant="warning" />
<Alert title="Info" variant="info" />
```

---

### 6. Select - Dropdown Picker

**Basic Select:**
```tsx
<Select
  label="Choose Stock"
  placeholder="Select a stock"
  options={[
    { label: 'MTN Ghana', value: 'mtn' },
    { label: 'GCB Bank', value: 'gcb' },
    { label: 'GOIL', value: 'goil' },
  ]}
  value={selected}
  onValueChange={setSelected}
/>
```

**With Search:**
```tsx
<Select
  label="Select Stock"
  placeholder="Search stock..."
  options={stockList}
  value={selectedStock}
  onValueChange={setSelectedStock}
  searchable={true}
/>
```

**With Icons:**
```tsx
<Select
  label="Choose Action"
  options={[
    { label: 'Buy', value: 'buy', icon: 'cart-plus' },
    { label: 'Sell', value: 'sell', icon: 'cart-minus' },
    { label: 'Hold', value: 'hold', icon: 'pause' },
  ]}
  value={action}
  onValueChange={setAction}
/>
```

---

### 7. StockCard - Stock Display

**Basic Stock Card:**
```tsx
<StockCard
  symbol="MTN"
  name="MTN Ghana"
  price="₵0.85"
  change={2.41}
  onPress={() => viewDetails('MTN')}
/>
```

**With Multiple Stocks:**
```tsx
{stocks.map(stock => (
  <StockCard
    key={stock.symbol}
    symbol={stock.symbol}
    name={stock.name}
    price={stock.price}
    change={stock.change}
    onPress={() => viewDetails(stock.symbol)}
  />
))}
```

---

### 8. PortfolioChart - Portfolio Visualization

**Basic Chart:**
```tsx
<PortfolioChart
  totalValue="₵12,560.00"
  change={4.2}
/>
```

**With Dynamic Values:**
```tsx
<PortfolioChart
  totalValue={`₵${portfolio.value.toFixed(2)}`}
  change={portfolio.gainPercent}
/>
```

---

### 9. InsightCard - Market Insights

**Buy Recommendation:**
```tsx
<InsightCard
  type="recommendation"
  title="Buy Signal Detected"
  description="MTN shows strong bullish indicators"
  symbol="MTN"
  action="buy"
  confidence={0.85}
  onPress={() => executeBuy('MTN')}
/>
```

**Alert:**
```tsx
<InsightCard
  type="alert"
  title="Price Alert"
  description="GCB stock dropped 5%"
  symbol="GCB"
  action="hold"
  confidence={0.92}
/>
```

**Insight:**
```tsx
<InsightCard
  type="insight"
  title="Market Trending"
  description="Tech stocks performing well this week"
  confidence={0.78}
  onPress={() => viewTrends()}
/>
```

---

## 🎯 Common Patterns

### Form with Validation

```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};
  if (!email.includes('@')) newErrors.email = 'Invalid email';
  if (password.length < 8) newErrors.password = 'Min 8 chars';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
  if (validateForm()) {
    // Submit form
  }
};

return (
  <>
    <Input
      label="Email"
      value={email}
      onChangeText={setEmail}
      error={errors.email}
      keyboardType="email-address"
    />
    <Input
      label="Password"
      value={password}
      onChangeText={setPassword}
      error={errors.password}
      secureTextEntry
    />
    <Button
      label="Login"
      variant="primary"
      onPress={handleSubmit}
    />
  </>
);
```

### Stock Trading Card

```tsx
const [selectedStock, setSelectedStock] = useState(null);
const [quantity, setQuantity] = useState('');

return (
  <Card gradient>
    <StockCard
      symbol="MTN"
      name="MTN Ghana"
      price="₵0.85"
      change={2.41}
      onPress={() => setSelectedStock('MTN')}
    />
    {selectedStock && (
      <>
        <Input
          label="Quantity"
          placeholder="Enter shares"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <Button
          label="Buy MTN"
          variant="primary"
          size="lg"
          onPress={() => buyStock(selectedStock, quantity)}
        />
      </>
    )}
  </Card>
);
```

### Alert System

```tsx
const [alert, setAlert] = useState(null);

const showAlert = (type, title, description) => {
  setAlert({ type, title, description });
  setTimeout(() => setAlert(null), 3000);
};

return (
  <>
    {alert && (
      <Alert
        title={alert.title}
        description={alert.description}
        variant={alert.type}
        dismissible
        onDismiss={() => setAlert(null)}
      />
    )}
    <Button
      label="Show Success"
      onPress={() => showAlert('success', 'Success!', 'Action completed')}
    />
  </>
);
```

---

## 🎨 Styling Tips

### Custom Colors
```tsx
<Card style={{ backgroundColor: '#your-color' }}>
  <Text>Custom colored card</Text>
</Card>

<Button
  label="Custom"
  style={{ backgroundColor: '#your-color' }}
/>
```

### Spacing
```tsx
<View style={{ marginBottom: 16 }}>
  <Input label="Input 1" />
</View>

<View style={{ marginBottom: 24 }}>
  <Button label="Submit" />
</View>
```

---

## 🔍 Debugging

### Check Props
```tsx
// Use TypeScript to catch issues
interface MyComponentProps {
  onPress: () => void;  // Required
  disabled?: boolean;   // Optional
}
```

### Common Issues

**Button not responding?**
```tsx
// Check onPress is provided
<Button label="Click" onPress={() => console.log('Clicked')} />
```

**Input not updating?**
```tsx
// Check onChangeText is properly set
<Input value={value} onChangeText={setValue} />
```

**Select not opening?**
```tsx
// Check options are provided
<Select options={options} value={value} onValueChange={setValue} />
```

---

## 📱 Responsive Design

### Screen Size Check
```tsx
import { useWindowDimensions } from 'react-native';

const MyComponent = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;

  return (
    <View style={{ padding: isSmallScreen ? 12 : 16 }}>
      {/* Content */}
    </View>
  );
};
```

---

## 🎓 Best Practices

1. **Always provide labels** for accessibility
   ```tsx
   <Input label="Email" placeholder="..." />  // Good
   <Input placeholder="..." />                // Avoid
   ```

2. **Use proper keyboard types**
   ```tsx
   <Input keyboardType="email-address" />
   <Input keyboardType="numeric" />
   <Input keyboardType="phone-pad" />
   ```

3. **Provide error messages**
   ```tsx
   <Input error={formErrors.email} />
   ```

4. **Use meaningful button labels**
   ```tsx
   <Button label="Buy Stock" />     // Good
   <Button label="Submit" />        // Okay
   <Button label="Do Action" />     // Avoid
   ```

5. **Group related inputs**
   ```tsx
   <Card>
     <Input label="Amount" />
     <Input label="Fee" />
     <Button label="Calculate" />
   </Card>
   ```

---

## 📚 More Help

- Check **docs/UI_COMPONENTS_MIGRATION.md** for detailed docs
- Check **docs/UI_COMPONENTS_SUMMARY.md** for API reference
- Look at component TypeScript files for full prop definitions

---

**Last Updated:** November 13, 2025  
**Version:** 1.0.0
