import { observer } from 'mobx-react';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Button } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import scheduleStore from '../store/ScheduleStore';
import IonIcon from 'react-native-vector-icons/Ionicons';
import authStore from '../store/AuthStore';

const ListSchedules = (props) => {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [hovered, setHovered] = useState(false);
  const nav = useNavigation();
  useEffect(() => {
    scheduleStore.listenSc();
  }, []);
  // console.log(scheduleStore.sc)
  const data = scheduleStore.sc;
  const [attendancesByDate, setAttendancesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const groupedByDate = {};
    data.forEach((item) => {
      const checkedAt = new Date(item.checked_at);
      const formattedDate = `${checkedAt.getDate()}/${checkedAt.getMonth() + 1}/${checkedAt.getFullYear()}`;

      if (!groupedByDate[formattedDate]) {
        groupedByDate[formattedDate] = [];
      }
      groupedByDate[formattedDate].push(item);
    });
    setAttendancesByDate(groupedByDate);
  }, [data]);

  const handleExportFile = async () => {
    if (!permissionResponse.granted) {
      requestPermission();
      return;
    }

    const csvHeaders = 'STT,Student Name,Student ID,Day Check In,Time Check In,Class,Subject,Teacher Name\n';
    let csvContent = csvHeaders;

    try {
      let stt = 1;
      data.forEach((student) => {
        const checkedAt = new Date(student.checked_at);
        const day = checkedAt.toLocaleDateString('vi-VN');
        const time = checkedAt.toLocaleTimeString('vi-VN');

        csvContent += `${stt},${student.name},${student.ID},${day},${time},${student.class},${student.subject},${authStore.user.name}\n`;
        stt++;
      });

      const fileUri = FileSystem.documentDirectory + 'List Attentdance_' + new Date().getTime() + '.xlsx';
      console.log(fileUri);
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error('Error saving or sharing file:', error);
    }
  };
  const handleExportButtonHover = () => {
    setHovered(true);
  };

  const handleExportButtonUnhover = () => {
    setHovered(false);
  };

  const renderItem = ({ item }) => {
    const checkedAt = new Date(item.checked_at);
    const time = checkedAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.boldText}>Name: {item.name}</Text>
        <Text style={styles.boldText}>Class: {item.class}</Text>
        <Text style={styles.text}>Subject: {item.subject}</Text>
        <Text style={styles.text}>Student ID: {item.ID}</Text>
        <Text style={styles.text}>Time Attendance: {time}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 30 }}>
        <TouchableOpacity
          onPress={() => {
            nav.goBack();
          }}
          activeOpacity={0.7}
          style={{ paddingLeft: 5, paddingRight: 15, marginLeft: 5 }}
        >
          <IonIcon name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 0 }}>List Attendance by Date</Text>
      </View>

      <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={handleExportFile}
          onMouseEnter={handleExportButtonHover} // Sự kiện hover vào
          onMouseLeave={handleExportButtonUnhover} // Sự kiện hover ra mode="contained" title="Export File"
          style={[
            styles.exportButton,
            {
              backgroundColor: hovered ? '#6b6b8e' : '#9494b8', // Màu sắc khi hover và khi không hover
            },
          ]}
        >
          <Text style={styles.exportButtonText}>Export File</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <FlatList
          data={Object.keys(attendancesByDate)}
          renderItem={({ item }) => (
            <List.Accordion
              title={item}
              style={styles.dateContainer}
              expanded={selectedDate === item}
              onPress={() => setSelectedDate(selectedDate === item ? null : item)}
            >
              <FlatList
                data={attendancesByDate[item]}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.ID}-${index}`}
              />
            </List.Accordion>
          )}
          keyExtractor={(item) => item}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  dateContainer: {
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 7,
  },
  itemContainer: {
    marginVertical: 2,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportButton: {
    width: '50%',
    borderRadius: 8,
    backgroundColor: '#9494b8', // Màu sắc của nút
    elevation: 3, // Hiệu ứng shadow
    alignItems: 'center', // Căn giữa theo chiều ngang
    paddingVertical: 8, // Khoảng cách dọc của nút
  },
  exportButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111', // Màu chữ của nút
  },
});

export default observer(ListSchedules);
