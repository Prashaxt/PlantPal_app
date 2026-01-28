import { Alert, Image, Linking, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import { defaults } from '../designToken'
import { ThemeContext } from '../context/ThemeContext';
import AppText from './AppText';
import { Switch } from 'react-native';
import { useMeasurementUnit } from "../context/MeasurementUnitContext";
import { useAuth } from '../context/AuthContext';


const SettingsCard = () => {

    const { theme, isDark, toggleTheme } = useContext(ThemeContext);
    const { temperatureUnit, toggleTemperatureUnit } = useMeasurementUnit();
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => console.log("Logout cancelled")
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                            console.log("Logged out successfully");
                        } catch (error) {
                            console.error("Logout error:", error);
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <AppText style={[styles.settingsText, { color: theme.text }]}> Settings & Preferences</AppText>
            <View style={[styles.settingsTray, { backgroundColor: theme.settingsTrayBackground }]}>

                {/* Notifications */}
                {/* <View style={[styles.settingsTraySection, styles.settingsTraySectionBorder, { borderColor: theme.settingsTraySectionBorder }]}>
                    <View style={styles.left}>
                        <View style={styles.iconBox}>
                            <Image
                                source={require('../assets/notificationIcon.png')}
                                style={styles.iconBoxImg}
                                resizeMode='center'
                            />
                        </View>
                        <AppText style={[styles.settingsLeftText, { color: theme.text }]}>Notification</AppText>
                    </View>
                    <View style={styles.right}>
                        <AppText style={[styles.rightText, { color: theme.settingsRightText }]}>Coming soon</AppText>
                    </View>
                </View> */}

                {/* Measurement Units */}
                <View style={[styles.settingsTraySection, styles.settingsTraySectionBorder, { borderColor: theme.settingsTraySectionBorder }]}>
                    <View style={styles.left}>
                        <View style={styles.iconBox}>
                            <Image
                                source={require('../assets/muIcon.png')}
                                style={styles.iconBoxImg}
                                resizeMode='contain'
                            />
                        </View>
                        <AppText style={[styles.settingsLeftText, { color: theme.text }]}>Measurement Units</AppText>
                    </View>

                    <View style={styles.radioContainer}>
                        {["C", "F"].map(unit => {
                            const selected = temperatureUnit === unit;

                            return (
                                <Pressable
                                    key={unit}
                                    style={[styles.radioItem]}
                                    onPress={() => {
                                        if (!selected) {
                                            toggleTemperatureUnit();
                                        }
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.outerCircle,
                                            {
                                                borderColor: theme.settingsRightText,
                                            },
                                        ]}
                                    >
                                        {selected && <View style={styles.innerCircle} />}
                                    </View>

                                    <AppText style={{ color: theme.settingsRightText }}>
                                        °{unit}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Theme Mode */}
                <View style={[styles.settingsTraySection, styles.settingsTraySectionBorder, { borderColor: theme.settingsTraySectionBorder }]}>
                    <View style={styles.left}>
                        <View style={styles.iconBox}>
                            <Image
                                source={require('../assets/moonIcon.png')}
                                style={styles.iconBoxImg}
                                resizeMode='center'
                            />
                        </View>
                        <AppText style={[styles.settingsLeftText, { color: theme.text }]}>Dark Mode</AppText>
                    </View>
                    <View style={styles.right}>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={isDark ? '#0178FE' : '#f4f3f4'}
                            style={styles.switchStyle}
                        />
                    </View>
                </View>


                {/* Help and Support */}
                <TouchableOpacity 
                style={[styles.settingsTraySection, styles.settingsTraySectionBorder, { borderColor: theme.settingsTraySectionBorder }]} 
                onPress={() => { Linking.openURL("https://plantpal-kappa-six.vercel.app"); }}>
                    <View style={styles.left}>
                        <View style={styles.iconBox}>
                            <Image
                                source={require('../assets/hsIcon.png')}
                                style={styles.iconBoxImg}
                                resizeMode='contain'
                            />
                        </View>
                        <AppText style={[styles.settingsLeftText, { color: theme.text }]}>Help & Support</AppText>
                    </View>
                </TouchableOpacity>

                {/* About Plantpal */}
                <TouchableOpacity 
                style={[styles.settingsTraySection, styles.settingsTraySectionBorder, { borderColor: theme.settingsTraySectionBorder }]} 
                onPress={() => { Linking.openURL("https://plantpal-kappa-six.vercel.app"); }}>
                    <View style={styles.left}>
                        <View style={styles.iconBox}>
                            <Image
                                source={require('../assets/globeIcon.png')}
                                style={styles.iconBoxImg}
                                resizeMode='contain'
                            />
                        </View>
                        <AppText style={[styles.settingsLeftText, { color: theme.text }]}>About PlantPal</AppText>
                    </View>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity style={[styles.settingsTraySection, { paddingBottom: 18 }]} onPress={handleLogout}>
                    <View style={styles.left} >
                        <View style={styles.iconBox}>
                            <Image
                                source={require('../assets/logout.png')}
                                style={styles.iconBoxImg}
                                resizeMode='contain'
                            />
                        </View>
                        <AppText style={[styles.settingsLeftText, { color: defaults.disconnectedColor }]}>Logout</AppText>
                    </View>
                </TouchableOpacity>

            </View>
        </View>
    )
}

export default SettingsCard

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        gap: 10,
    },
    settingsText: {
        fontFamily: defaults.font2,
        fontSize: 20,
    },
    settingsTray: {
        borderRadius: defaults.borderRadius,
        paddingHorizontal: 16,
    },
    settingsTraySection: {
        paddingLeft: 0,
        paddingRight: 10,
        paddingVertical: 14,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',


    },
    settingsTraySectionBorder: {
        borderBottomWidth: 0.4,
    },
    left: {
        display: "flex",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    iconBox: {
        height: 20,
        width: 20,


    },
    iconBoxImg: {
        height: '100%',
        width: '100%',
    },
    settingsLeftText: {
        fontFamily: defaults.font1,
        fontSize: 17,
    },
    rightText: {
        opacity: 0.6,
        fontSize: 16,
    },
    switchStyle: {
        height: 22,
    },
    radioContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    radioItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        opacity: 0.6,
    },
    outerCircle: {
        width: 14,
        height: 14,
        borderRadius: 9,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    innerCircle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#007AFF"
    },
})