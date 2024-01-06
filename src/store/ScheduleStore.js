import { addDoc, collection, getDocs, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { fireStore } from '../../firebase.config';
import { Alert } from 'react-native';
import authStore from './AuthStore';

const { makeAutoObservable } = require('mobx');

class ScheduleStore {
  DB = fireStore;
  schedules = [];
  sc = [];
  sce = [];
  ubr = [];
  classes = [];
  notifications = [];
  subject = [];

  constructor() {
    makeAutoObservable(this);
  }
  setSchedule = (val) => {
    this.schedules = val;
  };
  setSc = (val) => {
    this.sc = val;
  };
  setNoti = (val) => {
    this.notifications = val;
  };
  setSce = (val) => {
    this.sce = val;
  };
  setSubject = (val) => {
    this.subject = val;
  };
  setUBR = (val) => {
    this.ubr = val;
  };
  setClasses = (val) => {
    this.classes = val;
  };
  getClasses = async () => {
    try {
      const rs = await getDocs(query(collection(this.DB, 'classes')));
      // console.log('rs::' + JSON.stringify(rs));
      let rss = [];
      rs.forEach((doc) => {
        rss.push(doc.data());
      });
      this.setClasses(rss);
    } catch (e) {
      console.log(e);
    }
  };
  getSubject = async () => {
    try {
      const sj = await getDocs(query(collection(this.DB, 'subject')));
      // console.log("sj::"+sj)
      let sj1 = [];
      sj.forEach((doc) => {
        sj1.push(doc.data());
      });
      this.setSubject(sj1);
    } catch (e) {
      console.log(e);
    }
  };
  getSchedules = async () => {
    try {
      const sd = await getDocs(query(collection(this.DB, 'schedules'), orderBy('checked_at', 'asc')));
      // console.log("sj::"+sj)
      let sd1 = [];
      sd.forEach((doc) => {
        sd1.push(doc.data());
      });
      this.setSce(sd1);
    } catch (e) {
      console.log(e);
    }
  };

  getUseByRole = async () => {
    try {
      const q = query(collection(this.DB, 'users'), where('role', '==', 'STUDENT'), orderBy('name', 'desc'));
      const unsub = onSnapshot(q, (querySnapshot) => {
        const newSchedule = [];
        querySnapshot.forEach((doc) => {
          const scheduleData = doc.data();
          const newUsers = {
            avatar: scheduleData.avatar,
            user: scheduleData.name,
            class: scheduleData.classes.name,
            email: scheduleData.email,
            studentID: scheduleData.msv,
          };
          newSchedule.push(newUsers);
        });
        this.setUBR(newSchedule);
      });
    } catch (e) {
      console.log(e);
    }
  };

  listenSc = async () => {
    try {
      const q = query(collection(this.DB, 'schedules'), orderBy('checked_at', 'asc'));
      const unsub = onSnapshot(q, (querySnapshot) => {
        let schedule = [];
        querySnapshot.docChanges().forEach((change) => {
          const scheduleData = change.doc.data();
          // console.log(scheduleData)
          const selectedFields = {
            checked_at: new Date(scheduleData.checked_at.seconds * 1000),
            class: scheduleData.classes.name,
            subject: scheduleData.subject.name,
            teacher_id: scheduleData.teacher_id,
            name: scheduleData.user.name,
            ID: scheduleData.user.msv,
          };
          schedule.push(selectedFields);
        });
        this.setSc(schedule);
      });
    } catch (e) {
      console.log(e);
    }
  };

  listenSchedule = async (teacherId) => {
    try {
      let start = new Date();
      start.setUTCHours(0, 0, 0, 0);

      let end = new Date();
      end.setUTCHours(23, 59, 59, 999);
      const q = query(
        collection(this.DB, 'schedules'),
        where('checked_at', '>=', start),
        where('checked_at', '<=', end),
        where('teacher_id', '==', teacherId),
      );

      const unsub = onSnapshot(q, (querySnapshot) => {
        let schedule = [];
        let mine = false;
        querySnapshot.docChanges().forEach((change) => {
          if (change.type == 'added') {
            if (querySnapshot.docChanges().length == 1) {
              if (change.doc.data().teacher_id == authStore.user.id) {
                mine = true;
              }
            }
            schedule.push(change.doc.data());
          }
        });

        if (schedule.length == 1) {
          schedule = [...schedule, ...this.schedules];
          if (mine) {
            this.setNoti([0]);
          }
        }

        this.setSchedule(schedule);
      });
    } catch (e) {
      console.log(e);
    }
  };

  checked = async (checkData) => {
    try {
      console.log(checkData);
      let start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      let end = new Date();
      end.setUTCHours(23, 59, 59, 999);
      const q = query(
        collection(this.DB, 'schedules'),
        where('checked_at', '>=', start),
        where('checked_at', '<=', end),
        where('teacher_id', '==', checkData.teacher_id),
      );
      const rs = await getDocs(q);
      let canAdd = true;
      rs.forEach((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          // console.log('datadoc:' + JSON.stringify(data));
          // console.log('checkdata::  ' + JSON.stringify(checkData));
          if (data?.user.name == checkData.user.name && data?.subject.name == checkData.subject.name) {
            canAdd = false;
          }
        }
      });
      if (!canAdd) {
        Alert.alert('Invalid', 'You checked in!');
        return;
      }
      addDoc(collection(this.DB, 'schedules'), checkData);
      Alert.alert('Success', 'Check in success');
    } catch (e) {
      console.log(e);
    }
  };
}
const scheduleStore = new ScheduleStore();
export default scheduleStore;
