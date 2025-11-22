# GSE API Setup for Ghana Stocks

## Configuration

The app is now configured to use the GSE API from `https://dev.kwayisi.org/apis/gse` for Ghana stock data.

## Environment Variable

Add this to your `.env` file:

```bash
EXPO_PUBLIC_GSE_API_BASE_URL="https://dev.kwayisi.org/apis/gse"
```

## How It Works

1. **Primary Source**: The app uses `https://dev.kwayisi.org/apis/gse/live` to fetch live Ghana stock data
2. **Fallback**: If the free API fails, it will try the official GSE Data Services (if API key is configured)
3. **Caching**: Stock data is cached for 30 seconds to reduce API calls
4. **Error Handling**: If the API fails, the app returns cached data or empty array instead of crashing

## API Endpoints Used

- **Live Data**: `https://dev.kwayisi.org/apis/gse/live`
- **Historical Data**: `https://dev.kwayisi.org/apis/gse/historical` (if needed)

## Response Format

The API should return an array of stock objects with:
- `symbol`: Stock symbol (e.g., "MTN")
- `name`: Company name
- `price`: Current price
- `change`: Price change
- `changePercent`: Percentage change
- `volume`: Trading volume (optional)

## Testing

To verify the GSE API is working:

1. Check the console logs for `[GSE API]` messages
2. The Markets screen should show Ghana stocks
3. Stock prices should update when you refresh

## Troubleshooting

If stocks aren't loading:

1. **Check Network**: Ensure device has internet connection
2. **Check Console**: Look for `[GSE API]` error messages
3. **Verify URL**: The URL should be `https://dev.kwayisi.org/apis/gse/live`
4. **Check CORS**: The API should allow requests from your app origin
5. **Cache**: Try force refresh (pull down) to bypass cache

## Notes

- The GSE API is free and doesn't require an API key
- Data is cached for 30 seconds to improve performance
- The app gracefully handles API failures with fallbacks

