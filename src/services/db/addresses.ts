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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import type { Address } from '../../models/types/user';

const ADDRESSES_COLLECTION = 'addresses';

export const addressesService = {
  // Get user addresses
  async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const q = query(
        collection(db, ADDRESSES_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        label: doc.data().label,
        address: doc.data().address,
        city: doc.data().city,
        province: doc.data().province,
        postalCode: doc.data().postalCode,
        isDefault: doc.data().isDefault,
      })) as Address[];
    } catch (error) {
      console.error('Error getting addresses:', error);
      throw error;
    }
  },

  // Create address
  async createAddress(userId: string, addressData: Omit<Address, 'id'>): Promise<string> {
    try {
      const addressRef = doc(collection(db, ADDRESSES_COLLECTION));
      
      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        await this.unsetDefaultAddresses(userId);
      }

      await setDoc(addressRef, {
        ...addressData,
        userId,
        createdAt: serverTimestamp(),
      });
      return addressRef.id;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  },

  // Update address
  async updateAddress(addressId: string, updates: Partial<Address>): Promise<void> {
    try {
      const addressDoc = await getDoc(doc(db, ADDRESSES_COLLECTION, addressId));
      const userId = addressDoc.data()?.userId;

      if (updates.isDefault && userId) {
        await this.unsetDefaultAddresses(userId, addressId);
      }

      await updateDoc(doc(db, ADDRESSES_COLLECTION, addressId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  async deleteAddress(addressId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ADDRESSES_COLLECTION, addressId));
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  async unsetDefaultAddresses(userId: string, excludeId?: string): Promise<void> {
    try {
      const q = query(
        collection(db, ADDRESSES_COLLECTION),
        where('userId', '==', userId),
        where('isDefault', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.docs.forEach(doc => {
        if (doc.id !== excludeId) {
          batch.update(doc.ref, { isDefault: false });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error unsetting default addresses:', error);
      throw error;
    }
  },
};

