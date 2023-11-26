const { addDoc, collection } = require("firebase/firestore");
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyBgdiKRihgsaeCUFyqCpuBkmoepNi6reNU",
  authDomain: "khanh-dev-portfolio.firebaseapp.com",
  projectId: "khanh-dev-portfolio",
  storageBucket: "khanh-dev-portfolio.appspot.com",
  messagingSenderId: "172968607054",
  appId: "1:172968607054:web:60a1a552a6f3b536af721f",
  measurementId: "G-Z83STJ60GR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireStore = getFirestore(app);
const storage = getStorage(app);

const data = [
  { name: "users", child: [] },
  {
    name: "schedules",
    child: [
      {
        checked_at: new Date(),
        teacher_id: "uzVU0xuzqEVa6zeEeuyf",
        user: { name: "dang duy khanh" },
        classes: { name: "K34DL" },
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
