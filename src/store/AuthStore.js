import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { fireStore, storage } from '../../firebase.config';
import { Alert } from 'react-native';
import { DEFAULT_AVT, ROLES } from '../enum/role';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
const { makeAutoObservable } = require('mobx');

class AuthStore {
  DB = fireStore;
  logged = false;
  updateInfo = {};
  draft = {
    logging: false,
  };
  user = {};
  role = {};
  constructor() {
    makeAutoObservable(this);
  }
  setUpdateInfo = (val) => {
    this.updateInfo = val;
  };
  setUser = (val) => {
    this.user = val;
  };
  setRole = (val) => {
    this.role = val;
  };
  setLogged = (val) => {
    this.logged = val;
  };
  setLogging = (val) => {
    this.draft.logging = val;
  };

  logout = async (deleteCookies) => {
    if (deleteCookies) {
      await AsyncStorage.removeItem('auth_info');
    }
    this.setLogged(false);
    this.setUser({});
  };

  register = async ({ email, password, classes, name, msv }) => {
    try {
      if (!this.draft.logging) {
        this.setLogging(true);
        setTimeout(async () => {
          // const hashedPassword = CryptoJS.SHA256(password).toString();
          const doc = await getDocs(query(collection(this.DB, 'users'), where('email', '==', email)));
          const doc1 = await getDocs(query(collection(this.DB, 'users'), where('msv', '==', msv)));
          if (doc.docs.length > 0) {
            Alert.alert('Error', 'Email has been taken');
            this.setLogging(false);
            return;
          }
          if (doc1.docs.length > 0) {
            Alert.alert('Error', 'Studdent ID has been taken');
            this.setLogging(false);
            return;
          }
          addDoc(collection(this.DB, 'users'), {
            name,
            role: ROLES.STUDENT,
            email,
            password,
            classes,
            msv,
            avatar: DEFAULT_AVT,
          });
          Alert.alert('Success', 'Register success');
          this.setLogging(false);
        }, 1000);
      }
    } catch (e) {
      Alert.alert('Serve Error', 'Something error please retry later');
    }
  };
  login = async ({ email, password }) => {
    try {
      console.log(email, password);
      if (!this.draft.logging) {
        this.setLogging(true);
        setTimeout(async () => {
          const q = query(collection(this.DB, 'users'), where('email', '==', email), where('password', '==', password));
          const queryResult = await getDocs(q);
          if (queryResult.size > 0) {
            queryResult.forEach((us) => {
              const us_ = { ...us.data(), id: us.id };
              this.setUser(us_);
            });
            await AsyncStorage.setItem('auth_info', JSON.stringify(this.user));
            this.setLogged(true);
          } else {
            Alert.alert('Login Error', 'Email or password incorrect');
          }
          this.setLogging(false);
        }, 100);
      }
    } catch (e) {
      Alert.alert('Serve Error', 'Something error please retry later');
    }
  };

  changePassword = async ({ email, oldPassword, newPassword }) => {
    try {
      if (!this.draft.logging) {
        this.setLogging(true);
        setTimeout(async () => {
          const q = query(
            collection(this.DB, 'users'),
            where('email', '==', email),
            where('password', '==', oldPassword),
          );
          const queryResult = await getDocs(q);
          if (queryResult.size > 0) {
            queryResult.forEach(async (us) => {
              // Assuming only one user matches the email and old password
              const userRef = doc(this.DB, 'users', us.id);
              // Update password in Firestore
              await updateDoc(userRef, { password: newPassword });
              // You might want to update the local user object if needed
              const updatedUser = { ...us.data(), password: newPassword };
              this.setUser(updatedUser);
              // Optionally, you can also update the AsyncStorage with new auth info
              await AsyncStorage.setItem('auth_info', JSON.stringify(updatedUser));
              // Inform the user about the successful password change
              Alert.alert('Password Changed', 'Your password has been updated successfully');
            });
          } else {
            // Alert if the email or old password is incorrect
            Alert.alert('Change Password Error', 'Email or old password incorrect');
          }
          this.setLogging(false);
        }, 100);
      }
    } catch (e) {
      // Handle any server or unexpected errors
      Alert.alert('Server Error', 'Something went wrong. Please try again later');
    }
  };

  createObjectWithDefinedProperties(properties) {
    return Object.fromEntries(Object.entries(properties).filter(([_, value]) => value !== undefined));
  }
  checkIfMSVDuplicate = async (msv) => {
    try {
      const querySnapshot = await getDocs(query(collection(this.DB, 'users'), where('msv', '==', msv)));
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking for duplicate MSV:', error);
      return true; // Trả về true để tránh cập nhật khi có lỗi xảy ra
    }
  };
  checkIfEmailExists = async (email) => {
    try {
      const querySnapshot = await getDocs(query(collection(this.DB, 'users'), where('email', '==', email)));
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking for existing email:', error);
      return true; // Trả về true để tránh cập nhật khi có lỗi xảy ra
    }
  };
  updateProfileStudent = async () => {
    try {
      const { email, name, msv, classes } = authStore.updateInfo;

      // Kiểm tra xem dữ liệu đã thay đổi so với dữ liệu hiện tại không
      const isDataChanged =
        email !== authStore.user.email ||
        name !== authStore.user.name ||
        msv !== authStore.user.msv ||
        classes !== authStore.user.classes;

      if (!isDataChanged) {
        // Không có sự thay đổi, không cần cập nhật
        return;
      }

      // Tiến hành kiểm tra trùng lặp email và MSV
      const isEmailChanged = email !== authStore.user.email;
      const isMSVChanged = msv !== authStore.user.msv;

      if (
        (isEmailChanged && (await this.checkIfEmailExists(email))) ||
        (isMSVChanged && (await this.checkIfMSVDuplicate(msv)))
      ) {
        if (isEmailChanged) {
          Alert.alert('Duplicate Error', 'Email already exists, please use a different one');
        } else {
          Alert.alert('Duplicate Error', 'Student ID already exists, please use a different one');
        }
      } else {
        const updateData = this.createObjectWithDefinedProperties({
          email,
          name,
          classes,
        });

        await updateDoc(doc(this.DB, 'users', this.user.id), updateData);

        // Đăng xuất nếu email thay đổi, không đăng xuất nếu chỉ cập nhật thông tin khác
        if (isEmailChanged) {
          this.logout(true);
        } else {
          this.setUpdateInfo({});
        }
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong');
    }
  };
  updateProfileTeacher = async () => {
    try {
      const { email, name, msv, classes } = authStore.updateInfo;
      const updateF = this.createObjectWithDefinedProperties({
        email,
        name,
        msv,
        classes,
      });
      const isEmailExists = await this.checkIfEmailExists(email);
      if (!isEmailExists) {
        await updateDoc(doc(this.DB, 'users', this.user.id), updateF);
        if (email) {
          this.logout(true);
        } else {
          this.logout();
        }
      } else {
        if (isEmailExists) {
          Alert.alert('Duplicate Error', 'Email already exists, please use a different one');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Something error try later');
    }
    this.setUpdateInfo({});
  };

  updateProfile = async () => {
    try {
      const { email, name, classes } = authStore.updateInfo;
      const updateF = this.createObjectWithDefinedProperties({
        email,
        name,
        classes,
      });
      await updateDoc(doc(this.DB, 'users', this.user.id), updateF);
      if (email) {
        this.logout(true);
      } else {
        this.logout();
      }
    } catch (e) {
      Alert.alert('Error', 'Something error try later');
    }
    this.setUpdateInfo({});
  };

  uploadAvatar = async (uri) => {
    try {
      const url = await fetch(uri);
      const blob = await url.blob();
      const uniqueFileName = `${this.user.id}`;
      const storageRef = ref(storage, `/uploads/${uniqueFileName}`);
      // const storageRef = ref(storage, '/uploads');
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(this.DB, 'users', this.user.id), {
        avatar: downloadUrl,
      });
      this.logout();
    } catch (e) {
      console.log(e);
    }
  };

  getByName = async (name) => {
    try {
      const rs = await getDocs(query(collection(this.DB, 'users'), where('name', '==', name)));
      let user = null;
      rs.forEach((doc) => {
        if (doc.exists()) {
          user = doc.data();
        }
      });
      return user;
    } catch (e) {
      console.log(e);
    }
  };
}
const authStore = new AuthStore();
export default authStore;
