import { useState } from 'react';
import './index.css';
import { DraftProvider } from './features/draft/context/DraftContext';
import { AudioProvider } from './features/layout/context/AudioContext';
import MainLayout from './features/layout/components/MainLayout';

function App() {
  const [mode, setMode] = useState<'standard' | 'freedom'>('standard');
  const [teamAName, setTeamAName] = useState('ORDER');
  const [teamBName, setTeamBName] = useState('CHAOS');
  const [teamAColor, setTeamAColor] = useState('#1abc9c');
  const [teamBColor, setTeamBColor] = useState('#ff6666');

  return (
    <AudioProvider>
      <DraftProvider mode={mode}>
        <MainLayout
          teamAName={teamAName}
          onTeamANameChange={setTeamAName}
          teamBName={teamBName}
          onTeamBNameChange={setTeamBName}
          teamAColor={teamAColor}
          teamBColor={teamBColor}
          mode={mode}
          setMode={setMode}
        />
      </DraftProvider>
    </AudioProvider>
  );
}

export default App;