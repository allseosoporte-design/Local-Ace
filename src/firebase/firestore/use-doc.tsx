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
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
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

  // Incluir el path del documento en el estado para evitar contaminación
  const docPath = memoizedDocRef?.path || null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  useEffect(() => {
    // CRÍTICO: Limpiar el estado inmediatamente cuando cambia la referencia
    setData(null);
    setError(null);

    if (!memoizedDocRef) {
      setIsLoading(false);
      setCurrentPath(null);
      return;
    }

    // Actualizar el path actual
    const newPath = memoizedDocRef.path;
    setCurrentPath(newPath);
    setIsLoading(true);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        // Verificar que el snapshot es del documento actual
        if (snapshot.ref.path !== newPath) {
          console.warn('Snapshot obsoleto ignorado:', snapshot.ref.path);
          return;
        }

        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // Document does not exist
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // Verificar que el error es del documento actual
        if (memoizedDocRef.path !== newPath) {
          return;
        }

        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => {
      unsubscribe();
      // Limpiar estado al desmontar
      setData(null);
      setError(null);
      setIsLoading(false);
    };
  }, [memoizedDocRef, docPath]); // Incluir docPath en las dependencias

  return { data, isLoading, error };
}
