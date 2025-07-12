import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../../firebase';
import { UserProfile } from '../../../types';

export const useFriends = () => {
  const [user] = useAuthState(auth);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const friendUids = userData.friends || [];

        if (friendUids.length > 0) {
          const friendsQuery = query(collection(db, 'users'), where('uid', 'in', friendUids));
          const friendsSnapshot = await getDocs(friendsQuery);
          const friendsData = friendsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
          setFriends(friendsData);
        } else {
          setFriends([]);
        }
      }
      setLoading(false);
    }, (err) => {
      setError('Failed to fetch friends.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addFriend = async (email: string) => {
    if (!user) {
      setError('You must be logged in to add friends.');
      return;
    }
    if (user.email === email) {
        setError("You can't add yourself as a friend.");
        return;
    }

    setError(null);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User not found.');
        return;
      }

      const friendDoc = querySnapshot.docs[0];
      const friendId = friendDoc.id;
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        friends: arrayUnion(friendId)
      });

    } catch (err) {
      setError('Failed to add friend.');
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) {
      setError('You must be logged in to remove friends.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        friends: arrayRemove(friendId)
      });
    } catch (err) {
      setError('Failed to remove friend.');
    }
  };

  return { friends, addFriend, removeFriend, loading, error };
};
