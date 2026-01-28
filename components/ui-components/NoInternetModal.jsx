import React, { useContext } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    BackHandler
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import AppText from "../AppText";

export default function NoInternetModal({ visible, onRetry }) {

    const { theme, isDark } = useContext(ThemeContext);


    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: theme.background }]}>
                    <AppText style={styles.title}>No Internet Connection</AppText>
                    <AppText style={styles.message}>
                        Please check your internet and try again.
                    </AppText>

                    <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                            <AppText style={styles.retryText}>Retry</AppText>
                        </TouchableOpacity>

                        {Platform.OS === "android" && (
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => BackHandler.exitApp()}
                            >
                                <Text style={styles.closeText}>Close App</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center"
    },
    card: {
        width: "80%",
        padding: 20,
        borderRadius: 12
    },
    title: {
        fontSize: 18,
        fontWeight: "bold"
    },
    message: {
        marginVertical: 10,
        color: "#555"
    },
    modalButtonsContainer: {
        display: 'flex',
    },
    retryBtn: {
        backgroundColor: "#007AFF",
        padding: 12,
        borderRadius: 8,
        marginTop: 10
    },
    retryText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600"
    },
    closeBtn: {
        padding: 12,
        marginTop: 10
    },
    closeText: {
        color: "red",
        textAlign: "center"
    }
});
