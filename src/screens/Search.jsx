import { observer } from 'mobx-react';
import { Alert, ScrollView, Text, TouchableOpacity, View, FlatList, StyleSheet } from 'react-native';
import { useLayoutEffect, useState } from 'react';
import scheduleStore from '../store/ScheduleStore';
import { Icon } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import DateTimePicker from '@react-native-community/datetimepicker';
import authStore from '../store/AuthStore';
import RNPickerSelect from 'react-native-picker-select';
import IonIcon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';

const Search = (props) => {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [endDate, setEndDate] = useState(new Date().getTime());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const sevenDaysAgo = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(sevenDaysAgo.getTime());

  useLayoutEffect(() => {
    scheduleStore.getSchedules();
  }, []);
  useLayoutEffect(() => {}, [scheduleStore.sce]);
  const nav = useNavigation();
  // console.log(JSON.stringify(scheduleStore.sce));

  const convertDateToTimestamp = (date) => {
    // Chuyển đổi ngày tháng năm từ DateTimePicker thành timestamp
    const selectedDate = new Date(date);
    return selectedDate.getTime(); // Trả về giá trị timestamp
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const timestamp = convertDateToTimestamp(selectedDate);
      setStartDate(timestamp);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const timestamp = convertDateToTimestamp(selectedDate);
      setEndDate(timestamp);
    }
  };

  const showStartDatepicker = () => {
    setShowStartDatePicker(true);
  };

  const showEndDatepicker = () => {
    setShowEndDatePicker(true);
  };

  const handleSaveToFile = async () => {
    if (!permissionResponse.granted) {
      requestPermission();
      return;
    }
    if (filteredStudents.length === 0) {
      Alert.alert('Alert', 'There are no students to save to the file.');
      return;
    }
    // console.log('filter::' + JSON.stringify(filteredStudents));

    let csvContent = 'STT,Student Name,Student ID,Day Check In ,Time Check In,Class,Subject,Teacher Name\n';
    try {
      let stt = 1;
      filteredStudents.forEach((student) => {
        csvContent += `${stt},${student.name},${student.msv},${new Date(student.check_at.seconds * 1000).toLocaleString(
          'vi-VN',
        )},${student.classes},${student.subject},${authStore.user.name}\n`;
        stt++;
      });
      //,${student.teacher_id}Teacher ID,
      // console.log(csvContent);
      const fileUri =
        FileSystem.documentDirectory +
        `${selectedClass}_${selectedSubject}` +
        // '_' +
        // new Date(startDate).getDate() +
        // '_' +
        // (new Date(startDate).getMonth() + 1) +
        // '_' +
        // new Date(startDate).getFullYear() +
        // '_' +
        // new Date(endDate).getDate() +
        // '_' +
        // (new Date(endDate).getMonth() + 1) +
        // '_' +
        // new Date(endDate).getFullYear() +
        '_' +
        new Date().getTime() +
        '.xlsx';
      console.log(fileUri);
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };
  // console.log(JSON.stringify(data));

  const handleSearch = () => {
    if (selectedClass && selectedSubject && startDate && endDate) {
      const sevenDaysBeforeEndDate = endDate - 7 * 24 * 60 * 60 * 1000; // Calculate 7 days before the end date
      if (startDate > endDate) {
        Alert.alert('Alert', 'Start date cannot be after end date.', [
          {
            text: 'OK',
            style: 'cancel',
          },
        ]);
        return;
      }
      const filtered = scheduleStore.sce.filter((schedule) => {
        const scheduleDate = schedule.checked_at.seconds * 1000;
        return (
          schedule.classes.name === selectedClass &&
          schedule.subject.name === selectedSubject &&
          scheduleDate >= startDate &&
          scheduleDate <= endDate
        );
      });

      const students = filtered.map((schedule) => ({
        name: schedule.user.name,
        msv: schedule.user.msv,
        check_at: schedule.checked_at,
        classes: schedule.classes.name,
        subject: schedule.subject.name,
        teacher_id: schedule.teacher_id,
      }));
      // console.log('stu1:' + JSON.stringify(students));
      setFilteredStudents(students);
    } else {
      handleMissingFields();
    }
  };

  const handleMissingFields = () => {
    let errorMessage = '';

    if (!selectedClass) {
      errorMessage += 'Please select a class.\n';
    }

    if (!selectedSubject) {
      errorMessage += 'Please select a subject.\n';
    }

    if (!startDate || !endDate) {
      errorMessage += 'Please select both start date and end date.\n';
    }

    if (errorMessage) {
      Alert.alert('Alert', errorMessage, [
        {
          text: 'OK',
          style: 'cancel',
        },
      ]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 40, right: 0 }}>
        <TouchableOpacity
          onPress={() => {
            nav.goBack();
          }}
          activeOpacity={0.7}
          style={{ paddingLeft: 5, paddingRight: 15, marginLeft: 12 }}
        >
          <IonIcon name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 0 }}>Attendance list</Text>
      </View>
      <ScrollView>
        <View style={styles.container}>
          <RNPickerSelect
            placeholder={{ label: 'Select a class', value: null }}
            onValueChange={(value) => setSelectedClass(value)}
            items={scheduleStore.classes.map((cls) => ({
              label: cls.name,
              value: cls.name,
            }))}
            style={pickerSelectStyles}
          />
          <RNPickerSelect
            placeholder={{ label: 'Select a subject', value: null }}
            onValueChange={(value) => setSelectedSubject(value)}
            items={scheduleStore.subject.map((sub) => ({
              label: sub.name,
              value: sub.name,
            }))}
            style={pickerSelectStyles}
          />
          <View style={{ alignItems: 'center', justifyContent: 'space-evenly', flexDirection: 'row' }}>
            <View style={{ marginRight: 0 }}>
              <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>From Date:</Text>
              <TouchableOpacity onPress={showStartDatepicker} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon source="calendar" size={24} color="black" style={{ marginRight: 5 }} />
                <Text style={{ fontWeight: 'bold' }}>
                  {` ${new Date(startDate).getDate()}/${new Date(startDate).getMonth() + 1}/${new Date(
                    startDate,
                  ).getFullYear()}`}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 0 }}>
              <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>To Date:</Text>
              <TouchableOpacity onPress={showEndDatepicker} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon source="calendar" size={24} color="black" style={{ marginRight: 5 }} />
                <Text style={{ fontWeight: 'bold' }}>
                  {` ${new Date(endDate).getDate()}/${new Date(endDate).getMonth() + 1}/${new Date(
                    endDate,
                  ).getFullYear()}`}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={new Date(startDate)}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={handleStartDateChange}
                dateFormat="day month year" // Hiển thị ngày tháng năm
              />
            )}
            {showEndDatePicker && (
              <DateTimePicker
                value={new Date(endDate)}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={handleEndDateChange}
                dateFormat="day month year" // Hiển thị ngày tháng năm
              />
            )}
          </View>

          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSaveToFile} style={styles.saveFile}>
            <Text style={styles.buttonText}>Save to File</Text>
          </TouchableOpacity>
          <View>
            <FlatList
              data={filteredStudents}
              renderItem={({ item }) => (
                <View style={styles.studentItem}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Name: {item.name}</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>MSV: {item.msv}</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                    Check_at: {new Date(item.check_at.seconds * 1000).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              // scrollEnabled={true}
              style={{ flex: 1, height: 300 }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default observer(Search);
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchButton: {
    backgroundColor: 'blue',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderRadius: 10,
  },
  saveFile: {
    backgroundColor: 'blue',
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  studentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    padding: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    marginBottom: 10,
  },

  inputAndroid: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    marginBottom: 10,
  },
});
