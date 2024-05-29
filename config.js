import firebase from 'firebase';
const firebaseConfig = {
  apiKey: "AIzaSyAc5YLfeWvw6YS9xruvWH5wSLftMHX08Dc",
  authDomain: "sohan-elib.firebaseapp.com",
  projectId: "sohan-elib",
  storageBucket: "sohan-elib.appspot.com",
  messagingSenderId: "186541675502",
  appId: "1:186541675502:web:80976a26d503fc85edb4ff"
};

firebase.initializeApp(firebaseConfig);
export default firebase.firestore()