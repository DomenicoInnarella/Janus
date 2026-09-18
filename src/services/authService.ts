import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, HostStatus, VerificationStatus } from '../types';
import { DEMO_USER_PROFILE } from '../lib/mockData';

const USERS_COLLECTION = 'users';

export const authService = {
  // Listen to auth state
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  },

  // Google Sign-In
  async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const profile = await this.getOrCreateUserProfile(user);
      return profile;
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  },

  // Email Sign-In
  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await this.getOrCreateUserProfile(result.user);
      return profile;
    } catch (error) {
      console.error('Email Sign In Error:', error);
      throw error;
    }
  },

  // Email Sign-Up
  async signUpWithEmail(email: string, pass: string, name: string): Promise<UserProfile> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });

      const newProfile: UserProfile = {
        uid: result.user.uid,
        email: email,
        displayName: name || 'Janus User',
        photoURL: result.user.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
        rating: 5.0,
        reviewCount: 0,
        completedBookings: 0,
        verificationStatus: 'unverified',
        hostStatus: 'new_host',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, USERS_COLLECTION, result.user.uid), newProfile);
      return newProfile;
    } catch (error) {
      console.error('Sign Up Error:', error);
      throw error;
    }
  },

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Delete account and user document
  async deleteAccount(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const userRef = doc(db, USERS_COLLECTION, currentUser.uid);
      await deleteDoc(userRef);
    } catch (err) {
      console.warn('Could not delete user doc from Firestore:', err);
    }
    try {
      await deleteUser(currentUser);
    } catch (err) {
      console.error('Could not delete Firebase Auth user:', err);
      throw err;
    }
  },

  // Get or Create profile for authenticated user
  async getOrCreateUserProfile(user: FirebaseUser): Promise<UserProfile> {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    try {
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }

      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Janus User',
        photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        rating: 5.0,
        reviewCount: 0,
        completedBookings: 0,
        verificationStatus: 'verified',
        hostStatus: 'new_host',
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    } catch (error) {
      console.warn('Falling back to local profile state:', error);
      return {
        ...DEMO_USER_PROFILE,
        uid: user.uid,
        email: user.email || DEMO_USER_PROFILE.email,
        displayName: user.displayName || DEMO_USER_PROFILE.displayName,
      };
    }
  },

  // Update profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    try {
      await updateDoc(userRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
    }
  },

  // Calculate dynamic trust status
  computeHostStatus(completedBookings: number, rating: number, isVerified: boolean): HostStatus {
    if (completedBookings >= 20 && rating >= 4.8) {
      return 'super_host';
    }
    if (completedBookings >= 5 && rating >= 4.5) {
      return 'trusted_host';
    }
    if (isVerified || completedBookings > 0) {
      return 'verified_host';
    }
    return 'new_host';
  }
};
