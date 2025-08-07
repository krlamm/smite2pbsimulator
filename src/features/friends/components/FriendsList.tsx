import React from 'react';
import { UserProfile, FriendRequest } from '../../../types';
import { useFriends } from '../hooks/useFriends';
import { maskEmail } from '../../../utils/stringUtils';
import { AddFriendForm } from './AddFriendForm';
import { IncomingFriendRequests } from './IncomingFriendRequests';

export const FriendsList: React.FC = () => {
  const {
    friends,
    incomingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    loading,
    error,
  } = useFriends();

  if (loading) {
    return <p className="text-white">Loading friends...</p>;
  }

  return (
    <div className="mt-6 w-full max-w-md">
      <AddFriendForm sendFriendRequest={sendFriendRequest} error={error} />
      <IncomingFriendRequests
        requests={incomingRequests}
        acceptFriendRequest={acceptFriendRequest}
        declineFriendRequest={declineFriendRequest}
      />
      <h2 className="text-2xl text-gold mb-4 mt-6">Friends List</h2>
      {friends.length === 0 ? (
        <p className="text-gray-400">You have no friends yet. Send a request to add one!</p>
      ) : (
        <ul className="bg-gray-900 p-4 rounded">
          {friends.map((friend) => (
            <li key={friend.id} className="flex justify-between items-center p-2 border-b border-gray-700">
              <span className="text-white">{friend.displayName || maskEmail(friend.email)}</span>
              <button
                onClick={() => removeFriend(friend.uid)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
