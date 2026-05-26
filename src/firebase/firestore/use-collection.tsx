'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
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
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 */
export function useCollection<T = any>(
    targetRefOrQuery: CollectionReference<DocumentData> | Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      unsubscribe = onSnapshot(
        targetRefOrQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          if (!isMounted) return;

          const results: WithId<T>[] = [];
          snapshot.forEach((doc) => {
            results.push({ ...(doc.data() as T), id: doc.id });
          });
          setData(results);
          setError(null);
          setIsLoading(false);
        },
        (serverError: FirestoreError) => {
          if (!isMounted) return;

          // CRITICAL: Defer the error handling to the next execution cycle.
          // This prevents the "Unexpected state (ID: ca9)" error in Firebase SDK 11.9.0
          // which occurs when state updates happen during the listener lifecycle.
          setTimeout(() => {
            if (!isMounted) return;

            let path = 'collection-query';
            try {
              if (targetRefOrQuery) {
                if ('path' in targetRefOrQuery) {
                  path = (targetRefOrQuery as any).path;
                } else if ((targetRefOrQuery as any)._query?.path?.toString()) {
                  path = (targetRefOrQuery as any)._query.path.toString();
                }
              }
            } catch (e) {
              // Silently fallback
            }

            const contextualError = new FirestorePermissionError({
              operation: 'list',
              path,
            });

            errorEmitter.emit('permission-error', contextualError);
            setError(contextualError);
            setData(null);
            setIsLoading(false);
          }, 0);
        }
      );
    } catch (e) {
      // Catch synchronous subscription errors
      if (isMounted) {
        setIsLoading(false);
        console.error("Firestore subscription failed:", e);
      }
    }

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [targetRefOrQuery]); 
  
  return { data, isLoading, error };
}
