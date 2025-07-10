import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { gods } from '../../../constants/gods';

const OnlineDraftLobby = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [draftId, setDraftId] = useState('');

  const createOnlineDraft = async () => {
    if (!user) {
      alert('You must be logged in to create an online draft.');
      return;
    }
    const displayName = prompt("Please enter your display name for this draft:", "Player 1");
    if (!displayName) return;

    try {
      const newDraft = {
        phase: 'BAN',
        activeTeam: 'blue',
        blueBans: [],
        redBans: [],
        bluePicks: [],
        redPicks: [],
        availableGods: gods.map(g => g.name),
        timer: 30,
        teamAName: 'ORDER',
        teamBName: 'CHAOS',
        mode: 'standard',
        blueTeamUser: { uid: user.uid, name: displayName },
        redTeamUser: null,
      };
      const docRef = await addDoc(collection(db, 'drafts'), newDraft);
      navigate(`/draft/${docRef.id}`);
    } catch (e) {
      console.error('Error creating online draft: ', e);
    }
  };

  const joinOnlineDraft = () => {
    if (draftId) {
      navigate(`/draft/${draftId}`);
    } else {
      alert('Please enter a valid Draft ID.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-8">2-Player Draft</h1>
      <div className="flex flex-col gap-4">
        <button
          onClick={createOnlineDraft}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded"
        >
          Create New Draft
        </button>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draftId}
            onChange={(e) => setDraftId(e.target.value)}
            placeholder="Enter Draft ID"
            className="p-2 rounded text-black"
          />
          <button
            onClick={joinOnlineDraft}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Join
          </button>
        </div>
      </div>
       <button onClick={() => navigate('/')} className="absolute top-4 left-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Back to Home
        </button>
    </div>
  );
};

export default OnlineDraftLobby;
