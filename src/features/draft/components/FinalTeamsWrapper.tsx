import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DraftProvider, useDraftContext } from '../context/DraftContext';
import FinalTeamsDisplay from './FinalTeamsDisplay';
import { Draft } from '../../../types';
import { AudioProvider } from '../../layout/context/AudioContext';
import usePresence from '../hooks/usePresence';
import { useAuth } from '../../auth/hooks/useAuth'; // Assuming you have a useAuth hook

const FinalTeamsContent: React.FC = () => {
  const { draftId } = useDraftContext();
  const { user } = useAuth();
  const { setViewingFinalTeams } = usePresence(user?.uid, draftId);

  useEffect(() => {
    setViewingFinalTeams();
  }, [setViewingFinalTeams]);

  return <FinalTeamsDisplay />;
}

const FinalTeamsWrapper: React.FC = () => {
  const location = useLocation();
  const draft = location.state?.draft as Draft | null;
  const { user } = useAuth();

  return (
    <AudioProvider>
      <DraftProvider
        mode="standard"
        initialState={draft}
        draftId={draft?.id}
        currentUser={user}
        teamAName={draft?.teamA?.name || 'ORDER'}
        teamBName={draft?.teamB?.name || 'CHAOS'}
        teamAColor="#1abc9c"
        teamBColor="#ff6666"
      >
        <FinalTeamsContent />
      </DraftProvider>
    </AudioProvider>
  );
};

export default FinalTeamsWrapper;
