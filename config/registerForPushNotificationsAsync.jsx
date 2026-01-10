import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { fsdb } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';

async function registerForPushNotificationsAsync(user) {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data; 
  // Store token in Firestore
  const userRef = doc(fsdb, 'users', user.uid);
  await setDoc(userRef, { pushToken: token }, { merge: true });
}

// Call this in useEffect after user logs in
const { user } = useAuth();
useEffect(() => {
  if (user) registerForPushNotificationsAsync(user);
}, [user]);