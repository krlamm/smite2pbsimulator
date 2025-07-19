import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useDraftContext } from '../../draft/context/DraftContext';

const TradeNotifications = () => {
  const { draftId, currentUser } = useDraftContext();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!draftId || !currentUser) return;
    const q = query(
      collection(db, 'drafts', draftId, 'tradeRequests'),
      where('to', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [draftId, currentUser]);

  const handleTradeResponse = async (requestId: string, accepted: boolean) => {
    if (!draftId) return;
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const batch = writeBatch(db);
    const requestRef = doc(db, 'drafts', draftId, 'tradeRequests', requestId);

    if (accepted) {
      const draftRef = doc(db, 'drafts', draftId);
      const fromPlayerKey = `teamA.players.${request.from}.pick`; // This needs to be more robust
      const toPlayerKey = `teamA.players.${request.to}.pick`;
      
      // This is a simplified swap, a real implementation would need to get the doc
      // and figure out which team each player is on.
      // For now, we assume they are on the same team.
      batch.update(draftRef, {
        [fromPlayerKey]: request.toPick,
        [toPlayerKey]: request.fromPick,
      });
      batch.update(requestRef, { status: 'accepted' });
    } else {
      batch.update(requestRef, { status: 'declined' });
    }
    await batch.commit();
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-20 right-10 bg-gray-800 p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-lg font-bold mb-2">Incoming Trade Requests</h3>
      {requests.map(req => (
        <div key={req.id} className="p-2 border-b border-gray-700">
          <p>From: {req.fromName}</p>
          <p>Your Pick: {req.toPick}</p>
          <p>Their Pick: {req.fromPick}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => handleTradeResponse(req.id, true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">Accept</button>
            <button onClick={() => handleTradeResponse(req.id, false)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TradeNotifications;