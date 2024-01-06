import { observer } from 'mobx-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { Button, TextInput } from 'react-native-paper';
import { TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fireStore } from '../../firebase.config';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';

const DetailClassScreen = ({ route }) => {
  const nav = useNavigation();
  const [textHeading, setTextHeading] = useState(route.params.item.name);
  const [isPressed, setIsPressed] = useState(false);
  const todoRef = collection(fireStore, 'classes');
  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const buttonColor = isPressed ? '#0D6EFD' : '#1881FF';
  // const updateTodo = () => {
  //   if (textHeading && textHeading.length > 0) {
  //     const todoDoc = doc(todoRef, route.params.item.id);
  //     updateDoc(todoDoc, { name: textHeading })
  //       .then(() => {
  //         nav.goBack(); // Navigate back to the previous screen
  //         console.log('Updated todo:', route.params.item.id);
  //       })
  //       .catch((err) => {
  //         alert('Error updating todo: ' + err.message);
  //       });
  //   }
  // };
  const updateTodo = async () => {
    try {
      if (textHeading && textHeading.length > 0) {
        const newName = textHeading.trim().toLowerCase(); // Normalize input for comparison

        // Fetch existing classes to check for duplicates
        const querySnapshot = await getDocs(todoRef);
        const existingClasses = querySnapshot.docs.map((doc) => doc.data().name.trim().toLowerCase());

        const isDuplicate = existingClasses.includes(newName);

        if (isDuplicate) {
          alert('This class name already exists!');
          return;
        }

        const todoDoc = doc(todoRef, route.params.item.id);
        await updateDoc(todoDoc, { name: textHeading });
        nav.goBack(); // Navigate back to the previous screen
        console.log('Updated todo:', route.params.item.id);
      }
    } catch (error) {
      alert('Error updating todo: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.textField} onChangeText={setTextHeading} value={textHeading} placeholder="Update todo" />
      <Pressable
        style={({ pressed }) => [styles.buttonUpdate, { opacity: pressed ? 0.5 : 1 }]}
        onPress={updateTodo}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text>Update Class</Text>
      </Pressable>
      <TouchableOpacity onPress={() => nav.goBack()}>
        <Text style={styles.returnText}>Return</Text>
      </TouchableOpacity>
    </View>
  );
};

export default observer(DetailClassScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  textField: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonUpdate: {
    backgroundColor: '#1a53ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  returnText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
