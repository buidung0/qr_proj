import { observer } from 'mobx-react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { useLayoutEffect, useState } from 'react';
import scheduleStore from '../store/ScheduleStore';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import authStore from '../store/AuthStore';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
const Teacher = (props) => {
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
    scheduleStore.getSubject();
    scheduleStore.getUseByRole();
    scheduleStore.listenSc();
    scheduleStore.getSchedules();
  }, []);
  // console.log(scheduleStore.subject)
  const SecondRoute = () => (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        paddingVertical: 12,
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
        <Text style={{ textAlign: 'left', marginBottom: 4, width: '90%' }}>Teacher Name</Text>
        <TextInput
          onChangeText={(text) => authStore.setUpdateInfo({ ...authStore.updateInfo, name: text })}
          placeholder={authStore.user.name}
          style={{
            paddingHorizontal: 6,
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
        <Text style={{ textAlign: 'left', marginBottom: 4, width: '90%' }}>Teacher Email</Text>
        <TextInput
          onChangeText={(text) => authStore.setUpdateInfo({ ...authStore.updateInfo, email: text })}
          placeholder={authStore.user.email}
          style={{
            paddingHorizontal: 6,
            width: '90%',
            height: 46,
            borderColor: 'white',
            borderWidth: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 6,
          }}
        />
      </View>
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
        labelStyle={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}
        onPress={handleUpdateProfile}
        mode="contained"
      >
        Update
      </Button>
    </ScrollView>
  );

  // console.log((scheduleStore.subject))
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
              <View style={styles.modalContainer}>
                <View
                  style={[
                    styles.menuContainer,
                    {
                      width: (Dimensions.get('window').width * 9.7) / 12,
                      left: 0,
                      backgroundColor: 'white',
                      // borderRadius: 5,
                      // padding: 20,
                      // paddingBottom: 30,
                    },
                  ]}
                >
                  <View
                    style={{
                      backgroundColor: '#ff6666',
                      paddingTop: 20,
                      borderRadius: 10,
                      paddingBottom: 5,
                      paddingHorizontal: 20,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => {}}>
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
                        <Text style={{ fontWeight: 'bold', color: '#ffffff', fontSize: 18 }}>
                          {authStore.user.name}
                        </Text>
                        <Text style={{ color: '#ffffff', fontSize: 14 }}>{authStore.user.email}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}></View>
                  </View>
                  <View style={{ padding: 5 }}></View>
                  <Text style={styles.menuItem}>
                    {/* <IonIcon name="list-outline" size={20} /> */}
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('reg');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>Add Student</Text>
                    </TouchableOpacity>
                  </Text>
                  <Text style={styles.menuItem}>
                    {/* <IonIcon name="list-outline" size={20} /> */}
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('qrscreen');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>Generate QR Code</Text>
                    </TouchableOpacity>
                  </Text>

                  {/* <Text style={styles.menuItem}>
                    <IonIcon name="list-outline" size={20}  />
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('checkcl');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>Attendance by Class</Text>
                    </TouchableOpacity>
                  </Text> */}

                  <Text style={styles.menuItem}>
                    {/* <IonIcon name="list-outline" size={20} /> */}
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('class');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>Manage Class</Text>
                    </TouchableOpacity>
                  </Text>
                  <Text style={styles.menuItem}>
                    {/* <IonIcon name="list-outline" size={20} /> */}
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('subject');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>Manage Subject</Text>
                    </TouchableOpacity>
                  </Text>
                  <Text style={styles.menuItem}>
                    {/* <IonIcon name="list-outline" size={20} /> */}
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('lsu');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>List Student</Text>
                    </TouchableOpacity>
                  </Text>
                  <Text style={styles.menuItem}>
                    {/* <IonIcon name="list-outline" size={20} /> */}
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('lsc');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>List Schedules</Text>
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
                  <Text style={styles.menuItem}>
                    {/* <IonIcon name="list-outline" size={20} /> */}
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('search');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>Find Attendance</Text>
                    </TouchableOpacity>
                  </Text>
                  <Text style={styles.menuItem}>
                    {/* <IonIcon name="list-outline" size={20}  /> */}
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('checksj');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>Attendance by Subject</Text>
                    </TouchableOpacity>
                  </Text>
                  {/* <Text style={styles.menuItem}>
                    <IonIcon name="list-outline" size={20} />
                    <TouchableOpacity
                      onPress={() => {
                        nav.navigate('table');
                        setIsMenuVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>TimeTable</Text>
                    </TouchableOpacity>
                  </Text> */}
                </View>
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
      <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 5 }}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: authStore.user?.avatar }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 90 / 2,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 20, justifyContent: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 0 }}>{'Name: ' + authStore.user.name}</Text>
          <Text style={{ fontSize: 15, color: 'black', fontWeight: '600', marginVertical: 3 }}>
            {'Email: ' + authStore.user.email}
          </Text>
        </View>
      </View>
      <View
        style={{
          width: '100%',
          height: '100%',
          marginVertical: 10,
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
export default observer(Teacher);

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
    borderRadius: 2,
    padding: 20,
    marginTop: 60,
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
    left: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  iconStyle: {
    marginRight: 10,
    color: 'black',
    marginBottom: 10,
  },
});
