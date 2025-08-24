import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ThemeProvider } from './features/layout/context/ThemeContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useUserProfile } from './features/auth/hooks/useUserProfile';
import { DraftProvider } from './features/draft/context/DraftContext';
import { AudioProvider } from './features/layout/context/AudioContext';
import { Draft } from './types';
import MainLayout from './features/layout/components/MainLayout';
import LandingPage from './features/landing/LandingPage';
import FinalTeamsWrapper from './features/draft/components/FinalTeamsWrapper';
import './index.css';
import LoginPage from './features/auth/LoginPage';
import SignUpPage from './features/auth/SignUpPage';
import ProfilePage from './features/profile/ProfilePage';
import LobbyPage from './features/lobby/LobbyPage';

const LocalDraft = () => {
  const location = useLocation();
  const [mode, setMode] = useState<'standard' | 'freedom'>('standard');
  const [teamAName, setTeamAName] = useState('ORDER');
  const [teamBName, setTeamBName] = useState('CHAOS');
  
  // Check if we're returning from final teams with preserved state
  const preservedDraft = location.state?.preserveDraft ? location.state.draftState : null;
  
  return (
    <AudioProvider>
      <DraftProvider
        mode={mode}
        initialState={preservedDraft}
        teamAName={teamAName}
        teamBName={teamBName}
        teamAColor="#1abc9c"
        teamBColor="#ff6666"
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
    if (!draftId || !user) return;
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
  }, [draftId, navigate, user]);

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
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/local" element={<LocalDraft />} />
      <Route path="/draft/:draftId" element={<RealtimeDraft />} />
      <Route path="/lobby/:draftId" element={<LobbyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/final-teams" element={<FinalTeamsWrapper />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
