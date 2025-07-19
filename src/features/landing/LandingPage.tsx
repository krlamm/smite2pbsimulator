import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../auth/hooks/useUserProfile';
import { useFriends } from '../friends/hooks/useFriends';
import { FriendsList } from '../friends/components/FriendsList';
import { IncomingFriendRequests } from '../friends/components/IncomingFriendRequests';
import { UserDraftsList } from '../friends/components/UserDraftsList';
import { FriendDraftsList } from '../friends/components/FriendDraftsList';
import ProfileDropdown from '../layout/components/ProfileDropdown';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { gods } from '../../constants/gods';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useUserProfile();
  const { incomingRequests, acceptFriendRequest, declineFriendRequest } = useFriends();

  const handleCreateOnlineDraft = async () => {
    if (!user || !userProfile) {
      alert('You must be logged in and have a profile to create an online draft.');
      return;
    }
    if (!userProfile.displayName) {
      alert('Please set a display name in your profile before creating a draft.');
      navigate('/profile');
      return;
    }

    const draftName = prompt("Enter a name for your draft lobby:", `${userProfile.displayName}'s Draft`);
    if (!draftName) return; // User cancelled the prompt

    try {
      const newDraft = {
        draftName: draftName,
        status: 'lobby', // 'lobby', 'banning', 'picking', 'complete'
        pickOrder: [], // Will be populated when the draft starts
        currentPickIndex: 0,
        teamA: {
          name: 'Team A',
          captain: null, // uid of the captain
          players: {} // { uid: { displayName, pick, hasPicked } }
        },
        teamB: {
          name: 'Team B',
          captain: null,
          players: {}
        },
        bans: { A: [], B: [] },
        picks: { A: [], B: [] }, // Still useful for a quick overview
        availableGods: gods.map(g => g.name),
        createdAt: serverTimestamp(),
        hostId: user.uid
      };
      const docRef = await addDoc(collection(db, 'drafts'), newDraft);
      navigate(`/lobby/${docRef.id}`);
    } catch (e) {
      console.error('Error creating online draft: ', e);
      alert('Failed to create online draft. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-4">
      <div className="absolute top-4 right-4">
        {user && userProfile ? (
          <ProfileDropdown user={user} userProfile={userProfile} />
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-[2px] text-gold mb-4 text-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          SMITE 2 PICK/BAN SIMULATOR
        </h1>
        <div className="text-chaos text-2xl text-shadow-border-glow mb-8">
          BETA - NOT FINAL
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/local')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded"
          >
            Local Draft
          </button>
          <button
            onClick={handleCreateOnlineDraft}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded"
          >
            Create Online Draft
          </button>
        </div>
      </div>

      {user && (
        <div className="mt-8 w-full max-w-md">
          <FriendDraftsList />
          <IncomingFriendRequests
            requests={incomingRequests}
            acceptFriendRequest={acceptFriendRequest}
            declineFriendRequest={declineFriendRequest}
          />
          <FriendsList />
        </div>
      )}
    </div>
  );
};

export default LandingPage;
