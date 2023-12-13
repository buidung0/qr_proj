import { observer } from 'mobx-react';
import authStore from '../store/AuthStore';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Modal,
  Dimensions,
  FlatList,
  Keyboard,
  Pressable,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import React from 'react';
import { Button, TextInput } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import scheduleStore from '../store/ScheduleStore';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { fireStore } from '../../firebase.config';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  updateDoc,
  deleteDoc,
  QuerySnapshot,
  orderBy,
} from 'firebase/firestore';
const DetailSubjectScreen = () => {
  const nav = useNavigation();
  const [textHeading, setTextHeading] = useState(route.params.item.name);
  const todoRef = collection(fireStore, 'subject');

  const updateTodo = () => {
    if (textHeading && textHeading.length > 0) {
      const todoDoc = doc(todoRef, route.params.item.id);
      updateDoc(todoDoc, { name: textHeading })
        .then(() => {
          nav.goBack(); // Navigate back to the previous screen
          console.log('Updated todo:', route.params.item.id);
        })
        .catch((err) => {
          alert('Error updating todo: ' + err.message);
        });
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textField}
        onChangeText={setTextHeading}
        value={textHeading}
        placeholder="Update subject"
      />
      <Pressable style={styles.buttonUpdate} onPress={updateTodo}>
        <Text>update subject</Text>
      </Pressable>
      <TouchableOpacity onPress={() => nav.goBack()}>
        <Text style={styles.returnText}>return</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DetailSubjectScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    marginLeft: 15,
    marginRight: 15,
  },
  textField: {
    marginBottom: 10,
    padding: 10,
    fontSize: 15,
    color: '#000000',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  buttonUpdate: {
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    elevation: 10,
    borderRadius: 4,
    backgroundColor: '#0de065',
  },
  returnText: {
    color: '#FC0000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    left: 150,
  },
});
