import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBj83xNrt_3Hwchue5dn9qHabzpTjMhsak",
  authDomain: "e-grocery-c7b31.firebaseapp.com",
  projectId: "e-grocery-c7b31",
  storageBucket: "e-grocery-c7b31.firebasestorage.app",
  messagingSenderId: "123449079686",
  appId: "1:123449079686:web:26c921f199f66952815e07"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

} catch (error: any) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);

  } else {
   
    throw error;
  }
}

export { auth };

// Firestore - app requires online connection
// Offline persistence is not enabled - app will only work when online
export const db = getFirestore(app);

// Note: Firestore WebChannelConnection warnings are harmless
// They occur when Firestore reconnects after network interruptions
// This is normal behavior and doesn't affect functionality

export const storage = getStorage(app);