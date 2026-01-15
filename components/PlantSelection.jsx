import { lightTheme, darkTheme, defaults } from '../designToken';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, BackHandler } from 'react-native';
import AppText from '../components/AppText';
import React, { useCallback, useContext, useMemo, forwardRef, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { ConnectionContext } from '../context/ConnectionContext';
import Entypo from '@expo/vector-icons/Entypo';
import { PlantContext } from '../context/PlantContext';
import { FlatList } from 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetView, BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet';


//Plant Selection Bottom Sheet --------------------------------------------------------------------------------

const PlantSelectionSheet = forwardRef(({ closeModal, ...props }, ref) => {
    const { plants, selectPlant } = useContext(PlantContext);
    const { theme } = useContext(ThemeContext);

    const snapPoints = useMemo(() => ['60%'], []);

    const handleSelect = useCallback(
        (plant) => {
            console.log('Selected plant:', plant);
            selectPlant(plant);
            setTimeout(() => closeModal(), 0);
        },
        [selectPlant, closeModal]
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity style={sheetStyles.card} onPress={() => handleSelect(item)}>
            <View style={sheetStyles.imageBox}>
                <Image source={item.image} style={sheetStyles.image} resizeMode="contain" />
            </View>
            <View style={sheetStyles.textContainer}>
                <AppText style={[sheetStyles.nickname, { color: theme.text }]}>{item.nickname}</AppText>
                <View style={{ flexDirection: 'row' }}>
                    <AppText style={[sheetStyles.commonName]}>{item.commonName} </AppText>
                    <AppText style={[sheetStyles.commonName]}>• {item.commonName}</AppText>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderBackdrop = useCallback(
        (backdropProps) => (
            <BottomSheetBackdrop
                {...backdropProps}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.2}
                pressBehavior="close"
                onPress={() => {
                    ref.current?.dismiss();
                }}
            />
        ),
        []
    );


    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            style={[sheetStyles.modalStyle]}
            handleIndicatorStyle={{ backgroundColor: '#dedcdcff', height: 6, width: 50 }}
            backgroundStyle={{ backgroundColor: theme.background, borderTopWidth: 3, borderColor: '#dedcdcff' }}
            backdropComponent={renderBackdrop}
            enableContentPanningGesture={true}
            {...props}
        >

            <BottomSheetView style={[sheetStyles.container]}>
                <View style={[sheetStyles.bottomView]}>
                    <FlatList
                        data={plants}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 20 }}
                        style={sheetStyles.flatlist}
                    />
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

//PlantSelection ---------------------------------------------------------------------------------

const PlantSelection = () => {
    const { theme } = useContext(ThemeContext);
    const { hardwareActive } = useContext(ConnectionContext);
    const { selectedPlant } = useContext(PlantContext);

    const bottomSheetModalRef = React.useRef(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleOpenModal = useCallback(() => {
        bottomSheetModalRef.current?.present();
        setIsSheetOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setIsSheetOpen(false);
    }, []);

    const handleOpenSelection = () => {
        handleOpenModal();
    };

    // Handle Android back button
    useEffect(() => {
        const onBackPress = () => {
            if (isSheetOpen) {
                closeModal();
                return true; // Prevent default back behavior
            }
            return false; // Allow default back behavior
        };

        if (Platform.OS === 'android') {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                backHandler.remove();
            };
        }
    }, [isSheetOpen, closeModal]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View
                style={[
                    styles.activeStatusBorder,
                    styles.plantDetails,
                    { borderColor: hardwareActive ? theme.connectedColor : defaults.disconnectedColor },
                ]}
            >

                <View style={styles.left}>
                    {selectedPlant ? (
                        <>
                            <Image
                                source={selectedPlant.image}
                                style={styles.mascotImage}
                                resizeMode="cover"
                            />
                            <View style={styles.plantNames}>
                                <AppText style={styles.englishCommonName}>{selectedPlant.commonName}</AppText>
                                <AppText style={[styles.nickname]}>{selectedPlant.nickname}</AppText>
                            </View>
                        </>
                    ) : (
                        <View style={[styles.mascotPlaceholder, { justifyContent: 'center', alignItems: 'center' }]}>
                            <AppText style={{ color: 'grey' }}>No plant</AppText>
                        </View>
                    )}
                </View>
            </View>

            <View
                style={[
                    styles.activeStatusBorder,
                    styles.addButton,
                    { borderColor: hardwareActive ? theme.connectedColor : defaults.disconnectedColor },
                ]}
            >
                <TouchableOpacity onPress={handleOpenSelection} style={styles.addButtonpPressable}>
                    <Entypo name="chevron-small-down" size={24} color="#8F9983" />
                </TouchableOpacity>
                <PlantSelectionSheet
                    ref={bottomSheetModalRef}
                    closeModal={closeModal}
                    onDismiss={() => setIsSheetOpen(false)}
                />
            </View>
        </View>
    );
};

export default PlantSelection;

const sheetStyles = StyleSheet.create({
    modalStyle: {
        paddingTop: 10,
    },

    container: {
        flex: 1,
        height: '100%',
    },
    bottomView: {
        height: '90%',
    },
    bottomView2: {
        height: '10%',
    },
    flatlist: {
        flex: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dedcdcff',
    },
    imageBox: {
        width: 50,
        height: 50,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    textContainer: {
        height: 60,
        marginLeft: 12,
        justifyContent: 'space-evenly',
    },
    nickname: {
        fontFamily: defaults.font2,
        fontSize: 21,
    },
    commonName: {
        fontFamily: defaults.font1,
        fontWeight: 650,
        fontSize: 14,
        opacity: 0.5,
    },
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 66,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 7,
        marginBottom: 24,
    },
    activeStatusBorder: {
        borderWidth: 1,
        borderRadius: defaults.borderRadius,
    },
    plantDetails: {
        height: '100%',
        flexDirection: 'row',
        flex: 5,
        paddingVertical: 9,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 9,
        paddingRight: 16,
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
    connectionStatus: {
        fontSize: 10,
        color: defaults.connectedColor,
    },
    addButton: {
        flex: 1,
        height: '100%',
    },
    addButtonpPressable: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});