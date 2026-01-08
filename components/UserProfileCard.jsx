import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import AppText from './AppText'
import { defaults } from '../designToken';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';


const UserProfileCard = () => {

    const { theme } = useContext(ThemeContext);
    const { userData } = useUserData();
    const { user } = useAuth();

    const [avatarUri, setAvatarUri] = useState(null);
    const [cacheBuster, setCacheBuster] = useState(Date.now());



    useEffect(() => {
        if (!user?.uid) {
            setAvatarUri(null);
            return;
        }

        const avatarFile = new File(Paths.document, `avatar_${user.uid}.jpg`);

        const loadAvatar = async () => {
            try {
                if (avatarFile.exists) {
                    setAvatarUri(avatarFile.uri);
                    setCacheBuster(Date.now());
                } else {
                    setAvatarUri(null);
                }
            } catch (error) {
                console.error('Error loading avatar in UserProfileCard:', error);
                setAvatarUri(null);
            }
        };

        loadAvatar();
    }, [user?.uid]);

    if (!userData) return null;

    return (
        <View style={styles.container}>
            <View style={styles.profilePhoto}>
                {avatarUri ? (
                    <Image
                        source={{ uri: avatarUri + '?cb=' + cacheBuster }}
                        style={styles.profilePhotoImg} />
                ) : (
                    <Ionicons name="person-outline" size={60} color="#aaa" />
                )}
            </View>
            <View style={styles.profileDetails}>
                <AppText style={[styles.profileUserName, { color: theme.text }]}>{userData.name}</AppText>
                <AppText style={[styles.profileStartDateText, { color: theme.text }]}>Started since {userData.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</AppText>
            </View>
        </View>
    )
}

export default UserProfileCard

const styles = StyleSheet.create({
    container: {
        height: '30%',
        width: '100%',
        paddingTop: '15%',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,

    },
    profilePhoto: {
        overflow: 'hidden',
        height: 120,
        width: 120,
        borderRadius: 100,
    },
    profilePhotoImg: {
        height: '100%',
        width: '100%',

    },
    profileDetails: {
        width: '100%',
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,

    },
    profileUserName: {
        fontFamily: defaults.font2,
        fontSize: 30,
    },
    profileStartDateText: {
        fontSize: 12,
    },
})