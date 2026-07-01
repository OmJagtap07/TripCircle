import { db } from '../config/firebase';
import { doc, collection, writeBatch, serverTimestamp, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

export const sendInvitations = async (trip, sender, receiverUids) => {
  if (!receiverUids || receiverUids.length === 0) return;
  const batch = writeBatch(db);
  
  // Expiration: 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  for (const receiverId of receiverUids) {
    const inviteId = `${trip.id}_${receiverId}`;
    const inviteRef = doc(db, 'tripInvitations', inviteId);
    
    batch.set(inviteRef, {
      tripId: trip.id,
      senderId: sender.uid,
      receiverId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt
    });

    const notifRef = doc(collection(db, 'notifications'));
    batch.set(notifRef, {
      receiverId,
      senderId: sender.uid,
      invitationId: inviteId,
      tripId: trip.id,
      type: 'trip_invitation',
      title: 'New Trip Invitation',
      message: `${sender.name} invited you to join a trip to ${trip.location}!`,
      tripData: {
        name: trip.name || '',
        location: trip.location || '',
        dateRange: trip.dateRange || '',
        img: trip.img || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800',
        creatorName: sender.name || 'Anonymous'
      },
      read: false,
      createdAt: serverTimestamp()
    });
  }

  await batch.commit();
};

export const acceptInvitation = async (invitationId, tripId, userId, user) => {
  const batch = writeBatch(db);

  // 1. Update invitation status
  const inviteRef = doc(db, 'tripInvitations', invitationId);
  batch.update(inviteRef, {
    status: 'accepted',
    updatedAt: serverTimestamp()
  });

  // 2. Add to tripMembers
  const memberRef = doc(db, 'tripMembers', `${tripId}_${userId}`);
  batch.set(memberRef, {
    tripId,
    userId,
    role: 'member',
    joinedAt: serverTimestamp()
  });

  // 3. Add to chat participants
  const chatRef = doc(db, 'chats', `trip_${tripId}`);
  batch.update(chatRef, {
    participantIds: arrayUnion(userId),
    [`participantsData.${userId}`]: { name: user.name, avatar: user.avatar || null }
  });

  await batch.commit();
};

export const declineInvitation = async (invitationId) => {
  const inviteRef = doc(db, 'tripInvitations', invitationId);
  await updateDoc(inviteRef, {
    status: 'declined',
    updatedAt: serverTimestamp()
  });
};

export const cancelInvitation = async (invitationId) => {
  const inviteRef = doc(db, 'tripInvitations', invitationId);
  await updateDoc(inviteRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp()
  });
};

export const getTripInvitations = async (tripId) => {
  const q = query(collection(db, 'tripInvitations'), where('tripId', '==', tripId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
