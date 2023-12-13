import { observer } from 'mobx-react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import scheduleStore from '../store/ScheduleStore';
import { Button, Icon, MD3Colors } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import DateTimePicker from '@react-native-community/datetimepicker';
import authStore from '../store/AuthStore';
import RNPickerSelect from 'react-native-picker-select';
import IonIcon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { ROLES } from '../enum/role';
import * as Location from 'expo-location';

const Search = (props) => {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [startDate, setStartDate] = useState(new Date().getTime()); // Sử dụng timestamp thay vì đối tượng Date
  const [endDate, setEndDate] = useState(new Date().getTime());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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

  useLayoutEffect(() => {
    scheduleStore.getSchedules();
  }, []);
  useLayoutEffect(() => {}, [scheduleStore.sce]);
  // useEffect(() => {
  //   setStartDate(new Date());
  //   setEndDate(new Date());
  // }, []);
  const nav = useNavigation();
  // console.log(JSON.stringify(scheduleStore.sce));

  const handleSaveToFile = async () => {
    if (!permissionResponse.granted) {
      requestPermission();
      return;
    }
    console.log('filter::' + filteredStudents);

    let csvContent = 'Student Name,Student ID,Day Check In ,Time Check In,Class,Subject,Teacher ID\n';
    try {
      filteredStudents.forEach((student) => {
        csvContent += `${student.name},${student.msv},${new Date(student.check_at.seconds * 1000).toLocaleString()},${
          student.classes
        },${student.subject},${student.teacher_id}\n`;
      });
      // console.log(csvContent);
      const fileUri =
        FileSystem.documentDirectory + `${selectedClass}_${selectedSubject}` + '_' + new Date().getTime() + '.xlsx';
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

  // const handleSearch = () => {
  //   if (selectedClass && selectedSubject && startDate && endDate) {
  //     const filtered = scheduleStore.sce.filter((schedule) => {
  //       return (
  //         schedule.classes.name === selectedClass &&
  //         schedule.subject.name === selectedSubject &&
  //         schedule.checked_at.seconds * 1000 >= startDate.getTime() &&
  //         schedule.checked_at.seconds * 1000 <= endDate.getTime()
  //       );
  //     });

  //     const students = filtered.map((schedule) => {
  //       return {
  //         name: schedule.user.name,
  //         msv: schedule.user.msv,
  //         check_at: schedule.checked_at,
  //         classes: schedule.classes.name,
  //         subject: schedule.subject.name,
  //         teacher_id: schedule.teacher_id,
  //       };
  //     });
  //     console.log('stu:: ' + students);
  //     setFilteredStudents(students);
  //   } else {
  //     // Handle case where one or more fields are missing
  //     // You can show an alert or perform appropriate error handling
  //   }
  // };
  const handleSearch = () => {
    if (selectedClass && selectedSubject && startDate && endDate) {
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
    <View>
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
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 0 }}>Attendance list by class and subject</Text>
      </View>
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
        <View style={{ alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row' }}>
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

        <FlatList
          data={filteredStudents}
          renderItem={({ item }) => (
            <View style={styles.studentItem}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Name: {item.name}</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>MSV: {item.msv}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
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
    fontSize: 16,
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
