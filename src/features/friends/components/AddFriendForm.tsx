import React, { useState } from 'react';

interface AddFriendFormProps {
  addFriend: (email: string) => Promise<void>;
  error: string | null;
}

export const AddFriendForm: React.FC<AddFriendFormProps> = ({ addFriend, error }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      addFriend(email.trim());
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter friend's email"
        className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        required
      />
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Add Friend
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};
