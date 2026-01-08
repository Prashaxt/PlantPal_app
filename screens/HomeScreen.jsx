import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { usePlants } from '../context/PlantContext';
import AppText from '../components/AppText';
import PlantSelection from '../components/PlantSelection';
import WelcomeCard from '../components/WelcomeCard';
import PlantHealthMetrics from '../components/PlantHealthMetrics';
import PreciousMomentsCard from '../components/PreciousMomentsCard';
import Aisays from '../components/Aisays';
import WaterNowCard from '../components/WaterNowCard';
import { defaults } from '../designToken';

export default function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const { plants, loading } = usePlants();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Loading plants...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlantSelection />

      {plants.length === 0 ? (
        <View style={styles.noPlantContainer}>
          <Text style={[styles.noPlantText, { color: theme.text }]}>No plant</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <WelcomeCard />
          <PlantHealthMetrics />
          <WaterNowCard />
          {/* <Aisays /> */}
          <PreciousMomentsCard />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: defaults.screenHorizontalPadding,
    paddingTop: '15%',
  },
  contentContainer: {
    paddingBottom: '20%',
  },
  noPlantContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPlantText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
