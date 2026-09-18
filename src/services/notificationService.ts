import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { NotificationItem } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  // Subscribe to notifications for current user
  subscribeUserNotifications(userId: string, callback: (notifications: NotificationItem[]) => void) {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const list: NotificationItem[] = [];
      snapshot.forEach((d) => list.push(d.data() as NotificationItem));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    }, (error) => {
      console.warn('Notifications snapshot fallback:', error);
      callback([]);
    });
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    try {
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${NOTIFICATIONS_COLLECTION}/${notificationId}`);
    }
  }
};
