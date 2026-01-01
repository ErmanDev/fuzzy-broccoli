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
import type { StoreOwnerOrder } from '../../models/types/store-owner-order';
import type { Order } from '../../models/types/user';

const ORDERS_COLLECTION = 'orders';

export const ordersService = {
  // Create order
  async createOrder(orderData: Omit<Order, 'id'> & { 
    userId: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }): Promise<string> {
    try {
      const orderRef = doc(collection(db, ORDERS_COLLECTION));
      const orderDoc: any = {
        userId: orderData.userId,
        storeId: orderData.storeId,
        storeName: orderData.storeName,
        items: orderData.items,
        total: orderData.total,
        status: orderData.status,
        orderDate: serverTimestamp(),
        pickupTime: orderData.pickupTime,
        createdAt: serverTimestamp(),
      };

      // Add customer information if provided
      if (orderData.customerName) {
        orderDoc.customerName = orderData.customerName;
      }
      if (orderData.customerPhone) {
        orderDoc.customerPhone = orderData.customerPhone;
      }
      if (orderData.customerEmail) {
        orderDoc.customerEmail = orderData.customerEmail;
      }

      // Add payment fields if provided
      if (orderData.paymentStatus) {
        orderDoc.paymentStatus = orderData.paymentStatus;
      }
      if (orderData.paymentId) {
        orderDoc.paymentId = orderData.paymentId;
      }
      if (orderData.checkoutSessionId) {
        orderDoc.checkoutSessionId = orderData.checkoutSessionId;
      }
      if (orderData.paymentMethod) {
        orderDoc.paymentMethod = orderData.paymentMethod;
      }

      await setDoc(orderRef, orderDoc);
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user orders
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          storeId: data.storeId,
          storeName: data.storeName,
          items: data.items,
          total: data.total,
          status: data.status,
          orderDate: data.orderDate?.toDate?.().toISOString().split('T')[0] || data.orderDate,
          pickupTime: data.pickupTime,
          paymentStatus: data.paymentStatus,
          paymentId: data.paymentId,
          checkoutSessionId: data.checkoutSessionId,
          paymentMethod: data.paymentMethod,
        } as Order;
      });
      // Sort by orderDate descending in memory to avoid requiring a composite index
      return orders.sort((a, b) => {
        const dateA = new Date(a.orderDate || 0).getTime();
        const dateB = new Date(b.orderDate || 0).getTime();
        return dateB - dateA; // descending order
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  },

  // Get store orders
  async getStoreOrders(storeId: string): Promise<StoreOwnerOrder[]> {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('storeId', '==', storeId)
      );
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          storeId: data.storeId,
          storeName: data.storeName,
          items: data.items,
          total: data.total,
          status: data.status,
          orderDate: data.orderDate?.toDate?.().toISOString().split('T')[0] || data.orderDate,
          pickupTime: data.pickupTime,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          notes: data.notes,
        } as StoreOwnerOrder;
      });
      // Sort by orderDate descending in memory to avoid requiring a composite index
      return orders.sort((a, b) => {
        const dateA = new Date(a.orderDate || 0).getTime();
        const dateB = new Date(b.orderDate || 0).getTime();
        return dateB - dateA; // descending order
      });
    } catch (error) {
      console.error('Error getting store orders:', error);
      throw error;
    }
  },

  // Get all orders (for admin)
  async getAllOrders(): Promise<Order[]> {
    try {
      const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          storeId: data.storeId,
          storeName: data.storeName,
          items: data.items,
          total: data.total,
          status: data.status,
          orderDate: data.orderDate?.toDate?.().toISOString().split('T')[0] || data.orderDate,
          pickupTime: data.pickupTime,
          paymentStatus: data.paymentStatus,
          paymentId: data.paymentId,
          checkoutSessionId: data.checkoutSessionId,
          paymentMethod: data.paymentMethod,
        } as Order;
      });
      // Sort by orderDate descending in memory to avoid requiring a composite index
      return orders.sort((a, b) => {
        const dateA = new Date(a.orderDate || 0).getTime();
        const dateB = new Date(b.orderDate || 0).getTime();
        return dateB - dateA; // descending order
      });
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
      if (orderDoc.exists()) {
        const data = orderDoc.data();
        return {
          id: orderDoc.id,
          storeId: data.storeId,
          storeName: data.storeName,
          items: data.items,
          total: data.total,
          status: data.status,
          orderDate: data.orderDate?.toDate?.().toISOString().split('T')[0] || data.orderDate,
          pickupTime: data.pickupTime,
          paymentStatus: data.paymentStatus,
          paymentId: data.paymentId,
          checkoutSessionId: data.checkoutSessionId,
          paymentMethod: data.paymentMethod,
        } as Order;
      }
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  // Update payment status
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: Order['paymentStatus'],
    paymentId?: string,
    paymentMethod?: Order['paymentMethod']
  ): Promise<void> {
    try {
      const updateData: any = {
        paymentStatus,
        updatedAt: serverTimestamp(),
      };
      
      if (paymentId) {
        updateData.paymentId = paymentId;
      }
      
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },
};

