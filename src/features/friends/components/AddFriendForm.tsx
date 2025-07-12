import React, { useState } from 'react';

interface AddFriendFormProps {
  sendFriendRequest: (playerId: string) => Promise<void>;
  error: string | null;
}

export const AddFriendForm: React.FC<AddFriendFormProps> = ({ sendFriendRequest, error }) => {
  const [playerId, setPlayerId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerId.trim()) {
      sendFriendRequest(playerId.trim());
      setPlayerId('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4">
      <input
        type="text"
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
        placeholder="Enter friend's Player ID to send request"
        className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        required
      />
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Send Friend Request
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};
