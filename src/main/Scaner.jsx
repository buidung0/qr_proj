import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import scheduleStore from "../store/ScheduleStore";
import authStore from "../store/AuthStore";
export const Scanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    if (data.length > 0) {
      const checkData = JSON.parse(data);
      let time = new Date().getTime();

      if (time < checkData?.start) {
        Alert.alert("Error", "Time check incorrect u checked in early!");
        return;
      }
      if (time > checkData?.end) {
        Alert.alert("Error", "Time check incorrect u checked in late!");
        return;
      }
      if (authStore.user.classes.name != checkData.classes.name) {
        Alert.alert("Error", "Invalid classes");
        return;
      }
      if (time >= checkData?.start && time <= checkData?.end) {
        const data = {
          checked_at: new Date(),
          teacher_id: checkData?.teacherId,
          user: { name: authStore.user.name ,msv: authStore.user.msv},
          classes: checkData?.classes,
        };
        scheduleStore.checked(data);
      } else {
        Alert.alert("Error", "Time check incorrect u checked late!");
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button style={{marginTop:20}} title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent:"center",
    justifyContent:"flex-end"
  },
});
