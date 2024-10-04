// Profile.js
import React, { useState, useEffect } from 'react';
import { auth, firestore } from './firebase';

function Profile() {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        firestore.collection('users').doc(user.uid).get()
          .then(doc => {
            if (doc.exists) {
              setDisplayName(doc.data().displayName);
            }
          })
          .catch(error => console.error('Error getting user profile:', error));
      }
    });

    return unsubscribe;
  }, []);

  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await user.updateProfile({ displayName });
        await firestore.collection('users').doc(user.uid).set({ displayName }, { merge: true });
        console.log('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  return (
    <div>
      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      <button onClick={handleUpdateProfile}>Update Profile</button>
    </div>
  );
}

export default Profile;
