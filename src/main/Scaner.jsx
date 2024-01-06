import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import scheduleStore from '../store/ScheduleStore';
import authStore from '../store/AuthStore';
import * as Location from 'expo-location';

export const Scanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraType, setCameraType] = useState(BarCodeScanner.Constants.Type.back);
  // const [zoom, setZoom] = useState(0);
  const [canScanAgain, setCanScanAgain] = useState(true);
  const cameraRef = useRef(null);
  useLayoutEffect(() => {
    scheduleStore.getClasses();
    scheduleStore.getSubject();
  }, []);
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
  }, []);
  useEffect(() => {
    let timer;
    if (!canScanAgain) {
      timer = setTimeout(() => {
        setCanScanAgain(true);
      }, 5000); // Đợi 5 giây trước khi cho phép quét lại
    }
    return () => clearTimeout(timer);
  }, [canScanAgain]);
  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Quyền truy cập vị trí bị từ chối.');
        return null;
      }
      let location = await Location.getCurrentPositionAsync({});
      return location;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const calculateDistance = (latitude1, longitude1, latitude2, longitude2) => {
    const deg2rad = (angle) => {
      return angle * (Math.PI / 180);
    };
    const R = 6378.1; // Earth's radius in kilometers
    const lat1 = deg2rad(latitude1);
    const lon1 = deg2rad(longitude1);
    const lat2 = deg2rad(latitude2);
    const lon2 = deg2rad(longitude2);
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    //Công thức Haversine cho phép tính toán khoảng cách giữa hai điểm dựa trên vĩ độ và kinh độ của chúng trên bề mặt cầu quay, thông qua một loạt các phép toán lượng giác
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceKm = R * c; // in kilometers
    const distanceMiles = 0.621371 * distanceKm; // in miles
    const distanceMeters = 0.001 * distanceKm; // in meters
    // console.log({ kilometers: distanceKm, miles: distanceMiles ,meter: distanceMeters})
    console.log({ meter: distanceMeters });
    return distanceMeters;
  };
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    if (data.length > 0) {
      const checkData = JSON.parse(data);
      // console.log('checkdata:: ' + JSON.stringify(checkData));
      const userLocation = await getUserLocation();
      if (!userLocation) {
        Alert.alert('Error', 'Không thể lấy vị trí hiện tại.');
        return;
      }
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        checkData.lat,
        checkData.lon,
      );

      if (!canScanAgain) {
        // Nếu không thể quét lại sau 5 giây, không làm gì cả
        return;
      }
      setScanned(true);
      setCanScanAgain(false);

      let time = new Date().getTime();
      if (distance <= 50) {
        if (time < checkData?.start) {
          Alert.alert('Error', 'Time check incorrect u checked in early!');
          return;
        }
        if (checkData?.start === '') {
          Alert.alert('Error', 'Invalid data');
          return;
        }
        if (time > checkData?.end) {
          Alert.alert('Error', 'Time check incorrect u checked in late!');
          return;
        }
        if (authStore.user.classes.name != checkData.classes.name) {
          Alert.alert('Error', 'Invalid classes');
          return;
        }
        if (time >= checkData?.start && time <= checkData?.end) {
          const data = {
            checked_at: new Date(),
            teacher_id: checkData?.teacherId,
            user: { name: authStore.user.name, msv: authStore.user.msv },
            subject: checkData?.subject,
            classes: checkData?.classes,
          };
          console.log('check data export ?:' + JSON.stringify(data));
          scheduleStore.checked(data);
        } else {
          Alert.alert('Error', 'Time check incorrect u checked late!');
        }
      } else {
        Alert.alert('Error', 'You are not in the attendance zone!');
      }
    }
  };
  // console.log(scheduleStore.subject)
  // console.log(authStore.user.classes.name);
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <BarCodeScanner
          ref={cameraRef}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      {scanned && (
        <Button
          style={{
            marginTop: 20,
            width: 130,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            backgroundColor: '#4d4dff',
          }}
          labelStyle={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}
          onPress={() => setScanned(false)}
          title="Tap to Scan Again"
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'flex-end',
  },
  // overlay: {
  //   flexDirection: "row",
  //   justifyContent: "space-around",
  //   alignItems: "center",
  //   marginBottom: 1,
  //   width:50,
  //   height:50,
  //   borderRadius:50,
  //   width: '100%',
  // },
});
