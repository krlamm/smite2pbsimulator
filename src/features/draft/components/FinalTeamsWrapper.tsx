import React from 'react';
import { useLocation } from 'react-router-dom';
import { DraftProvider } from '../context/DraftContext';
import FinalTeamsDisplay from './FinalTeamsDisplay';
import { Draft } from '../../../types';
import { AudioProvider } from '../../layout/context/AudioContext';

const FinalTeamsWrapper: React.FC = () => {
  const location = useLocation();
  const draft = location.state?.draft as Draft | null;

  return (
    <AudioProvider>
      <DraftProvider
        mode="standard"
        initialState={draft}
        teamAName={draft?.teamA?.name || 'ORDER'}
        teamBName={draft?.teamB?.name || 'CHAOS'}
        teamAColor="#1abc9c"
        teamBColor="#ff6666"
      >
        <FinalTeamsDisplay />
      </DraftProvider>
    </AudioProvider>
  );
};

export default FinalTeamsWrapper;
