import React, { useState } from 'react';
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
import { defaults } from '../designToken';
import { Ionicons } from '@expo/vector-icons';

export default function ForgetPasswordScreen() {
  const { resetPassword } = useAuth();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(true);

  const handleReset = async () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email.trim() || !emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim());
      Alert.alert(
        'Reset Email Sent',
        'If an account exists for this email, a password reset link has been sent.'
      );
      navigation.goBack();
    } catch (error) {
      console.log('Reset password error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !email.trim() || loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a password reset link.
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#777" style={styles.leftIcon} />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.textInput}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={isButtonDisabled}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backContainer}
      >
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 35,
    marginTop: 120,
  },
  title: {
    fontSize: 32,
    color: defaults.green,
    fontFamily: defaults.font2,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 40,
    fontFamily: defaults.font1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadadaff',
    borderRadius: 8,
    backgroundColor: '#ebebebff',
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 20,
  },
  leftIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    color: '#000',
  },
  button: {
    backgroundColor: defaults.green,
    paddingVertical: 18,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: defaults.font2,
    fontSize: 16,
  },
  backContainer: {
    marginTop: 30,
  },
  backText: {
    color: defaults.green,
    textAlign: 'center',
    fontFamily: defaults.font2,
    fontSize: 16,
  },
});
