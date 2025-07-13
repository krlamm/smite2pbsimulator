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
    if (!user || friends.length === 0) {
      setFriendDrafts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const friendUids = friends.map(f => f.uid);
    const draftsRef = collection(db, 'drafts');

    // Query for drafts where a friend is the blue team user and red team is open
    const blueTeamQuery = query(
      draftsRef,
      where('blueTeamUser.uid', 'in', friendUids),
      where('redTeamUser', '==', null)
    );

    // Query for drafts where a friend is the red team user and blue team is open
    const redTeamQuery = query(
      draftsRef,
      where('redTeamUser.uid', 'in', friendUids),
      where('blueTeamUser', '==', null)
    );

    const unsubBlue = onSnapshot(blueTeamQuery, (blueSnapshot) => {
      const blueDrafts = blueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Draft));
      
      // After getting blue team drafts, listen to red team drafts to merge
      const unsubRed = onSnapshot(redTeamQuery, (redSnapshot) => {
        const redDrafts = redSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Draft));
        
        // Merge and remove duplicates
        const allDrafts = [...blueDrafts, ...redDrafts];
        const uniqueDrafts = allDrafts.filter((draft, index, self) =>
          index === self.findIndex((d) => d.id === draft.id)
        );

        setFriendDrafts(uniqueDrafts);
        setLoading(false);
      }, (err) => {
        setError('Failed to fetch friend drafts (red team).');
        setLoading(false);
      });

      return () => unsubRed();
    }, (err) => {
      setError('Failed to fetch friend drafts (blue team).');
      setLoading(false);
    });

    return () => {
      unsubBlue();
      // The red subscription is handled inside blue's callback
    };
  }, [user, friends]);

  return { friendDrafts, loading, error };
};
