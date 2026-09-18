import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (pendingAction?: () => void) => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<UserProfile>;
  signInWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await authService.getOrCreateUserProfile(fbUser);
          setUser(profile);
        } catch (err) {
          console.warn('Could not fetch user profile:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (action?: () => void) => {
    if (action) {
      setPendingAction(() => action);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  const handlePostAuth = () => {
    setIsAuthModalOpen(false);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setTimeout(() => {
        action();
      }, 100);
    }
  };

  const signInWithGoogle = async (): Promise<UserProfile> => {
    try {
      const profile = await authService.signInWithGoogle();
      setUser(profile);
      handlePostAuth();
      return profile;
    } catch (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    try {
      const profile = await authService.signInWithEmail(email, pass);
      setUser(profile);
      handlePostAuth();
      return profile;
    } catch (error) {
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<UserProfile> => {
    try {
      const profile = await authService.signUpWithEmail(email, pass, name);
      setUser(profile);
      handlePostAuth();
      return profile;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const deleteAccount = async (): Promise<void> => {
    await authService.deleteAccount();
    setUser(null);
    setFirebaseUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    await authService.updateUserProfile(user.uid, data);
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const updateUserProfile = updateProfile;

  const requireAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      openAuthModal(action);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        deleteAccount,
        updateProfile,
        updateUserProfile,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
