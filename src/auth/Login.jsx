import { observer } from 'mobx-react';
import VStack from '../cpn/layout/VStack';
import { Text, TextInput, Button } from 'react-native-paper';
import { useLayoutEffect, useState } from 'react';
import authStore from '../store/AuthStore';
import { ActivityIndicator, Alert, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
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
    if (loginData.email.trim() === '' || loginData.password.trim() === '') {
      Alert.alert('Form Invalid', 'Please fill in both email and password fields');
      return;
    }
    if (loginData.password.trim().length < 6) {
      Alert.alert('Form Invalid', 'Password should be at least 6 characters');
      return;
    }
    // Nếu các điều kiện đều đúng, tiến hành đăng nhập
    await authStore.login(loginData);
  };
  useLayoutEffect(() => {
    const bs = async () => {
      const authInfo = JSON.parse(await AsyncStorage.getItem('auth_info'));
      if (authInfo != null) {
        authStore.login({ email: authInfo.email, password: authInfo.password });
      }
    };
    bs();
  }, []);

  return (
    <VStack flex={1} space={20} justifyContent={'center'} alignItems={'center'}>
      <Text variant="displayLarge" style={{ color: 'black', fontSize: 50, fontWeight: '500', fontFamily: 'Roboto' }}>
        Log in
      </Text>
      <TextInput
        onChangeText={(text) => setLoginData({ ...loginData, email: text })}
        style={{ width: '90%' }}
        label="Email"
        right={<TextInput.Icon icon={'email'} />}
      />
      <TextInput
        onChangeText={(text) => setLoginData({ ...loginData, password: text })}
        style={{ width: '90%' }}
        label="Password"
        secureTextEntry={!showPassword} // Sử dụng secureTextEntry với trạng thái ngược với showPassword
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'} // Chuyển đổi icon theo trạng thái hiển thị mật khẩu
            onPress={toggleShowPassword} // Gọi hàm toggle khi người dùng nhấn vào icon
          />
        }
      />
      {authStore.draft.logging ? (
        <ActivityIndicator size={40} color={'black'} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', left: 120 }}>
            <TouchableOpacity
              onPress={() => {
                nav.navigate('ChangePassword');
              }}
            >
              <Text style={{ color: '#ff3333' }}>Forgot Password ?</Text>
            </TouchableOpacity>
          </View>
          <Button mode="contained" onPress={handleLogin}>
            Login
          </Button>
          <View style={styles.container}>
            {/* <View style={styles.line} />
            <Text style={styles.text}>OR</Text>
            <View style={styles.line} /> */}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* <TouchableOpacity onPress={() => {}}>
              <Text style={{ color: '#4d4dff' }}>Don't have account ? Register</Text>
            </TouchableOpacity> */}
          </View>
        </>
      )}
    </VStack>
  );
};

export default observer(Login);
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
    width: '85%',
    justifyContent: 'space-between',
  },
  line: {
    borderBottomColor: 'black',
    borderBottomWidth: 0.5,
    flex: 1,
    height: 1,
  },
  text: {
    paddingHorizontal: 10,
    color: 'black',
  },
});
