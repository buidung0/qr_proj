import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { fireStore, storage } from "../../firebase.config";
import { Alert } from "react-native";
import { DEFAULT_AVT, ROLES } from "../enum/role";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
const { makeAutoObservable } = require("mobx");
const CryptoJS = require("crypto-js");
class AuthStore {
  DB = fireStore;
  logged = false;
  updateInfo = {};
  draft = {
    logging: false,
  };
  user = {};

  constructor() {
    makeAutoObservable(this);
  }
  setUpdateInfo = (val) => {
    this.updateInfo = val;
  };
  setUser = (val) => {
    this.user = val;
  };
  setLogged = (val) => {
    this.logged = val;
  };
  setLogging = (val) => {
    this.draft.logging = val;
  };

  logout = async (deleteCookies) => {
    if (deleteCookies) {
      await AsyncStorage.removeItem("auth_info");
    }
    this.setLogged(false);
    this.setUser({});
  };

  // logout1 = async (deleteCookies) => {
  //   if (deleteCookies) {
  //     await AsyncStorage.removeItem("auth_info");
  //   }
  //   // Hiển thị cảnh báo trước khi đăng xuất
  //   Alert.alert(
  //     "Cảnh báo",
  //     "Bạn có chắc muốn đăng xuất?",
  //     [
  //       {
  //         text: "Hủy",
  //         style: "cancel",
  //       },
  //       {
  //         text: "Đăng xuất",
  //         onPress: () => {
  //           this.performLogout();
  //         },
  //       },
  //     ],
  //     { cancelable: false }
  //   );
  // };

  // performLogout = () => {
  //   this.setLogged(false);
  //   this.setUser({});
  //   // Thực hiện các thao tác đăng xuất sau khi người dùng xác nhận
  // };

  register = async ({ email, password, classes, name, msv }) => {
    try {
      if (!this.draft.logging) {
        this.setLogging(true);
        setTimeout(async () => {
          // const hashedPassword = CryptoJS.SHA256(password).toString();
          const doc = await getDocs(
            query(collection(this.DB, "users"), where("email", "==", email))
          );
          const doc1 = await getDocs(
            query(collection(this.DB, "users"), where("msv", "==", msv))
          );
          if (doc.docs.length > 0) {
            Alert.alert("Error", "Email has been taken");
            this.setLogging(false);
            return;
          }
          if (doc1.docs.length > 0) {
            Alert.alert("Error", "Studdent ID has been taken");
            this.setLogging(false);
            return;
          }
          addDoc(collection(this.DB, "users"), {
            name,
            role: ROLES.STUDENT,
            email,
            password,
            classes,
            msv,
            avatar: DEFAULT_AVT,
          });
          Alert.alert("Success", "Register success");
          this.setLogging(false);
        }, 1000);
      }
    } catch (e) {
      Alert.alert("Serve Error", "Something error please retry later");
    }
  };

  login = async ({ email, password }) => {
    try {
      console.log(email, password);
      if (!this.draft.logging) {
        this.setLogging(true);
        setTimeout(async () => {
          const q = query(
            collection(this.DB, "users"),
            where("email", "==", email),
            where("password", "==", password)
          );
          const queryResult = await getDocs(q);
          if (queryResult.size > 0) {
            queryResult.forEach((us) => {
              const us_ = { ...us.data(), id: us.id };
              this.setUser(us_);
            });
            await AsyncStorage.setItem("auth_info", JSON.stringify(this.user));
            this.setLogged(true);
          } else {
            Alert.alert("Login Error", "Email or password incorrect");
          }
          this.setLogging(false);
        }, 100);
      }
    } catch (e) {
      Alert.alert("Serve Error", "Something error please retry later");
    }
  };

  changePassword = async ({ email, oldPassword, newPassword }) => {
    try {
      const q = query(
        collection(this.DB, "users"),
        where("email", "==", email),
        where("password", "==", oldPassword)
      );
      const queryResult = await getDocs(q);
      if (queryResult.size > 0) {
        queryResult.forEach(async (us) => {
          // Assuming only one user matches the email and old password
          const userRef = doc(this.DB, "users", us.id);
          
          // Update password in Firestore
          await updateDoc(userRef, { password: newPassword });
  
          // You might want to update the local user object if needed
          const updatedUser = { ...us.data(), password: newPassword };
          this.setUser(updatedUser);
  
          // Optionally, you can also update the AsyncStorage with new auth info
          await AsyncStorage.setItem("auth_info", JSON.stringify(updatedUser));
  
          // Inform the user about the successful password change
          Alert.alert("Password Changed", "Your password has been updated successfully");
        });
      } else {
        // Alert if the email or old password is incorrect
        Alert.alert("Change Password Error", "Email or old password incorrect");
      }
    } catch (e) {
      // Handle any server or unexpected errors
      Alert.alert("Server Error", "Something went wrong. Please try again later");
    }
  };
  createObjectWithDefinedProperties(properties) {
    return Object.fromEntries(
      Object.entries(properties).filter(([_, value]) => value !== undefined)
    );
  }

  updateProfile = async () => {
    try {
      const { email, name, msv, classes } = authStore.updateInfo;
      const updateF = this.createObjectWithDefinedProperties({
        email,
        name,
        msv,
        classes,
      });
      await updateDoc(doc(this.DB, "users", this.user.id), updateF);
      if (email) {
        this.logout(true);
      } else {
        this.logout();
      }
    } catch (e) {
      Alert.alert("Error", "Something error try later");
    }
    this.setUpdateInfo({});
  };

  uploadAvatar = async (uri) => {
    const url = await fetch(uri);
    const blob = await url.blob();
    const storageRef = ref(storage, "/uploads");
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    await updateDoc(doc(this.DB, "users", this.user.id), {
      avatar: downloadUrl,
    });
    this.logout();
  };

  getByName = async (name) => {
    const rs = await getDocs(
      query(collection(this.DB, "users"), where("name", "==", name))
    );
    let user = null;
    rs.forEach((doc) => {
      if (doc.exists()) {
        user = doc.data();
      }
    });
    return user;
  };
}
const authStore = new AuthStore();
export default authStore;
