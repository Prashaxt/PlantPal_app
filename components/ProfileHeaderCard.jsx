import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext';
import AppText from './AppText';
import { defaults } from '../designToken';
import { MaterialIcons } from '@expo/vector-icons';
import { PlantContext } from '../context/PlantContext';
import { useNavigation } from '@react-navigation/native';

const ProfileHeaderCard = () => {

    const { theme, isDark, toggleTheme } = useContext(ThemeContext);
    const { plants } = useContext(PlantContext);
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { backgroundColor: theme.settingsTrayBackground }]}>

            {/* Total Plants  */}
            <View style={styles.card}>
                <View style={styles.top}>
                    <Image
                        source={require('../assets/plantLeafIcon.png')}
                        style={styles.topIcon}
                        resizeMethod='center'
                    />

                    <AppText style={[styles.topText]}>{plants.length}</AppText>
                </View>
                <View style={styles.bottom}>
                    <AppText style={[styles.bottomText]}>Total Plant</AppText>
                </View>
            </View>


            {/* Water All  */}
            <TouchableOpacity style={styles.card} onPress={() => { alert('will be added later ') }}>
                <View style={styles.top}>
                    <Image
                        source={require('../assets/watercanIcon.png')}
                        style={styles.topIcon}
                        resizeMethod='center'
                    />
                </View>
                <View style={styles.bottom}>
                    <AppText style={[styles.bottomText]}>Water All</AppText>
                </View>
            </TouchableOpacity>



            {/* Edit Profile  */}
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('EditProfile')}
            >
                <View style={styles.top}>
                    {isDark ?
                        <Image
                            source={require('../assets/profileEditDark.png')}
                            style={styles.topIcon}
                            resizeMethod='center'
                        />
                        :
                        <Image
                            source={require('../assets/profileEditLight.png')}
                            style={styles.topIcon}
                            resizeMethod='center'
                        />
                    }

                </View>
                <View style={styles.bottom}>
                    <AppText style={[styles.bottomText]}>Edit Profile</AppText>
                </View>
            </TouchableOpacity>

        </View>
    )
}

export default ProfileHeaderCard

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: defaults.borderRadius,
        paddingHorizontal: 16,
        paddingVertical: 22,
        justifyContent: 'space-between',
        alignContent: "center",
        flexDirection: 'row',
        marginBottom: 10,
    },
    card: {
        gap: 4,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    top: {
        flexDirection: 'row',
        gap: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topIcon: {
        height: 28,
        width: 28,
    },
    switchStyle: {
        height: 22,
    },
    topText: {
        fontSize: 18,
        fontFamily: defaults.font2,
    },
    themeText: {
        fontFamily: defaults.font1,
        fontSize: 11,
        alignSelf: 'center'
    },
    bottomText: {
        fontSize: 13,
        fontFamily: defaults.font1,
    },

})