import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useUserProfile } from './features/auth/hooks/useUserProfile';
import { useAuthState } from 'react-firebase-hooks/auth';
import { DraftProvider } from './features/draft/context/DraftContext';
import { AudioProvider } from './features/layout/context/AudioContext';
import MainLayout from './features/layout/components/MainLayout';
import LandingPage from './features/landing/LandingPage';
import OnlineDraftLobby from './features/draft/components/OnlineDraftLobby';
import FinalTeamsDisplay from './features/draft/components/FinalTeamsDisplay'; // Add this import
import './index.css';
import LoginPage from './features/auth/LoginPage';
import SignUpPage from './features/auth/SignUpPage';
import ProfilePage from './features/profile/ProfilePage';

const LocalDraft = () => {
  const [mode, setMode] = useState<'standard' | 'freedom'>('standard');
  const [teamAName, setTeamAName] = useState('ORDER');
  const [teamBName, setTeamBName] = useState('CHAOS');
  
  return (
    <AudioProvider>
      <DraftProvider
        mode={mode}
        teamAName={teamAName}
        teamBName={teamBName}
        teamAColor="#1abc9c" // Pass teamAColor
        teamBColor="#ff6666" // Pass teamBColor
      >
        <MainLayout teamAName={teamAName} onTeamANameChange={setTeamAName} teamBName={teamBName} onTeamBNameChange={setTeamBName} teamAColor="#1abc9c" teamBColor="#ff6666" mode={mode} setMode={setMode} />
      </DraftProvider>
    </AudioProvider>
  );
};

const JoinTeamButtons = ({ draftId, draftData, user, userProfile }: any) => {
  const joinTeam = async (team: 'blue' | 'red') => {
    if (!user || !userProfile) return;
    const displayName = userProfile.displayName;
    if (!displayName) {
      alert("Please set a display name in your profile before joining a draft.");
      return;
    }

    const field = team === 'blue' ? 'blueTeamUser' : 'redTeamUser';
    await updateDoc(doc(db, 'drafts', draftId), { [field]: { uid: user.uid, name: displayName } });
  };

  return (
    <div className="flex gap-4">
      {!draftData.blueTeamUser && <button onClick={() => joinTeam('blue')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join Blue Team</button>}
      {!draftData.redTeamUser && <button onClick={() => joinTeam('red')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Join Red Team</button>}
    </div>
  );
};

const RealtimeDraft = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const [draftState, setDraftState] = useState<any>(null);
  const { user, userProfile } = useUserProfile();
  const navigate = useNavigate();
  const prevDraftStateRef = React.useRef<any>();

  useEffect(() => {
    if (!draftId) return;
    const draftDocRef = doc(db, 'drafts', draftId);
    const unsubscribe = onSnapshot(draftDocRef, (doc) => {
      if (doc.exists()) {
        setDraftState(doc.data());
      } else {
        console.error("Draft not found!");
        navigate('/'); 
      }
    });
    return () => unsubscribe();
  }, [draftId, navigate]);

  useEffect(() => {
    if (prevDraftStateRef.current && draftState && user) {
      const amIBlue = draftState.blueTeamUser?.uid === user.uid;
      const amIRed = draftState.redTeamUser?.uid === user.uid;

      const wasOtherPlayerPresent = amIBlue ? prevDraftStateRef.current.redTeamUser : prevDraftStateRef.current.blueTeamUser;
      const isOtherPlayerPresent = amIBlue ? draftState.redTeamUser : draftState.redTeamUser;
      
      if (wasOtherPlayerPresent && !isOtherPlayerPresent) {
        const otherPlayerName = (amIBlue ? prevDraftStateRef.current.redTeamUser.name : prevDraftStateRef.current.blueTeamUser.name) || 'The other player';
        alert(`${otherPlayerName} has left the draft.`);
      }
    }
    prevDraftStateRef.current = draftState;
  }, [draftState, user]);

  if (!draftState || !user) {
    return <div className="flex items-center justify-center h-screen bg-gray-800 text-white">Loading Online Draft...</div>;
  }

  const isUserInDraft = draftState.blueTeamUser?.uid === user.uid || draftState.redTeamUser?.uid === user.uid;
  const blueTeamName = draftState.blueTeamUser ? draftState.blueTeamUser.name : 'ORDER';
  const redTeamName = draftState.redTeamUser ? draftState.redTeamUser.name : 'CHAOS';
  const teamAColor = "#1abc9c"; // Assuming these are fixed for online mode as well
  const teamBColor = "#ff6666"; // Assuming these are fixed for online mode as well

  return (
    <AudioProvider>
      <DraftProvider
        mode={draftState.mode}
        initialState={draftState}
        draftId={draftId}
        currentUser={user}
        teamAName={blueTeamName}
        teamBName={redTeamName}
        teamAColor={teamAColor} // Pass teamAColor
        teamBColor={teamBColor} // Pass teamBColor
      >
        <MainLayout teamAName={blueTeamName} onTeamANameChange={() => {}} teamBName={redTeamName} onTeamBNameChange={() => {}} teamAColor="#1abc9c" teamBColor="#ff6666" mode={draftState.mode} setMode={(newMode) => updateDoc(doc(db, 'drafts', draftId!), { mode: newMode })} />

        {!isUserInDraft && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><JoinTeamButtons draftId={draftId} draftData={draftState} user={user} userProfile={userProfile} /></div>}

      </DraftProvider>
    </AudioProvider>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/local" element={<LocalDraft />} />
      <Route path="/online" element={<OnlineDraftLobby />} />
      <Route path="/draft/:draftId" element={<RealtimeDraft />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      {/* Wrap FinalTeamsDisplay with AudioProvider and DraftProvider to ensure all contexts are available */}
      <Route path="/final-teams" element={
        <AudioProvider> {/* Add AudioProvider here */}
          <DraftProvider
            mode="standard"
            teamAName="ORDER"
            teamBName="CHAOS"
            teamAColor="#1abc9c"
            teamBColor="#ff6666"
          >
            <FinalTeamsDisplay />
          </DraftProvider>
        </AudioProvider>
      } />
    </Routes>
  );
}

export default App;