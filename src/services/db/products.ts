import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import type { Product } from '../../models/types/product';
import type { StoreOwnerProduct } from '../../models/types/store-owner-product';
import { uploadProductImage } from '../cloudinary';

const PRODUCTS_COLLECTION = 'products';

export const productsService = {
  // Get all active products from all stores
  async getAllActiveProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        storeId: doc.data().storeId,
        name: doc.data().name,
        price: doc.data().price,
        tag: doc.data().tag,
        category: doc.data().category,
        imageUrl: doc.data().imageUrl,
      })) as Product[];
      
      // Sort by name in memory
      return products.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  },

  // Get products by store ID
  async getProductsByStore(storeId: string, category?: string): Promise<Product[]> {
    try {
      let q;
      if (category && category !== 'All') {
        q = query(
          collection(db, PRODUCTS_COLLECTION),
          where('storeId', '==', storeId),
          where('category', '==', category),
          where('isActive', '==', true)
        );
      } else {
        q = query(
          collection(db, PRODUCTS_COLLECTION),
          where('storeId', '==', storeId),
          where('isActive', '==', true)
        );
      }

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        storeId: doc.data().storeId,
        name: doc.data().name,
        price: doc.data().price,
        tag: doc.data().tag,
        category: doc.data().category,
        imageUrl: doc.data().imageUrl,
      })) as Product[];
      
      // Sort by name in memory to avoid requiring a composite index
      return products.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
      if (productDoc.exists()) {
        const data = productDoc.data();
        return { 
          id: productDoc.id, 
          storeId: data.storeId,
          name: data.name,
          price: data.price,
          tag: data.tag,
          category: data.category,
          imageUrl: data.imageUrl,
        } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  // Get store owner products
  async getStoreOwnerProducts(storeId: string): Promise<StoreOwnerProduct[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('storeId', '==', storeId)
      );
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          storeId: data.storeId,
          name: data.name,
          price: data.price,
          tag: data.tag,
          category: data.category,
          imageUrl: data.imageUrl,
          stock: data.stock,
          isActive: data.isActive,
          description: data.description,
          createdAt: data.createdAt?.toDate?.().toISOString(),
          updatedAt: data.updatedAt?.toDate?.().toISOString(),
        } as StoreOwnerProduct;
      });
      
      // Sort by createdAt in memory to avoid requiring a composite index
      return products.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate; // Descending order (newest first)
      });
    } catch (error) {
      console.error('Error getting store owner products:', error);
      throw error;
    }
  },

  // Create product
  async createProduct(
    productData: Omit<StoreOwnerProduct, 'id' | 'createdAt' | 'updatedAt'>,
    imageUri?: string
  ): Promise<string> {
    try {
      const productRef = doc(collection(db, PRODUCTS_COLLECTION));
      
      // Upload image to Cloudinary if provided
      let imageUrl = undefined;
      if (imageUri) {
        try {
          imageUrl = await uploadProductImage(imageUri, productRef.id, productData.storeId);
        } catch (uploadError) {
          console.error('Product image upload error:', uploadError);
          // Continue without image if upload fails
        }
      }
  
      const productDoc: any = {
        storeId: productData.storeId,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        stock: productData.stock,
        isActive: productData.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Only include optional fields if they have values
      if (productData.tag) {
        productDoc.tag = productData.tag;
      }
      if (productData.description) {
        productDoc.description = productData.description;
      }
      if (imageUrl) {
        productDoc.imageUrl = imageUrl;
      }
      
      await setDoc(productRef, productDoc);
      return productRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(
    productId: string, 
    updates: Partial<StoreOwnerProduct>,
    imageUri?: string
  ): Promise<void> {
    try {
      const { id, createdAt, updatedAt, ...updateData } = updates;
      
      // Upload new image to Cloudinary if provided
      let imageUrl = undefined;
      if (imageUri) {
        try {
          // Get storeId from updates or fetch from existing product
          const storeId = updateData.storeId;
          if (storeId) {
            imageUrl = await uploadProductImage(imageUri, productId, storeId);
          } else {
            // Fetch existing product document to get storeId
            const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
            if (productDoc.exists()) {
              const existingStoreId = productDoc.data().storeId;
              if (existingStoreId) {
                imageUrl = await uploadProductImage(imageUri, productId, existingStoreId);
              } else {
                imageUrl = await uploadProductImage(imageUri, productId);
              }
            } else {
              imageUrl = await uploadProductImage(imageUri, productId);
            }
          }
        } catch (uploadError) {
          console.error('Product image upload error:', uploadError);
          // Continue without image if upload fails
        }
      }
      
      // Filter out undefined values - Firebase doesn't allow undefined
      const cleanUpdateData: any = {
        updatedAt: serverTimestamp(),
      };
      
      // Only include fields that have actual values (not undefined)
      Object.keys(updateData).forEach(key => {
        const value = (updateData as any)[key];
        if (value !== undefined) {
          cleanUpdateData[key] = value;
        }
      });
      
      // Add imageUrl if a new image was uploaded
      if (imageUrl) {
        cleanUpdateData.imageUrl = imageUrl;
      }
      
      await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), cleanUpdateData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};

