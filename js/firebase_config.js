  // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
  // Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwgIs8aGzcp7VCX6k5vilUsaHigUcLUeg",
  authDomain: "scene-f735f.firebaseapp.com",
  projectId: "scene-f735f",
  storageBucket: "scene-f735f.firebasestorage.app",
  messagingSenderId: "875776182352",
  appId: "1:875776182352:web:59b7cfacd8cb0eafac6955",
  measurementId: "G-Y1ZQDB2EZ7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db};