const { addDoc, collection } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
  apiKey: 'AIzaSyCo2k_SyjOSOpxaaiWlCJvEn0CIEl23JCk',
  authDomain: 'qr-atentdance.firebaseapp.com',
  projectId: 'qr-atentdance',
  storageBucket: 'qr-atentdance.appspot.com',
  messagingSenderId: '285780628611',
  appId: '1:285780628611:web:51200a989bc0fd535fb7b6',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireStore = getFirestore(app);
const storage = getStorage(app);

const data = [
  { name: 'users', child: [] },
  {
    name: 'schedules',
    child: [
      {
        checked_at: new Date(),
        teacher_id: 'uzVU0xuzqEVa6zeEeuyf',
        user: { name: 'bui cong dung' },
        classes: { name: 'K34DL' },
      },
      // {
      //   checked_at: new Date(),
      //   teacher_id: "uzVU0xuzqEVa6zeEeuyf",
      //   user: { name: "khanhdaica2" },
      //   classes: { name: "K34DL" },
      // },
      // {
      //   checked_at: new Date(),
      //   teacher_id: "uzVU0xuzqEVa6zeEeuyf",
      //   user: { name: "khanhdaica3" },
      //   classes: { name: "K34DL" },
      // },
      // {
      //   checked_at: new Date(),
      //   teacher_id: "uzVU0xuzqEVa6zeEeuyf",
      //   user: { name: "khanhdaica4" },
      //   classes: { name: "K34DL" },
      // },
      // {
      //   checked_at: new Date(),
      //   teacher_id: "uzVU0xuzqEVa6zeEeuyf",
      //   user: { name: "khanhdaica5" },
      //   classes: { name: "K34DL" },
      // },
      // {
      //   checked_at: new Date(),
      //   teacher_id: "uzVU0xuzqEVa6zeEeuyf",
      //   user: { name: "alscknaslckn" },
      //   classes: { name: "K34DH" },
      // },
      // {
      //   checked_at: new Date(),
      //   teacher_id: "uzVU0xuzqEVa6zeEeuyf",
      //   user: { name: "lcanslkcas" },
      //   classes: { name: "K34TT" },
      // },
      // {
      //   checked_at: new Date(),
      //   teacher_id: "uzVU0xuzqEVa6zeEeuyf",
      //   user: { name: "alcnaacas" },
      //   classes: { name: "K34DL" },
      // },
      // {
      //   checked_at: new Date(),
      //   teacher_id: "uzVU0xuzqEVa6zeEeuyf",
      //   user: { name: "acascasc" },
      //   classes: { name: "K34CT" },
      // },
      // {
      //   checked_at: new Date(),
      //   teacher_id: "uzVU0xuzqEVa6zeEeuyf",
      //   user: { name: "ascscasc" },
      //   classes: { name: "K34KT" },
      // },
    ],
  },
];
//  user = { name : '' , role : 'STUDENT' , email :'',password:''}

data.forEach((d) => {
  d.child.forEach((dd) => {
    addData(fireStore, d.name, dd);
  });
});
async function addData(db, name, data) {
  await addDoc(collection(db, name), data);
}
