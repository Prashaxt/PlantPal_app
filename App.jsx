import 'react-native-gesture-handler';
import React, { useContext, useEffect, useState } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { FontProvider } from './context/FontContext';
import { View, StyleSheet, Text } from 'react-native';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import { ConnectionProvider } from './context/ConnectionContext';
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
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeStack from './navigation/HomeStack';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
SplashScreen.preventAutoHideAsync();


function AuthenticatedApp() {
  const { theme, isDark } = useContext(ThemeContext);


  //NavBar theme settings
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(theme.background);

    NavigationBar.setButtonStyleAsync(
      isDark ? 'light' : 'dark' // icons
    );
  }, [isDark, theme.background]);

  
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
          component={HomeStack}
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
function RootNavigator({ isFirstLaunch }) {
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
      {isFirstLaunch && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
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

  const [appIsReady, setAppIsReady] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);


  //SplashScreen loading
  useEffect(() => {
    async function prepare() {
      try {

        // Wait for Firebase auth to initialize
        await new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve();
          });
        });

        // Check for first launch
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        setIsFirstLaunch(hasLaunched === null);

        //Fonts loading
        await Font.loadAsync({
          'GilroyRegular': require('./assets/fonts/Gilroy-Regular.ttf'),
          'GilroyMedium': require('./assets/fonts/Gilroy-Medium.ttf'),
          'GilroySemiBold': require('./assets/fonts/Gilroy-SemiBold.ttf'),
          'Degular-SemiBold': require('./assets/fonts/Degular-SemiBold.otf'),
        });

        //Tab icons loading
        await Promise.all([
          Asset.fromModule(require('./assets/homeActiveDark1.png')).downloadAsync(),
          Asset.fromModule(require('./assets/homeInactiveDark1.png')).downloadAsync(),
          Asset.fromModule(require('./assets/homeActiveLight1.png')).downloadAsync(),
          Asset.fromModule(require('./assets/homeInactiveLight1.png')).downloadAsync(),

          Asset.fromModule(require('./assets/gardenActiveDark.png')).downloadAsync(),
          Asset.fromModule(require('./assets/gardenInactiveDark.png')).downloadAsync(),
          Asset.fromModule(require('./assets/gardenActiveLight.png')).downloadAsync(),
          Asset.fromModule(require('./assets/gardenInactiveLight.png')).downloadAsync(),

          Asset.fromModule(require('./assets/profileActiveDark.png')).downloadAsync(),
          Asset.fromModule(require('./assets/profileInactiveDark.png')).downloadAsync(),
          Asset.fromModule(require('./assets/profileActiveLight.png')).downloadAsync(),
          Asset.fromModule(require('./assets/profileInactiveLight.png')).downloadAsync(),
        ]);

        // Example delay (replace with real loading)
        // await new Promise(resolve => setTimeout(resolve, 2000));


      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Listen for changes to hasLaunched
  useEffect(() => {
    const checkLaunchStatus = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched !== null && isFirstLaunch === true) {
        setIsFirstLaunch(false);
      }
    };

    // Check every time the app comes to foreground
    const interval = setInterval(checkLaunchStatus, 1000);
    return () => clearInterval(interval);
  }, [isFirstLaunch]);


  // Keep splash visible while preparing
  if (!appIsReady || isFirstLaunch === null) { // Wait for first-launch check too
    return null;
  }

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
                          <RootNavigator isFirstLaunch={isFirstLaunch} />
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