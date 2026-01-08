import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GardenScreen from '../screens/GardenScreen';
import AddPlantStack from './AddPlantStack';

const Stack = createNativeStackNavigator();

export default function GardenStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: true,
      }}>
      <Stack.Screen
        name="GardenHome"
        component={GardenScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddPlant"
        component={AddPlantStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
