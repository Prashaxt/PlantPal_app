import React, { useContext } from 'react';
import { Text } from 'react-native';
import { FontContext } from '../context/FontContext';
import { defaults } from '../designToken';
import { ThemeContext } from '../context/ThemeContext';

export default function AppText({ style, children, ...props }) {
  const { fontsLoaded } = useContext(FontContext);

  if (!fontsLoaded) {
    return null;
  }

   const { theme } = useContext(ThemeContext);

  return (
    <Text style={[{ fontFamily: defaults.fontFamily },{color: theme.text}, style]} {...props}>
      {children}
    </Text>
  );
}
