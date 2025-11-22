/**
 * Firestore Adapter - Provides native-like API using web SDK
 * This allows services to work with both native and web Firebase
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './index';

/**
 * Firestore adapter that mimics @react-native-firebase/firestore API
 */
export class FirestoreAdapter {
  /**
   * Get a collection reference
   */
  collection(collectionPath: string) {
    return {
      doc: (docPath?: string) => {
        const docRef = docPath 
          ? doc(db, collectionPath, docPath)
          : doc(collection(db, collectionPath));
        
        return {
          get: async () => {
            const snapshot = await getDoc(docRef);
            return {
              exists: () => snapshot.exists(),
              data: () => snapshot.data(),
              id: snapshot.id,
              ref: {
                update: async (data: any) => {
                  await updateDoc(docRef, {
                    ...data,
                    updatedAt: serverTimestamp(),
                  });
                },
                id: docRef.id,
                path: docRef.path,
              },
            };
          },
          set: async (data: any, options?: any) => {
            const dataWithTimestamp = {
              ...data,
              ...(options?.merge ? {} : { createdAt: serverTimestamp() }),
              updatedAt: serverTimestamp(),
            };
            await setDoc(docRef, dataWithTimestamp, options);
            return { id: docRef.id };
          },
          update: async (data: any) => {
            await updateDoc(docRef, {
              ...data,
              updatedAt: serverTimestamp(),
            });
          },
          delete: async () => {
            await deleteDoc(docRef);
          },
          collection: (subCollectionPath: string) => {
            // Support for subcollections (e.g., users/{userId}/portfolio)
            return firestoreAdapter.collection(`${collectionPath}/${docRef.id}/${subCollectionPath}`);
          },
          id: docRef.id,
          path: docRef.path,
        };
      },
      add: async (data: any) => {
        const docRef = await addDoc(collection(db, collectionPath), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return { id: docRef.id };
      },
      where: (field: string, operator: any, value: any) => {
        return new QueryBuilder(collectionPath).where(field, operator, value);
      },
      orderBy: (field: string, direction?: 'asc' | 'desc') => {
        return new QueryBuilder(collectionPath).orderBy(field, direction);
      },
      limit: (count: number) => {
        return new QueryBuilder(collectionPath).limit(count);
      },
      get: async () => {
        const snapshot = await getDocs(collection(db, collectionPath));
        return {
          docs: snapshot.docs.map(d => ({
            id: d.id,
            data: () => d.data(),
            exists: () => true,
          })),
          empty: snapshot.empty,
          size: snapshot.size,
        };
      },
    };
  }
}

class QueryBuilder {
  private collectionPath: string;
  private constraints: QueryConstraint[] = [];

  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  where(field: string, operator: any, value: any) {
    this.constraints.push(where(field, operator, value));
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.constraints.push(orderBy(field, direction));
    return this;
  }

  limit(count: number) {
    this.constraints.push(limit(count));
    return this;
  }

  async get() {
    const q = query(collection(db as any, this.collectionPath), ...this.constraints);
    const snapshot = await getDocs(q);
    return {
      docs: snapshot.docs.map(d => {
        const docRef = doc(db, d.ref.path);
        return {
          id: d.id,
          data: () => d.data(),
          exists: () => true,
          ref: {
            update: async (data: any) => {
              await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp(),
              });
            },
            id: d.id,
            path: d.ref.path,
          },
        };
      }),
      empty: snapshot.empty,
      size: snapshot.size,
    };
  }
}

// Export FieldValue for compatibility
export const FieldValue = {
  serverTimestamp: () => serverTimestamp(),
  delete: () => ({ __deleted: true }),
  increment: (n: number) => ({ __increment: n }),
  arrayUnion: (...elements: any[]) => ({ __arrayUnion: elements }),
  arrayRemove: (...elements: any[]) => ({ __arrayRemove: elements }),
};

// Create singleton instance
const firestoreAdapter = new FirestoreAdapter();

// Create firestore function with FieldValue attached as static property
const firestoreFunction = () => firestoreAdapter;
(firestoreFunction as any).FieldValue = FieldValue;

// Export functions that match @react-native-firebase/firestore API
export const firestore = firestoreFunction;

// Export default (as function for compatibility)
export default firestoreFunction;

