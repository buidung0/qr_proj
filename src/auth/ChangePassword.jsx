import React, { useState } from "react";
import { Text, TextInput, Button, Alert } from "react-native";
import { VStack } from "../cpn/layout/VStack";
import authStore from "../store/AuthStore";

const ChangePasswordScreen = () => {
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChangePassword = async () => {
    if (
      passwordData.oldPassword.trim() === "" ||
      passwordData.newPassword.trim() === "" ||
      passwordData.confirmNewPassword.trim() === ""
    ) {
      Alert.alert("Form Invalid", "Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      Alert.alert("Form Invalid", "Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert(
        "Form Invalid",
        "New password should be at least 6 characters"
      );
      return;
    }

    await authStore.changePassword({
      email: authStore.user.email, // You might need to obtain user's email from authStore or somewhere else
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <VStack flex={1} space={20} justifyContent={"center"} alignItems={"center"}>
      <Text variant="displayMedium" style={{ color: "black" }}>
        Change Password
      </Text>
      <TextInput
        onChangeText={(text) =>
          setPasswordData({ ...passwordData, oldPassword: text })
        }
        style={{ width: "90%" }}
        label="Old Password"
        secureTextEntry={true}
      />
      <TextInput
        onChangeText={(text) =>
          setPasswordData({ ...passwordData, newPassword: text })
        }
        style={{ width: "90%" }}
        label="New Password"
        secureTextEntry={true}
      />
      <TextInput
        onChangeText={(text) =>
          setPasswordData({ ...passwordData, confirmNewPassword: text })
        }
        style={{ width: "90%" }}
        label="Confirm New Password"
        secureTextEntry={true}
      />
      <Button mode="contained" onPress={handleChangePassword}>
        Change Password
      </Button>
    </VStack>
  );
};

export default ChangePasswordScreen;
