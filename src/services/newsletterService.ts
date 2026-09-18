import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { NewsletterSubscriber } from '../types';

const NEWSLETTER_COLLECTION = 'newsletterSubscribers';
const LOCAL_STORAGE_KEY = 'janus_newsletter_sub';

// Helper to convert email to safe valid Firestore document ID
export function emailToDocId(email: string): string {
  const normalized = email.trim().toLowerCase();
  // Safe hex or clean alphanumeric identifier
  return normalized.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export const newsletterService = {
  // Check if an email is already subscribed (Firestore with local fallback)
  async getSubscription(email: string): Promise<NewsletterSubscriber | null> {
    if (!email || !email.includes('@')) return null;

    const docId = emailToDocId(email);
    try {
      const docRef = doc(db, NEWSLETTER_COLLECTION, docId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as NewsletterSubscriber;
        // Sync local storage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data;
      }

      // Check local cache if not found on server
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local) as NewsletterSubscriber;
        if (parsed.email.toLowerCase() === email.trim().toLowerCase()) {
          return parsed;
        }
      }

      return null;
    } catch (error) {
      console.warn('Error checking newsletter subscription, falling back to local state:', error);
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        try {
          const parsed = JSON.parse(local) as NewsletterSubscriber;
          if (parsed.email.toLowerCase() === email.trim().toLowerCase()) {
            return parsed;
          }
        } catch {
          // ignore parsing error
        }
      }
      return null;
    }
  },

  // Subscribe user or update subscription
  async subscribe(email: string, userId?: string | null, source = 'app'): Promise<NewsletterSubscriber> {
    const cleanEmail = email.trim().toLowerCase();
    const docId = emailToDocId(cleanEmail);
    const now = new Date().toISOString();

    const subscriberData: NewsletterSubscriber = {
      id: docId,
      email: cleanEmail,
      userId: userId || null,
      status: 'subscribed',
      source,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const docRef = doc(db, NEWSLETTER_COLLECTION, docId);
      const existing = await getDoc(docRef);

      if (existing.exists()) {
        await updateDoc(docRef, {
          status: 'subscribed',
          updatedAt: now,
          userId: userId || null,
          source,
        });
      } else {
        await setDoc(docRef, subscriberData);
      }

      // Save locally
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subscriberData));
      return subscriberData;
    } catch (error) {
      // Local fallback in case of connection drop
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subscriberData));
      handleFirestoreError(error, OperationType.WRITE, `${NEWSLETTER_COLLECTION}/${docId}`);
    }
  },

  // Unsubscribe an email
  async unsubscribe(email: string): Promise<NewsletterSubscriber> {
    const cleanEmail = email.trim().toLowerCase();
    const docId = emailToDocId(cleanEmail);
    const now = new Date().toISOString();

    const unsubscribedData: NewsletterSubscriber = {
      id: docId,
      email: cleanEmail,
      status: 'unsubscribed',
      createdAt: now,
      updatedAt: now,
    };

    try {
      const docRef = doc(db, NEWSLETTER_COLLECTION, docId);
      await updateDoc(docRef, {
        status: 'unsubscribed',
        updatedAt: now,
      });

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unsubscribedData));
      return unsubscribedData;
    } catch (error) {
      // Fallback
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unsubscribedData));
      handleFirestoreError(error, OperationType.UPDATE, `${NEWSLETTER_COLLECTION}/${docId}`);
    }
  },

  // Get cached subscription from localStorage
  getLocalCachedSubscription(): NewsletterSubscriber | null {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  },

  // Clear local subscription cache
  clearLocalSubscription() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
};
