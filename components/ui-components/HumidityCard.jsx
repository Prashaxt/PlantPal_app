import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { defaults } from '../../designToken'
import { ThemeContext } from '../../context/ThemeContext';
import AppText from '../AppText';
import { ConnectionContext } from '../../context/ConnectionContext';

const HumidityCard = () => {

    const { hardwareData, hardwareActive } = useContext(ConnectionContext);
    const humidity = hardwareData?.sensorData?.humidity ?? 'N/A';

    const lowHumidityPoint = 30;

    const { theme } = useContext(ThemeContext);

    return (
        <View
            style={[
                styles.humidity,
                styles.otherDetailsCard,
                { backgroundColor: theme.humidityBackground }, { borderWidth: theme.HnTBorder },
            ]}
        >
            <View>
                <AppText style={styles.humidityText}>Humidity Level</AppText>
                <AppText style={[styles.humidityValue, { color: humidity < lowHumidityPoint ? theme.lowHumidityText : theme.humidityText }]}>
                    {humidity}%
                </AppText>
            </View>
            <View>{/* Graph placeholder */}</View>
        </View>
    )
}

export default HumidityCard

const styles = StyleSheet.create({
    humidity: {
        flex: 1.1,
        borderColor: '#484848',
        flexDirection: 'row',
    },
    humidityText: {
        fontFamily: defaults.font2,
        color: '#ffffff',
        fontSize: 13,
        marginBottom: 5,
    },
    humidityValue: {
        fontFamily: defaults.font2,
        fontSize: 20,
    },
    otherDetailsCard: {
        paddingTop: 9,
        paddingLeft: 12,
        borderRadius: defaults.borderRadius,
    },
})