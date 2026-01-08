import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { defaults } from '../designToken';
import { useNavigation } from '@react-navigation/native';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailScreen() {
  const user = auth.currentUser;
  const navigation = useNavigation();
  const { reloadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Auto-check for email verification every 5 seconds
  useEffect(() => {
    let interval;

    const checkVerification = async () => {
      if (!user) return;

      await user.reload();

      if (user.emailVerified) {
        clearInterval(interval);
        await reloadUser();

        Alert.alert(
          'Email Verified!',
          'You can now access the app.',
          [{ text: 'OK' }]
        );
      }
    };

    // Initial check
    checkVerification();

    // Poll every 5 seconds
    interval = setInterval(checkVerification, 5000);

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, reloadUser]);


  // Resend verification email
  const resendEmail = async () => {
    try {
      setLoading(true);
      setResendDisabled(true);
      await sendEmailVerification(user);
      Alert.alert('Verification Email Sent', 'Please check your inbox.');

      // Start countdown after email is sent successfully
      let remainingTime = 30;
      setCountdown(remainingTime);
      const interval = setInterval(() => {
        remainingTime -= 1;
        setCountdown(remainingTime);
        if (remainingTime === 0) {
          clearInterval(interval);
          setResendDisabled(false); // Enable button after countdown ends
        }
      }, 1000);
    } catch (error) {
      setResendDisabled(false);
      handleResendError(error);
    } finally {
      setLoading(false);
    }
  };

  // Error Handling for Resend Email
  const handleResendError = (error) => {
    let errorMessage = 'An error occurred. Please try again later.';
    if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.code === 'auth/invalid-user') {
      errorMessage = 'User not found. Please sign in again.';
    }
    Alert.alert('Error', errorMessage);
  };

  // Back to login (logout)
  const backToLogin = async () => {
    await auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        A verification link has been sent to your email. Please click the link to continue.
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={resendEmail}
        disabled={loading || resendDisabled}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : resendDisabled ? `Resend in ${countdown}s` : 'Resend Email'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 15 }]}
        onPress={backToLogin}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 35, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, color: defaults.green, fontFamily: defaults.font2, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#555', fontFamily: defaults.font1, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: defaults.green, paddingVertical: 15, borderRadius: 10, width: '100%' },
  buttonDisabled: { backgroundColor: '#A5D6A7' },
  buttonText: { color: '#fff', textAlign: 'center', fontFamily: defaults.font2, fontSize: 16 },
});
