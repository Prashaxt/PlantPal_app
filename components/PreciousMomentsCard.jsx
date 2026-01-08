import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    Modal,
    Text,
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePlants } from '../context/PlantContext';
import { ThemeContext } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Directory, File, Paths } from 'expo-file-system';
import AppText from './AppText';
import { defaults } from '../designToken';

const PreciousMomentsCard = () => {
    const { theme, isDark } = useContext(ThemeContext);
    const { selectedPlant } = usePlants();

    const [plantImages, setPlantImages] = useState([]);
    const [cacheBuster, setCacheBuster] = useState(Date.now());

    const [modalVisible, setModalVisible] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(null);

    if (!selectedPlant) return null;

    // Plant folder
    const plantFolder = new Directory(Paths.document, `plant_${selectedPlant.id}`);
    const plantFolderUri = `${Paths.document}/plant_${selectedPlant.id}/`;

    // Load all images for the selected plant
    // const loadPlantImages = async () => {
    //     try {
    //         // if (!plantFolderUri.exists) {
    //         //     setPlantImages([]);
    //         //     return;
    //         // }
    //         if (!(await plantFolder.exists())) {
    //             setPlantImages([]);
    //             return;
    //         }

    //         // Get all files in the folder
    //         const files = plantFolder.files.filter(f => f.name.endsWith('.jpg'));
    //         const uris = files.map(f => f.uri);

    //         setPlantImages(uris);
    //     } catch (error) {
    //         console.error('Error loading plant images:', error);
    //         setPlantImages([]);
    //     }
    // };
    const loadPlantImages = () => {
        try {
            if (!plantFolder.exists) {
                setPlantImages([]);
                return;
            }

            // Get all contents and filter to image files
            const contents = plantFolder.list();
            const files = contents.filter(f => f instanceof File && f.name.endsWith('.jpg'));
            const uris = files.map(f => f.uri);

            setPlantImages(uris);
        } catch (error) {
            console.error('Error loading plant images:', error);
            setPlantImages([]);
        }
    };

    useEffect(() => {
        loadPlantImages();
    }, [selectedPlant]);

    // Add a new image
    const addImage = async () => {

        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission required', 'Please allow access to your photo library.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (result.canceled) return;

            const selectedUri = result.assets[0].uri;

            // Resize/compress image
            const manipResult = await ImageManipulator.manipulateAsync(
                selectedUri,
                [{ resize: { width: 512 } }], // maintain aspect ratio
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );

            // Ensure folder exists
            if (!(await plantFolder.exists)) {
                await plantFolder.create({ intermediates: true });
            }

            const destFile = new File(plantFolder.uri, `${Date.now()}.jpg`);
            await new File(manipResult.uri).copy(destFile);

            // Add new image at the START of the list
            setPlantImages(prev => [destFile.uri, ...prev]);
            setCacheBuster(Date.now());
        } catch (error) {
            console.error('Error adding plant image:', error);
            Alert.alert('Error', 'Failed to add image.');
        }
    };

    // Delete an image
    const deleteImage = async index => {
        try {
            const fileToDelete = new File(plantImages[index]);
            if (fileToDelete.exists) {
                await fileToDelete.delete();
            }

            const updated = plantImages.filter((_, i) => i !== index);
            setPlantImages(updated);
            setModalVisible(false);
            setCacheBuster(Date.now());
        } catch (error) {
            console.error('Error deleting image:', error);
            Alert.alert('Error', 'Failed to delete image.');
        }
    };

    // Open modal
    const openImage = index => {
        setActiveImageIndex(index);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                {isDark
                    ?
                    <Image
                        source={require('../assets/momentsIconDark.png')}
                        style={styles.preciousMomentsIcon}
                        resizeMode="cover"
                    />
                    :
                    <Image
                        source={require('../assets/momentsIconLight.png')}
                        style={styles.preciousMomentsIcon}
                        resizeMode="cover"
                    />
                }
                <AppText style={[styles.preciousMomentsText, { color: theme.text }]}>Precious Moments</AppText>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {/* Add Button */}
                <TouchableOpacity
                    style={[styles.photoCard, styles.addButton, { backgroundColor: theme.card }]}
                    onPress={addImage}
                >
                    <Entypo name="plus" size={24} color="#B2B2B2" />
                </TouchableOpacity>

                {/* Plant Images */}
                {plantImages.map((uri, index) => (
                    <TouchableOpacity
                        key={uri}
                        style={styles.photoCard}
                        onPress={() => openImage(index)}
                    >
                        <Image
                            source={{ uri: uri + '?cb=' + cacheBuster }}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>


            {/* Fullscreen Modal */}
            {/* <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <Image
                        source={{ uri: plantImages[activeImageIndex] + '?cb=' + cacheBuster }}
                        style={styles.fullscreenImage}
                    />
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteImage(activeImageIndex)}
                    >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal> */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalCloseArea}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    />

                    <Image
                        source={{
                            uri: activeImageIndex !== null
                                ? plantImages[activeImageIndex] + '?cb=' + cacheBuster
                                : undefined,
                        }}
                        style={styles.fullscreenImage}
                        resizeMode="contain"
                    />

                    {/* Delete Button - Bottom Right */}
                    <TouchableOpacity
                        style={[styles.fabButton, styles.deleteFab]}
                        onPress={() => {
                            if (activeImageIndex !== null) {
                                deleteImage(activeImageIndex);
                            }
                        }}
                    >
                        <MaterialIcons name="delete" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Close Button - Bottom Left */}
                    <TouchableOpacity
                        style={[styles.fabButton, styles.closeFab]}
                        onPress={() => setModalVisible(false)}
                    >
                        <MaterialIcons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default PreciousMomentsCard;

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    top: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    preciousMomentsIcon: {
        height: 20,
        width: 20,
    },
    preciousMomentsText: {
        fontSize: 18,
        fontFamily: defaults.font1,
    },
    scrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 20,
        paddingRight: 20,
    },
    photoCard: {
        width: 120,
        height: 115,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    addButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#dedcdc',
        borderStyle: 'dashed',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    fullscreenImage: {
        width: '95%',
        height: '75%',
        borderRadius: 12,
    },
    fabButton: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    deleteFab: {
        bottom: 40,
        right: 30,
        backgroundColor: '#d32f2f',
    },
    closeFab: {
        bottom: 40,
        left: 30,
        backgroundColor: '#424242',
    },
});
