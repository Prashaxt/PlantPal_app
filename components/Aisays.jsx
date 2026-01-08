import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo';
import React, { useContext } from 'react'
import { defaults } from '../designToken';
import { ThemeContext } from '../context/ThemeContext';
import AppText from './AppText';

const Aisays = () => {

    const { theme, isDark } = useContext(ThemeContext);

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <Image
                    source={require('../assets/plantSaysIcon.png')}
                    style={styles.plantSaysIcon}
                    resizeMode="cover"
                />
                <AppText style={[styles.plantSaysText, { color: theme.text }]}>Plant Says:</AppText>
            </View>
            <View style={styles.bottom}>
                <AppText style={[styles.aiText, { color: theme.text }]}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum repellat, doloremque autem labore veniam perferendis ab eaque minus corporis delectus provident minima a incidunt at odit vitae velit. Voluptas similique earum veniam placeat provident nulla voluptates a reiciendis temporibus porro!
                </AppText>
            </View>
        </View>
    )
}

export default Aisays

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        width: '100%',
        gap: 5,
    },
    top: {
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    plantSaysIcon: {
        height: 20,
        width: 20,
    },
    plantSaysText: {
        fontSize: 18,
        fontFamily: defaults.font1,
    },
    bottom: {
        // maxHeight: 130,
        width: '100%',
        paddingLeft: 30,
        marginBottom: 24,
    },
    aiText: {
        fontSize: 16,
        lineHeight: 18,
        width: '90%',
    },


})