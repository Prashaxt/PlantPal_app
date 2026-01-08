// UserDataContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext'; // we use your existing AuthContext
import { fsdb } from '../firebaseConfig';

const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const { user } = useAuth(); // Firebase Auth user
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userRef = doc(fsdb, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData({ id: userSnap.id, ...userSnap.data() });
        } else {
          console.log('No user document found in Firestore!');
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching Firestore user data:', error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <UserDataContext.Provider value={{ userData, setUserData, loading }}>
      {children}
    </UserDataContext.Provider>
  );
};

// Hook to use the context
export const useUserData = () => useContext(UserDataContext);
