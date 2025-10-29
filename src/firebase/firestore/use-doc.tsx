
'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedDocRef or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence. Also make sure that it's dependencies are stable
 * references
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  docRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the ref is null/undefined, set to a non-loading, empty state.
    if (!docRef) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Immediately set loading state and clear previous data/errors.
    // This prevents stale data from being shown during a ref change.
    setIsLoading(true);
    setData(null);
    setError(null);
    
    // onSnapshot returns an unsubscribe function.
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // Explicitly handle the case where the document does not exist.
          setData(null); 
        }
        // Success, so clear any previous errors and set loading to false.
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // Handle Firestore errors (e.g., permissions).
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: docRef.path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        
        // Globally emit the permission error for other parts of the app to react.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // This cleanup function is critical.
    // React runs this when the component unmounts or before re-running the effect.
    // This prevents memory leaks and race conditions.
    return () => {
      unsubscribe();
    };
  }, [docRef]); // The effect re-runs ONLY if the docRef object reference changes.

  return { data, isLoading, error };
}
