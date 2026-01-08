import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useMeasurementUnit } from '../context/MeasurementUnitContext';
import { ThemeContext } from '../context/ThemeContext';
import { defaults } from '../designToken';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup } = useAuth();
  const navigation = useNavigation();

  const { temperatureUnit } = useMeasurementUnit();
  const { isDark } = useContext(ThemeContext);

  const showFirebaseSignupError = (error) => {
    let message = 'Signup failed.';

    switch (error.code) {
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters.';
        break;
      case 'auth/email-already-in-use':
        message = 'Email is already registered.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Try again later.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled.';
        break;
    }

    Alert.alert('Signup Failed', message);
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    try {
    const user = await signup(email.trim(), password, { name }, { temperatureUnit, isDark });
    Alert.alert(
      'Account Created!',
      'A verification email has been sent. Please check your inbox.',
    );
    navigation.navigate('VerifyEmail');
  } catch (error) {
    showFirebaseSignupError(error);
  }
  };

  const isButtonDisabled =
    !name.trim() || !email.trim() || !password.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Hello!, Register to get started on PlantPal </Text>

        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <View style={styles.inputContainer}>

          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.textInput}
          />

          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={styles.signupContainer}
      >
        <Text style={styles.signupText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 35,
    marginTop: 100,
  },
  form: {
    width: '100%',
    borderRadius: 20,
    marginBottom: 120,
  },
  title: {
    fontSize: 32,
    marginBottom: 60,
    color: defaults.green,
    fontFamily: defaults.font2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dadadaff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 15,
    marginBottom: 15,
    backgroundColor: '#ebebebff',
  },
  button: {
    backgroundColor: defaults.green,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 40,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    position: 'absolute',
    bottom: 60,
  },
  signupText: {
    textAlign: 'center',
    color: defaults.green,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadadaff',
    borderRadius: 8,
    backgroundColor: '#ebebebff',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  leftIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
  },
});
