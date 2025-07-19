import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriendDrafts } from '../hooks/useFriendDrafts';
import { useFriends } from '../hooks/useFriends';
import { formatTimeAgo } from '../../../utils/timeUtils';

export const FriendDraftsList: React.FC = () => {
  const { friendDrafts, loading, error } = useFriendDrafts();
  const { friends } = useFriends();
  const navigate = useNavigate();

  if (loading) {
    return <p className="text-white">Loading friend lobbies...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (friendDrafts.length === 0) {
    return <p className="text-gray-400">No active lobbies from your friends.</p>;
  }

  const getHostName = (hostId: string) => {
    const host = friends.find(f => f.uid === hostId);
    return host ? host.displayName : 'A friend';
  };

  return (
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-2xl text-gold mb-4">Join a Friend's Lobby</h2>
      <ul className="bg-gray-900 p-4 rounded">
        {friendDrafts.map((draft) => (
          <li key={draft.id} className="flex justify-between items-center p-2 border-b border-gray-700">
            <div>
              <span className="text-white">{draft.draftName}</span>
              <p className="text-gray-400 text-sm">
                Hosted by {getHostName(draft.hostId)} - {formatTimeAgo(draft.createdAt)}
              </p>
            </div>
            <button
              onClick={() => navigate(`/lobby/${draft.id}`)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
