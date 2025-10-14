// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB-jU0onguGwUiS7L5PSgAfJouj_dLhjPw',
  authDomain: 'adminconsole-parshwa.firebaseapp.com',
  projectId: 'adminconsole-parshwa',
  storageBucket: 'adminconsole-parshwa.appspot.com',
  messagingSenderId: '589288702270',
  appId: '1:589288702270:web:c24582a56fb4413002ec6f',
};

// Initialize Firebase
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// Initialize Firebase
const storage = getStorage(app);
const firestore = getFirestore(app);

export const GoogleProvider = new GoogleAuthProvider();

export const auth = getAuth(app);

export { storage, firestore };
