import { observer } from 'mobx-react';
import { Alert, ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import scheduleStore from '../store/ScheduleStore';
import { Button, Icon, MD3Colors } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import authStore from '../store/AuthStore';
import RNPickerSelect from 'react-native-picker-select';
import IonIcon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { ROLES } from '../enum/role';
import * as Location from 'expo-location';

const History = (props) => {
  const qrRef = useRef();
  const [showModal, setShowModel] = useState(false);
  const [value, setValue] = useState('');
  const [timeStart, setTimeStart] = useState(0);
  const [timeEnd, setTimeEnd] = useState(0);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [showTimeStartClock, setShowTimeStartClock] = useState(false);
  const [showTimeEndClock, setShowTimeEndClock] = useState(false);
  const [classes, setClasses] = useState({});
  const [subject, setSubject] = useState({});
  useLayoutEffect(() => {
    scheduleStore.listenSc();
  }, []);
  // useLayoutEffect(() => {scheduleStore.listenSchedule();}, [])
  // useLayoutEffect(() => {scheduleStore.getUseByRole();}, [])
  useLayoutEffect(() => {}, [scheduleStore.classes]);
  useLayoutEffect(() => {}, [scheduleStore.schedules]);
  useLayoutEffect(() => {}, [scheduleStore.subject]);
  // useLayoutEffect(() => {}, [scheduleStore.sc])
  // useLayoutEffect(() => {}, [scheduleStore.ubr])
  const test = () => {
    console.log(scheduleStore.ubr);
    const groupedData = {};
    scheduleStore.sc.forEach((item) => {
      const date = new Date();
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      if (!groupedData[formattedDate]) {
        groupedData[formattedDate] = [];
      }
      if (!groupedData[formattedDate].includes(item.name)) {
        groupedData[formattedDate].push(item.name);
      }
    });
    const result = Object.keys(groupedData).map((date) => ({ ngay: date, hocSinhs: groupedData[date] }));
    console.log(result);
  };
  const abc = () => {
    // console.log(scheduleStore.sc)
    // console.log(scheduleStore.getSubject())
  };
  useEffect(() => {
    abc();
  }, []);
  const handleScAtt = () => {
    console.log(scheduleStore.sc);
    const groupedData = {};
    scheduleStore.sc.forEach((item) => {
      const date = new Date(item.checked_at);
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      if (!groupedData[formattedDate]) {
        groupedData[formattedDate] = [];
      }
      if (!groupedData[formattedDate].includes(item.name)) {
        groupedData[formattedDate].push(item.name);
      }
    });
    const result = Object.keys(groupedData).map((date) => ({ dayAtt: date, listStuAtt: groupedData[date] }));
    console.log(result);
  };
  const generateData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Quyền truy cập vị trí bị từ chối.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      console.log(location.coords.latitude, location.coords.longitude);
      // Sử dụng latitude và longitude để làm việc với vị trí
      return location.coords; // Trả về vị trí để sử dụng trong hàm gọi
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  const handleSaveHistory = () => {
    if (!permissionResponse.granted) {
      requestPermission();
      return;
    }
    const filePath =
      FileSystem.documentDirectory +
      new Date().getTime() +
      '_' +
      authStore.user.name +
      '_' +
      authStore.user.id +
      '.csv';
    let data = {
      teacher: authStore.user,
      schedules: scheduleStore.schedules,
    };
    console.log(filePath);
    console.log('there:: ' + JSON.stringify(data));
    // Tạo tiêu đề cho file CSV
    // let csvContent = "Teacher Name,Teacher Email,Subject,Student ID,Class Name,User Name,Day Check In ,Time Check In\n";
    let csvContent = 'Teacher Name,Teacher Email,Student ID,Class Name,User Name,Day Check In ,Time Check In\n';
    // Trích xuất thông tin từ JSON và thêm vào chuỗi CSV
    const teacher = data.teacher;
    const schedules = data.schedules;
    schedules.forEach((schedule) => {
      // csvContent += `${teacher.name},${teacher.email},${schedule.subject.name},${schedule.user.msv},${schedule.classes.name},${schedule.user.name},${new Date(schedule.checked_at.seconds * 1000).toLocaleString()}\n`;
      csvContent += `${teacher.name},${teacher.email},${schedule.user.msv},${schedule.classes.name},${
        schedule.user.name
      },${new Date(schedule.checked_at.seconds * 1000).toLocaleString()}\n`;
    });
    console.log('a:::' + csvContent);
    FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    }).then(() => {
      Sharing.isAvailableAsync().then((res) => {
        if (res) {
          Sharing.shareAsync(filePath);
        }
      });
    });
  };
  const setDateTimeStart = (event, date) => {
    const {
      type,
      nativeEvent: { timestamp, utcOffset },
    } = event;
    setShowTimeStartClock(false);
    setTimeStart(timestamp);
  };
  const setDateTimeEnd = (event, date) => {
    const {
      type,
      nativeEvent: { timestamp, utcOffset },
    } = event;
    setShowTimeEndClock(false);
    setTimeEnd(timestamp);
  };
  const SC_W = Dimensions.get('window').width;
  const handleGenerateCode = async () => {
    const userLocation = await generateData(); // Gọi hàm để lấy vị trí
    if (!userLocation) {
      Alert.alert('Error', "Can't get your location, please try again");
      return;
    }
    if (parseInt(timeEnd) <= parseInt(timeStart)) {
      Alert.alert('Error', 'Time InValid');
      return;
    }
    if (timeEnd - timeStart < 10 * 60 * 1000) {
      Alert.alert('Error', 'Time end must more than time start 10 minutes');
      return;
    }
    if (Object.keys(classes).length <= 0) {
      Alert.alert('Error', 'Select class');
      return;
    }
    // if (Object.keys(subject).length <= 0) {
    //   Alert.alert("Error", "Select subject");
    //   return;
    // }
    const data = {
      lat: userLocation.latitude,
      lon: userLocation.longitude,
      start: timeStart,
      end: timeEnd,
      teacherId: authStore.user.id,
      // subject:subject,
      classes: classes,
    };
    console.log(data);
    setValue(JSON.stringify(data));
  };
  const handleSaveQrToDisk = () => {
    if (!permissionResponse.granted) {
      requestPermission();
    }
    qrRef.current.toDataURL((data) => {
      const filePath = FileSystem.documentDirectory + new Date().getTime() + '.png';
      console.log(filePath);
      FileSystem.writeAsStringAsync(filePath, data, {
        encoding: FileSystem.EncodingType.Base64,
      }).then(() => {
        MediaLibrary.saveToLibraryAsync(filePath).then(() => {
          Toast.show({
            type: 'success',
            text1: 'Save success',
          });
        });
      });
    });
  };
  const filterScheduleWithClass = (clazz, schedules) => {
    return schedules.filter((sc) => sc.classes.name == clazz);
  };
  const nav = useNavigation();
  useLayoutEffect(() => {
    if (authStore?.user?.role == ROLES.TEACHER && scheduleStore.notifications.length > 0) {
      Toast.show({
        type: 'success',
        text1: 'One more student checked in',
      });
      scheduleStore.setNoti([]);
    }
  }, [scheduleStore.notifications]);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
      }}
    >
      {!showModal && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, position: 'relative', padding: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 0, left: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 10, left: 0 }}>
              <TouchableOpacity
                onPress={() => {
                  nav.goBack();
                }}
                activeOpacity={0.7}
                style={{ paddingLeft: 5, paddingRight: 15, marginLeft: 0 }}
              >
                <IonIcon name="arrow-back" size={30} />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: -10 }}>History</Text>
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'column', alignItems: '', width: '80%', marginTop: 40 }}>
              <Button
                onPress={() => {
                  setShowModel(true);
                }}
                mode="contained"
                style={{ marginBottom: 10 }}
              >
                <Text>Generate QRCode</Text>
              </Button>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <Button
                  onPress={() => {
                    handleSaveHistory();
                  }}
                  mode="contained"
                  style={{ flex: 1, width: '45%', marginRight: 2 }}
                >
                  <Text>Save History</Text>
                </Button>
                <Button
                  onPress={() => {
                    handleAnalysis();
                  }}
                  mode="contained"
                  style={{ flex: 1, width: '45%', marginLeft: 2 }}
                >
                  <Text>Analysis</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
      <>
        <Text style={{ fontSize: 26, marginVertical: 20, marginLeft: 10 }}>List Student Checked In</Text>
        <ScrollView>
          {authStore.user.classes.map((cl, index) => {
            const listStudentOfClass = filterScheduleWithClass(cl.name, scheduleStore.schedules);
            return (
              <List.AccordionGroup key={index}>
                <List.Section>
                  <List.Accordion
                    id="1"
                    title={cl.name + '(' + listStudentOfClass.length + ')'}
                    style={{ width: SC_W - 20, paddingVertical: 0 }}
                  >
                    {listStudentOfClass.map((sc, idx) => {
                      const std = authStore.getByName(sc.user.name);
                      const isVerify = std !== null;
                      return (
                        <List.Item
                          key={idx}
                          onPress={() => {
                            nav.navigate('profile', {
                              name: sc.user.name,
                            });
                          }}
                          title={sc.user.name}
                          left={() => <List.Icon icon="account" />}
                        />
                      );
                    })}
                  </List.Accordion>
                </List.Section>
              </List.AccordionGroup>
            );
          })}
        </ScrollView>
        {showModal && (
          <TouchableOpacity
            onPress={() => {
              setShowModel(false);
              setValue('');
              setTimeEnd(0);
              setTimeStart(0);
              setClasses({});
            }}
            activeOpacity={1}
            style={{
              width: '100%',
              borderRadius: 6,
              height: '100%',
              backgroundColor: 'rgba(0,0,0,.6)',
              display: 'flex',
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 'auto',
              zIndex: 10,
            }}
          >
            <View
              style={{
                width: '80%',
                borderRadius: 6,
                height: '80%',
                backgroundColor: 'white',
                zIndex: 10,
                paddingHorizontal: 6,
                display: 'flex',
                paddingVertical: 30,
                justifyContent: 'flex-start',
                alignItems: 'center',
                margin: 'auto',
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,.04)',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 4,
                }}
                onPress={() => {
                  setShowTimeStartClock(true);
                }}
              >
                <Text style={{ textAlign: 'left', width: '100%' }}>
                  {' '}
                  {timeStart != 0
                    ? new Date(timeStart).getHours() +
                      ' : ' +
                      new Date(timeStart).getMinutes() +
                      ' : ' +
                      (new Date(timeStart).getHours > 12 ? 'PM' : 'AM')
                    : 'Time Start'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  marginVertical: 8,
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,.04)',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 4,
                }}
                onPress={() => {
                  setShowTimeEndClock(true);
                }}
              >
                <Text style={{ textAlign: 'left' }}>
                  {timeEnd != 0
                    ? new Date(timeEnd).getHours() +
                      ' : ' +
                      new Date(timeEnd).getMinutes() +
                      ' : ' +
                      (new Date(timeEnd).getHours > 12 ? 'PM' : 'AM')
                    : 'Time End'}
                </Text>
              </TouchableOpacity>
              <RNPickerSelect
                style={{ width: '90%' }}
                placeholder={{ label: 'Select class' }}
                onValueChange={(value) => {
                  setClasses({ name: value });
                }}
                items={authStore.user.classes.map((val) => {
                  return {
                    label: val?.name,
                    value: val?.name,
                  };
                })}
              />
              {/* <RNPickerSelect
                  style={{ width: "90%" }}
                  placeholder={{ label: "Select subject" }}
                  onValueChange={(value) => {
                    setSubject({ name: value });
                  }}
                  items={authStore.user.subject.map((val) => {
                    return {
                      label: val?.name,
                      value: val?.name,
                    };
                  })}
                /> */}
              <Button onPress={handleGenerateCode} style={{ marginBottom: 12 }}>
                Generate
              </Button>
              {value !== '' && <QRCode getRef={(c) => (qrRef.current = c)} size={200} value={value} />}
              {value !== '' && (
                <TouchableOpacity
                  onPress={handleSaveQrToDisk}
                  activeOpacity={0.7}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,.1)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 4,
                    marginVertical: 20,
                  }}
                >
                  <IonIcon name="arrow-down-circle-outline" color={'black'} size={26} />
                  <Text style={{ marginHorizontal: 6 }}>Save to library</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        {showTimeStartClock && (
          <RNDateTimePicker
            mode="time"
            display="spinner"
            onChange={setDateTimeStart}
            value={new Date()}
            maximumDate={new Date()}
          />
        )}
        {showTimeEndClock && (
          <RNDateTimePicker
            mode="time"
            display="spinner"
            onChange={setDateTimeEnd}
            value={new Date()}
            maximumDate={new Date()}
          />
        )}
        <View
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 20,
          }}
        ></View>
      </>
    </View>
  );
};
export default observer(History);
