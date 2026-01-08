import React, {
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Switch,
    Platform,
    KeyboardAvoidingView,
    BackHandler,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import AppText from '../components/AppText';
import { ThemeContext } from '../context/ThemeContext';
import { PlantContext } from '../context/PlantContext';
import { defaults } from '../designToken';
import { plantMascotImages } from './plantMascotImages';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const durations = [5, 10, 15, 20, 30];

const PlantEditSheet = forwardRef(({ selectedPlant, closeModal }, ref) => {
    const { theme } = useContext(ThemeContext);
    const { updatePlant, deletePlant } = useContext(PlantContext);

    const snapPoints = useMemo(() => ['90%'], []);

    // Initialize local state with a copy of selectedPlant
    const [plantData, setPlantData] = useState(() => selectedPlant || {});
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Reset unsaved changes whenever sheet is reopened with a new plant
    useEffect(() => {
        if (selectedPlant) {
            setPlantData({ ...selectedPlant });
        }
    }, [selectedPlant]);

    // Helper: update local state
    const handleChange = (key, value) => {
        setPlantData(prev => ({ ...prev, [key]: value }));
    };

    // Format date as DD-MM-YYYY
    const formatDate = date => {
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${d.getFullYear()}`;
    };

    // Save changes to Firebase via PlantContext
    const handleSave = async () => {
        try {
            await updatePlant(plantData.id, {
                nickname: plantData.nickname,
                birthday: plantData.birthday,
                imageIndex: plantData.imageIndex,
                autoWateredEnabled: plantData.autoWateredEnabled,
                waterDuration: plantData.waterDuration,
            });
            closeModal();
        } catch (err) {
            Alert.alert('Error', 'Failed to save changes');
        }
    };

    // Delete plant
    const handleDelete = () => {
        Alert.alert(
            'Delete Plant',
            'Are you sure you want to delete this plant?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deletePlant(plantData.id);
                        closeModal();
                    },
                },
            ]
        );
    };

    // BottomSheet backdrop
    const renderBackdrop = useCallback(
        props => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
                opacity={0.2}
            />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            onDismiss={() => setPlantData({ ...selectedPlant })}
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor: theme.background,
                borderTopWidth: 3,
                borderColor: '#dedcdcff',
            }}
            handleIndicatorStyle={{
                backgroundColor: '#dedcdcff',
                height: 6,
                width: 50,
            }}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <BottomSheetScrollView>
                    <KeyboardAwareScrollView
                        contentContainerStyle={styles.container}
                        enableOnAndroid={true}
                        keyboardOpeningTime={0}
                        extraScrollHeight={20} // space above keyboard
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.card}>
                            <View style={styles.cardLeft}>
                                <View style={styles.imageBox}>
                                    <Image
                                        source={plantMascotImages[plantData.imageIndex] || plantMascotImages[0]}
                                        style={styles.image}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <AppText style={styles.nickname}>{plantData.nickname}</AppText>
                                    <AppText style={styles.commonName}>{plantData.commonName}</AppText>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleDelete}>
                                <AppText style={styles.removePlant}>Remove</AppText>
                            </TouchableOpacity>
                        </View>

                        <AppText style={styles.hid}>Hardware ID: {plantData.hardwareId}</AppText>

                        {/* Mascot selection */}
                        <AppText style={styles.label}>Mascot: </AppText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.imageRow}
                        >
                            {plantMascotImages.map((img, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleChange('imageIndex', index)}
                                    style={[
                                        styles.imageOption,
                                        plantData.imageIndex === index && styles.selectedImageBorder,
                                    ]}
                                >
                                    <Image source={img} style={styles.imageThumbnail} resizeMode="contain" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Auto Water */}
                        {/* <View style={styles.editRow}>
                            <AppText style={styles.label}>Auto Water</AppText>
                            <Switch
                                value={plantData.autoWateredEnabled}
                                onValueChange={v => handleChange('autoWateredEnabled', v)}
                            />
                        </View> */}

                        {/* Nickname */}
                        <View style={styles.editRow}>
                            <AppText style={styles.label}>Nickname</AppText>
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                value={plantData.nickname}
                                onChangeText={t => handleChange('nickname', t)}
                            />
                        </View>

                        {/* Birthday */}
                        <View style={styles.editRow}>
                            <AppText style={styles.label}>Birthday</AppText>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <AppText>{plantData.birthday || 'Select date'}</AppText>
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={plantData.birthday ? new Date(plantData.birthday.split('-').reverse().join('-')) : new Date()}
                                maximumDate={new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                onChange={(e, date) => {
                                    setShowDatePicker(false);
                                    if (date) handleChange('birthday', formatDate(date));
                                }}
                            />
                        )}

                        {/* Water Duration */}
                        <View style={styles.editRow}>
                            <AppText style={styles.label}>Water Duration</AppText>
                            {/* <Picker
                                selectedValue={plantData.waterDuration?.toString() || '5'}
                                onValueChange={v => handleChange('waterDuration', Number(v))}
                                style={styles.input}
                            >
                                {durations.map(v => (
                                    <Picker.Item key={v} label={`${v} seconds`} value={v.toString()} />
                                ))}
                            </Picker> */}
                            <Picker
                                selectedValue={plantData.waterDuration?.toString() || '5'}
                                onValueChange={(v) => handleChange('waterDuration', Number(v))}
                                style={[styles.input, { color: theme.text }]}
                                itemStyle={{ color: theme.text }}
                                dropdownIconColor={theme.text}
                                mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
                            >
                                {durations.map(v => (
                                    <Picker.Item key={v} label={`${v} seconds`} value={v.toString()} />
                                ))}

                            </Picker>
                        </View>

                        {/* Save button */}
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <AppText style={styles.saveText}>Save Changes</AppText>
                        </TouchableOpacity>
                    </KeyboardAwareScrollView>
                </BottomSheetScrollView>
            </KeyboardAvoidingView>
        </BottomSheetModal>
    );
});

export default PlantEditSheet;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20,
        paddingBottom: 40,
    },
    input: {
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        flex: 1,
        maxWidth: '70%',
        borderColor: '#abababff',
    },
    hid: {
        fontSize: 14,
        fontFamily: defaults.font3,
        color: '#a4a4a4',
    },
    label: {
        fontSize: 18,
        fontFamily: defaults.font2,
    },
    removePlant: {
        fontSize: 12,
        color: '#b53a10',
        fontFamily: defaults.font2,
    },
    editRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: defaults.green,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    saveText: {
        color: 'white',
        fontWeight: 'bold',
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLeft: {
        flexDirection: 'row',
    },
    imageBox: {
        width: 50,
        height: 50,
    },
    image: {
        width: '100%',
        height: '100%',
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
        fontWeight: '700',
        fontSize: 14,
        opacity: 0.5,
    },
    imageRow: {
        flexDirection: 'row',
        gap: 10,
    },
    imageOption: {
        width: 90,
        height: 90,
    },
    selectedImageBorder: {
        borderColor: '#4CAF50',
        borderWidth: 1,
        borderRadius: 10,
    },
    imageThumbnail: {
        width: '100%',
        height: '100%',
    },
});
