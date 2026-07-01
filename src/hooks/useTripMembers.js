import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useTripMembers = (tripId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    const q = query(collection(db, 'tripMembers'), where('tripId', '==', tripId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [tripId]);

  return { members, loading };
};
