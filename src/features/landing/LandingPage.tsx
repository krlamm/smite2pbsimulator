import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../layout/context/ThemeContext';
import { useUserProfile } from '../auth/hooks/useUserProfile';
import { FriendsList } from '../friends/components/FriendsList';
import { UserDraftsList } from '../friends/components/UserDraftsList';
import { FriendDraftsList } from '../friends/components/FriendDraftsList';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { gods } from '../../constants/gods';
import { FaUserFriends, FaPlus, FaSync, FaEye, FaRedo, FaPaperPlane, FaHistory, FaUser, FaUsers } from 'react-icons/fa';
import ProfileDropdown from '../layout/components/ProfileDropdown';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useUserProfile();
  const { theme } = useTheme();

  const themeClasses = {
    light: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      cardBg: 'bg-white',
      cardBorder: 'border-gray-200',
      buttonText: 'text-white',
      headerText: 'text-blue-600',
      subHeaderText: 'text-gray-600',
      footerBg: 'bg-gray-200',
      footerBorder: 'border-gray-300',
      backgroundImage: 'url(/AI_Jing_Wei_Light_Theme.png)',
    },
    dark: {
      bg: 'bg-[#121a23]',
      text: 'text-white',
      cardBg: 'bg-[#1a2430]',
      cardBorder: 'border-gray-700',
      buttonText: 'text-white',
      headerText: 'text-yellow-400',
      subHeaderText: 'text-gray-400',
      footerBg: 'bg-[#1a2430]',
      footerBorder: 'border-gray-700',
      backgroundImage: 'url(/AI_Jing_Wei_Dark_Theme.png)',
    },
  };

  const currentTheme = themeClasses[theme];

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
    if (!draftName) return;

    try {
      const newDraft = {
        draftName: draftName,
        status: 'lobby',
        pickOrder: [],
        currentPickIndex: 0,
        teamA: { name: 'Team A', captain: null, players: {} },
        teamB: { name: 'Team B', captain: null, players: {} },
        bans: { A: [], B: [] },
        picks: { A: [], B: [] },
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
    <div
      className={`${currentTheme.bg} min-h-screen ${currentTheme.text} font-sans`}
      style={{ backgroundImage: currentTheme.backgroundImage }}
    >
      <div className="container mx-auto px-4 py-8 relative">
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
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold ${currentTheme.headerText} tracking-wider`}>SMITE 2 PICK/BAN SIMULATOR</h1>
          <p className="text-red-500 font-semibold mt-2">BETA - NOT FINAL</p>
          <p className={`${currentTheme.subHeaderText} mt-4 max-w-2xl mx-auto`}>
            Practice your draft strategies for SMITE 2. Create custom drafts, invite friends, and perfect your team compositions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Single Player Draft */}
          <div className={`${currentTheme.cardBg} p-6 rounded-lg border ${currentTheme.cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Single Player Draft</h2>
              <span className="text-xs font-semibold bg-gray-600 px-2 py-1 rounded">PRACTICE</span>
            </div>
            <p className={`${currentTheme.subHeaderText} mb-6`}>Practice draft strategies on your own. Control both teams and experiment with different picks and bans.</p>
            <button
              onClick={() => navigate('/local')}
              className={`w-full bg-blue-600 hover:bg-blue-700 ${currentTheme.buttonText} font-bold py-3 px-4 rounded-lg flex items-center justify-center`}
            >
              <FaUser className="mr-2" /> 1-Player Draft
            </button>
          </div>

          {/* Multiplayer Draft */}
          <div className={`${currentTheme.cardBg} p-6 rounded-lg border ${currentTheme.cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Multiplayer Draft</h2>
              <span className="text-xs font-semibold bg-gray-600 px-2 py-1 rounded">WITH FRIENDS</span>
            </div>
            <p className={`${currentTheme.subHeaderText} mb-6`}>Create a draft lobby and invite friends to join. Perfect for team practice or competitive preparation.</p>
            <button
              onClick={handleCreateOnlineDraft}
              className={`w-full bg-green-600 hover:bg-green-700 ${currentTheme.buttonText} font-bold py-3 px-4 rounded-lg flex items-center justify-center`}
            >
              <FaUsers className="mr-2" /> 2-Player Draft
            </button>
          </div>
        </div>

        {/* Active Drafts */}
        {/* <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-yellow-400">Your Active Drafts</h2>
            <button className="text-gray-400 hover:text-white flex items-center">
              <FaSync className="mr-2" /> Refresh
            </button>
          </div>
          <div className="bg-[#1a2430] p-6 rounded-lg border border-gray-700">
            <UserDraftsList />
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Join a Friend's Draft */}
          <div>
            <h2 className={`text-3xl font-bold ${currentTheme.headerText} mb-4`}>Join a Friend's Draft</h2>
            <div className={`${currentTheme.cardBg} p-6 rounded-lg border ${currentTheme.cardBorder}`}>
              <FriendDraftsList />
            </div>
          </div>

          {/* Friends List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-3xl font-bold ${currentTheme.headerText}`}>Friends List</h2>
              <button className={`${currentTheme.subHeaderText} hover:text-white flex items-center`}>
                <FaPlus className="mr-2" /> Add
              </button>
            </div>
            <div className={`${currentTheme.cardBg} p-6 rounded-lg border ${currentTheme.cardBorder}`}>
              <FriendsList />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {/* <div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-4">Recent Activity</h2>
          <div className="bg-[#1a2430] p-6 rounded-lg border border-gray-700 text-center text-gray-500">
            <FaHistory className="mx-auto text-4xl mb-4" />
            <p>No recent activity to display</p>
            <p className="text-sm">Your draft history will appear here</p>
          </div>
        </div> */}

      </div>

      <footer className={`${currentTheme.footerBg} border-t ${currentTheme.footerBorder} mt-12 py-6`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h3 className={`font-bold ${currentTheme.headerText}`}>SMITE 2 DRAFT SIMULATOR</h3>
            <p className="text-xs text-gray-500">&copy; 2023 All Rights Reserved</p>
          </div>
          {/* <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white">Support</a>
            <a href="#" className="text-gray-400 hover:text-white">Contact</a>
          </div> */}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
