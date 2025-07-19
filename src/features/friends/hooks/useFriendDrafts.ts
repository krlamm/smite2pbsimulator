import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../../firebase';
import { useFriends } from './useFriends';
import { Draft } from '../../../types';

export const useFriendDrafts = () => {
  const [user] = useAuthState(auth);
  const { friends } = useFriends();
  const [friendDrafts, setFriendDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFriendDrafts([]);
      setLoading(false);
      return;
    }

    if (friends.length === 0) {
      setFriendDrafts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const friendUids = friends.map(f => f.uid);
    if (friendUids.length === 0) {
        setFriendDrafts([]);
        setLoading(false);
        return;
    }
    const draftsRef = collection(db, 'drafts');

    const lobbiesQuery = query(
      draftsRef,
      where('status', '==', 'lobby'),
      where('hostId', 'in', friendUids)
    );

    const unsubscribe = onSnapshot(lobbiesQuery, (snapshot) => {
      const drafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Draft));
      setFriendDrafts(drafts);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('Failed to fetch friend lobbies.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, friends]);

  return { friendDrafts, loading, error };
};
