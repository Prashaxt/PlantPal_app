import { lightTheme, darkTheme, defaults } from '../designToken';
import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import AppText from '../components/AppText';
import { ThemeContext } from '../context/ThemeContext';

const WelcomeCard = () => {
    const { theme } = useContext(ThemeContext);
  return (
    <View>
      <AppText style={[styles.welcome, { color: theme.text }]}>Welcome Back, User!</AppText>
    </View>
  )
}

export default WelcomeCard

const styles = StyleSheet.create({
    welcome: {
        fontFamily: 'DegularSemiBold',
        fontSize: 26,
        marginBottom: 24,
        height: '28',
    },
})