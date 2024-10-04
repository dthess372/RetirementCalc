import React from 'react';
import { auth } from './firebase';

function SignOut() {
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button onClick={handleSignOut}>Sign Out</button>
  );
}

export default SignOut;
