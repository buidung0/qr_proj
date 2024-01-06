import { observer } from 'mobx-react';
import VStack from '../cpn/layout/VStack';
import authStore from '../store/AuthStore';
import { useLayoutEffect, useState } from 'react';
import scheduleStore from '../store/ScheduleStore';
import { ROLES } from '../enum/role';
import Teacher from '../screens/Teacher';
import Student from '../screens/Student';
const Home = () => {
  const role = authStore.user.role;
  useLayoutEffect(() => {
    scheduleStore.listenSchedule(authStore?.user?.id);
  }, []);
  return (
    <VStack flex={1} justifyContent={'center'} alignItem={'center'}>
      {role == ROLES.TEACHER ? <Teacher /> : <Student />}
    </VStack>
  );
};
export default observer(Home);
