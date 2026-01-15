import React, { useState, useEffect, useContext } from 'react';
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
    Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { updateProfile, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth, fsdb } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { defaults } from '../designToken';
import { ThemeContext } from '../context/ThemeContext';

import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Modal } from 'react-native';

export default function EditProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { userData, setUserData } = useUserData();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarUri, setAvatarUri] = useState(null);
    const [cacheBuster, setCacheBuster] = useState(Date.now());
    const [modalVisible, setModalVisible] = useState(false);
    const [password, setPassword] = useState('');

    //states for tracking changes
    const [originalName, setOriginalName] = useState('');
    const [originalAvatarUri, setOriginalAvatarUri] = useState(null);
    const [pendingAvatarUri, setPendingAvatarUri] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const { theme } = useContext(ThemeContext);

    const avatarFile = new File(Paths.document, `avatar_${user.uid}.jpg`);
    const tempAvatarFile = new File(Paths.document, `temp_avatar_${user.uid}.jpg`);

    useEffect(() => {
        if (userData?.name) {
            setName(userData.name);
            setOriginalName(userData.name);
        }
    }, [userData]);

    useEffect(() => {
        if (avatarFile.exists) {
            const uri = avatarFile.uri;
            setAvatarUri(uri);
            setOriginalAvatarUri(uri);
        } else {
            setAvatarUri(null);
            setOriginalAvatarUri(null);
        }
    }, [user.uid]);

    // Track unsaved changes
    useEffect(() => {
        const nameChanged = name.trim() !== originalName;
        const avatarChanged = pendingAvatarUri !== null;
        setHasUnsavedChanges(nameChanged || avatarChanged);
    }, [name, originalName, pendingAvatarUri]);

    // Handle back button press
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!hasUnsavedChanges) {
                // No unsaved changes, allow navigation
                return;
            }

            // Prevent default behavior of leaving the screen
            e.preventDefault();
 
            // Prompt the user before leaving the screen
            Alert.alert(
                'Save Changes?',
                'You have unsaved changes. Are you sure you want to discard them?',
                [
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: async () => {
                            if (tempAvatarFile.exists) {
                                await tempAvatarFile.delete();
                            }
                            navigation.dispatch(e.data.action);
                        },
                    },
                    { text: "Save", style: 'cancel', onPress: () => {
                        handleSave();
                    } },
                ],
                { cancelable: true }
            );
        });

        return unsubscribe;
    }, [navigation, hasUnsavedChanges]);

    const changeAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission required', 'Please allow access to your photo library.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (result.canceled) return;

        const selectedUri = result.assets[0].uri;

        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                selectedUri,
                [{ resize: { width: 512, height: 512 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );

            const tempFile = new File(manipResult.uri);

            // Delete old temp file if exists
            if (tempAvatarFile.exists) {
                await tempAvatarFile.delete();
            }

            // Save to temporary location
            await tempFile.copy(tempAvatarFile);

            // Update preview with pending avatar
            setPendingAvatarUri(tempAvatarFile.uri);
            setCacheBuster(Date.now());
        } catch (error) {
            console.error('Error processing avatar:', error);
            Alert.alert('Error', 'Failed to update profile photo.');
        }
    };

    const removeAvatar = async () => {
        setPendingAvatarUri('removed');
        setCacheBuster(Date.now());
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Invalid Name', 'Name cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            // Update name if changed
            if (user.displayName !== name.trim()) {
                await updateProfile(user, { displayName: name.trim() });
            }

            if (userData.name !== name.trim()) {
                const userRef = doc(fsdb, 'users', user.uid);
                await updateDoc(userRef, { name: name.trim() });
                setUserData({ ...userData, name: name.trim() });
            }

            // Handle avatar changes
            if (pendingAvatarUri === 'removed') {
                // Remove avatar
                if (avatarFile.exists) {
                    await avatarFile.delete();
                }
                setAvatarUri(null);
                setOriginalAvatarUri(null);
            } else if (pendingAvatarUri) {
                // Save new avatar
                if (avatarFile.exists) {
                    await avatarFile.delete();
                }
                await tempAvatarFile.copy(avatarFile);
                setAvatarUri(avatarFile.uri);
                setOriginalAvatarUri(avatarFile.uri);
            }

            // Clean up temp file
            if (tempAvatarFile.exists) {
                await tempAvatarFile.delete();
            }

            // Reset tracking states
            setPendingAvatarUri(null);
            setOriginalName(name.trim());
            setHasUnsavedChanges(false);

            Alert.alert('Success', 'Profile updated successfully.', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate('Profile', { screen: 'ProfileMain' });
                    }
                }
            ]);
        } catch (error) {
            console.log('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => setModalVisible(true),
                },
            ]
        );
    };

    const confirmDelete = async () => {
        if (!password) {
            Alert.alert('Error', 'Password is required.');
            return;
        }

        setModalVisible(false);
        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            if (avatarFile.exists) {
                await avatarFile.delete();
            }
            if (tempAvatarFile.exists) {
                await tempAvatarFile.delete();
            }
            await deleteDoc(doc(fsdb, 'users', user.uid));
            await deleteUser(user);
            await logout();
            navigation.reset({});
        } catch (error) {
            console.error('Delete account error:', error);
            if (error.code === 'auth/invalid-credential') {
                Alert.alert('Wrong Password', 'The password you entered is incorrect.');
            } else if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Session Expired', 'Please try again and enter your password.');
            } else {
                Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
        } finally {
            setLoading(false);
            setPassword('');
        }
    };

    // Get display URI for avatar
    const getDisplayAvatarUri = () => {
        if (pendingAvatarUri === 'removed') {
            return null;
        }
        if (pendingAvatarUri) {
            return pendingAvatarUri;
        }
        return avatarUri;
    };

    if (!userData) return null;

    const displayUri = getDisplayAvatarUri();

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarPlaceholder}>
                        {displayUri ? (
                            <Image
                                source={{ uri: displayUri + '?cb=' + cacheBuster }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Ionicons name="person-outline" size={60} color="#aaa" />
                        )}
                    </View>

                    <View style={styles.avatarButtons}>
                        <TouchableOpacity style={[styles.changePhotoButton, { borderColor: theme.text + '30' }]} onPress={changeAvatar}>
                            <Text style={[styles.changePhotoText, { color: theme.text }]}>Change Profile Photo</Text>
                        </TouchableOpacity>

                        {displayUri && (
                            <TouchableOpacity style={styles.removePhotoButton} onPress={removeAvatar}>
                                <Text style={styles.removePhotoText}>Remove Profile Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Personal Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Info</Text>
                    <View style={styles.inputRow}>
                        <Text style={[styles.label, { color: theme.text }]}>Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={[styles.input, { borderColor: theme.text + '30', backgroundColor: theme.background, color: theme.text }]}
                            placeholder="Enter your name"
                            placeholderTextColor="#aaa"
                        />
                    </View>
                </View>

                {/* Account Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Info</Text>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                        <Text style={styles.infoText}>{user.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.text }]}>Account Created</Text>
                        <Text style={styles.infoText}>
                            {userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : ''}
                        </Text>
                    </View>

                    {/* Change Password     */}
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.background, borderColor: theme.text + '30' }]}
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                        <Text style={styles.actionButtonText}>Change Password</Text>
                    </TouchableOpacity>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>

                {/* Danger Zone */}
                <View style={styles.dangerSection}>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Text style={styles.deleteButtonText}>Delete Account Permanently</Text>
                    </TouchableOpacity>
                </View>
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                            <Text style={styles.confirmDeleteTitle}>Confirm Password</Text>
                            <Text style={[styles.confirmDeleteMessage, { color: theme.text }]}>Please enter your password to delete your account</Text>

                            <TextInput
                                style={[styles.confirmDeleteInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.text }]}
                                secureTextEntry={true}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                autoFocus={true}
                            />

                            <View style={styles.confirmDeleteButtons}>
                                <TouchableOpacity
                                    style={[styles.confirmDeleteButton, styles.confirmDeleteCancelButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setPassword('');
                                    }}
                                >
                                    <Text style={styles.confirmDeleteCancelText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.confirmDeleteButton, styles.confirmDeleteDeleteButton]}
                                    onPress={confirmDelete}
                                >
                                    <Text style={styles.confirmDeleteDeleteText}>Delete Account</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 80, marginBottom: 40, },
    avatarSection: { alignItems: 'center', marginBottom: 40 },
    avatarPlaceholder: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 4,
        borderColor: defaults.green,
        overflow: 'hidden',
    },
    avatarImage: { width: 130, height: 130, borderRadius: 65 },
    avatarButtons: { flexDirection: 'row', gap: 15 },
    changePhotoButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
    },
    changePhotoText: { fontWeight: '600', },
    removePhotoButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#ffe5e5',
        borderRadius: 25,
    },
    removePhotoText: { color: '#d32f2f', fontWeight: '600' },

    section: { marginBottom: 10 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: defaults.green, marginBottom: 15 },
    inputRow: { marginBottom: 0 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    infoRow: { marginBottom: 15 },
    infoText: { fontSize: 16, color: '#555' },

    actionButton: {
        backgroundColor: '#f8f8f8',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
    },
    actionButtonText: { color: defaults.green, fontWeight: 'bold', fontSize: 16 },

    saveButton: {
        backgroundColor: defaults.green,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

    dangerSection: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#ddd' },
    dangerTitle: { fontSize: 18, fontWeight: '700', color: '#d32f2f', marginBottom: 15 },
    deleteButton: {
        backgroundColor: '#d32f2f',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    confirmDeleteTitle: {
        fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: defaults.disconnectedColor,
    },
    confirmDeleteMessage: { marginBottom: 15, fontSize: 16 },
    confirmDeleteInput: {
        width: '100%',
        borderWidth: 0.5,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    confirmDeleteButtons: {
        flexDirection: 'row', justifyContent: 'space-between', width: '100%'
    },
    confirmDeleteButton: { padding: 10, borderRadius: 5, minWidth: 100, alignItems: 'center' },
    confirmDeleteCancelButton: { backgroundColor: '#ccc' },
    confirmDeleteDeleteButton: { backgroundColor: '#d32f2f' },
    confirmDeleteCancelText: { color: 'black' },
    confirmDeleteDeleteText: { color: 'white' },
});