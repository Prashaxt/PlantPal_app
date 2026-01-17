import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated,
    Image,
} from "react-native";
import React, { useContext, useRef, useState, useEffect } from "react";
import LottieView from "lottie-react-native";
import AppText from "./AppText";
import { defaults } from "../designToken";
import { ConnectionContext } from "../context/ConnectionContext";
import { PlantContext } from "../context/PlantContext";

import wateringAnimation from "../assets/waterLoading.json";

const WaterNowCard = () => {
    const { updateMotorStatus, hardwareActive } = useContext(ConnectionContext);
    const { selectedPlant } = useContext(PlantContext);

    // Early return if no plant selected
    if (!selectedPlant) return null;

    const duration = Number(selectedPlant?.waterDuration ?? 10);

    const [modalOneVisible, setModalOneVisible] = useState(false);
    const [modalTwoVisible, setModalTwoVisible] = useState(false);
    const [modalThreeVisible, setModalThreeVisible] = useState(false);

    const [percent, setPercent] = useState(0);

    const animationProgress = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef(null);

    const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);


    //
    useEffect(() => {
        if (modalOneVisible) {
        const listener = animationProgress.addListener(({ value }) => {
            setPercent(Math.round(value * 100)); // (0-100 only)
        });

        return () => animationProgress.removeListener(listener);
    }
    }, [modalOneVisible, animationProgress]);

    useEffect(() => {
    if (modalOneVisible) {
      animationProgress.setValue(0);
      setPercent(0);
      Animated.timing(animationProgress, {
        toValue: 1,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          updateMotorStatus(false);
          setModalOneVisible(false);
          setModalTwoVisible(true);
        }
      });
    }
  }, [modalOneVisible, duration, updateMotorStatus]);




    const handleWaterNow = () => {
        if (!updateMotorStatus) {
            Alert.alert("Error", "No hardware connected. Cannot water plant.");
            return;
        }
        else if (!hardwareActive) {
            setModalThreeVisible(true);
            return;
        }

        // Turn motor on
        updateMotorStatus(true);
        
        // Open modal
        setModalOneVisible(true);
    };

    const cancelWatering = () => {
        // Stop animation
        animationProgress.stopAnimation();

        // Stop motor
        if (updateMotorStatus) updateMotorStatus(false);

        // Clear timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setPercent(0);

        setModalOneVisible(false);

    };

    const closeModalTwo = () => {
        setModalTwoVisible(false);
    }
    const closeModalThree = () => {
        setModalThreeVisible(false);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.waterNowButton}
                onPress={handleWaterNow}
                disabled={!updateMotorStatus}
            >
                <AppText style={styles.waterNowText}>Water Now</AppText>
            </TouchableOpacity>

            {/* Watering modal */}
            <Modal visible={modalOneVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalOneBox}>
                        <AppText style={styles.wateringText}>Watering {selectedPlant?.nickname || 'Plant'} </AppText>
                        <View style={{ position: 'relative', width: 250, height: 200 }}>
                            <AnimatedLottieView
                                source={wateringAnimation}
                                autoPlay={false}
                                loop={false}
                                progress={animationProgress}
                                style={{ width: 250, height: 200 }}
                            />
                            <Text
                                style={{
                                    bottom: '60%',
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    textShadowColor: '#0178FE',
                                    textShadowOffset: { width: 1, height: 1 },
                                    textShadowRadius: 2,
                                    textAlign: 'center',
                                }}
                            >
                                {percent} %
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.cancelButton} onPress={cancelWatering}>
                            <AppText style={styles.cancelText}>Cancel</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Watering Completed modal */}
            <Modal visible={modalTwoVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalTwoBox, { backgroundColor: defaults.green }]}>
                        <View style={styles.modalTopLayer}>
                            <TouchableOpacity onPress={closeModalTwo}>
                                <Image
                                    source={require('../assets/close-circle.png')}
                                    style={styles.closeImg}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Image
                                source={require('../assets/flower-smile.png')}
                                style={styles.flowerImg}
                                resizeMode="contain"
                            />
                        </View>
                        <AppText style={styles.wateringDoneText}>Hydration Completed !</AppText>
                        <AppText style={styles.wateringDoneText}>Watered {selectedPlant?.nickname || 'Plant'} for {duration} sec.</AppText>
                    </View>
                </View>
            </Modal>

            {/* Cannot be Watered modal */}
            <Modal visible={modalThreeVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalTwoBox, { backgroundColor: defaults.disconnectedColor }]}>
                        <View style={styles.modalTopLayer}>
                            <TouchableOpacity onPress={closeModalThree}>
                                <Image
                                    source={require('../assets/close-circle.png')}
                                    style={styles.closeImg}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Image
                                source={require('../assets/flower-sad.png')}
                                style={styles.flowerImg}
                                resizeMode="contain"
                            />
                        </View>
                        <AppText style={styles.wateringDoneText}>Cannot Water Plant</AppText>
                        <AppText style={styles.wateringDoneText}>Device is Disconneted.</AppText>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default WaterNowCard;

const styles = StyleSheet.create({
    container: {
        height: 42,
        width: "100%",
        marginBottom: 24,
    },
    waterNowButton: {
        backgroundColor: defaults.green,
        flex: 1,
        borderRadius: defaults.borderRadius,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    waterNowText: {
        color: "#ffffff",
        fontSize: 16,
        fontFamily: defaults.font1,
    },
    wateringText: {
        fontSize: 20,
        fontFamily: defaults.font1,
    },
    wateringDoneText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: defaults.font1,
        textAlign: 'center',
        marginBottom: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalOneBox: {
        width: 220,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        alignItems: "center",
    },
    modalTwoBox: {

        width: 220,
        paddingBottom: 20,
        paddingTop: 10,
        backgroundColor: defaults.green,
        borderRadius: 12,
        alignItems: "center",
    },
    modalTopLayer: {
        paddingBottom: 10,
        position: 'relative',
        left: "40%",
    },
    closeImg: {
        height: 24,
        width: 24,
    },
    flowerImg: {
        height: 155,
        width: 165,
        marginBottom: 12,
    },
    cancelButton: {
        // marginTop: 20,
        backgroundColor: "#ff4d4d",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: defaults.borderRadius,
        width: '100%',

    },
    okayButton: {
        marginTop: 20,
        backgroundColor: defaults.green,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: defaults.borderRadius,
        width: '100%',

    },
    cancelText: {
        color: "#fff",
        fontSize: 16,
        textAlign: 'center',

    },
});