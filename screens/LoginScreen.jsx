import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { defaults } from '../designToken';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const { login, resetPassword } = useAuth();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);


  const showFirebaseLoginError = (error) => {
    let message = 'Invalid email or password.';

    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Invalid email address format.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Try again later.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled.';
        break;
    }

    Alert.alert('Login Failed', message);
  };


  //Login Handle Function
  const handleLogin = async () => {

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log('Firebase error:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      showFirebaseLoginError(error);
    }
  };

  //Handle Forgot password
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const result = await resetPassword(email);

    if (result.success) {
      Alert.alert(
        'Reset Email Sent',
        'If an account exists for this email, a password reset link has been sent.'
      );
    } else {
      if (result.error.code === 'auth/too-many-requests') {
        Alert.alert(
          'Too Many Requests',
          'Please wait a while before trying again.'
        );
      } else {
        Alert.alert(
          'Reset Email Sent',
          'If an account exists for this email, a password reset link has been sent.'
        );
      }
    }
  };


  const isButtonDisabled = !email.trim() || !password.trim();


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >


      <Text style={styles.title}>Welcome Back Glad to see you, Again!</Text>

      <View style={styles.form}>


        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#777"
            style={styles.leftIcon}
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.textInput}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#777"
            style={styles.leftIcon}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.textInput}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#777"
            />
          </TouchableOpacity>
        </View>


        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgetPassword')}
          style={styles.forgotPasswordText}>
          <Text style={styles.signupText}>Forgot Password ?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isButtonDisabled}
        >

          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>



      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? Signup</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 35,
    marginTop: 120,

  },
  form: {
    width: '100%',
    borderRadius: 20,
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
    paddingVertical: 18,
    marginBottom: 15,
    backgroundColor: '#ebebebff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadadaff',
    borderRadius: 8,
    backgroundColor: '#ebebebff',
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: defaults.green,
    paddingVertical: 18,
    borderRadius: 10,
    marginTop: 30,

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
  forgotPasswordText: {
    alignSelf: 'flex-end',
    fontFamily: defaults.font2,
  },
  signupContainer: {
    position: 'absolute',
    bottom: 60,
  },
  signupText: {
    textAlign: 'center',
    color: defaults.green,
    marginTop: 5,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadadaff',
    borderRadius: 8,
    backgroundColor: '#ebebebff',
    paddingHorizontal: 10,
    marginTop: 15,
  },
  leftIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    color: '#000',
  },
});
