import { observer } from 'mobx-react';
import VStack from '../cpn/layout/VStack';
import { Text, TextInput, Button } from 'react-native-paper';
import { useLayoutEffect, useState } from 'react';
import authStore from '../store/AuthStore';
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ChangePasswordScreen = () => {
  const nav = useNavigation();
  const [oPass, setOPass] = useState(false);
  const [nPass, setNPass] = useState(false);
  const [cfnPass, setCfnPass] = useState(false);
  const [passwordData, setPasswordData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const toggleShowOPassword = () => {
    setOPass(!oPass);
  };
  const toggleShowNPassword = () => {
    setNPass(!nPass);
  };
  const toggleShowCfnPassword = () => {
    setCfnPass(!cfnPass);
  };
  const handleChangePassword = async () => {
    const { email, oldPassword, newPassword, confirmNewPassword } = passwordData;
    if (
      email.trim() === '' ||
      oldPassword.trim() === '' ||
      newPassword.trim() === '' ||
      confirmNewPassword.trim() === ''
    ) {
      Alert.alert('Form Invalid', 'Please fill in all fields');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Form Invalid', 'Oldpassword match Newpassword');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Form Invalid', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Form Invalid', 'New password should be at least 6 characters');
      return;
    }

    // Chỉ khi tất cả điều kiện đều đúng, tiến hành thay đổi mật khẩu
    await authStore.changePassword(passwordData);
  };

  return (
    <VStack flex={1} space={20} justifyContent={'center'} alignItems={'center'}>
      <Text variant="displaySmall" style={{ color: 'black', fontSize: 30, fontWeight: '500', fontFamily: 'Roboto' }}>
        Forgot Password
      </Text>
      <TextInput
        onChangeText={
          (text) => setPasswordData({ ...passwordData, email: text }) // Handle email change
        }
        style={{ width: '90%' }}
        label="Email"
        keyboardType="email-address" // Set the keyboard type to email
        right={<TextInput.Icon icon={'email'} />}
      />
      <TextInput
        onChangeText={(text) => setPasswordData({ ...passwordData, oldPassword: text })}
        style={{ width: '90%' }}
        label="Old Password"
        secureTextEntry={!oPass} // Sử dụng secureTextEntry với trạng thái ngược với showPassword
        right={
          <TextInput.Icon
            icon={oPass ? 'eye-off' : 'eye'} // Chuyển đổi icon theo trạng thái hiển thị mật khẩu
            onPress={toggleShowOPassword} // Gọi hàm toggle khi người dùng nhấn vào icon
          />
        }
      />
      <TextInput
        onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
        style={{ width: '90%' }}
        label="New Password"
        secureTextEntry={!nPass} // Sử dụng secureTextEntry với trạng thái ngược với showPassword
        right={
          <TextInput.Icon
            icon={nPass ? 'eye-off' : 'eye'} // Chuyển đổi icon theo trạng thái hiển thị mật khẩu
            onPress={toggleShowNPassword} // Gọi hàm toggle khi người dùng nhấn vào icon
          />
        }
      />

      <TextInput
        onChangeText={(text) => setPasswordData({ ...passwordData, confirmNewPassword: text })}
        style={{ width: '90%' }}
        label="Confirm New Password"
        secureTextEntry={!cfnPass} // Sử dụng secureTextEntry với trạng thái ngược với showPassword
        right={
          <TextInput.Icon
            icon={cfnPass ? 'eye-off' : 'eye'} // Chuyển đổi icon theo trạng thái hiển thị mật khẩu
            onPress={toggleShowCfnPassword} // Gọi hàm toggle khi người dùng nhấn vào icon
          />
        }
      />
      {authStore.draft.logging ? (
        <ActivityIndicator size={40} color={'black'} />
      ) : (
        <>
          <View></View>
          <Button mode="contained" onPress={handleChangePassword}>
            Change Password
          </Button>
          <TouchableOpacity
            onPress={() => {
              nav.goBack();
            }}
          >
            <Text>Return</Text>
          </TouchableOpacity>
        </>
      )}
    </VStack>
  );
};

export default observer(ChangePasswordScreen);
