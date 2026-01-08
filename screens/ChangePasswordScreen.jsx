import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { defaults } from '../designToken';
import { ThemeContext } from '../context/ThemeContext';


export default function ChangePasswordScreen({ navigation }) {
    const { user } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const { theme } = useContext(ThemeContext);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Confirm Password does not match.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const auth = getAuth();
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            await reauthenticateWithCredential(user, credential);

            await updatePassword(user, newPassword);

            Alert.alert('Success', 'Password changed successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.log(error);
            let message = 'Failed to change password.';
            if (error.code === 'auth/invalid-credential') {
                message = 'Current password is incorrect.';
            } else if (error.code === 'auth/requires-recent-login') {
                message = 'Please log out and log in again before changing password.';
            }
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={[styles.content]} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Change Password</Text>

                <Text style={[styles.label, { color: theme.text }]}>Current Password</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                    <TextInput
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        secureTextEntry={!showOld}
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Enter current password"
                        placeholderTextColor="#aaa"
                    />
                    <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                        <Ionicons name={showOld ? 'eye-outline' : 'eye-off-outline'} size={24} color={defaults.green} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                    <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNew}
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Enter new password"
                        placeholderTextColor="#aaa"
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                        <Ionicons name={showNew ? 'eye-outline' : 'eye-off-outline'} size={24} color={defaults.green} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Confirm New Password</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirm}
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Confirm new password"
                        placeholderTextColor="#aaa"
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                        <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={24} color={defaults.green} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingTop: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: defaults.green, marginBottom: 30, },
    label: { fontSize: 15, marginBottom: 8, fontWeight: '600' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#fff',
        marginBottom: 20,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    input: { flex: 1, paddingVertical: 16, fontSize: 16 },
    button: {
        backgroundColor: defaults.green,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});