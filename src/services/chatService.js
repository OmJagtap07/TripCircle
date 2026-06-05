import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  writeBatch,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Ensures a direct message room exists between two users.
 * Denormalizes basic user info into participantsData for easy Inbox rendering.
 */
export async function getOrCreateDirectChat(currentUser, targetUser) {
  const sortedIds = [currentUser.uid, targetUser.uid].sort();
  const chatId = `dm_${sortedIds[0]}_${sortedIds[1]}`;
  const chatRef = doc(db, "chats", chatId);
  
  const chatSnap = await getDoc(chatRef);
  
  if (!chatSnap.exists()) {
    // Create room with denormalized participant data
    await setDoc(chatRef, {
      type: "direct",
      tripId: null,
      participantIds: [currentUser.uid, targetUser.uid],
      participantsData: {
        [currentUser.uid]: { name: currentUser.name, avatar: currentUser.avatar || null },
        [targetUser.uid]: { name: targetUser.name, avatar: targetUser.avatar || null }
      },
      updatedAt: serverTimestamp(),
      lastMessage: null
    });
  }
  
  return chatId;
}

/**
 * Creates a group chat for a trip. 
 * initialMembersData should be an array of user objects: { uid, name, avatar }
 */
export async function createTripGroupChat(tripId, tripName, creatorData, initialMembersData = []) {
  const chatId = `trip_${tripId}`;
  const chatRef = doc(db, "chats", chatId);
  
  const participantIds = [creatorData.uid, ...initialMembersData.map(m => m.uid)];
  const participantsData = {
    [creatorData.uid]: { name: creatorData.name, avatar: creatorData.avatar || null }
  };
  
  initialMembersData.forEach(m => {
    participantsData[m.uid] = { name: m.name, avatar: m.avatar || null };
  });
  
  await setDoc(chatRef, {
    type: "group",
    tripId: tripId,
    tripName: tripName,
    participantIds: participantIds,
    participantsData: participantsData,
    updatedAt: serverTimestamp(),
    lastMessage: null
  });
  
  return chatId;
}

/**
 * Removes a user from a trip group chat.
 * Used when a user leaves a trip.
 */
export async function leaveTripGroupChat(chatId, userId) {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    participantIds: arrayRemove(userId)
  });
}

/**
 * Sends a message in a chat and updates the chat's lastMessage.
 */
export async function sendMessage(chatId, senderData, messageText) {
  const batch = writeBatch(db);
  
  // 1. Reference for new message inside subcollection
  const messagesRef = collection(db, "chats", chatId, "messages");
  const newMessageRef = doc(messagesRef); 
  
  const messageData = {
    text: messageText,
    senderId: senderData.uid,
    senderName: senderData.name,
    senderPhotoURL: senderData.avatar || null,
    createdAt: serverTimestamp()
  };
  
  batch.set(newMessageRef, messageData);
  
  // 2. Update parent room metadata for inbox sorting
  const chatRef = doc(db, "chats", chatId);
  batch.update(chatRef, {
    lastMessage: {
      text: messageText,
      senderId: senderData.uid,
      senderName: senderData.name,
      createdAt: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });
  
  await batch.commit();
}

/**
 * Listens to all active chats for a given user.
 */
export function subscribeToUserChats(userId, callback) {
  // Query without orderBy to avoid needing a manual composite index in Firestore
  const q = query(
    collection(db, "chats"),
    where("participantIds", "array-contains", userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort locally by updatedAt descending
    chats.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis() || 0;
      const timeB = b.updatedAt?.toMillis() || 0;
      return timeB - timeA;
    });
    
    callback(chats);
  }, (error) => {
    console.error("Error fetching chats: ", error);
  });
}
