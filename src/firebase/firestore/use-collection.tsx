
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
    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      targetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: WithId<T>[] = [];
        snapshot.forEach((doc) => {
          results.push({ ...(doc.data() as T), id: doc.id });
        });
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (serverError: FirestoreError) => {
        // Estabilizando a extração do caminho para depuração
        let path = 'collection-query';
        try {
          if (targetRefOrQuery) {
            // Tenta extrair o caminho diretamente se for uma CollectionReference
            if ('path' in targetRefOrQuery) {
              path = (targetRefOrQuery as any).path;
            } 
            // Tenta extrair de uma Query de forma segura
            else if ('_query' in targetRefOrQuery) {
              const queryImpl = (targetRefOrQuery as any)._query;
              if (queryImpl && queryImpl.path) {
                path = queryImpl.path.toString();
              }
            }
          }
        } catch (e) {
          // Fallback silencioso para o caminho padrão de erro
        }

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        // Emite o erro através do emissor central de forma síncrona para evitar falhas de asserção
        errorEmitter.emit('permission-error', contextualError);

        setError(contextualError);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetRefOrQuery]); 
  
  return { data, isLoading, error };
}
