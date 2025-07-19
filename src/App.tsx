import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useUserProfile } from './features/auth/hooks/useUserProfile';
import { DraftProvider } from './features/draft/context/DraftContext';
import { AudioProvider } from './features/layout/context/AudioContext';
import MainLayout from './features/layout/components/MainLayout';
import LandingPage from './features/landing/LandingPage';
import FinalTeamsDisplay from './features/draft/components/FinalTeamsDisplay'; // Add this import
import './index.css';
import LoginPage from './features/auth/LoginPage';
import SignUpPage from './features/auth/SignUpPage';
import ProfilePage from './features/profile/ProfilePage';
import LobbyPage from './features/lobby/LobbyPage';

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

const RealtimeDraft = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const [draftState, setDraftState] = useState<Draft | null>(null);
  const { user } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!draftId) return;
    const draftDocRef = doc(db, "drafts", draftId);
    const unsubscribe = onSnapshot(draftDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Draft;
        if (data.status === 'lobby') {
          navigate(`/lobby/${draftId}`);
        } else {
          setDraftState(data);
        }
      } else {
        console.error("Draft not found!");
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [draftId, navigate]);

  if (!draftState || !user) {
    return <div className="flex items-center justify-center h-screen bg-gray-800 text-white">Loading Online Draft...</div>;
  }

  const teamAName = draftState.teamA?.name || 'Team A';
  const teamBName = draftState.teamB?.name || 'Team B';
  const teamAColor = "#1abc9c";
  const teamBColor = "#ff6666";

  return (
    <AudioProvider>
      <DraftProvider
        mode="standard"
        initialState={draftState}
        draftId={draftId}
        currentUser={user}
        teamAName={teamAName}
        teamBName={teamBName}
        teamAColor={teamAColor}
        teamBColor={teamBColor}
      >
        <MainLayout 
          teamAName={teamAName} 
          onTeamANameChange={() => {}} 
          teamBName={teamBName} 
          onTeamBNameChange={() => {}} 
          teamAColor={teamAColor} 
          teamBColor={teamBColor} 
          mode="standard"
          setMode={() => {}} 
        />
      </DraftProvider>
    </AudioProvider>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/local" element={<LocalDraft />} />
      <Route path="/draft/:draftId" element={<RealtimeDraft />} />
      <Route path="/lobby/:draftId" element={<LobbyPage />} />
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