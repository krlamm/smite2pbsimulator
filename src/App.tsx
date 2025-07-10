import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { gods } from './constants/gods';
import { DraftProvider, useDraftContext } from './features/draft/context/DraftContext';
import { AudioProvider } from './features/layout/context/AudioContext';
import MainLayout from './features/layout/components/MainLayout';
import './index.css';

// --- Local (Single-Player) Draft Components ---

const OnlineModeButton = () => {
  const navigate = useNavigate();
  const draft = useDraftContext();
  const [user] = useAuthState(auth); // We still need the user object here to create the draft

  const createOnlineDraft = async () => {
    if (!user) return; // Should not happen due to the AuthWrapper, but good practice
    
    const displayName = prompt("Please enter your display name for this draft:", "Player 1");
    if (!displayName) return;

    try {
      const mapCharactersToNames = (items: (any | null)[]) => items.filter(item => item).map(item => item.name);
      const newDraft = {
        phase: draft.phase,
        activeTeam: draft.currentTeam === 'A' ? 'blue' : 'red',
        blueBans: mapCharactersToNames(draft.bans.A),
        redBans: mapCharactersToNames(draft.bans.B),
        bluePicks: mapCharactersToNames(draft.picks.A),
        redPicks: mapCharactersToNames(draft.picks.B),
        availableGods: gods.map(g => g.name),
        timer: 30,
        teamAName: 'ORDER',
        teamBName: 'CHAOS',
        mode: draft.mode,
        blueTeamUser: { uid: user.uid, name: displayName },
        redTeamUser: null,
      };
      const docRef = await addDoc(collection(db, 'drafts'), newDraft);
      navigate(`/draft/${docRef.id}`);
    } catch (e) {
      console.error('Error creating online draft: ', e);
    }
  };

  return (
    <button onClick={createOnlineDraft} className="absolute top-4 right-24 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
      Create Online Draft & Invite
    </button>
  );
};

const LocalDraft = () => {
  const [mode, setMode] = useState<'standard' | 'freedom'>('standard');
  const [teamAName, setTeamAName] = useState('ORDER');
  const [teamBName, setTeamBName] = useState('CHAOS');

  return (
    <AudioProvider>
      <DraftProvider mode={mode}>
        <MainLayout teamAName={teamAName} onTeamANameChange={setTeamAName} teamBName={teamBName} onTeamBNameChange={setTeamBName} teamAColor="#1abc9c" teamBColor="#ff6666" mode={mode} setMode={setMode} />
        <OnlineModeButton />
      </DraftProvider>
    </AudioProvider>
  );
};

// --- Real-Time (Multiplayer) Draft Components ---

const JoinTeamButtons = ({ draftId, user }: any) => {
  const joinTeam = async (team: 'blue' | 'red') => {
    if (!user) return;
    const displayName = prompt(`Please enter your display name to join the ${team} team:`);
    if (!displayName) return;

    const field = team === 'blue' ? 'blueTeamUser' : 'redTeamUser';
    await updateDoc(doc(db, 'drafts', draftId), { [field]: { uid: user.uid, name: displayName } });
  };

  return (
    <div className="flex gap-4">
      <button onClick={() => joinTeam('blue')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join Blue Team</button>
      <button onClick={() => joinTeam('red')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Join Red Team</button>
    </div>
  );
};

const RealtimeDraft = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const [draftState, setDraftState] = useState<any>(null);
  const [user] = useAuthState(auth); // The user is guaranteed to be loaded here

  useEffect(() => {
    if (!draftId) return;
    const draftDocRef = doc(db, 'drafts', draftId);
    const unsubscribe = onSnapshot(draftDocRef, (doc) => doc.exists() ? setDraftState(doc.data()) : console.error("Draft not found!"));
    return () => unsubscribe();
  }, [draftId]);

  if (!draftState || !user) {
    return <div className="flex items-center justify-center h-screen bg-gray-800 text-white">Loading Online Draft...</div>;
  }

  const isUserInDraft = draftState.blueTeamUser?.uid === user.uid || draftState.redTeamUser?.uid === user.uid;
  const blueTeamName = draftState.blueTeamUser ? draftState.blueTeamUser.name : 'ORDER';
  const redTeamName = draftState.redTeamUser ? draftState.redTeamUser.name : 'CHAOS';

  return (
    <AudioProvider>
      <DraftProvider mode={draftState.mode} initialState={draftState} draftId={draftId} currentUser={user}>
        <MainLayout teamAName={blueTeamName} onTeamANameChange={() => {}} teamBName={redTeamName} onTeamBNameChange={() => {}} teamAColor="#1abc9c" teamBColor="#ff6666" mode={draftState.mode} setMode={(newMode) => updateDoc(doc(db, 'drafts', draftId!), { mode: newMode })} />
        {!isUserInDraft && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><JoinTeamButtons draftId={draftId} user={user} /></div>}
      </DraftProvider>
    </AudioProvider>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LocalDraft />} />
      <Route path="/draft/:draftId" element={<RealtimeDraft />} />
    </Routes>
  );
}

export default App;