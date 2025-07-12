import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../../firebase';
import { UserProfile, FriendRequest } from '../../../types';

export const useFriends = () => {
  const [user] = useAuthState(auth);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches the user's friends list using the 'friends' collection
  const fetchFriends = useCallback((currentUser) => {
    const friendsQuery = query(collection(db, 'friends'), where('members', 'array-contains', currentUser.uid));
    
    return onSnapshot(friendsQuery, async (snapshot) => {
      setLoading(true);
      if (snapshot.empty) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const friendUids = snapshot.docs
        .map(doc => doc.data().members)
        .flat()
        .filter(uid => uid !== currentUser.uid);

      if (friendUids.length > 0) {
        const usersQuery = query(collection(db, 'users'), where('uid', 'in', friendUids));
        const usersSnapshot = await getDocs(usersQuery);
        const friendsData = usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
        setFriends(friendsData);
      } else {
        setFriends([]);
      }
      setLoading(false);
    }, () => {
      setError('Failed to fetch friends.');
      setLoading(false);
    });
  }, []);

  // Listens for incoming friend requests
  const listenForIncomingRequests = useCallback((currentUser) => {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(requestsRef, where('recipientId', '==', currentUser.uid), where('status', '==', 'pending'));
    return onSnapshot(q, (snapshot) => {
      setIncomingRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest)));
    }, () => setError('Failed to fetch friend requests.'));
  }, []);

  useEffect(() => {
    if (user) {
      const unsubFriends = fetchFriends(user);
      const unsubIncoming = listenForIncomingRequests(user);
      
      return () => {
        unsubFriends();
        unsubIncoming();
      };
    } else {
      setFriends([]);
      setIncomingRequests([]);
      setLoading(false);
    }
  }, [user, fetchFriends, listenForIncomingRequests]);

  const sendFriendRequest = async (recipientEmail: string) => {
    if (!user) return setError('You must be logged in.');
    if (user.email === recipientEmail) return setError("You can't send a request to yourself.");

    setError(null);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', recipientEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return setError('User not found.');
      
      const recipientDoc = querySnapshot.docs[0];
      const recipientId = recipientDoc.id;

      const sortedIds = [user.uid, recipientId].sort();
      const requestId = sortedIds.join('_');
      
      const requestDocRef = doc(db, 'friendRequests', requestId);

      await setDoc(requestDocRef, {
        id: requestId,
        senderId: user.uid,
        senderEmail: user.email,
        recipientId: recipientId,
        recipientEmail,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      setError('Failed to send friend request.');
    }
  };

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);

      // Create a new document in the 'friends' collection
      const friendshipId = [user.uid, senderId].sort().join('_');
      const friendDocRef = doc(db, 'friends', friendshipId);
      batch.set(friendDocRef, {
        members: [user.uid, senderId],
        createdAt: serverTimestamp(),
      });

      // Delete the original friend request
      const requestDocRef = doc(db, 'friendRequests', requestId);
      batch.delete(requestDocRef);

      await batch.commit();
    } catch (err) {
      console.error("Error accepting friend request:", err);
      setError('Failed to accept friend request.');
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));
    } catch (err) {
      setError('Failed to decline friend request.');
    }
  };

  const removeFriend = async (friendUid: string) => {
    if (!user) return setError('You must be logged in.');
    try {
      const friendshipId = [user.uid, friendUid].sort().join('_');
      const friendDocRef = doc(db, 'friends', friendshipId);
      await deleteDoc(friendDocRef);
    } catch (err) {
      setError('Failed to remove friend.');
    }
  };

  return { friends, incomingRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, loading, error };
};
