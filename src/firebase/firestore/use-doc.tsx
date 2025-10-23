'use client';
    
import { useState, useEffect, useRef } from 'react';
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
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const pathRef = useRef<string | null>(null);

  useEffect(() => {
    // If the ref is null/undefined, reset to initial state and do nothing.
    if (!memoizedDocRef) {
      pathRef.current = null;
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const newPath = memoizedDocRef.path;

    // If the path is the same as the current one, do nothing.
    if (pathRef.current === newPath) {
      return;
    }

    pathRef.current = newPath;
    setIsLoading(true);
    setData(null);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        // Ensure the callback corresponds to the current subscription.
        if (pathRef.current !== snapshot.ref.path) {
          return;
        }

        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null); // Document does not exist.
        }
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // Ensure the error corresponds to the current subscription.
        if (pathRef.current !== memoizedDocRef.path) {
          return;
        }
        
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup function for this effect.
    return () => {
      unsubscribe();
    };
  }, [memoizedDocRef]); // Re-run only if the document reference itself changes.

  return { data, isLoading, error };
}
