import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { defaults } from '../../designToken'
import { ThemeContext } from '../../context/ThemeContext';
import AppText from '../AppText'
import { ConnectionContext } from '../../context/ConnectionContext';
import { useMeasurementUnit } from '../../context/MeasurementUnitContext';

const TemperatureCard = () => {

    const { hardwareData, hardwareActive } = useContext(ConnectionContext);
    const temperature = hardwareData?.sensorData?.temperature ?? 'N/A';
    const { temperatureUnit, formatTemperature } = useMeasurementUnit();

    const hotTempPoint = 31;

    const { theme } = useContext(ThemeContext);


    return (
        <View
            style={[
                styles.temperature,
                styles.otherDetailsCard,
                { borderWidth: theme.HnTBorder, backgroundColor: temperature > hotTempPoint ? '#FECE00' : '#B0D5FF' },

            ]}
        >
            <View>
                <AppText style={styles.tempText}>Temperature Outside</AppText>
                {/* <AppText style={[styles.tempValue, { color: temperature > hotTempPoint ? '#FF5217' : '#0178fe' }]}>{temperature}°C</AppText> */}
                <AppText style={[styles.tempValue, { color: temperature > hotTempPoint ? '#FF5217' : '#0178fe' }]}>{formatTemperature(temperature)}°{temperatureUnit}</AppText>
            </View>
            <View>
                {temperature > hotTempPoint ?
                    <Image

                        source={require('../../assets/temperature-fire.png')}
                        style={styles.tempFireImage}
                        resizeMode="contain"
                    /> :
                    <Image

                        source={require('../../assets/temperature-cloud.png')}
                        style={styles.tempCloudImage}
                        resizeMode="contain"
                    />
                }

            </View>
        </View>
    )
}

export default TemperatureCard

const styles = StyleSheet.create({
    temperature: {
        flex: 1,
        backgroundColor: '#FECE00',
        borderColor: '#6B220A',

        flexDirection: 'row',
        overflow: 'hidden',
    },
    tempText: {
        fontFamily: defaults.font2,
        fontSize: 13,
        marginBottom: 5,
        color: 'black'
    },
    tempValue: {
        fontFamily: defaults.font2,
        fontSize: 22,
    },
    tempFireImage: {
        height: 65,
        width: 40,
        right: 6,
    },
    tempCloudImage: {
        height: 42,
        top: '25%',
        right: '52%',
    },
    otherDetailsCard: {
        paddingTop: 9,
        paddingLeft: 12,
        borderRadius: defaults.borderRadius,
    },
})