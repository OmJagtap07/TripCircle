import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useTripInvitations = (tripId) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    const q = query(collection(db, 'tripInvitations'), where('tripId', '==', tripId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [tripId]);

  return { invitations, loading };
};
