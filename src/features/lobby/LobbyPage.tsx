import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUserProfile } from '../auth/hooks/useUserProfile';

const LobbyPage = () => {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useUserProfile();
  const [draft, setDraft] = React.useState<any>(null);

  React.useEffect(() => {
    if (!draftId) return;
    const unsub = onSnapshot(doc(db, 'drafts', draftId), (doc) => {
      if (doc.exists()) {
        const draftData = doc.data();
        setDraft(draftData);
        // If draft has started, navigate to the draft page
        if (draftData.status !== 'lobby') {
          navigate(`/draft/${draftId}`);
        }
      } else {
        console.error("Draft not found!");
        navigate('/');
      }
    });
    return () => unsub();
  }, [draftId, navigate]);

  const handleStartDraft = async () => {
    if (!draftId || !draft) return;

    const { teamA, teamB } = draft;
    let { captainA, captainB } = { captainA: teamA.captain, captainB: teamB.captain };

    // Assign captain if none is selected
    if (!captainA && Object.keys(teamA.players).length > 0) {
      captainA = Object.keys(teamA.players)[0];
    }
    if (!captainB && Object.keys(teamB.players).length > 0) {
      captainB = Object.keys(teamB.players)[0];
    }

    if (!captainA || !captainB) {
      alert("Both teams must have at least one player to start the draft.");
      return;
    }

    // Define the pick and ban order
    const pickOrder = [
      { type: 'ban', team: 'teamA', uid: captainA },
      { type: 'ban', team: 'teamB', uid: captainB },
      { type: 'ban', team: 'teamA', uid: captainA },
      { type: 'ban', team: 'teamB', uid: captainB },
      { type: 'ban', team: 'teamA', uid: captainA },
      { type: 'ban', team: 'teamB', uid: captainB },
      { type: 'pick', team: 'teamA', uid: captainA },
      { type: 'pick', team: 'teamB', uid: captainB },
      // Add the rest of the pick order here, this is just an example
    ];

    const draftDocRef = doc(db, 'drafts', draftId);
    await updateDoc(draftDocRef, {
      status: 'banning',
      'teamA.captain': captainA,
      'teamB.captain': captainB,
      pickOrder: pickOrder,
      currentPickIndex: 0,
    });
  };

  const handleJoinTeam = async (team: 'teamA' | 'teamB') => {
    if (!draftId || !user || !userProfile) return;
    const playerKey = `${team}.players.${user.uid}`;
    await updateDoc(doc(db, 'drafts', draftId), {
      [playerKey]: {
        displayName: userProfile.displayName,
        pick: null,
        hasPicked: false,
      }
    });
  };

  const handleBecomeCaptain = async (team: 'teamA' | 'teamB') => {
    if (!draftId || !user) return;
    const captainKey = `${team}.captain`;
    await updateDoc(doc(db, 'drafts', draftId), {
      [captainKey]: user.uid
    });
  };

  if (!draft || !user || !userProfile) {
    return <div>Loading Lobby...</div>;
  }

  const renderTeam = (team: 'teamA' | 'teamB') => {
    const teamData = draft[team];
    const players = Object.entries(teamData.players).map(([uid, player]: [string, any]) => ({ uid, ...player }));
    const isUserInTeam = players.some(p => p.uid === user.uid);

    return (
      <div className="w-1/2 p-4">
        <h2 className="text-2xl font-bold mb-2">{teamData.name}</h2>
        {players.map(p => (
          <div key={p.uid} className="flex items-center gap-2">
            <p>{p.displayName}</p>
            {teamData.captain === p.uid && <span className="text-yellow-400">(Captain)</span>}
          </div>
        ))}
        {!isUserInTeam && Object.keys(teamData.players).length < 5 && (
          <button onClick={() => handleJoinTeam(team)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">Join Team</button>
        )}
        {isUserInTeam && !teamData.captain && (
          <button onClick={() => handleBecomeCaptain(team)} className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">Become Captain</button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Draft Lobby: {draft.draftName}</h1>
      <div className="flex w-full max-w-4xl justify-around">
        {renderTeam('teamA')}
        {renderTeam('teamB')}
      </div>
      {draft.hostId === user.uid && draft.status === 'lobby' && (
        <button
          onClick={handleStartDraft}
          className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Start Draft
        </button>
      )}
    </div>
  );
};

export default LobbyPage;
