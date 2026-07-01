import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';

export const subscribeToNotifications = (userId, callback) => {
  const q = query(collection(db, 'notifications'), where('receiverId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort locally by createdAt desc (if needed) to avoid needing composite index immediately
    notifications.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
    callback(notifications);
  }, (error) => {
    console.error("Error fetching notifications:", error);
  });
};

export const markNotificationAsRead = async (notificationId) => {
  const notifRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifRef, { read: true });
};

export const markAllNotificationsAsRead = async (userId, notifications) => {
  const batch = writeBatch(db);
  const unreadNotifs = notifications.filter(n => !n.read);
  if (unreadNotifs.length === 0) return;

  unreadNotifs.forEach(n => {
    const ref = doc(db, 'notifications', n.id);
    batch.update(ref, { read: true });
  });
  await batch.commit();
};
