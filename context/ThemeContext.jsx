import React, { createContext, useState, useContext, useEffect } from 'react';
import { lightTheme, darkTheme } from '../designToken';
import { useAuth } from './AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { fsdb } from '../firebaseConfig';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user, updateSetting } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;


  // Fetch theme from Firestore on mount or user change
  useEffect(() => {
    if (user) {
      const fetchTheme = async () => {
        try {
          const userDocRef = doc(fsdb, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setIsDark(data.theme === 'dark'); 
          }
        } catch (error) {
          console.error('Error fetching theme:', error);
        }
      };

      fetchTheme();
    } else {
      setIsDark(false); 
    }
  }, [user]);

  // Toggle theme and update Firestore
  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;

      if (user) {
        updateSetting('theme', newValue ? 'dark' : 'light');
      }

      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

