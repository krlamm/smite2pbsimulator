import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../../firebase';
import { Draft } from '../../../types';

export const useUserDrafts = () => {
  const [user] = useAuthState(auth);
  const [userDrafts, setUserDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUserDrafts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const draftsRef = collection(db, 'drafts');

    const q = query(
      draftsRef,
      where('blueTeamUser.uid', '==', user.uid),
      where('redTeamUser', '==', null)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const drafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Draft));
      setUserDrafts(drafts);
      setLoading(false);
    }, (err) => {
      setError('Failed to fetch user drafts.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { userDrafts, loading, error };
};
