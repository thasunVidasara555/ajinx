// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase, ref, push } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig1 = {
  apiKey: "AIzaSyBHjrth8B0QFXQZOL3re4vdyc0q7vBKvJg",
  authDomain: "ajinx-2.firebaseapp.com",
  projectId: "ajinx-2",
  storageBucket: "ajinx-2.appspot.com",
  messagingSenderId: "244315272771",
  appId: "1:244315272771:web:931b93d7c5f0849ce3c6f6",
};

const app1 = initializeApp(firebaseConfig1);

const database1 = getDatabase(app1);
const storage1 = getStorage(app1);
const db1 = getFirestore(app1);
const auth1 = getAuth(app1);

export { database1, storage1, db1, auth1, ref, push };
