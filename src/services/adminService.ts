import firestore, { type FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Stock, User } from '../types';

export class AdminService {
  private static instance: AdminService;
  private stocksCollection = firestore().collection('stocks');
  private usersCollection = firestore().collection('users');

  private constructor() {}

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  public async getStocks(): Promise<Stock[]> {
    const snapshot = await this.stocksCollection.get();
    return snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as Stock[];
  }

  public async getUsers(): Promise<User[]> {
    const snapshot = await this.usersCollection.get();
    return snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as User[];
  }

  public async addStock(symbol: string): Promise<void> {
    await this.stocksCollection.add({
      name: symbol, // You might want to fetch the real name from an API
      symbol: symbol.toUpperCase(),
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  public async updateStockPrice(stockId: string, newPrice: number): Promise<void> {
    const stockRef = this.stocksCollection.doc(stockId);
    const stockDoc = await stockRef.get();
    if (!stockDoc.exists) {
      throw new Error('Stock not found');
    }
    const currentPrice = stockDoc.data()?.price || 0;
    const change = newPrice - currentPrice;
    const changePercent = currentPrice > 0 ? (change / currentPrice) * 100 : 0;

    await stockRef.update({
      price: newPrice,
      change,
      changePercent,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }
}
