import {
  collection,
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
import type { Store } from '../../models/types/store';

const STORES_COLLECTION = 'stores';

export const storesService = {
  // Get all active stores
  async getActiveStores(): Promise<Store[]> {
    try {
      const q = query(
        collection(db, STORES_COLLECTION),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      const stores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        logo: doc.data().logo,
        rating: doc.data().rating,
        pickupTime: doc.data().pickupTime,
      })) as Store[];
      
      // Sort by name in memory to avoid requiring a composite index
      return stores.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting stores:', error);
      throw error;
    }
  },

  // Get store by ID
  async getStoreById(storeId: string): Promise<(Store & { 
    status?: string; 
    ownerId?: string;
    description?: string;
    storeHours?: any;
    contactInfo?: any;
  }) | null> {
    try {
      const storeDoc = await getDoc(doc(db, STORES_COLLECTION, storeId));
      if (storeDoc.exists()) {
        const data = storeDoc.data();
        return { 
          id: storeDoc.id, 
          name: data.name,
          logo: data.logo,
          rating: data.rating,
          pickupTime: data.pickupTime,
          status: data.status,
          ownerId: data.ownerId,
          description: data.description,
          storeHours: data.storeHours,
          contactInfo: data.contactInfo,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting store:', error);
      throw error;
    }
  },

  // Get stores by owner
  async getStoresByOwner(ownerId: string): Promise<(Store & {
    status?: string;
    description?: string;
    storeHours?: any;
    contactInfo?: any;
  })[]> {
    try {
      const q = query(
        collection(db, STORES_COLLECTION),
        where('ownerId', '==', ownerId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          logo: data.logo,
          rating: data.rating,
          pickupTime: data.pickupTime,
          status: data.status,
          description: data.description,
          storeHours: data.storeHours,
          contactInfo: data.contactInfo,
        };
      });
    } catch (error) {
      console.error('Error getting stores by owner:', error);
      throw error;
    }
  },

  // Create store
  async createStore(storeData: Omit<Store, 'id'> & { ownerId: string; status?: string }): Promise<string> {
    try {
      const storeRef = doc(collection(db, STORES_COLLECTION));
      const storeDoc: any = {
        name: storeData.name,
        rating: storeData.rating || 0,
        ownerId: storeData.ownerId,
        status: storeData.status || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Only include optional fields if they have values
      if (storeData.logo) {
        storeDoc.logo = storeData.logo;
      }
      if (storeData.pickupTime) {
        storeDoc.pickupTime = storeData.pickupTime;
      }
      
      await setDoc(storeRef, storeDoc);
      return storeRef.id;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  },

  // Update store
  async updateStore(storeId: string, updates: Partial<Store> & { status?: string }): Promise<void> {
    try {
      await updateDoc(doc(db, STORES_COLLECTION, storeId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  },

  // Get all stores (for admin)
  async getAllStores(): Promise<(Store & { status?: string; ownerId?: string })[]> {
    try {
      const querySnapshot = await getDocs(collection(db, STORES_COLLECTION));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          logo: data.logo,
          rating: data.rating,
          pickupTime: data.pickupTime,
          status: data.status,
          ownerId: data.ownerId,
        };
      });
    } catch (error) {
      console.error('Error getting all stores:', error);
      throw error;
    }
  },
};

