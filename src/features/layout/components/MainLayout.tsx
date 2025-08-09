import React, { useEffect } from 'react';
import Header from './Header';
import DraftControls from '../../draft/components/DraftControls';
import CharacterGrid from '../../draft/components/CharacterGrid';
import BanArea from '../../draft/components/BanArea';
import EsportsTeamDisplay from '../../teams/components/EsportsTeamDisplay';
import LocalTeamDisplay from '../../teams/components/LocalTeamDisplay';
import TradeNotifications from '../../teams/components/TradeNotifications';
import { useDraftContext } from '../../draft/context/DraftContext';
import { useAudioContext } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

interface MainLayoutProps {
  teamAName: string;
  onTeamANameChange: (name: string) => void;
  teamBName: string;
  onTeamBNameChange: (name: string) => void;
  teamAColor: string;
  teamBColor: string;
  mode: 'standard' | 'freedom';
  setMode: (mode: 'standard' | 'freedom') => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  teamAName,
  onTeamANameChange,
  teamBName,
  onTeamBNameChange,
  teamAColor,
  teamBColor,
  mode,
  setMode,
}) => {
  const { theme } = useTheme();
  const { bans, picks, draftId } = useDraftContext();
  const { unlockAudio } = useAudioContext();
  const isOnlineMode = !!draftId;

  useEffect(() => {
    const handleFirstClick = () => {
      unlockAudio();
      window.removeEventListener('click', handleFirstClick);
    };

    window.addEventListener('click', handleFirstClick);

    return () => {
      window.removeEventListener('click', handleFirstClick);
    };
  }, [unlockAudio]);

  return (
    <div className={`${theme} font-sans overflow-hidden flex flex-col h-screen ${mode}`}>
      <Header />
      <TradeNotifications />
      <DraftControls
        teamAName={teamAName}
        onTeamANameChange={onTeamANameChange}
        teamBName={teamBName}
        onTeamBNameChange={onTeamBNameChange}
        teamAColor={teamAColor}
        teamBColor={teamBColor}
        mode={mode}
        setMode={setMode}
      />
      <div className="flex overflow-y-auto px-4 gap-4 h-full w-full relative">
        {isOnlineMode ? (
          <EsportsTeamDisplay team="A" />
        ) : (
          <LocalTeamDisplay team="A" picks={picks.A} />
        )}
        <div className="flex-1 flex flex-col">
          <BanArea bansA={bans.A} bansB={bans.B} />
          <div className="flex-1 bg-black/30 rounded-md overflow-y-auto flex flex-col border-2 border-light-blue shadow-[0_0_10px_rgba(0,204,255,0.3)] p-2.5 lg:p-4">
            <CharacterGrid />
          </div>
        </div>
        {isOnlineMode ? (
          <EsportsTeamDisplay team="B" />
        ) : (
          <LocalTeamDisplay team="B" picks={picks.B} />
        )}
      </div>
    </div>
  );
};

export default MainLayout;
