import { observer } from 'mobx-react';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';
import { List, IconButton, Colors } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ROLES } from '../enum/role';
import scheduleStore from '../store/ScheduleStore';
import IonIcon from 'react-native-vector-icons/Ionicons';

const ListSchedules = (props) => {
  const nav = useNavigation();
  useEffect(() => {
    scheduleStore.listenSc();
  }, []);
  // useEffect(()=>{},scheduleStore.listenSc)

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
    <ScrollView>
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
      </View>
    </ScrollView>
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
    borderRadius: 5,
  },
  itemContainer: {
    marginVertical: 5,
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
});

export default observer(ListSchedules);
