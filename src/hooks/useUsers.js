import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';

export const useUsers = (userIds) => {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userIds || userIds.length === 0) {
        setUsers({});
        setLoading(false);
        return;
      }
      
      try {
        // Firestore 'in' query supports up to 10 items.
        // For larger arrays, we'd need to chunk it.
        const chunks = [];
        for (let i = 0; i < userIds.length; i += 10) {
          chunks.push(userIds.slice(i, i + 10));
        }

        const userMap = {};
        for (const chunk of chunks) {
          const q = query(collection(db, 'users'), where(documentId(), 'in', chunk));
          const snap = await getDocs(q);
          snap.forEach(doc => {
            userMap[doc.id] = { uid: doc.id, ...doc.data() };
          });
        }
        setUsers(userMap);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [JSON.stringify(userIds)]); // Re-run if userIds changes

  return { users, loading };
};
