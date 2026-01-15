// import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList, Platform, BackHandler } from 'react-native'
// import React, { useCallback, useContext, useState, useRef, useEffect } from 'react'
// import AppText from '../components/AppText'
// import { ThemeContext } from '../context/ThemeContext'
// import { MaterialIcons } from '@expo/vector-icons';
// import { defaults } from '../designToken'
// import PlantCard from '../components/ui-components/PlantCard';
// import { PlantContext } from '../context/PlantContext';
// import PlantEditSheet from '../components/PlantEditSheet';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';



// const GardenScreen = () => {

//     const { theme } = useContext(ThemeContext);
//     const navigation = useNavigation();

//     const { plants, addPlant, updatePlant, deletePlant } = useContext(PlantContext);

//     const bottomSheetModalRef = useRef(null);
//     const [selectedPlant, setSelectedPlant] = useState(null);

//     const handleOpenModal = useCallback(() => {
//         bottomSheetModalRef.current?.present();
//     }, []);

//     const closeModal = useCallback(() => {
//         bottomSheetModalRef.current?.dismiss();
//     }, []);

//     const handleEdit = (plant) => {
//         setSelectedPlant(plant);
//         handleOpenModal();
//     };

//     const handleSavePlant = (id, updatedData) => {
//         updatePlant(id, updatedData);
//     };

//     return (
//         <BottomSheetModalProvider>
//             <View style={[styles.container, { backgroundColor: theme.background }]}>

//                 <View style={styles.heading}>
//                     <AppText style={[styles.headingText]}>Your Garden</AppText>
//                     <TouchableOpacity onPress={() => navigation.navigate('AddPlant', { screen: 'AddPlantHardware', })} style={styles.addButton}>
//                         <AppText style={styles.addButtonText}>+</AppText>
//                     </TouchableOpacity>
//                 </View>

//                 {plants.length === 0 ? (
//                     <View style={styles.noPlantContainer}>
//                         <Text style={[styles.noPlantText, { color: theme.text }]}>No plant</Text>
//                     </View>
//                 ) : (
//                     <View styles={styles.garden}>
//                         <FlatList
//                             data={plants}
//                             keyExtractor={(item) => item.id}
//                             renderItem={({ item }) => (
//                                 <PlantCard
//                                     commonName={item.commonName}
//                                     nickname={item.nickname}
//                                     image={item.image}
//                                     onEdit={() => handleEdit(item)}
//                                 />
//                             )}
//                             contentContainerStyle={styles.contentContainer}
//                             showsVerticalScrollIndicator={false}
//                         />

//                         <PlantEditSheet
//                             ref={bottomSheetModalRef}
//                             selectedPlant={selectedPlant}
//                             onSave={handleSavePlant}
//                             closeModal={closeModal}
//                         />

//                     </View>
//                 )}

//             </View>
//         </BottomSheetModalProvider>
//     )
// }

// export default GardenScreen

import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList, Platform, BackHandler } from 'react-native'
import React, { useCallback, useContext, useState, useRef, useEffect } from 'react'
import AppText from '../components/AppText'
import { ThemeContext } from '../context/ThemeContext'
import { MaterialIcons } from '@expo/vector-icons';
import { defaults } from '../designToken'
import PlantCard from '../components/ui-components/PlantCard';
import { PlantContext } from '../context/PlantContext';
import PlantEditSheet from '../components/PlantEditSheet';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';



const GardenScreen = () => {

    const { theme } = useContext(ThemeContext);
    const navigation = useNavigation();

    const { plants, addPlant, updatePlant, deletePlant } = useContext(PlantContext);

    const bottomSheetModalRef = useRef(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleOpenModal = useCallback(() => {
        bottomSheetModalRef.current?.present();
        setIsSheetOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setIsSheetOpen(false);
    }, []);

    const handleEdit = (plant) => {
        setSelectedPlant(plant);
        handleOpenModal();
    };

    const handleSavePlant = (id, updatedData) => {
        updatePlant(id, updatedData);
    };

    // Handle Android back button
    useFocusEffect(
        useCallback(() => {
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
        }, [isSheetOpen, closeModal])
    );

    return (
        <BottomSheetModalProvider>
            <View style={[styles.container, { backgroundColor: theme.background }]}>

                <View style={styles.heading}>
                    <AppText style={[styles.headingText]}>Your Garden</AppText>
                    <TouchableOpacity onPress={() => navigation.navigate('AddPlant', { screen: 'AddPlantHardware', })} style={styles.addButton}>
                        <AppText style={styles.addButtonText}>+</AppText>
                    </TouchableOpacity>
                </View>

                {plants.length === 0 ? (
                    <View style={styles.noPlantContainer}>
                        <Text style={[styles.noPlantText, { color: theme.text }]}>No plant</Text>
                    </View>
                ) : (
                    <View styles={styles.garden}>
                        <FlatList
                            data={plants}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <PlantCard
                                    commonName={item.commonName}
                                    nickname={item.nickname}
                                    image={item.image}
                                    onEdit={() => handleEdit(item)}
                                />
                            )}
                            contentContainerStyle={styles.contentContainer}
                            showsVerticalScrollIndicator={false}
                        />

                        <PlantEditSheet
                            ref={bottomSheetModalRef}
                            selectedPlant={selectedPlant}
                            onSave={handleSavePlant}
                            closeModal={closeModal}
                            onDismiss={() => setIsSheetOpen(false)}
                        />

                    </View>
                )}

            </View>
        </BottomSheetModalProvider>
    )
}

export default GardenScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: '15%',
        paddingHorizontal: defaults.screenHorizontalPadding,
        width: '100%',
    },
    contentContainer: {
        paddingBottom: '20%',
    },
    heading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    addButton: {
        width: 40,
        alignItems: 'center',
    },
    addButtonText: {
        fontFamily: defaults.font3,
        fontSize: 30,
    },
    headingText: {
        fontFamily: defaults.font2,
        fontSize: 22,

    },
    garden: {

    }



})