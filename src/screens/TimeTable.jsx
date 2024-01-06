import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { eachDayOfInterval, format } from 'date-fns';
import scheduleStore from '../store/ScheduleStore';
import { da } from 'date-fns/locale';
import { observer } from 'mobx-react';

const TimeTable = () => {
  useLayoutEffect(() => {
    scheduleStore.getClasses();
    scheduleStore.getSubject();
    scheduleStore.getUseByRole();
    scheduleStore.listenSc();
    scheduleStore.getSchedules();
  }, []);
  useLayoutEffect(() => {}, scheduleStore.ubr);
  console.log(scheduleStore.ubr);
  const startDate = new Date(2023, 11, 1); // Ngày bắt đầu: 1/12/2023
  const endDate = new Date(2023, 11, 31); // Ngày kết thúc: 31/12/2023

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Chuyển đổi mỗi ngày thành chuỗi và đưa vào mảng
  const arrayOfDates = allDays.map((day) => format(day, 'dd/MM/yyyy'));
  // console.log(arrayOfDates);
  const data = {
    date: arrayOfDates,
    user: scheduleStore.ubr,
  };

  const dataWithUsers = data.date.map((date) => {
    const usersForDate = data.user.filter((user) => user.class === date);

    // Tạo một đối tượng mới cho mỗi ngày và thêm danh sách người dùng tương ứng
    return {
      date: date,
      users: usersForDate,
    };
  });
  // console.log(JSON.stringify(data));
  // console.log(JSON.stringify(dataWithUsers));
  const [selectedClass, setSelectedClass] = useState(''); // Lớp đã chọn

  const handleClassChange = (itemValue) => {
    // Xử lý khi lớp được chọn
    setSelectedClass(itemValue);
  };

  const combinedData = data.date.map((date) => {
    const filteredData = data.user.filter((user) => user.class === selectedClass);
    const users = filteredData.map((user) => user.user);

    return {
      date: date,
      user: users,
    };
  });
  console.log(combinedData);
  return (
    <View>
      {arrayOfDates.map((dateString, index) => (
        <Text key={index}>{dateString}</Text>
      ))}
    </View>
  );
};

export default observer(TimeTable);
