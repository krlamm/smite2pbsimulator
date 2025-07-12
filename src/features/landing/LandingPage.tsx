import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../auth/hooks/useUserProfile';
import { useFriends } from '../friends/hooks/useFriends';
import { FriendsList } from '../friends/components/FriendsList';
import { IncomingFriendRequests } from '../friends/components/IncomingFriendRequests';
import ProfileDropdown from '../layout/components/ProfileDropdown';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useUserProfile();
  const { incomingRequests, acceptFriendRequest, declineFriendRequest } = useFriends();

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
            1-Player Draft
          </button>
          <button
            onClick={() => navigate('/online')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded"
          >
            2-Player Draft
          </button>
        </div>
      </div>

      {user && (
        <div className="mt-8 w-full max-w-md">
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
