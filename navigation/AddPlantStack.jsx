import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddPlantHardwareScreen from '../screens/AddPlantHardwareScreen';
import AddPlantDetailsScreen from '../screens/AddPlantDetailsScreen';
import { ThemeContext } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';


const Stack = createNativeStackNavigator();

export default function AddPlantStack() {
  const { theme } = useContext(ThemeContext);
  return (
    <Stack.Navigator screenOptions={{
      contentStyle: { backgroundColor: theme.background },
      headerStyle: { backgroundColor: theme.background },
      headerTintColor: theme.text,
      gestureEnabled: true,
    }}>
      <Stack.Screen
        name="AddPlantHardware"
        component={AddPlantHardwareScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="AddPlantDetails"
        component={AddPlantDetailsScreen}
        options={{ title: 'Plant Details' }}
      />
    </Stack.Navigator>
  );
}

