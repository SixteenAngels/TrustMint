-- Cloud SQL (PostgreSQL) Schema for Complex Analytics
-- This complements Firestore for complex queries and analytics

-- Portfolio Analytics Table
CREATE TABLE IF NOT EXISTS portfolio_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    daily_pnl DECIMAL(15,2) NOT NULL,
    total_pnl DECIMAL(15,2) NOT NULL,
    total_pnl_percent DECIMAL(8,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Trading Patterns Table
CREATE TABLE IF NOT EXISTS trading_patterns (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stock_symbol VARCHAR(10) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Sentiment Table
CREATE TABLE IF NOT EXISTS market_sentiment (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    overall_sentiment DECIMAL(5,2) NOT NULL,
    sector_sentiment JSONB,
    news_sentiment JSONB,
    social_sentiment JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- User Performance Metrics
CREATE TABLE IF NOT EXISTS user_performance (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    period VARCHAR(10) NOT NULL,
    total_return DECIMAL(8,4) NOT NULL,
    sharpe_ratio DECIMAL(8,4) NOT NULL,
    max_drawdown DECIMAL(8,4) NOT NULL,
    win_rate DECIMAL(5,2) NOT NULL,
    avg_trade_size DECIMAL(15,2) NOT NULL,
    total_trades INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, period)
);

-- Stock Performance History
CREATE TABLE IF NOT EXISTS stock_performance (
    id SERIAL PRIMARY KEY,
    stock_symbol VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    volume BIGINT NOT NULL,
    market_cap DECIMAL(15,2),
    pe_ratio DECIMAL(8,2),
    dividend_yield DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stock_symbol, date)
);

-- Risk Metrics
CREATE TABLE IF NOT EXISTS risk_metrics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    portfolio_volatility DECIMAL(8,4) NOT NULL,
    beta DECIMAL(8,4) NOT NULL,
    var_95 DECIMAL(8,4) NOT NULL,
    var_99 DECIMAL(8,4) NOT NULL,
    max_drawdown DECIMAL(8,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_user_date ON portfolio_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_trading_patterns_user ON trading_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_market_sentiment_date ON market_sentiment(date);
CREATE INDEX IF NOT EXISTS idx_user_performance_user_period ON user_performance(user_id, period);
CREATE INDEX IF NOT EXISTS idx_stock_performance_symbol_date ON stock_performance(stock_symbol, date);
CREATE INDEX IF NOT EXISTS idx_risk_metrics_user_date ON risk_metrics(user_id, date);

-- Create views for common queries
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT 
    user_id,
    MAX(date) as last_updated,
    MAX(total_value) as current_value,
    MAX(total_pnl) as total_pnl,
    MAX(total_pnl_percent) as total_pnl_percent
FROM portfolio_analytics
GROUP BY user_id;

CREATE OR REPLACE VIEW top_performers AS
SELECT 
    user_id,
    total_pnl_percent,
    ROW_NUMBER() OVER (ORDER BY total_pnl_percent DESC) as rank
FROM portfolio_summary
WHERE total_pnl_percent IS NOT NULL;

CREATE OR REPLACE VIEW market_overview AS
SELECT 
    date,
    COUNT(DISTINCT stock_symbol) as total_stocks,
    AVG(price) as avg_price,
    SUM(volume) as total_volume,
    AVG(pe_ratio) as avg_pe_ratio
FROM stock_performance
GROUP BY date
ORDER BY date DESC;