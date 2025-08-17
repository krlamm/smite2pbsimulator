import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../auth/hooks/useUserProfile';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FriendsList } from '../friends/components/FriendsList';
import { FriendDraftsList } from '../friends/components/FriendDraftsList';
import { useTheme } from '../layout/context/ThemeContext';
import { maskEmail } from '../../utils/stringUtils';
import { doc, updateDoc } from 'firebase/firestore';

const ProfilePage = () => {
  const { user, userProfile, loading } = useUserProfile();
  const { theme } = useTheme();
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

  const themeClasses = {
    light: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      cardBg: 'bg-white/80',
      cardBorder: 'border-gray-200',
      headerText: 'text-blue-600',
      subHeaderText: 'text-gray-600',
      backgroundImage: 'url(/AI_Jing_Wei_Light_Theme.png)',
    },
    dark: {
      bg: 'bg-[#121a23]',
      text: 'text-white',
      cardBg: 'bg-[#1a2430]/70',
      cardBorder: 'border-gray-700',
      headerText: 'text-yellow-400',
      subHeaderText: 'text-gray-400',
      backgroundImage: 'url(/AI_Jing_Wei_Dark_Theme.png)',
    },
  };

  const currentTheme = themeClasses[theme];

  if (loading) {
    return <div className={`flex flex-col items-center justify-center min-h-screen ${currentTheme.bg} ${currentTheme.text}`}>Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${currentTheme.bg} ${currentTheme.text}`}>
        <p>You must be logged in to view this page.</p>
        <button onClick={() => navigate('/login')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Login
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${currentTheme.bg} min-h-screen ${currentTheme.text} font-sans`}
      style={{ 
        backgroundImage: currentTheme.backgroundImage,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            &larr; Back to Home
          </button>
          <h1 className={`text-4xl font-bold ${currentTheme.headerText}`}>Your Profile</h1>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Logout
          </button>
        </div>
        
        <div className={`${currentTheme.cardBg} p-6 rounded-lg border ${currentTheme.cardBorder} mb-8`}>
          <h2 className="text-2xl font-bold mb-4">User Information</h2>
          <div className="space-y-4">
            <p><span className="font-bold">Email:</span> {maskEmail(user.email || '')}</p>
            <div>
              <span className="font-bold">Display Name:</span>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'} border`}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Friends Management */}
          <div>
            <h2 className={`text-3xl font-bold ${currentTheme.headerText} mb-4`}>Friends Management</h2>
            <div className={`${currentTheme.cardBg} p-6 rounded-lg border ${currentTheme.cardBorder}`}>
              <FriendsList />
            </div>
          </div>

          {/* Draft Activities */}
          <div>
            <h2 className={`text-3xl font-bold ${currentTheme.headerText} mb-4`}>Draft Activities</h2>
            <div className={`${currentTheme.cardBg} p-6 rounded-lg border ${currentTheme.cardBorder}`}>
              <h3 className="text-xl font-bold mb-4">Join Friend's Draft</h3>
              <FriendDraftsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
