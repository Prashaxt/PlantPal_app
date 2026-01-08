import React, { createContext, useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export const FontContext = createContext();

export const FontProvider = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          GilroyRegular: require('../assets/fonts/Gilroy-Regular.ttf'),
          GilroyMedium: require('../assets/fonts/Gilroy-Medium.ttf'),
          GilroySemiBold: require('../assets/fonts/Gilroy-SemiBold.ttf'),
          DegularSemiBold: require('../assets/fonts/Degular-SemiBold.otf'),
        });
      } catch (error) {
        console.warn('Error loading fonts:', error);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <FontContext.Provider value={{ fontsLoaded }}>
      {children}
    </FontContext.Provider>
  );
};
