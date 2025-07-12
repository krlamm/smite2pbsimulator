import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../auth/hooks/useUserProfile';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FriendsList } from '../friends/components/FriendsList';
import { doc, updateDoc } from 'firebase/firestore';

const ProfilePage = () => {
  const { user, userProfile, loading } = useUserProfile();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile?.displayName) {
      setDisplayName(userProfile.displayName);
    }
  }, [userProfile]);

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  const handleSaveDisplayName = async () => {
    if (!user || !displayName.trim()) {
      setError("Display name cannot be empty.");
      return;
    }
    setError(null);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update display name.");
    }
  };

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
        <p>You must be logged in to view this page.</p>
        <button onClick={() => navigate('/login')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-800 p-4 text-white">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            &larr; Back to Home
          </button>
          <h1 className="text-4xl text-gold">Your Profile</h1>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Logout
          </button>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-2xl mb-4">User Information</h2>
          <div className="space-y-4">
            <p><span className="font-bold">Email:</span> {user.email}</p>
            <div>
              <span className="font-bold">Display Name:</span>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600"
                  />
                  <button onClick={handleSaveDisplayName} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Save</button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span>{userProfile?.displayName || 'Not set'}</span>
                  <button onClick={() => setIsEditing(true)} className="text-sm text-blue-400 hover:underline">Edit</button>
                </div>
              )}
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <FriendsList />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
