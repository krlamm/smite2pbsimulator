import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../../firebase';
import { UserProfile } from '../../../types';

export const useUserProfile = () => {
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserProfile({ id: doc.id, ...doc.data() } as UserProfile);
      } else {
        // This case can happen if the user exists in Auth but not in Firestore
        setError("User profile not found in the database.");
      }
      setLoading(false);
    }, (err) => {
      setError("Failed to fetch user profile.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { user, userProfile, loading, error };
};
