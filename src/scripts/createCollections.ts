import { getApps, initializeApp } from 'firebase/app';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

/**
 * Create empty Firestore collections with structure
 * This creates placeholder documents to establish the collection structure
 */

// Firebase config for Node.js scripts (no React Native dependencies)
const firebaseConfig = {
  apiKey: "AIzaSyBj83xNrt_3Hwchue5dn9qHabzpTjMhsak",
  authDomain: "e-grocery-c7b31.firebaseapp.com",
  projectId: "e-grocery-c7b31",
  storageBucket: "e-grocery-c7b31.firebasestorage.app",
  messagingSenderId: "123449079686",
  appId: "1:123449079686:web:26c921f199f66952815e07"
};

// Initialize Firebase for Node.js (no auth persistence needed for scripts)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const createCollections = async () => {
  try {
    console.log('🚀 Creating Firestore collections...\n');

    // Create users collection structure
    console.log('📋 Creating users collection...');
    await setDoc(doc(db, 'users', '_structure'), {
      name: '',
      email: '',
      phone: '',
      avatar: '',
      role: 'customer', // 'customer' | 'storeOwner' | 'admin'
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ users collection created');

    // Create stores collection structure
    console.log('📋 Creating stores collection...');
    await setDoc(doc(db, 'stores', '_structure'), {
      name: '',
      logo: '',
      rating: 0,
      pickupTime: '',
      status: 'active', // 'active' | 'pending' | 'suspended'
      ownerId: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ stores collection created');

    // Create products collection structure
    console.log('📋 Creating products collection...');
    await setDoc(doc(db, 'products', '_structure'), {
      storeId: '',
      name: '',
      price: '',
      tag: '',
      category: '',
      stock: 0,
      isActive: true,
      description: '',
      imageUrl: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ products collection created');

    // Create orders collection structure
    console.log('📋 Creating orders collection...');
    await setDoc(doc(db, 'orders', '_structure'), {
      userId: '',
      storeId: '',
      storeName: '',
      items: [
        {
          productId: '',
          productName: '',
          quantity: 0,
          price: '',
        },
      ],
      total: '',
      status: 'pending', // 'pending' | 'ready' | 'completed' | 'cancelled'
      orderDate: serverTimestamp(),
      pickupTime: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      notes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ orders collection created');

    // Create addresses collection structure
    console.log('📋 Creating addresses collection...');
    await setDoc(doc(db, 'addresses', '_structure'), {
      userId: '',
      label: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ addresses collection created');

    console.log('\n✅ All collections created successfully!');
    console.log('\n📝 Note: You can delete the "_structure" documents after collections are created.');
    console.log('   They are just placeholders to establish the collection structure.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating collections:', error);
    process.exit(1);
  }
};

// Run the script
createCollections();