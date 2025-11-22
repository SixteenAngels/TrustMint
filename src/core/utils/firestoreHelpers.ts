/**
 * Firestore helper utilities
 */

/**
 * Convert Firestore timestamp to Date
 */
export function toDate(timestamp: any): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp?.toDate === 'function') {
    return timestamp.toDate();
  }
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return undefined;
}

/**
 * Convert Firestore timestamp to Date with fallback
 */
export function toDateOrNow(timestamp: any): Date {
  return toDate(timestamp) || new Date();
}

/**
 * Safely get data from Firestore document
 */
export function getDocumentData<T>(doc: any): T | null {
  if (!doc || !doc.exists()) return null;
  const data = doc.data();
  return data ? { ...data, id: doc.id } as T : null;
}

/**
 * Safely map Firestore documents to typed objects
 */
export function mapDocuments<T>(
  docs: any[],
  transformer?: (data: any) => T
): T[] {
  return docs
    .map((doc: any) => {
      const data = doc.data();
      if (!data) return null;
      const transformed = transformer
        ? transformer({ ...data, id: doc.id })
        : { ...data, id: doc.id };
      return transformed as T;
    })
    .filter((item): item is T => item !== null);
}

/**
 * Convert Date to Firestore timestamp
 * For web SDK, we use Timestamp from firebase/firestore
 */
export function toFirestoreTimestamp(date: Date): any {
  // Import Timestamp from web SDK
  const { Timestamp } = require('firebase/firestore');
  return Timestamp.fromDate(date);
}

/**
 * Convert object with Date fields to Firestore-compatible object
 */
export function prepareForFirestore<T extends Record<string, any>>(
  data: T,
  dateFields: (keyof T)[]
): Record<string, any> {
  const result = { ...data };
  
  for (const field of dateFields) {
    if (result[field] instanceof Date) {
      result[field] = toFirestoreTimestamp(result[field] as Date);
    }
  }
  
  return result;
}

