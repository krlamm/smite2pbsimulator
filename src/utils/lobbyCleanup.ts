import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Clean up empty lobbies after 1 hour
export const cleanupEmptyLobbies = async (): Promise<number> => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    const cutoffTimestamp = Timestamp.fromDate(oneHourAgo);
    
    // Query for lobbies older than 1 hour
    const q = query(
      collection(db, 'drafts'),
      where('createdAt', '<', cutoffTimestamp),
      where('status', '==', 'lobby')
    );
    
    const querySnapshot = await getDocs(q);
    let deletedCount = 0;
    
    // Check each lobby to see if it's empty (no players in either team)
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const teamACount = Object.keys(data.teamA?.players || {}).length;
      const teamBCount = Object.keys(data.teamB?.players || {}).length;
      
      // Delete if no players in either team
      if (teamACount === 0 && teamBCount === 0) {
        await deleteDoc(doc(db, 'drafts', docSnap.id));
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`Auto-cleaned ${deletedCount} empty lobbies older than 1 hour`);
    }
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up empty lobbies:', error);
    return 0;
  }
};

// Clean up very old lobbies (24+ hours) regardless of status to prevent database bloat
export const cleanupVeryOldLobbies = async (): Promise<number> => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const cutoffTimestamp = Timestamp.fromDate(oneDayAgo);
    
    // Query for any drafts older than 24 hours
    const q = query(
      collection(db, 'drafts'),
      where('createdAt', '<', cutoffTimestamp)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(docSnap => 
      deleteDoc(doc(db, 'drafts', docSnap.id))
    );
    
    await Promise.all(deletePromises);
    
    if (querySnapshot.size > 0) {
      console.log(`Auto-cleaned ${querySnapshot.size} very old lobbies/drafts (24+ hours)`);
    }
    return querySnapshot.size;
  } catch (error) {
    console.error('Error cleaning up very old lobbies:', error);
    return 0;
  }
};

// Main cleanup function - runs both cleanup types
export const runAutomaticCleanup = async () => {
  const emptyLobbies = await cleanupEmptyLobbies();
  const veryOldLobbies = await cleanupVeryOldLobbies();
  
  const total = emptyLobbies + veryOldLobbies;
  if (total > 0) {
    console.log(`Automatic cleanup complete: ${total} total lobbies/drafts removed`);
  }
  
  return { emptyLobbies, veryOldLobbies, total };
};