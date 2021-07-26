import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA_ZhGnyx1lQaIa3QyfqBjNHcGqTo5zqic",
  authDomain: "chatify-1f5c7.firebaseapp.com",
  projectId: "chatify-1f5c7",
  storageBucket: "chatify-1f5c7.appspot.com",
  messagingSenderId: "59693324588",
  appId: "1:59693324588:web:e9187bdd4ef6fe4f9af489",
  measurementId: "G-GBS9V65L70",
};
firebase.initializeApp(firebaseConfig);

export default firebase;
