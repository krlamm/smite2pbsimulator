import React, { useState } from 'react';
import { useFriends } from '../hooks/useFriends';
import { maskEmail } from '../../../utils/stringUtils';
import { AddFriendForm } from './AddFriendForm';
import { IncomingFriendRequests } from './IncomingFriendRequests';
import ListContainer from '../../../components/ui/ListContainer';
import ListItem from '../../../components/ui/ListItem';
import Button from '../../../components/ui/Button';

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6 w-full max-w-md">
      <AddFriendForm sendFriendRequest={sendFriendRequest} error={error} />
      <IncomingFriendRequests
        requests={incomingRequests}
        acceptFriendRequest={acceptFriendRequest}
        declineFriendRequest={declineFriendRequest}
      />
      
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-2xl text-gold mb-4 mt-6 w-full text-left flex justify-between items-center hover:text-yellow-300 transition-colors"
      >
        <span>Friends List</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="bg-gray-900 p-4 rounded">
          <ListContainer
            loading={loading}
            error={error}
            emptyMessage="You have no friends yet. Send a request to add one!"
          >
            {friends.map((friend) => (
              <ListItem
                key={friend.id}
                actions={
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeFriend(friend.uid)}
                  >
                    Remove
                  </Button>
                }
              >
                <span>{friend.displayName || maskEmail(friend.email)}</span>
              </ListItem>
            ))}
          </ListContainer>
        </div>
      )}
    </div>
  );
};
