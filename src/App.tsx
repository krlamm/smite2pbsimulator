import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { gods } from './constants/gods';
import { DraftProvider, useDraftContext } from './features/draft/context/DraftContext';
import { AudioProvider } from './features/layout/context/AudioContext';
import MainLayout from './features/layout/components/MainLayout';
import './index.css';

// A new component that provides the "Create Online" button
const OnlineModeButton = () => {
  const navigate = useNavigate();
  const draft = useDraftContext(); // Get the current local draft state

  const createOnlineDraft = async () => {
    try {
      // Helper to convert character objects back to simple names for Firestore
      const mapCharactersToNames = (items: (any | null)[]) => {
        return items.filter(item => item).map(item => item.name);
      };

      const newDraft = {
        phase: draft.phase,
        activeTeam: draft.currentTeam === 'A' ? 'blue' : 'red',
        blueBans: mapCharactersToNames(draft.bans.A),
        redBans: mapCharactersToNames(draft.bans.B),
        bluePicks: mapCharactersToNames(draft.picks.A),
        redPicks: mapCharactersToNames(draft.picks.B),
        availableGods: gods.map(g => g.name), // Reset available gods for the online session
        timer: 30,
        teamAName: 'ORDER',
        teamBName: 'CHAOS',
        mode: draft.mode,
      };
      
      const docRef = await addDoc(collection(db, 'drafts'), newDraft);
      console.log('Online draft created with ID: ', docRef.id);
      navigate(`/draft/${docRef.id}`);
    } catch (e) {
      console.error('Error creating online draft: ', e);
    }
  };

  return (
    <button
      onClick={createOnlineDraft}
      className="absolute top-4 right-24 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
    >
      Create Online Draft & Invite
    </button>
  );
};


// The default, local-only draft experience
const LocalDraft = () => {
  const [mode, setMode] = useState<'standard' | 'freedom'>('standard');
  const [teamAName, setTeamAName] = useState('ORDER');
  const [teamBName, setTeamBName] = useState('CHAOS');

  return (
    <AudioProvider>
      <DraftProvider mode={mode}>
        <MainLayout
          teamAName={teamAName}
          onTeamANameChange={setTeamAName}
          teamBName={teamBName}
          onTeamBNameChange={setTeamBName}
          teamAColor="#1abc9c"
          teamBColor="#ff6666"
          mode={mode}
          setMode={setMode}
        />
        <OnlineModeButton />
      </DraftProvider>
    </AudioProvider>
  );
};

// The real-time, multi-user draft experience
const RealtimeDraft = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const [draftState, setDraftState] = useState<any>(null);

  React.useEffect(() => {
    if (!draftId) return;
    const draftDocRef = doc(db, 'drafts', draftId);
    
    const unsubscribe = onSnapshot(draftDocRef, (doc) => {
      if (doc.exists()) {
        setDraftState(doc.data());
      } else {
        console.error("Draft not found!");
      }
    });

    return () => unsubscribe();
  }, [draftId]);

  if (!draftState) {
    return <div className="flex items-center justify-center h-screen bg-gray-800 text-white">Loading Online Draft...</div>;
  }

  return (
    <AudioProvider>
      <DraftProvider mode={draftState.mode} initialState={draftState} draftId={draftId}>
        <MainLayout
          teamAName={draftState.teamAName}
          onTeamANameChange={(name) => updateDoc(doc(db, 'drafts', draftId!), { teamAName: name })}
          teamBName={draftState.teamBName}
          onTeamBNameChange={(name) => updateDoc(doc(db, 'drafts', draftId!), { teamBName: name })}
          teamAColor="#1abc9c"
          teamBColor="#ff6666"
          mode={draftState.mode}
          setMode={(newMode) => updateDoc(doc(db, 'drafts', draftId!), { mode: newMode })}
        />
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