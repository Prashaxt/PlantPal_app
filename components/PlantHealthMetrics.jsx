import { StyleSheet, Text, View, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager, Dimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { defaults } from '../designToken';
import AppText from './AppText';
import Entypo from '@expo/vector-icons/Entypo';
import TemperatureCard from './ui-components/TemperatureCard';
import HumidityCard from './ui-components/HumidityCard';
import { ConnectionContext } from '../context/ConnectionContext';
import { PlantContext } from '../context/PlantContext';

const screenHeight = Dimensions.get('window').height;
const collapsedHeight = screenHeight * 0.35;
const expandedHeight = screenHeight * 0.55;

const PlantHealthMetrics = () => {
    const { theme } = useContext(ThemeContext);
    const [expanded, setExpanded] = useState(false);
    const animatedHeight = useRef(new Animated.Value(collapsedHeight)).current;

    const { selectedPlant } = useContext(PlantContext);
    const [age, setAge] = useState('');

    const { hardwareData, hardwareActive } = useContext(ConnectionContext);
    const moisture = hardwareData?.sensorData?.moisture ?? 'N/A';

    //Water level in percentage , can be set as per need
    const minMoisture = 600; // completely wet 
    const maxMoisture = 4095; // completely dry 

    const waterLevelPercentage = Math.min(
        100,
        Math.max(
            0,
            Math.floor(
                100 - ((moisture - minMoisture) / (maxMoisture - minMoisture)) * 100
            )
        )
    );
    const lowWaterPoint = 20;

    const toggleExpand = () => {
        Animated.timing(animatedHeight, {
            toValue: expanded ? collapsedHeight : expandedHeight,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();

        setExpanded(prev => !prev);
    };

    const calculateAge = () => {

        if (!selectedPlant?.birthday) return;

        const [year, month, day] = selectedPlant.birthday.split('-').map(Number);
        const birthDate = new Date(day, month - 1, year);

        const today = new Date();
        const diffTime = today - birthDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
            setAge(`${diffDays} days old`);
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            setAge(`${weeks} weeks old`);
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            setAge(`${months} months old`);
        } else {
            const years = Math.floor(diffDays / 365);
            setAge(`${years} years old`);
        }
    };

    useEffect(() => {
        calculateAge();
    }, [selectedPlant]);

    return (
        <View
            style={[
                styles.container,
                { height: expanded ? expandedHeight : collapsedHeight },
            ]}
        >
            {/* Expandable Water Level Card */}
            <Animated.View style={[styles.waterLevelCard, { backgroundColor: theme.waterBackground }]}>
                <View style={styles.top}>
                    <TouchableOpacity style={styles.touchableArea} onPress={toggleExpand}>
                        <Entypo name={expanded ? 'chevron-thin-up' : 'chevron-thin-down'} size={20} color="#0178FE" />
                    </TouchableOpacity>

                    <AppText style={styles.waterValue}>
                        {waterLevelPercentage}%
                    </AppText>

                    {/* Urgent care require Text */}
                    {waterLevelPercentage < lowWaterPoint ?
                        <AppText style={styles.topWarningText}>
                            Urgent Care Required
                        </AppText> :
                        <AppText></AppText>
                    }

                </View>
                <View style={styles.bottom}>
                    <View style={[styles.eyesBox, { top: waterLevelPercentage > lowWaterPoint ? '' : '15%', width: waterLevelPercentage > lowWaterPoint ? '120%' : '110%' }]}>
                        {waterLevelPercentage > lowWaterPoint ?
                            <Image
                                source={require('../assets/water-good.png')}
                                style={styles.eyesImg}
                                resizeMode="contain"
                            /> :
                            <Image
                                source={require('../assets/water-bad.png')}
                                style={styles.eyesImgBad}
                                resizeMode="contain"
                            />}

                    </View>
                    <View style={styles.wave}>
                        <Svg width="100%" height="150" viewBox="0 0 441 102" >
                            <Path d="M170.087 14.406C78.0745 29.6486 18.429 11.1531 0.10791 0V101.5H220.5H440.108V3.24597C392.881 22.9497 347.87 21.5316 324.799 19.0532C285.103 14.406 230.343 4.36829 170.087 14.406Z" fill="#0074F6" />
                        </Svg>
                    </View>
                    <View style={styles.waterTextCard}>
                        <AppText style={styles.waterText}>Water Level</AppText>
                    </View>
                </View>
                {expanded && (
                    <View style={styles.extra}>
                        <View style={styles.extraWaterDetailsStart}>
                            <View style={[styles.extraWaterDetails]}>
                                <View style={styles.extraWaterDetailsIcon}>
                                    <Image
                                        source={require('../assets/droplet.png')}
                                        style={styles.extraWaterDetailsIconImg}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={[styles.extraWaterDetailsText]}>
                                    <AppText style={[styles.extraWaterDetailsTextOne]}>{selectedPlant.nickname}'s Birthdate</AppText>
                                    <AppText style={styles.extraWaterDetailsTextTwo}>{selectedPlant.birthday}</AppText>
                                </View>
                            </View>
                            <View style={[styles.extraWaterDetails, { borderLeftWidth: 1, borderLeftColor: '#ffffff' }]}>
                                <View style={styles.extraWaterDetailsIcon}>
                                    <Image
                                        source={require('../assets/timer.png')}
                                        style={styles.extraWaterDetailsIconImg}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={styles.extraWaterDetailsText}>
                                    <AppText style={styles.extraWaterDetailsTextOne}>{selectedPlant.nickname}'s Age</AppText>
                                    <AppText style={styles.extraWaterDetailsTextTwo}>{age}</AppText>
                                </View>
                            </View>

                        </View>
                        <View style={styles.extraWaterDetailsEnd}>
                            {waterLevelPercentage > lowWaterPoint ?
                                <AppText style={styles.extraWaterDetailsTextThree}>
                                    {selectedPlant.nickname} is Healthy and Hydrated.
                                </AppText> :
                                <AppText style={styles.extraWaterDetailsTextThree}>
                                    {selectedPlant.nickname} is Unhappy.
                                </AppText>}

                        </View>
                    </View>
                )}
            </Animated.View>

            {/* Bottom Row */}
            <View style={styles.otherDetails}>
                {/* Humidity */}
                <HumidityCard />

                {/* Temperature */}
                <TemperatureCard />

            </View>
        </View>
    );
};

export default PlantHealthMetrics;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 14,
        borderRadius: defaults.borderRadius,
        overflow: 'hidden',
    },
    waterLevelCard: {
        flex: 1,
        borderRadius: defaults.borderRadius,
        paddingTop: 9,
        marginBottom: 15,
        overflow: 'hidden',
    },
    top: {
        height: 40,
        marginBottom: 12,

    },
    touchableArea: {
        zIndex: 2,
        position: 'absolute',
        height: 60,
        width: 60,
        top: -10,
        right: 0,
        borderRadius: 25,
        display: 'flex',
        alignItems: 'flex-end',
        padding: 12,
    },
    waterValue: {
        fontFamily: defaults.font2,
        fontSize: 28,
        textAlign: 'center',
        paddingLeft: 30,
        color: defaults.waterCardColor,
    },
    topWarningText: {
        fontFamily: defaults.font2,
        textAlign: 'center',
        color: '#E84B15',
    },
    bottom: {
        height: 180,
        overflow: 'hidden',
        borderRadius: defaults.borderRadius,
    },
    eyesBox: {
        backgroundColor: '#2e90ffff',
        right: '9%',
        borderRadius: '50%',
        height: '180%',

    },
    eyesImg: {
        position: 'relative',
        left: "42%",
        top: 12,
        height: 60,
        width: 60,
    },
    eyesImgBad: {
        position: 'relative',
        left: "35%",
        height: 55,
        width: 55,
    },

    wave: {
        width: '100%',
        position: 'absolute',
        bottom: -40,
        paddingBottom: 20,
        display: 'flex',
        justifyContent: 'flex-end',
        height: 60,
        borderRadius: defaults.borderRadius,
    },
    waterTextCard: {
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        bottom: 55,
        width: '100%',

    },
    waterText: {
        fontFamily: defaults.font2,
        color: '#ffffff',
        fontSize: 20,
    },

    extra: {
        top: -40,
        height: '50%',
        backgroundColor: defaults.waterCardColor
    },
    extraWaterDetailsStart: {
        height: 100,
        paddingVertical: 15,
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
        gap: 10

    },
    extraWaterDetails: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderColor: '#ffffff',
    },
    extraWaterDetailsText: {
        gap: 5,
    },
    extraWaterDetailsIcon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
        ,
    },
    extraWaterDetailsIconImg: {
        height: 25,
        width: 25,
    },
    extraWaterDetailsTextOne: {
        color: '#ffffff',
        fontFamily: defaults.font1,
        fontSize: 14,
    },
    extraWaterDetailsTextTwo: {
        color: '#ffffff',
        fontFamily: defaults.font2,
        fontSize: 16,
    },
    extraWaterDetailsTextThree: {
        color: '#ffffff',
        fontFamily: defaults.font2,
        fontSize: 18,
        textAlign: 'center',
    },
    otherDetails: {
        flexDirection: 'row',
        height: '65',
        justifyContent: 'space-between',
        gap: 5,
    },
});
