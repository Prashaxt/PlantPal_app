import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import AppText from '../components/AppText';
import { defaults } from '../designToken';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';


const OnboardingScreen = ({ navigation }) => {

    const completeOnboarding = async () => {
        try {
            // Mark onboarding as completed
            await AsyncStorage.setItem('hasLaunched', 'true');
            
            // Reset navigation to remove onboarding from stack and go to Login
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );
        } catch (error) {
            console.error('Error setting onboarding flag:', error);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.imgContainer}>
                <Image
                    source={require('../assets/onboarding.png')}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.bottom}>
                <Text style={styles.headingText}>Give your Plants the Care they Deserve</Text>
                <Text style={styles.titleText}>Caring for your plants got easier - and a lot more fun!</Text>
                <TouchableOpacity style={styles.continueButton} onPress={completeOnboarding}>
                    <AppText style={styles.continueButtonText}>Continue  →</AppText>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default OnboardingScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imgContainer: {
        height: '68%',
        width: '100%',
        overflow: 'hidden',
        
    },
    image: {
        // flex:1,
        height: "100%",
        width: "100%",
        borderBottomRightRadius: 12,
        borderBottomLeftRadius: 12,
    },
    bottom: {
        height: '25%',
        width: '100%',
        justifyContent: 'center',
        gap: 15,
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    headingText: {
        fontFamily: defaults.font2,
        textAlign: 'center',
        fontSize: 28,
        color: '#006603',
    },
    titleText: {
        fontFamily: defaults.fontFamily,
        textAlign: 'center',
        fontSize: 14,
        color: '#5E5E5E',
        marginBottom: 10,
    },
    continueButton: {
        backgroundColor: defaults.green,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 15,
    },
    continueButtonText: {
        fontFamily: defaults.font1,
        color: '#ffffff',
        fontSize: 18,
    },
});