import { observer } from "mobx-react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Alert
} from "react-native";
import { useLayoutEffect, useState } from "react";
import scheduleStore from "../store/ScheduleStore";
import { Button } from "react-native-paper";
import { ROLES } from "../enum/role";

import * as ImagePicker from "expo-image-picker";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import authStore from "../store/AuthStore";
import IonIcon from "react-native-vector-icons/Ionicons";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import React from "react";
import { useNavigation } from "@react-navigation/native";
const Teacher = (props) => {
  const handleUpdateProfile = async () => {
    if (Object.keys(authStore.updateInfo).length <= 0) {
      Toast.show({
        type: "info",
        text1: "Nothing change",
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
        paddingVertical: 12,
        backgroundColor: "white",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <View
        style={{
          marginVertical: 10,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ textAlign: "left", marginBottom: 4, width: "90%" }}>
          Teacher Name
        </Text>
        <TextInput
          onChangeText={(text) =>
            authStore.setUpdateInfo({ ...authStore.updateInfo, name: text })
          }
          placeholder={authStore.user.name}
          style={{
            paddingHorizontal: 6,
            width: "90%",
            height: 46,
            borderColor: "white",
            borderWidth: 0,
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: 6,
          }}
        />
      </View>
      <View
        style={{
          marginVertical: 10,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ textAlign: "left", marginBottom: 4, width: "90%" }}>
          Teacher Email
        </Text>
        <TextInput
          onChangeText={(text) =>
            authStore.setUpdateInfo({ ...authStore.updateInfo, email: text })
          }
          placeholder={authStore.user.email}
          style={{
            paddingHorizontal: 6,
            width: "90%",
            height: 46,
            borderColor: "white",
            borderWidth: 0,
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: 6,
          }}
        />
      </View>
      <Button onPress={handleUpdateProfile} mode="contained">
        Update
      </Button>
    
    </ScrollView>
  );

  const renderScene = SceneMap({
    second: SecondRoute,
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([{ key: "second", title: "Profile" }]);
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "black" }}
      style={{ backgroundColor: "white" }}
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

  const nav = useNavigation();
  return (
    <View
      style={{
        width: "100%",
        flex: 1,
        paddingVertical: 40,
        justifyContent: "start",
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          width: "90%",
          height: 40,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            nav.navigate("history");
          }}
          activeOpacity={0.7}
        >
          <IonIcon name="list-outline" size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Cảnh báo',
              'Bạn có chắc muốn đăng xuất?',
              [
                {
                  text: 'Hủy',
                  style: 'cancel',
                },
                {
                  text: 'Đăng xuất',
                  onPress: () => {
                    authStore.logout(true);
                  },
                },
              ],
              { cancelable: false }
            );
          }}
          activeOpacity={0.7}
        >
          <IonIcon name="log-out-outline" color={"red"} size={24} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: authStore.user?.avatar }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 100,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        />
      </TouchableOpacity>
      <Text
        style={{
          textAlign: "center",
          fontSize: 26,
          fontWeight: "300",
          marginTop: 10,
        }}
      >
        {authStore.user.name}
      </Text>
      <Text
        style={{
          textAlign: "center",
          fontSize: 12,
          fontStyle: "italic",
          color: "gray",
          fontWeight: 600,
          marginVertical: 3,
        }}
      >
        {authStore.user.email}
      </Text>
      <Text
        style={{
          textAlign: "center",
          fontSize: 20,
          color: "#2c2c2c",
          fontWeight: 600,
          marginVertical: 3,
        }}
      >
        {authStore.user.classes.name}
      </Text>
      <View
        style={{
          width: "100%",
          height: "100%",
          marginVertical: 20,
          backgroundColor: "black",
        }}
      >
        <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: "100%" }}
        />
      </View>
    </View>
  );
};
export default observer(Teacher);
