import React from 'react';
import { FriendRequest } from '../../../types';

interface IncomingFriendRequestsProps {
  requests: FriendRequest[];
  acceptFriendRequest: (requestId: string, senderId: string) => void;
  declineFriendRequest: (requestId: string) => void;
}

export const IncomingFriendRequests: React.FC<IncomingFriendRequestsProps> = ({
  requests,
  acceptFriendRequest,
  declineFriendRequest,
}) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-2xl text-gold mb-4">Incoming Requests</h2>
      <ul className="bg-gray-900 p-4 rounded">
        {requests.map((req) => (
          <li key={req.id} className="flex justify-between items-center p-2 border-b border-gray-700">
            <span className="text-white">{req.senderEmail}</span>
            <div className="flex gap-2">
              <button
                onClick={() => acceptFriendRequest(req.id, req.senderId)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => declineFriendRequest(req.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
