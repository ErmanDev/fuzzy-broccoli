import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import type { User, UserRole } from '../../models/types/user';

const USERS_COLLECTION = 'users';

export const usersService = {
  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return { 
          id: userDoc.id, 
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
          role: data.role,
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Create user profile
  async createUser(userId: string, userData: Omit<User, 'id' | 'token'>): Promise<void> {
    try {
      const data: any = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (userData.phone) data.phone = userData.phone;
      if (userData.avatar) data.avatar = userData.avatar;
      await setDoc(doc(db, USERS_COLLECTION, userId), data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const { id, token, ...updateData } = updates;
      
      // Filter out undefined values and convert null to deleteField() for explicit deletion
      const cleanData: Record<string, any> = {};
      Object.keys(updateData).forEach(key => {
        const value = (updateData as any)[key];
        if (value === null) {
          // Use deleteField() to explicitly delete the field
          cleanData[key] = deleteField();
        } else if (value !== undefined) {
          cleanData[key] = value;
        }
      });
      
      await updateDoc(doc(db, USERS_COLLECTION, userId), {
        ...cleanData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Get users by role (for admin)
  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', role)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        phone: doc.data().phone,
        avatar: doc.data().avatar,
        role: doc.data().role,
      })) as User[];
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  },

  // Get all users (for admin)
  async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        phone: doc.data().phone,
        avatar: doc.data().avatar,
        role: doc.data().role,
      })) as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },
};

