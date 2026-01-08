import React, { useContext, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { get, ref } from 'firebase/database';
import { db } from '../firebaseConfig';
import AppText from '../components/AppText';
import { defaults } from '../designToken';
import { ThemeContext } from '../context/ThemeContext';
import { PlantContext } from '../context/PlantContext';

const AddPlantHardwareScreen = ({ navigation }) => {
  const [hardwareId, setHardwareId] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { plants } = useContext(PlantContext);

  const plantAlreadtExists = () => {
    const plantExists = plants.some(
      plant => plant.hardwareId === hardwareId
    );
    if (plantExists) {
      Alert.alert('Error', 'Plant already added to your garden.');
    }
    else {
      validateHardwareId();
    }
  }

  const validateHardwareId = async () => {
    if (!hardwareId.trim()) {
      Alert.alert('Error', 'Please enter a Hardware ID');
      return;
    }

    setLoading(true);
    try {
      const snapshot = await get(ref(db, `/${hardwareId.trim()}`));
      if (snapshot.exists()) {
        navigation.navigate('AddPlantDetails', { hardwareId: hardwareId.trim() });
      } else {
        Alert.alert('Not Found', 'This Hardware ID does not exist. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating hardware ID:', error);
      Alert.alert('Error', 'Failed to connect. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.inner, { backgroundColor: theme.background }]}>
        <AppText style={[styles.title, { color: theme.text }]}>Add New Plant</AppText>
        <AppText style={styles.subtitle}>
          First, enter the Hardware ID from your plant device
        </AppText>

        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Your Hardware ID"
          placeholderTextColor="#999"
          value={hardwareId}
          onChangeText={setHardwareId}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={plantAlreadtExists}
          disabled={loading}
        >
          <AppText style={styles.buttonText}>
            {loading ? 'Checking...' : 'Continue'}
          </AppText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddPlantHardwareScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: defaults.font1,
  },
  inner: {
    flex: 1,
    padding: 30,
    gap: 30,
    fontFamily: defaults.font2,
  },
  title: {
    fontSize: 28,
    fontFamily: defaults.font2,

  },
  subtitle: {
    fontSize: 16,
    color: '#8b8b8bff',
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dedcdcff',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,

  },
  button: {
    backgroundColor: defaults.green,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});