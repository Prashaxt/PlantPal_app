import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, fsdb } from '../firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Signup function with default Firestore fields
  const signup = async (email, password, additionalData = {}, settings = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(fsdb, 'users', user.uid), {
        email: user.email,
        createdAt: new Date(),
        measurementUnit: settings.temperatureUnit || 'C',
        theme: settings.isDark ? 'dark' : 'light',
        notificationEnabled: true,
        ...additionalData,
      });


      await sendEmailVerification(user);


      console.log('User signed up and Firestore document created');
      return user;
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  //Forgot Password function
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Logout function
  const logout = () => signOut(auth);

  // Update a single field in Firestore
  const updateSetting = async (key, value) => {
    if (!user) return; // Must be logged in
    try {
      const userRef = doc(fsdb, 'users', user.uid);
      await updateDoc(userRef, { [key]: value });
      console.log(`Updated ${key} to ${value} in Firestore`);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  //Reload user
  const reloadUser = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
      }
    } catch (error) {
      console.error('Error reloading user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateSetting, resetPassword, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
