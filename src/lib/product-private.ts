'use client';

import { useEffect, useMemo, useRef } from 'react';
import { collection, deleteField, doc, writeBatch, type Firestore } from 'firebase/firestore';
import { useCollection, useMemoFirebase } from '@/firebase';

// Dados internos do produto (custo, fornecedor, observações). A coleção "products" é
// pública, então esses campos ficam em "productsPrivate/{id}", que só o admin lê.
export const PRIVATE_PRODUCT_FIELDS = [
  'cost',
  'supplierUrl',
  'supplierName',
  'vendorName',
  'internalNotes',
  'sourceUrl',
] as const;

export const PRIVATE_PRODUCTS_COLLECTION = 'productsPrivate';

export function privateProductRef(db: Firestore, productId: string) {
  return doc(db, PRIVATE_PRODUCTS_COLLECTION, productId);
}

// Separa o payload de um produto em parte pública e parte interna. A parte pública
// leva deleteField() nos campos internos, para limpar o que estiver no doc público
// (use sempre com setDoc(..., { merge: true }) ou updateDoc).
export function splitProductPayload(payload: Record<string, any>) {
  const publicData: Record<string, any> = { ...payload };
  const privateData: Record<string, any> = {};
  for (const field of PRIVATE_PRODUCT_FIELDS) {
    if (field in publicData) {
      const value = publicData[field];
      if (value !== undefined) privateData[field] = value;
    }
    publicData[field] = deleteField();
  }
  return { publicData, privateData };
}

// Junta os dados internos aos produtos para as telas do admin (lucro, link do fornecedor).
export function useProductsWithPrivate<T extends { id: string }>(
  db: Firestore | null,
  products: T[] | null | undefined,
  enabled = true
) {
  const privateQuery = useMemoFirebase(
    () => (db && enabled ? collection(db, PRIVATE_PRODUCTS_COLLECTION) : null),
    [db, enabled]
  );
  const { data: privateDocs } = useCollection(privateQuery);

  const merged = useMemo(() => {
    if (!products) return products;
    const byId = new Map((privateDocs || []).map((d: any) => [d.id, d]));
    return products.map(p => {
      const priv = byId.get(p.id);
      if (!priv) return p;
      const { id: _ignored, ...rest } = priv as any;
      return { ...p, ...rest };
    });
  }, [products, privateDocs]);

  return { products: merged, privateDocs };
}

// Migração automática: move custo/fornecedor que ainda estejam no doc público para
// a área interna. Roda uma vez quando o admin abre a lista de produtos.
export function useMigratePrivateProductFields(
  db: Firestore | null,
  products: any[] | null | undefined,
  onDone?: (count: number) => void
) {
  const ran = useRef(false);

  useEffect(() => {
    if (!db || !products || ran.current) return;
    const pending = products.filter(p => PRIVATE_PRODUCT_FIELDS.some(f => p[f] !== undefined));
    ran.current = true;
    if (!pending.length) return;

    (async () => {
      try {
        for (let i = 0; i < pending.length; i += 200) {
          const batch = writeBatch(db);
          for (const p of pending.slice(i, i + 200)) {
            const { publicData, privateData } = splitProductPayload(
              Object.fromEntries(PRIVATE_PRODUCT_FIELDS.filter(f => p[f] !== undefined).map(f => [f, p[f]]))
            );
            batch.set(privateProductRef(db, p.id), privateData, { merge: true });
            batch.update(doc(db, 'products', p.id), publicData);
          }
          await batch.commit();
        }
        onDone?.(pending.length);
      } catch (e) {
        console.error('Erro ao proteger dados internos dos produtos:', e);
        ran.current = false;
      }
    })();
  }, [db, products, onDone]);
}
