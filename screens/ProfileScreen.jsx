import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../components/AppText';
import { ThemeContext } from '../context/ThemeContext';
import { defaults } from '../designToken';
import UserProfileCard from '../components/UserProfileCard';
import SettingsCard from '../components/SettingsCard';
import ProfileHeaderCard from '../components/ProfileHeaderCard';



export default function ProfileScreen() {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.profileScreenBackground }]}>
      <UserProfileCard />
      <ProfileHeaderCard />
      <SettingsCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: defaults.screenHorizontalPadding,
    paddingTop: '15%',
  },
});
