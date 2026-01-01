import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Firebase config (copy from your .env or firebase.ts)
const serviceAccount = require('../../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();


const seedStores = async () => {
  console.log('🌱 Seeding stores...');
  
  const stores = [
    {
      id: 'robinsons',
      name: 'Robinsons Supermarket',
      rating: 4.7,
      pickupTime: 'Ready in 30–45 min',
      status: 'active',
      ownerId: '', 
    },
    {
      id: 'gaisano',
      name: 'Gaisano Supermarket',
      rating: 4.5,
      pickupTime: 'Ready in 35–50 min',
      status: 'active',
      ownerId: '',
    },
    {
      id: 'localmart',
      name: 'Local Mart Supermarket',
      rating: 4.3,
      pickupTime: 'Ready in 25–40 min',
      status: 'active',
      ownerId: '',
    },
  ];

  for (const store of stores) {
    await db.collection('stores').doc(store.id).set({
      name: store.name,
      rating: store.rating,
      pickupTime: store.pickupTime,
      status: store.status,
      ownerId: store.ownerId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Created store: ${store.name}`);
  }
};

const seedProducts = async () => {
  console.log('🌱 Seeding products...');
  
  const products = [
    // Robinsons Products
    {
      id: 'prod-robinsons-1',
      storeId: 'robinsons',
      name: 'Fresh Apples',
      price: '₱199',
      tag: 'Best Seller',
      category: 'Fruits',
      stock: 50,
      isActive: true,
      description: 'Fresh red apples from local farms',
    },
    {
      id: 'prod-robinsons-2',
      storeId: 'robinsons',
      name: 'Organic Milk',
      price: '₱89',
      tag: 'Organic',
      category: 'Dairy',
      stock: 30,
      isActive: true,
      description: 'Fresh organic milk',
    },
    {
      id: 'prod-robinsons-3',
      storeId: 'robinsons',
      name: 'Bananas',
      price: '₱69',
      category: 'Fruits',
      stock: 25,
      isActive: true,
      description: 'Fresh yellow bananas',
    },
    {
      id: 'prod-robinsons-4',
      storeId: 'robinsons',
      name: 'Carrots',
      price: '₱45',
      category: 'Vegetables',
      stock: 40,
      isActive: true,
      description: 'Fresh orange carrots',
    },
    {
      id: 'prod-robinsons-5',
      storeId: 'robinsons',
      name: 'Chicken Breast',
      price: '₱250',
      tag: 'Hot',
      category: 'Meat',
      stock: 20,
      isActive: true,
      description: 'Fresh chicken breast',
    },
    
    // Gaisano Products
    {
      id: 'prod-gaisano-1',
      storeId: 'gaisano',
      name: 'Bananas',
      price: '₱69',
      tag: 'Hot',
      category: 'Fruits',
      stock: 35,
      isActive: true,
      description: 'Fresh yellow bananas',
    },
    {
      id: 'prod-gaisano-2',
      storeId: 'gaisano',
      name: 'Orange Juice',
      price: '₱149',
      tag: 'New',
      category: 'Drinks',
      stock: 25,
      isActive: true,
      description: 'Fresh orange juice',
    },
    {
      id: 'prod-gaisano-3',
      storeId: 'gaisano',
      name: 'Tomatoes',
      price: '₱55',
      category: 'Vegetables',
      stock: 30,
      isActive: true,
      description: 'Fresh red tomatoes',
    },
    {
      id: 'prod-gaisano-4',
      storeId: 'gaisano',
      name: 'Bread Loaf',
      price: '₱65',
      category: 'Snacks',
      stock: 15,
      isActive: true,
      description: 'Fresh white bread',
    },
    
    // Local Mart Products
    {
      id: 'prod-localmart-1',
      storeId: 'localmart',
      name: 'Brown Eggs (12pcs)',
      price: '₱120',
      category: 'Dairy',
      stock: 20,
      isActive: true,
      description: 'Fresh brown eggs',
    },
    {
      id: 'prod-localmart-2',
      storeId: 'localmart',
      name: 'Potatoes',
      price: '₱80',
      category: 'Vegetables',
      stock: 45,
      isActive: true,
      description: 'Fresh potatoes',
    },
    {
      id: 'prod-localmart-3',
      storeId: 'localmart',
      name: 'Coca Cola (1.5L)',
      price: '₱75',
      category: 'Drinks',
      stock: 30,
      isActive: true,
      description: 'Coca Cola soft drink',
    },
    {
      id: 'prod-localmart-4',
      storeId: 'localmart',
      name: 'Rice (5kg)',
      price: '₱250',
      tag: 'Best Seller',
      category: 'Snacks',
      stock: 15,
      isActive: true,
      description: 'Premium rice 5kg bag',
    },
  ];

  for (const product of products) {
    const data: any = {
      storeId: product.storeId,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      isActive: product.isActive,
      description: product.description,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    if (product.tag) data.tag = product.tag;
    await db.collection('products').doc(product.id).set(data);
    console.log(`✅ Created product: ${product.name} (${product.storeId})`);
  }
};

const seedData = async () => {
  try {
    console.log('🚀 Starting Firestore seeding...\n');
    
    await seedStores();
    console.log('');
    
    await seedProducts();
    console.log('');
    
    console.log('✅ Seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Register test users through the app');
    console.log('2. Assign store owners to stores in Firebase Console');
    console.log('3. Update store ownerId fields with actual user IDs');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding script
seedData();