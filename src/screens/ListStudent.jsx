import { observer } from 'mobx-react';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { List } from 'react-native-paper';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import scheduleStore from '../store/ScheduleStore';

const ListStudent = (props) => {
  const nav = useNavigation();
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentsByClass, setStudentsByClass] = useState({});
  // console.log(scheduleStore.ubr)
  useLayoutEffect(() => {
    scheduleStore.getUseByRole();
  }, []);
  useLayoutEffect(() => {}, [scheduleStore.ubr]);
  const data = scheduleStore.ubr;

  useEffect(() => {
    const students = {};
    data.forEach((student) => {
      const className = student.class;
      if (!students[className]) {
        students[className] = [];
      }
      students[className].push(student);
    });
    setStudentsByClass(students);
  }, [data]);

  const toggleClass = (className) => {
    if (selectedClass === className) {
      setSelectedClass(null);
    } else {
      setSelectedClass(className);
    }
  };

  const renderItem = ({ item }) => (
    <List.Item
      title={`Name: ${item.user}`}
      description={`Student ID: ${item.studentID}\nEmail: ${item.email}`}
      left={() => <Image source={{ uri: item.avatar }} style={styles.avatar} />}
    />
  );

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 30, right: 10 }}>
          <TouchableOpacity
            onPress={() => {
              nav.goBack();
            }}
            activeOpacity={0.7}
            style={{ paddingLeft: 5, paddingRight: 15, marginLeft: 5 }}
          >
            <IonIcon name="arrow-back" size={30} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 0 }}>List student by Class</Text>
        </View>
        {Object.keys(studentsByClass).map((className) => (
          <List.Accordion
            key={className}
            title={className}
            expanded={selectedClass === className}
            onPress={() => toggleClass(className)}
          >
            {selectedClass === className && (
              <List.Section>
                {studentsByClass[className].map((student) => (
                  <List.Item
                    key={student.studentID}
                    title={`Name: ${student.user}`}
                    description={`Student ID: ${student.studentID}\nEmail: ${student.email}`}
                    left={() => <Image source={{ uri: student.avatar }} style={styles.avatar} />}
                  />
                ))}
              </List.Section>
            )}
          </List.Accordion>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    paddingTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});

export default observer(ListStudent);
