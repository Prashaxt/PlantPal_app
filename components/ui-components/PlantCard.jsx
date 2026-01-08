import React, { useContext } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppText from '../AppText';
import { ThemeContext } from '../../context/ThemeContext';
import { defaults } from '../../designToken';

const PlantCard = ({ commonName, nickname, image, onEdit }) => {

    const { theme } = useContext(ThemeContext);

    return (

        <View style={[styles.plantDetails, { backgroundColor: theme.settingsTrayBackground }]}>
            <View style={styles.left}>
                <Image
                    source={image}
                    style={styles.mascotImage}
                    resizeMode="cover"
                />
                <View style={styles.plantNames}>
                    <AppText style={styles.englishCommonName}>{commonName}</AppText>
                    <AppText style={[styles.nickname, { color: theme.text }]}>{nickname}</AppText>
                </View>
            </View>
            <TouchableOpacity style={styles.right} onPress={onEdit}>
                <MaterialIcons name="edit" size={28} color={theme.text} />
            </TouchableOpacity>
        </View>

    )
}

export default PlantCard

const styles = StyleSheet.create({
    plantDetails: {
        // height: '100%',
        flexDirection: 'row',
        paddingVertical: 9,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 9,
        paddingRight: 16,
        borderColor: '#a9a9a9ff',
        borderWidth: 0.8,
        borderRadius: defaults.borderRadius,
        marginBottom: 8,
    },
    left: {
        flexDirection: 'row',
        gap: 10,
    },
    mascotImage: {
        height: 50,
        width: 75,
        borderRadius: 12,
    },
    plantNames: {
        display: 'flex',
        justifyContent: 'center',

        gap: 3,
    },
    englishCommonName: {
        fontFamily: defaults.font2,
        color: 'grey',
        fontSize: 12,
    },
    nickname: {
        fontFamily: defaults.font3,
    },
    right: {
        flexDirection: 'row',
        gap: 5,
    },
})