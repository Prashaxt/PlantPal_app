// import React, { createContext, useState } from 'react';
// import { lightTheme, darkTheme } from '../designToken';


// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [isDark, setIsDark] = useState(false);           // default to light theme
//   const theme = isDark ? darkTheme : lightTheme;



//   const toggleTheme = () => setIsDark(prev => !prev);    // function to switch theme


//   return (
//     <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

//---------------------------------------------------------------------------------------------------------------------------------
import React, { createContext, useState, useContext } from 'react';
import { lightTheme, darkTheme } from '../designToken';
import { useAuth } from './AuthContext';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user, updateSetting } = useAuth();
  const [isDark, setIsDark] = useState(false); // default light theme
  const theme = isDark ? darkTheme : lightTheme;

  // Toggle theme and update Firestore
  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;

      // Only update Firestore if user is logged in
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

