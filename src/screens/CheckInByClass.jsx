import { observer } from 'mobx-react';
import { Alert, ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useLayoutEffect } from 'react';
import scheduleStore from '../store/ScheduleStore';
import authStore from '../store/AuthStore';
import IonIcon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ROLES } from '../enum/role';

const CheckInByClass = (props) => {
  useLayoutEffect(() => {}, [scheduleStore.classes]);

  // console.log(scheduleStore.classes)
  const SC_W = Dimensions.get('window').width;
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

  // console.log(scheduleStore.schedules.user)
  const filterScheduleWithClass = (cl, schedules) => {
    return schedules.filter((sc) => sc.classes.name == cl);
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingTop: 50,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 2, right: 130 }}>
        <TouchableOpacity
          onPress={() => {
            nav.goBack();
          }}
          activeOpacity={0.7}
          style={{ paddingLeft: 5, paddingRight: 15, marginLeft: 5 }}
        >
          <IonIcon name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: -5 }}>Return</Text>
      </View>
      <Text style={{ fontSize: 26, marginVertical: 20, marginLeft: 10 }}>Attendance list by class</Text>
      <ScrollView>
        {scheduleStore.classes.map((cl, index) => {
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
    </View>
  );
};
export default observer(CheckInByClass);
