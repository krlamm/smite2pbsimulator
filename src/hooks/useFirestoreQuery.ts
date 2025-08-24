import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  QueryConstraint, 
  DocumentData,
  FirestoreError 
} from 'firebase/firestore';
import { db } from '../firebase';

interface UseFirestoreQueryOptions<T> {
  transform?: (doc: DocumentData) => T;
  dependencies?: unknown[];
}

interface UseFirestoreQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useFirestoreQuery<T = DocumentData>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = [],
  options: UseFirestoreQueryOptions<T> = {}
): UseFirestoreQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { transform, dependencies = [] } = options;

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(collection(db, collectionName), ...queryConstraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const results = snapshot.docs.map((doc) => {
            const docData = { id: doc.id, ...doc.data() };
            return transform ? transform(doc.data()) : (docData as T);
          });
          setData(results);
          setLoading(false);
        } catch (err) {
          console.error('Error processing query results:', err);
          setError('Error processing data');
          setLoading(false);
        }
      },
      (err: FirestoreError) => {
        console.error('Firestore query error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(queryConstraints), ...dependencies]);

  return { data, loading, error };
}

export default useFirestoreQuery;