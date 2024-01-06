import { observer } from 'mobx-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { TextInput } from 'react-native-paper';
import { TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fireStore } from '../../firebase.config';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';

const DetailSubjectScreen = ({ route }) => {
  const nav = useNavigation();
  const [textHeading, setTextHeading] = useState(route.params.item.name);
  const todoRef = collection(fireStore, 'subject');

  const updateTodo = async () => {
    try {
      if (textHeading && textHeading.length > 0) {
        const newName = textHeading.trim().toLowerCase();
        const querySnapshot = await getDocs(todoRef);
        const existingSubjects = querySnapshot.docs.map((doc) => doc.data().name.trim().toLowerCase());
        const isDuplicate = existingSubjects.includes(newName);

        if (isDuplicate) {
          alert('This subject name already exists!');
          return;
        }

        const todoDoc = doc(todoRef, route.params.item.id);
        await updateDoc(todoDoc, { name: textHeading });
        nav.goBack();
        console.log('Updated subject:', route.params.item.id);
      }
    } catch (error) {
      alert('Error updating subject: ' + error.message);
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
        <Text>Update subject</Text>
      </Pressable>
      <TouchableOpacity onPress={() => nav.goBack()}>
        <Text style={styles.returnText}>Return</Text>
      </TouchableOpacity>
    </View>
  );
};

export default observer(DetailSubjectScreen);

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
