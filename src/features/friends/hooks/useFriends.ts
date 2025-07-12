import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
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
    console.log('Attempting to add friend with email:', email);
    console.log('Current user object:', user);

    if (!user) {
      console.error('Add friend failed: User is not logged in.');
      setError('You must be logged in to add friends.');
      return;
    }
    if (user.email === email) {
      console.error("Add friend failed: User tried to add themselves.", {userEmail: user.email, friendEmail: email});
      setError("You can't add yourself as a friend.");
      return;
    }

    setError(null);
    console.log('Pre-flight checks passed. Proceeding to query Firestore.');

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User not found.');
        return;
      }

      const friendDoc = querySnapshot.docs[0];
      const friendData = friendDoc.data();
      
      const userDocRef = doc(db, 'users', user.uid);

      // Ensure the user's own document exists before trying to update it
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          friends: []
        });
      }

      await updateDoc(userDocRef, {
        friends: arrayUnion(friendData.uid)
      });

    } catch (err) {
      console.error('An error occurred during the add friend process:', err);
      setError('Failed to add friend.');
    }
  };

  const removeFriend = async (friendUid: string) => {
    if (!user) {
      setError('You must be logged in to remove friends.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        friends: arrayRemove(friendUid)
      });
    } catch (err) {
      setError('Failed to remove friend.');
    }
  };

  return { friends, addFriend, removeFriend, loading, error };
};
