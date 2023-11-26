import { observer } from "mobx-react";
import VStack from "../cpn/layout/VStack";
import { Text, TextInput, Button } from "react-native-paper";
import { useLayoutEffect, useState } from "react";
import authStore from "../store/AuthStore";
import { ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import scheduleStore from "../store/ScheduleStore";
import { useNavigation } from "@react-navigation/native";
const Register = () => {
  const nav = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [cfPass, setCfpass] = useState(false);
  const [regData, setRegData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    msv:"",
    classes: {},
    name: "",
  });
  useLayoutEffect(() => {
    const bs = async () => {
      await scheduleStore.getClasses();
    };
    bs();
  }, []);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const toggleShowCfPassword = () => {
    setCfpass(!cfPass);
  };
  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regData.email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address");
        return; // Exit function if email format is invalid
      }
    if (regData.email.trim() === "") {
      Alert.alert("Form Invalid", "Please enter an email");
      return;
    }
    if (regData.password.trim() === "") {
      Alert.alert("Form Invalid", "Please enter a password");
      return;
    }
    if (regData.password.length < 6) {
      Alert.alert("Form Invalid", "Password should be at least 6 characters");
      return;
    }  
    if (regData.msv.trim() === "") {
      Alert.alert("Form Invalid", "Please enter a student ID");
      return;
    } 
    if (regData.password !== regData.confirmPassword) {
      Alert.alert("Form Invalid", "Passwords do not match");
      return;
    } 
    if (Object.keys(regData.classes).length === 0) {
      Alert.alert("Form Invalid", "Please select classes");
      return;
    }
    if (regData.name.trim() === "") {
      Alert.alert("Form Invalid", "Please enter your name");
      return;
    } 
    // Nếu tất cả điều kiện đều đúng, thực hiện đăng ký
    await authStore.register(regData);
  };
  return (
    <VStack flex={1} space={20} justifyContent={"center"} alignItems={"center"}>
      <Text variant="displayMedium" style={{ color: "black" }}>
        Register
      </Text>
      <TextInput
        onChangeText={(text) => setRegData({ ...regData, email: text })}
        style={{ width: "90%" }}
        label="Email"
        right={<TextInput.Icon icon={"email"} />}
      />
      <TextInput
        onChangeText={(text) => setRegData({ ...regData, name: text })}
        style={{ width: "90%" }}
        label="Name"
        right={<TextInput.Icon icon={"account"} />}
      />
      <TextInput
        onChangeText={(text) => setRegData({ ...regData, msv: text })}
        style={{ width: "90%" }}
        label="Student ID"
        right={<TextInput.Icon icon={"account"} />}
      />
      <TextInput
        onChangeText={(text) => setRegData({ ...regData, password: text })}
        style={{ width: "90%" }}
        label="Password"
        secureTextEntry={!showPassword} // Sử dụng secureTextEntry với trạng thái ngược với showPassword
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off" : "eye"} // Chuyển đổi icon theo trạng thái hiển thị mật khẩu
            onPress={toggleShowPassword} // Gọi hàm toggle khi người dùng nhấn vào icon
          />
        }
      />
      <TextInput
        onChangeText={(text) =>
          setRegData({ ...regData, confirmPassword: text })
        }
        style={{ width: "90%" }}
        label="Confirm Password"
        secureTextEntry={!cfPass} // Sử dụng secureTextEntry với trạng thái ngược với showPassword
        right={
          <TextInput.Icon
            icon={cfPass ? "eye-off" : "eye"} // Chuyển đổi icon theo trạng thái hiển thị mật khẩu
            onPress={toggleShowCfPassword} // Gọi hàm toggle khi người dùng nhấn vào icon
          />
        }
      />
      <RNPickerSelect
        style={{ width: "90%" }}
        placeholder={{ label: "Select class" }}
        onValueChange={(value) =>
          setRegData({ ...regData, classes: { name: value } })
        }
        items={scheduleStore.classes.map((val) => {
          return {
            label: val?.name,
            value: val?.name,
          };
        })}
      />
      {authStore.draft.logging ? (
        <ActivityIndicator size={40} color={"black"} />
      ) : (
        <>
          <Button mode="contained" onPress={()=>{
            handleLogin()
            // setTimeout(()=>{
            //   nav.navigate("login")
            // },3000)
          }}>
            Register
          </Button>
          <TouchableOpacity
            onPress={() => {
              nav.navigate("login");
            }}
          >
            <Text>Return</Text>
          </TouchableOpacity>
        </>
      )}
    </VStack>
  );
};

export default observer(Register);
