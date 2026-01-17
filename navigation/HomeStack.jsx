import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddPlantStack from './AddPlantStack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: true,
      }}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
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
