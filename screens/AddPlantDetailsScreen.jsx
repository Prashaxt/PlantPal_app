import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PlantContext } from '../context/PlantContext';
import { ThemeContext } from '../context/ThemeContext';
import AppText from '../components/AppText';
import { defaults } from '../designToken';
import { plantMascotImages } from '../components/plantMascotImages';
import { Switch } from 'react-native';

const AddPlantDetailsScreen = ({ route, navigation }) => {
  const { hardwareId } = route.params;
  const { addPlant } = useContext(PlantContext);
  const { theme } = useContext(ThemeContext);

  const [nickname, setNickname] = useState('');
  const [commonName, setCommonName] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [birthday, setBirthday] = useState(null);
  const [autoWateredEnabled, setAutoWateredEnabled] = useState(false);
  const [waterDuration, setWaterDuration] = useState('10');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const durations = ['5', '10', '15', '20', '30'];

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSave = async () => {
    if (!commonName.trim()) {
      Alert.alert('Missing Info', 'Please enter a common name for your plant');
      return;
    }
    if (!nickname.trim()) {
      Alert.alert('Missing Info', 'Please give your plant a nickname');
      return;
    }

    const newPlant = {
      hardwareId,
      commonName: commonName.trim(),
      nickname: nickname.trim(),
      imageIndex: selectedImageIndex,
      birthday: birthday ? formatDate(birthday) : formatDate(new Date()),
      autoWateredEnabled,
      waterDuration: parseInt(waterDuration),
    };

    try {
      await addPlant(newPlant);
      Alert.alert('Success!', `${nickname} has been added!`, [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Garden', {
              screen: 'GardenHome',
            });
          }
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save plant. Try again.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <AppText style={styles.title}>Plant Details</AppText>
      <AppText style={styles.hardwareText}>Hardware ID: {hardwareId}</AppText>

      {/* Mascot Selection */}
      <AppText style={styles.label}>Choose a Mascot:</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
        {plantMascotImages.map((img, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedImageIndex(index)}
            style={[
              styles.imageOption,
              selectedImageIndex === index && styles.selectedImageBorder,
            ]}
          >
            <Image source={img} style={styles.imageThumbnail} resizeMode="contain" />

          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nickname */}
      <View style={styles.row}>
        <AppText style={styles.label}>Nickname:</AppText>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={nickname}
          onChangeText={setNickname}
          placeholder="e.g. Rosie"
          placeholderTextColor="#999"
        />
      </View>

      {/* Common Name */}
      <View style={styles.row}>
        <AppText style={styles.label}>Common Name:</AppText>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={commonName}
          onChangeText={setCommonName}
          placeholder="e.g. Rose, Monstera"
          placeholderTextColor="#999"
        />
      </View>

      {/* Birthday */}
      <View style={styles.row}>
        <AppText style={styles.label}>Birthday:</AppText>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          <AppText style={{ color: theme.text }}>
            {birthday ? formatDate(birthday) : 'Today (default)'}
          </AppText>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={birthday || new Date()}
          mode="date"
          maximumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setBirthday(date);
          }}
        />
      )}

      {/* Auto Water */}
      {/* <View style={styles.row}>
        <AppText style={styles.label}>Auto Watering</AppText>
        <Switch
          value={autoWateredEnabled}
          onValueChange={setAutoWateredEnabled}
        />
      </View> */}

      {/* Water Duration */}
      <View style={styles.row}>
        <AppText style={styles.label}>Water Duration:</AppText>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={waterDuration}
            onValueChange={(value) => setWaterDuration(value)}
            style={[styles.picker, { color: theme.text }]}
            itemStyle={{ color: theme.text }}
            dropdownIconColor={theme.text}
            mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
          >
            {durations.map((d) => (
              <Picker.Item key={d} label={`${d} seconds`} value={d} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <AppText style={styles.saveText}>Add Plant</AppText>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddPlantDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 18, paddingBottom: 10 },
  title: { fontSize: 26, fontFamily: defaults.font2, },
  hardwareText: { fontSize: 16, color: '#666', },
  label: { fontSize: 16, fontFamily: defaults.font2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    maxWidth: '62%',
    backgroundColor: defaults.backgroundColor,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: defaults.backgroundColor,
    minWidth: 150,
    justifyContent: 'center',
  },
  imageRow: { marginVertical: 10 },
  imageOption: { width: 90, height: 90, marginRight: 12 },
  imageThumbnail: { width: '100%', height: '100%' },
  selectedImageBorder: { borderWidth: 3, borderColor: defaults.green, borderRadius: 14 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' },
  picker: { height: 50, width: 160 },
  saveButton: {
    backgroundColor: defaults.green,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});