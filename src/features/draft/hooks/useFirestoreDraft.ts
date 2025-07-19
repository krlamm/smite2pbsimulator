import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Character, TeamState, Draft } from '../../../types';
import { gods } from '../../../constants/gods';
import { useAudioContext } from '../../layout/context/AudioContext';

interface UseDraftProps {
  initialState: Draft | null;
  draftId?: string;
  currentUser?: any;
}

export const useFirestoreDraft = ({ initialState, draftId, currentUser }: UseDraftProps) => {
  const [characters] = useState<Character[]>(gods);
  const { playAudio } = useAudioContext();
  const prevInitialStateRef = useRef(initialState);

  const [phase, setPhase] = useState<'lobby' | 'banning' | 'picking' | 'complete'>(initialState?.status || 'lobby');
  const [bans, setBans] = useState<TeamState>({ A: [], B: [] });
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);

  useEffect(() => {
    if (!initialState) return;

    setPhase(initialState.status);

    const teamABans = initialState.bans?.A || [];
    const teamBBans = initialState.bans?.B || [];
    const mapNamesToCharacters = (names: string[]): (Character | null)[] => {
      return names.map(name => gods.find(g => g.name === name) || null);
    };
    setBans({ A: mapNamesToCharacters(teamABans), B: mapNamesToCharacters(teamBBans) });

    const { pickOrder, currentPickIndex } = initialState;
    if ((initialState.status === 'banning' || initialState.status === 'picking') && currentPickIndex < pickOrder.length) {
      const currentPlayerTurn = pickOrder[currentPickIndex];
      setActivePlayer(currentPlayerTurn);

      const isMyDesignatedTurn = currentUser?.uid === currentPlayerTurn.uid;
      const currentTeamKey = currentPlayerTurn.team;
      const captainId = initialState[currentTeamKey].captain;
      const iAmCaptainOfCurrentTeam = currentUser?.uid === captainId;
      const isPlayerInTeam = initialState[currentTeamKey].players[currentPlayerTurn.uid];

      setIsMyTurn(isMyDesignatedTurn || (iAmCaptainOfCurrentTeam && !isPlayerInTeam));
    } else {
      setIsMyTurn(false);
      setActivePlayer(null);
    }

    prevInitialStateRef.current = initialState;
  }, [initialState, currentUser]);

  const handleCharacterSelect = async (character: Character) => {
    if (!isMyTurn || !draftId || !activePlayer) return;

    const allBans = [...(initialState.bans?.A || []), ...(initialState.bans?.B || [])];
    const allPicks = Object.values(initialState.picks || {}).map(p => p.character);
    if (allBans.includes(character.name) || allPicks.includes(character.name)) {
      return;
    }
    
    playAudio(character.name);

    const draftDocRef = doc(db, 'drafts', draftId);
    const { status, pickOrder, currentPickIndex, bans } = initialState;
    const currentPlayerTurn = pickOrder[currentPickIndex];
    
    const updates: any = {};

    if (status === 'banning') {
      const teamKey = currentPlayerTurn.team.slice(-1);
      const currentBans = bans[teamKey] || [];
      updates[`bans.${teamKey}`] = [...currentBans, character.name];
    } else if (status === 'picking') {
      updates[`picks.${currentPickIndex}`] = { uid: currentPlayerTurn.uid, character: character.name };
    }

    updates.currentPickIndex = currentPickIndex + 1;

    const nextAction = pickOrder[currentPickIndex + 1];
    if (status === 'banning' && nextAction?.type === 'pick') {
      updates.status = 'picking';
    } else if (status === 'picking' && currentPickIndex + 1 >= pickOrder.length) {
      updates.status = 'complete';
    }

    await updateDoc(draftDocRef, updates);
  };

  // ... (rest of the hook is the same)
  const handleReset = async () => {
    if (!draftId) return;
    const draftDocRef = doc(db, 'drafts', draftId);
    await updateDoc(draftDocRef, {
      status: 'lobby',
      pickOrder: [],
      currentPickIndex: 0,
      teamA: { name: 'Team A', captain: null, players: {} },
      teamB: { name: 'Team B', captain: null, players: {} },
      bans: { A: [], B: [] },
      picks: {},
      availableGods: gods.map(g => g.name),
      lastActionTimestamp: null,
    });
  };

  const handleLeave = async () => {
    if (!draftId || !currentUser) return;
    const draftDocRef = doc(db, 'drafts', draftId);
    const draftSnap = await getDoc(draftDocRef);
    if (!draftSnap.exists()) return;
    const draftData = draftSnap.data();

    const updates: any = {};
    if (draftData.teamA.players[currentUser.uid]) {
      delete draftData.teamA.players[currentUser.uid];
      updates['teamA.players'] = draftData.teamA.players;
      if (draftData.teamA.captain === currentUser.uid) {
        updates['teamA.captain'] = null;
      }
    } else if (draftData.teamB.players[currentUser.uid]) {
      delete draftData.teamB.players[currentUser.uid];
      updates['teamB.players'] = draftData.teamB.players;
       if (draftData.teamB.captain === currentUser.uid) {
        updates['teamB.captain'] = null;
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(draftDocRef, updates);
    }
  };

  return {
    mode: 'standard',
    characters,
    phase,
    picks: { A: [], B: [] }, // Simplified, as rendering is handled elsewhere
    bans,
    isMyTurn,
    handleCharacterSelect,
    handleReset,
    handleLeave,
    handleDragStart: () => {},
    handleDragOver: () => {},
    handleDragLeave: () => {},
    handleDrop: () => {},
    handleStandardDrop: () => {},
    handleUndo: () => {},
    handleClear: () => {},
  };
};
