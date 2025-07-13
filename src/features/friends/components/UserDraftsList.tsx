import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDrafts } from '../hooks/useUserDrafts';
import { formatTimeAgo } from '../../../utils/timeUtils';

export const UserDraftsList: React.FC = () => {
  const { userDrafts, loading, error } = useUserDrafts();
  const navigate = useNavigate();

  if (loading) {
    return <p className="text-white">Loading your drafts...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (userDrafts.length === 0) {
    return null; // Don't show anything if there are no active drafts
  }

  return (
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-2xl text-gold mb-4">Your Active Drafts</h2>
      <ul className="bg-gray-900 p-4 rounded">
        {userDrafts.map((draft) => (
          <li key={draft.id} className="flex justify-between items-center p-2 border-b border-gray-700">
            <div>
              <span className="text-white">{draft.draftName}</span>
              <p className="text-gray-400 text-sm">{formatTimeAgo(draft.createdAt)}</p>
            </div>
            <button
              onClick={() => navigate(`/draft/${draft.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
            >
              Rejoin
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
