import { observer } from 'mobx-react';
import authStore from '../store/AuthStore';
import { useLayoutEffect, useState } from 'react';
import { Image, ScrollView, Text, View, StyleSheet, Modal, Dimensions } from 'react-native';
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
const Student = (props) => {
  const handleUpdateProfile = async () => {
    if (Object.keys(authStore.updateInfo).length <= 0) {
      Toast.show({
        type: 'info',
        text1: 'Nothing change',
      });
      return;
    }
    await authStore.updateProfile();
  };

  useLayoutEffect(() => {
    scheduleStore.getClasses();
  }, []);
  useLayoutEffect(() => {}, [scheduleStore.classes]);
  const SecondRoute = () => (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        paddingVertical: 20,
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          marginVertical: 10,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ textAlign: 'left', marginBottom: 4, width: '90%' }}>Student Name</Text>
        <TextInput
          onChangeText={(text) => authStore.setUpdateInfo({ ...authStore.updateInfo, name: text })}
          placeholder={authStore.user.name}
          style={{
            width: '90%',
            height: 46,
            borderColor: 'white',
            borderWidth: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 6,
          }}
        />
      </View>
      <View
        style={{
          marginVertical: 10,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ textAlign: 'left', marginBottom: 4, width: '90%' }}>Student ID</Text>
        <TextInput
          onChangeText={(text) => authStore.setUpdateInfo({ ...authStore.updateInfo, msv: text })}
          placeholder={authStore.user.msv}
          style={{
            width: '90%',
            height: 46,
            borderColor: 'white',
            borderWidth: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 6,
          }}
        />
      </View>
      <View
        style={{
          marginVertical: 10,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ textAlign: 'left', marginBottom: 4, width: '90%' }}>Student Email</Text>
        <TextInput
          onChangeText={(text) => authStore.setUpdateInfo({ ...authStore.updateInfo, email: text })}
          placeholder={authStore.user.email}
          style={{
            width: '90%',
            height: 46,
            borderColor: 'white',
            borderWidth: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 6,
          }}
        />
      </View>
      <RNPickerSelect
        style={{ width: '90%' }}
        placeholder={{ label: 'Select class' }}
        onValueChange={(value) => {
          authStore.setUpdateInfo({ classes: { name: value } });
        }}
        value={authStore.user.classes.name}
        items={scheduleStore.classes.map((val) => {
          return {
            label: val?.name,
            value: val?.name,
          };
        })}
      />
      <Button
        style={{
          marginTop: 20,
          width: 130,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 10,
          backgroundColor: '#4d4dff',
        }}
        labelStyle={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}
        onPress={handleUpdateProfile}
        mode="contained"
      >
        Update
      </Button>
    </ScrollView>
  );

  const renderScene = SceneMap({
    second: SecondRoute,
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([{ key: 'second', title: 'Profile' }]);
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: 'black' }}
      style={{ backgroundColor: 'white' }}
      activeColor="black"
      inactiveColor="gray"
    />
  );

  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await authStore.uploadAvatar(result.assets[0].uri);
    }
  };
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };
  const handleShowMenu = (event) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ top: pageY, left: pageX });
    // Chỉ hiển thị menu khi isMenuVisible là false
    if (!isMenuVisible) {
      toggleMenu();
    } else {
      // Nếu menu đang được hiển thị, đóng nó khi nhấn vào màn hình ngoài
      setIsMenuVisible(false);
    }
  };

  const nav = useNavigation();
  return (
    <View
      style={{
        width: '100%',
        flex: 1,
        paddingVertical: 40,
        justifyContent: 'start',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          width: '90%',
          height: 40,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={handleShowMenu} activeOpacity={0.7}>
            <IonIcon name="list-outline" size={28} />
          </TouchableOpacity>
          <Modal
            animationType="fade"
            transparent={true}
            visible={isMenuVisible}
            onRequestClose={() => setIsMenuVisible(!isMenuVisible)}
          >
            <TouchableOpacity activeOpacity={1} onPress={toggleMenu} style={styles.modalBackground}>
              <View
                style={[
                  styles.menuContainer,
                  { width: (Dimensions.get('window').width * 9.7) / 12, left: 0, paddingTop: 20, padding: 20 },
                ]}
              >
                <View
                  style={{
                    backgroundColor: '#ff6666',
                    paddingTop: 20,
                    borderRadius: 10,
                    paddingBottom: 15,
                    paddingHorizontal: 20,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={pickImage}>
                      <Image
                        source={{ uri: authStore.user?.avatar }}
                        style={{
                          width: 75,
                          height: 75,
                          borderRadius: 75 / 2, // để hiển thị ảnh tròn
                        }}
                      />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 20 }}>
                      <Text style={{ fontWeight: 'bold', color: '#ffffff', fontSize: 16 }}>{authStore.user?.name}</Text>
                      {/* <Text style={{ color: '#ffffff', fontSize: 14 }}>{authStore.user?.classes.name}</Text> */}
                      <Text style={{ color: '#ffffff', fontSize: 14 }}>{authStore.user?.msv}</Text>
                    </View>
                  </View>
                  <View style={{ justifyContent: 'space-around', marginTop: 15 }}>
                    {/* <Text style={{ color: '#ffffff', fontSize: 14 }}>{authStore.user?.email}</Text> */}
                  </View>
                </View>
                <Text style={styles.menuItem}>
                  {/* <IonIcon name="list-outline" size={20}  /> */}
                  <TouchableOpacity
                    onPress={() => {
                      nav.navigate('scanner');
                      setIsMenuVisible(false);
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>Scan QR</Text>
                  </TouchableOpacity>
                </Text>
                <Text style={styles.menuItem}>
                  {/* <IonIcon name="list-outline" size={20} /> */}
                  <TouchableOpacity
                    onPress={() => {
                      nav.navigate('ChangePassword');
                      setIsMenuVisible(false);
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>Change Password</Text>
                  </TouchableOpacity>
                </Text>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Alert',
              'Are you sure you want to log out?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Log Out',
                  onPress: () => {
                    authStore.logout(true);
                  },
                },
              ],
              { cancelable: false },
            );
          }}
          activeOpacity={0.7}
        >
          <IonIcon name="log-out-outline" color={'red'} size={24} />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 5 }}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: authStore.user?.avatar }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 100,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 15, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#2c2c2c', marginRight: 10 }}>
              {'Name: ' + authStore.user.name}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#2c2c2c', marginRight: 10 }}>
              {'ID: ' + authStore.user.msv}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#2c2c2c', marginRight: 10 }}>
              {'Class: ' + authStore.user.classes.name}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#2c2c2c', marginRight: 10 }}>
              {'Email: ' + authStore.user.email}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          width: '100%',
          height: '100%',
          marginVertical: 20,
          backgroundColor: 'black',
        }}
      >
        <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: '100%' }}
        />
      </View>
    </View>
  );
};
export default observer(Student);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  listButton: {
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    backgroundColor: 'white',
    height: '100%', // Chiếm toàn bộ chiều cao của màn hình
    borderRadius: 5,
    padding: 20,
    position: 'absolute',
    zIndex: 999, // Layer ưu tiên
  },
  menuItem: {
    paddingVertical: 8,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
