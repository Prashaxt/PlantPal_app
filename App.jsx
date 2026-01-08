import 'react-native-gesture-handler';
import React, { useContext, useEffect } from 'react';
import { FontProvider } from './context/FontContext';
import { View, StyleSheet, Text } from 'react-native';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import { ConnectionProvider } from './context/ConnectionContext';
import HomeScreen from './screens/HomeScreen';
import { StatusBar, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { PlantProvider } from './context/PlantContext';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MeasurementUnitProvider } from './context/MeasurementUnitContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GardenStack from './navigation/GardenStack';
import { UserDataProvider } from './context/UserDataContext';
import ProfileStack from './navigation/ProfileStack';
import ForgetPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AuthenticatedApp() {
  const { theme, isDark } = useContext(ThemeContext);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <Tab.Navigator
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: theme.background,
            height: 90,
            borderTopWidth: 0,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => {
              let iconSource;
              if (isDark) {
                iconSource = focused
                  ? require('./assets/homeActiveDark1.png')
                  : require('./assets/homeInactiveDark1.png');
              } else {
                iconSource = focused
                  ? require('./assets/homeActiveLight1.png')
                  : require('./assets/homeInactiveLight1.png');
              }
              return (
                <Image
                  source={iconSource}
                  style={styles.navIcons}
                  resizeMode="contain"
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="Garden"
          component={GardenStack}
          options={{
            tabBarIcon: ({ focused }) => {
              let iconSource;
              if (isDark) {
                iconSource = focused
                  ? require('./assets/gardenActiveDark.png')
                  : require('./assets/gardenInactiveDark.png');
              } else {
                iconSource = focused
                  ? require('./assets/gardenActiveLight.png')
                  : require('./assets/gardenInactiveLight.png');
              }
              return (
                <Image
                  source={iconSource}
                  style={styles.navIcons}
                  resizeMode="contain"
                />
              );
            },
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarIcon: ({ focused }) => {
              let iconSource;
              if (isDark) {
                iconSource = focused
                  ? require('./assets/profileActiveDark.png')
                  : require('./assets/profileInactiveDark.png');
              } else {
                iconSource = focused
                  ? require('./assets/profileActiveLight.png')
                  : require('./assets/profileInactiveLight.png');
              }
              return (
                <Image
                  source={iconSource}
                  style={styles.navIcons}
                  resizeMode="contain"
                />
              );
            },
          }}
        />
      </Tab.Navigator>
    </>
  );
}

// Root navigator that handles auth state
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (user && !user.emailVerified) {
    return <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </Stack.Navigator>;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={AuthenticatedApp} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <FontProvider>
      <AuthProvider>
        <NavigationContainer>
          <ThemeProvider>
            <UserDataProvider>
              <PlantProvider>
                <ConnectionProvider>
                  <MeasurementUnitProvider>
                    <SafeAreaProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <BottomSheetModalProvider>
                          <RootNavigator />
                        </BottomSheetModalProvider>
                      </GestureHandlerRootView>
                    </SafeAreaProvider>
                  </MeasurementUnitProvider>
                </ConnectionProvider>
              </PlantProvider>
            </UserDataProvider>
          </ThemeProvider>
        </NavigationContainer>
      </AuthProvider>
    </FontProvider>
  );
}

const styles = StyleSheet.create({
  navIcons: {
    height: 23,
    width: 23,
  },
});
