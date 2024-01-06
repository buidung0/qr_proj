import { observer } from 'mobx-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import { addDoc, collection, doc, onSnapshot, query, deleteDoc, orderBy } from 'firebase/firestore';
import IonIcon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { Button, TextInput } from 'react-native-paper';
import { TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fireStore } from '../../firebase.config';

const ClassScreen = (props) => {
  const nav = useNavigation();
  const [todos, setTodos] = useState([]);
  const [addData, setAddData] = useState('');
  const todoRef = collection(fireStore, 'classes');

  useEffect(() => {
    const unsubscribe = onSnapshot(query(todoRef, orderBy('name', 'asc')), (querySnapshot) => {
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
      const existingClass = todos.find((todo) => todo.name.toLowerCase() === addData.toLowerCase());
      if (existingClass) {
        alert('This subject already exists!');
        return;
      }
      addDoc(todoRef, data)
        .then(() => {
          console.log('add success' + JSON.stringify(data));
          setAddData('');
        })
        .catch((err) => {
          alert(err);
        });
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, top: 0 }}>
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
          placeholder="Add New Class"
          placeholderTextColor="#cccccc"
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
            <TouchableOpacity onPress={() => nav.navigate('detailCl', { item })} style={styles.touchable}>
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
    marginBottom: 20, // Thay đổi margin để phù hợp với kích thước màn hình
    marginTop: 30,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1, // Để title có thể căn chỉnh với nút quay lại
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 0, // Thêm padding để tạo khoảng cách giữa ô input và nút thêm
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
    paddingVertical: 4, // Thêm padding để tạo khoảng cách giữa các mục
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
    marginBottom: 5,
    padding: 7,
  },
});
