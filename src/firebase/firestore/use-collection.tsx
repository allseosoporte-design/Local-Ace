
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
  queryEqual,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
  forceUpdate: () => void; // Function to manually trigger a re-fetch.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

// Custom hook to compare queries and avoid re-subscribing on every render.
const useComparableQuery = (
  query: CollectionReference<DocumentData> | Query<DocumentData> | null | undefined
) => {
  const queryRef = useRef(query);

  if (query && queryRef.current && !queryEqual(query, queryRef.current)) {
    queryRef.current = query;
  } else if (!query && queryRef.current) {
    queryRef.current = null;
  }


  return queryRef.current;
};


/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence. Also make sure that it's dependencies are stable
 * references
 *  
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    targetRefOrQuery: CollectionReference<DocumentData> | Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const [updateCount, setUpdateCount] = useState(0); // State to trigger re-fetch

  const memoizedQuery = useComparableQuery(targetRefOrQuery);
  
  const forceUpdate = useCallback(() => {
    setUpdateCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    // If the query is not ready, set a non-loading, empty state.
    if (!memoizedQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Immediately set loading state and clear previous data/errors.
    // This prevents displaying stale data from a previous query.
    setIsLoading(true);
    setData(null);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = snapshot.docs.map(doc => ({
            ...(doc.data() as T),
            id: doc.id
        }));
        
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // This logic extracts the path from either a ref or a query
        const path: string =
          memoizedQuery.type === 'collection'
            ? (memoizedQuery as CollectionReference).path
            : (memoizedQuery as unknown as InternalQuery)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup function is crucial to prevent memory leaks and race conditions.
    // It runs when the component unmounts or before the effect re-runs.
    return () => {
      unsubscribe();
    };
    // By using the memoized query, this effect only runs when the query's
    // logical value changes, not just its object reference.
  }, [memoizedQuery, updateCount]); // Add updateCount to dependencies

  return { data, isLoading, error, forceUpdate };
}

    