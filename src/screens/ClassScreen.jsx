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

const ClassScreen = (props) => {
  const nav = useNavigation();
  const [todos, setTodos] = useState([]);
  const [addData, setAddData] = useState('');
  const todoRef = collection(fireStore, 'classes');

  useEffect(() => {
    const unsubscribe = onSnapshot(query(todoRef, orderBy('createAt', 'asc')), (querySnapshot) => {
      const todos = [];
      querySnapshot.forEach((doc) => {
        const { name } = doc.data();
        todos.push({
          id: doc.id,
          name,
        });
      });
      setTodos(todos); // Update the state with the fetched todos
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts or when the effect is re-run
  }, []);

  const deleteTodo = (id) => {
    deleteDoc(doc(todoRef, id))
      .then(() => {
        alert('Delete success');
      })
      .catch((err) => {
        // console.log("abc::"+err)
        alert(err);
      });
  };

  const addTodo = () => {
    if (addData && addData.length > 0) {
      const timestamp = new Date();
      const data = {
        name: addData,
        createAt: timestamp,
      };
      addDoc(todoRef, data)
        .then(() => {
          setAddData('');
        })
        .catch((err) => {
          alert(err);
        });
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            nav.goBack();
          }}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <IonIcon name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Class</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add new"
          placeholderTextColor="#aaaaaa"
          onChangeText={(name) => setAddData(name)}
          value={addData}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todos}
        numColumns={1}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => nav.navigate('detail', { item })} style={styles.touchable}>
              <Text style={styles.itemText}>
                {item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <IonIcon name="trash-outline" color="red" style={styles.icon} />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
      />
    </View>
  );
};

export default observer(ClassScreen);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  backButton: {
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingBottom: 10,
    marginBottom: 10,
  },
  touchable: {
    flex: 1,
  },
  itemText: {
    fontSize: 18,
  },
  icon: {
    fontSize: 24,
  },
  flatList: {
    marginBottom: 20,
  },
});
