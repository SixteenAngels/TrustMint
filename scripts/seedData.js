const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// admin.initializeApp({
//   credential: admin.credential.cert(require('./path-to-service-account.json'))
// });

const db = admin.firestore();

// Sample GSE stocks data
const stocks = [
  {
    id: 'gse_mtn',
    name: 'MTN Ghana',
    symbol: 'MTN',
    price: 0.85,
    change: 0.02,
    changePercent: 2.41,
    volume: 1000000,
    updatedAt: new Date(),
  },
  {
    id: 'gse_gcb',
    name: 'GCB Bank',
    symbol: 'GCB',
    price: 4.20,
    change: -0.10,
    changePercent: -2.33,
    volume: 500000,
    updatedAt: new Date(),
  },
  {
    id: 'gse_goil',
    name: 'GOIL',
    symbol: 'GOIL',
    price: 1.50,
    change: 0.05,
    changePercent: 3.45,
    volume: 750000,
    updatedAt: new Date(),
  },
  {
    id: 'gse_cal',
    name: 'CAL Bank',
    symbol: 'CAL',
    price: 0.45,
    change: 0.01,
    changePercent: 2.27,
    volume: 300000,
    updatedAt: new Date(),
  },
  {
    id: 'gse_etl',
    name: 'Enterprise Group',
    symbol: 'ETL',
    price: 2.10,
    change: -0.05,
    changePercent: -2.33,
    volume: 200000,
    updatedAt: new Date(),
  },
  {
    id: 'gse_fanmilk',
    name: 'Fan Milk',
    symbol: 'FML',
    price: 0.80,
    change: 0.02,
    changePercent: 2.56,
    volume: 150000,
    updatedAt: new Date(),
  },
  {
    id: 'gse_ghl',
    name: 'Ghana Commercial Bank',
    symbol: 'GHB',
    price: 3.50,
    change: 0.15,
    changePercent: 4.48,
    volume: 400000,
    updatedAt: new Date(),
  },
  {
    id: 'gse_mlc',
    name: 'Mechanical Lloyd',
    symbol: 'MLC',
    price: 0.25,
    change: 0.00,
    changePercent: 0.00,
    volume: 50000,
    updatedAt: new Date(),
  },
];

// Sample learning lessons
const lessons = [
  {
    id: 'lesson_1',
    title: 'What are Stocks?',
    content: `Stocks represent ownership in a company. When you buy a stock, you become a shareholder and own a small piece of that company. In Ghana, companies like MTN, GCB Bank, and GOIL are publicly traded on the Ghana Stock Exchange (GSE).

Key points:
• Stocks give you ownership rights
• You can profit from price increases
• You may receive dividends
• Stock prices fluctuate based on company performance and market conditions`,
    order: 1,
    completed: false,
  },
  {
    id: 'lesson_2',
    title: 'Understanding the Ghana Stock Exchange',
    content: `The Ghana Stock Exchange (GSE) is where stocks are bought and sold in Ghana. It's regulated by the Securities and Exchange Commission (SEC) and provides a platform for companies to raise capital.

Major GSE companies include:
• MTN Ghana - Telecommunications
• GCB Bank - Banking
• GOIL - Oil and Gas
• CAL Bank - Banking
• Enterprise Group - Insurance

The GSE operates during business hours and prices are updated in real-time.`,
    order: 2,
    completed: false,
  },
  {
    id: 'lesson_3',
    title: 'How to Analyze Companies',
    content: `Before investing in a stock, it's important to analyze the company. Here are key factors to consider:

Financial Health:
• Revenue growth
• Profit margins
• Debt levels
• Cash flow

Industry Analysis:
• Market position
• Competition
• Growth prospects
• Regulatory environment

For Ghanaian companies, also consider:
• Economic conditions
• Government policies
• Currency stability
• Local market trends`,
    order: 3,
    completed: false,
  },
  {
    id: 'lesson_4',
    title: 'Building a Diversified Portfolio',
    content: `Diversification is key to reducing risk in your investment portfolio. Instead of putting all your money in one stock, spread it across different companies and sectors.

Diversification strategies:
• Invest in different sectors (banking, telecom, oil & gas)
• Mix large and small companies
• Consider different risk levels
• Regular rebalancing

Example diversified portfolio:
• 30% Banking (GCB, CAL Bank)
• 30% Telecom (MTN)
• 20% Oil & Gas (GOIL)
• 20% Other sectors`,
    order: 4,
    completed: false,
  },
  {
    id: 'lesson_5',
    title: 'Risk Management',
    content: `All investments carry risk. Understanding and managing risk is crucial for successful investing.

Types of risk:
• Market risk - overall market movements
• Company risk - specific company problems
• Currency risk - exchange rate fluctuations
• Liquidity risk - difficulty selling stocks

Risk management strategies:
• Never invest more than you can afford to lose
• Set stop-loss orders
• Diversify your portfolio
• Stay informed about market conditions
• Have a long-term perspective`,
    order: 5,
    completed: false,
  },
];

// Function to seed data
async function seedData() {
  try {
    console.log('Starting to seed data...');

    // Add stocks
    console.log('Adding stocks...');
    for (const stock of stocks) {
      await db.collection('stocks').doc(stock.id).set(stock);
      console.log(`Added stock: ${stock.symbol}`);
    }

    // Add lessons
    console.log('Adding lessons...');
    for (const lesson of lessons) {
      await db.collection('lessons').doc(lesson.id).set(lesson);
      console.log(`Added lesson: ${lesson.title}`);
    }

    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run the seeding function
seedData().then(() => {
  console.log('Seeding process finished');
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});

module.exports = { stocks, lessons };