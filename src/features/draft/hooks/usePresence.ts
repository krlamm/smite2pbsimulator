import { useEffect, useCallback } from 'react';
import { ref, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { rtdb } from '../../../firebase'; // Assuming you have an RTDB export

const usePresence = (userId?: string, draftId?: string) => {
  useEffect(() => {
    if (!userId || !draftId) return;

    const userStatusRef = ref(rtdb, `/status/${userId}`);

    const isOfflineForDatabase = {
      state: 'offline',
      last_changed: serverTimestamp(),
      draftId: draftId,
    };

    const isOnlineForDatabase = {
      state: 'online',
      last_changed: serverTimestamp(),
      draftId: draftId,
    };

    // `onDisconnect` is the key. It sets the user's status to offline
    // when they close the browser or lose connection.
    onDisconnect(userStatusRef).set(isOfflineForDatabase).then(() => {
      set(userStatusRef, isOnlineForDatabase);
    });

    return () => {
      // Clean up the disconnect handler if the component unmounts
      // but the user is still connected (e.g., navigating away).
      onDisconnect(userStatusRef).cancel();
    };
  }, [userId, draftId]);

  const setViewingFinalTeams = useCallback(() => {
    if (!userId || !draftId) return;
    const userStatusRef = ref(rtdb, `/status/${userId}`);
    set(userStatusRef, {
      state: 'viewingFinalTeams',
      last_changed: serverTimestamp(),
      draftId: draftId,
    });
  }, [userId, draftId]);

  return { setViewingFinalTeams };
};

export default usePresence;
