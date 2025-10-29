import {
  DocumentData,
  Query,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';
import { firestore, storage } from './firebase';
import { Product } from './types';
import { deleteObject, getStorage, ref } from 'firebase/storage';

export async function fetchAllProducts(
  pageSize: number = 100000
): Promise<{ products: Product[]; nextPage: string | null }> {
  const productsRef = collection(firestore, 'products');
  let q: Query<DocumentData>;

  // Order products by createdAt in descending order
  q = query(productsRef, orderBy('createdAt', 'desc'));

  // Apply pagination if pageSize is specified
  if (pageSize > 0) {
    q = query(q, limit(pageSize));
  }

  const querySnapshot = await getDocs(q);
  const products: Product[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Product, 'id'>),
  }));

  // Return products and next page details
  return {
    products,
    nextPage:
      querySnapshot.size === pageSize
        ? querySnapshot.docs[querySnapshot.size - 1].id
        : null,
  };
}

export async function deleteProduct(id: string) {
  try {
    if (!id) {
      throw new Error('Product ID is required.');
    }
    const productRef = doc(firestore, 'products', id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const imageRef = productSnap.data().imgRef;

      if (imageRef && imageRef.length) {
        for (const i of imageRef) {
          const imageObjectRef = ref(storage, i);
          await deleteObject(imageObjectRef);
          console.log('DELETED ', i);
        }
      }
      // Delete document from Firestore
      await deleteDoc(doc(firestore, 'products', id));
    }
  } catch (e) {
    console.log(e);
  }

  // Delete image from Storage (if imageRef exists)
}
