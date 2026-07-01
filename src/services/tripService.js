import { db } from '../config/firebase';
import { collection, doc, setDoc, deleteDoc, query, where, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';

/**
 * Adds a user as a member to a trip.
 */
export const addTripMember = async (tripId, userId, role = 'member') => {
  const memberRef = doc(db, 'tripMembers', `${tripId}_${userId}`);
  await setDoc(memberRef, {
    tripId,
    userId,
    role,
    joinedAt: serverTimestamp()
  });
};

/**
 * Removes a user from a trip.
 */
export const removeTripMember = async (tripId, userId) => {
  const memberRef = doc(db, 'tripMembers', `${tripId}_${userId}`);
  await deleteDoc(memberRef);
};

/**
 * Gets all members of a trip.
 */
export const getTripMembers = async (tripId) => {
  const q = query(collection(db, 'tripMembers'), where('tripId', '==', tripId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Gets all trips a user is a member of.
 */
export const getUserTrips = async (userId) => {
  const q = query(collection(db, 'tripMembers'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().tripId);
};
