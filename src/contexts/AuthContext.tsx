import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { auth } from "../firebase/firebase";
import type { User, UserRole } from "../models/types/user";
import { uploadAvatar } from "../services/cloudinary";
import { usersService } from "../services/db";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string, 
    phone: string,
    password: string,
    role: UserRole,
    avatar?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore - requires online connection
          const userData = await usersService.getUserById(firebaseUser.uid);
          
          if (userData) {
            setUser({
              ...userData,
              token: await firebaseUser.getIdToken(),
            });
          } else {
            // User doesn't exist in Firestore yet, create profile
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: 'customer',
              token: await firebaseUser.getIdToken(),
            };
            
            // Create user profile - requires online connection
            await usersService.createUser(firebaseUser.uid, {
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
            });
            
            setUser(newUser);
          }
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          
          // Check if it's an offline error
          const isOfflineError = 
            error?.code === 'unavailable' || 
            error?.code === 'failed-precondition' ||
            error?.message?.toLowerCase().includes('offline') ||
            error?.message?.toLowerCase().includes('network') ||
            error?.message?.toLowerCase().includes('client is offline');
          
          if (isOfflineError) {
            // Show error message for offline - app requires online connection
            Alert.alert(
              'No Internet Connection',
              'This app requires an active internet connection. Please check your connection and try again.',
              [{ text: 'OK' }]
            );
          }
          
          // Set user to null - app won't work offline
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle setting user and isLoading
      // Don't set isLoading(false) here - let the auth state listener handle it
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false); // Only set to false on error
      let errorMessage = "Login failed. Please try again.";
      
      // Handle Firebase error codes
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = "Invalid email address. Please check and try again.";
            break;
          case 'auth/user-not-found':
            errorMessage = "No account found with this email.";
            break;
          case 'auth/wrong-password':
            errorMessage = "Incorrect password. Please try again.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many failed login attempts. Please try again later.";
            break;
          case 'auth/user-disabled':
            errorMessage = "This account has been disabled.";
            break;
          case 'auth/invalid-api-key':
            errorMessage = "Authentication service is currently unavailable. Please try again later.";
            break;
          default:
            errorMessage = error.message || "Login failed. Please try again.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };



// Update the register function
const register = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  role: UserRole,
  avatar?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    setIsLoading(true);

    // Validation
    if (!name || !email || !phone || !password) {
      setIsLoading(false);
      return { success: false, error: "All fields are required" };
    }

    if (password.length < 6) {
      setIsLoading(false);
      return { success: false, error: "Password must be at least 6 characters" };
    }

    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Upload avatar to Cloudinary if provided
    let avatarUrl = undefined;
    if (avatar) {
      try {
        avatarUrl = await uploadAvatar(avatar, firebaseUser.uid);
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        // Continue without avatar if upload fails
      }
    }

    // Create user profile in Firestore
    await usersService.createUser(firebaseUser.uid, {
      name,
      email,
      phone,
      avatar: avatarUrl,
      role: "customer",
    });

    return { success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    setIsLoading(false);
    let errorMessage = "Registration failed. Please try again.";
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Email is already registered";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak";
    }
    
    return { success: false, error: errorMessage };
  }
};

  const logout = async (): Promise<void> => {
    try {
      // Clear AsyncStorage (includes Firebase Auth persistence and any other stored data)
      await AsyncStorage.clear();
      
      // Sign out from Firebase (this will also clear Firebase's auth state)
      await firebaseSignOut(auth);
      
      // Clear user state
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      // Fetch updated user data from Firestore - requires online connection
      const userData = await usersService.getUserById(firebaseUser.uid);
      if (userData) {
        setUser({
          ...userData,
          token: await firebaseUser.getIdToken(),
        });
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      
      // Check if it's an offline error
      const isOfflineError = 
        error?.code === 'unavailable' || 
        error?.message?.toLowerCase().includes('offline') ||
        error?.message?.toLowerCase().includes('client is offline');
      
      if (isOfflineError) {
        Alert.alert(
          'No Internet Connection',
          'This app requires an active internet connection. Please check your connection and try again.'
        );
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

