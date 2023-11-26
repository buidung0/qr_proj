import { observer } from "mobx-react";
import VStack from "../cpn/layout/VStack";
import { Text, TextInput, Button } from "react-native-paper";
import { useLayoutEffect, useState } from "react";
import authStore from "../store/AuthStore";
import { ActivityIndicator, Alert, TouchableOpacity,View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);  
  const nav = useNavigation();
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleRememberLogin = () => {
    setRememberLogin(!rememberLogin); // Đảo ngược trạng thái khi nhấn vào checkbox
  };
  const handleLogin = async () => {
    if (loginData.email.trim() === "" || loginData.password.trim() === "") {
      Alert.alert("Form Invalid", "Please fill in both email and password fields");
      return;
    }
    if (loginData.password.trim().length < 6) {
      Alert.alert("Form Invalid", "Password should be at least 6 characters");
      return;
    }
    // Nếu các điều kiện đều đúng, tiến hành đăng nhập
    await authStore.login(loginData);
  };
  useLayoutEffect(() => {
    const bs = async () => {
      const authInfo = JSON.parse(await AsyncStorage.getItem("auth_info"));
      if (authInfo != null) {
        authStore.login({ email: authInfo.email, password: authInfo.password });
      }
    };
    bs();
  }, []);
  return (
    <VStack flex={1} space={20} justifyContent={"center"} alignItems={"center"}>
      <Text variant="displayMedium" style={{ color: "black" }}>
        login
      </Text>
      <TextInput
        onChangeText={(text) => setLoginData({ ...loginData, email: text })}
        style={{ width: "90%" }}
        label="Email"
        right={<TextInput.Icon icon={"email"} />}
      />
      <TextInput
        onChangeText={(text) => setLoginData({ ...loginData, password: text })}
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
      {authStore.draft.logging ? (
        <ActivityIndicator size={40} color={"black"} />
      ) : (
        <>
          <Button mode="contained" onPress={handleLogin}>
            Login
          </Button>
          <TouchableOpacity
            onPress={() => {
              nav.navigate("reg");
            }}
          >
            <Text>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              nav.navigate("ChangePassword"); // Điều hướng đến màn hình đổi mật khẩu khi người dùng nhấn vào
            }}
          >
            <Text>Change Password</Text>
          </TouchableOpacity>
        </>
      )}
    </VStack>
  );
};

export default observer(Login);
