import { observer } from "mobx-react";
import VStack from "../cpn/layout/VStack";
import authStore from "../store/AuthStore";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLayoutEffect, useState } from "react";
import scheduleStore from "../store/ScheduleStore";
import { Button, Icon, TextInput } from "react-native-paper";
import { ROLES } from "../enum/role";
import { useNavigation } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";

import RNDateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Teacher from "../screens/Teacher";
import Student from "../screens/Student";
const Home = () => {
  const role = authStore.user.role;
  useLayoutEffect(() => {
    scheduleStore.listenSchedule(authStore?.user?.id);
  }, []);
  return (
    <VStack flex={1} justifyContent={"center"} alignItem={"center"}>
      {role == ROLES.TEACHER ? <Teacher /> : <Student />}
    </VStack>
  );
};
export default observer(Home);
