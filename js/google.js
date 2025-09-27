// Import the functions you need from the SDKs you need
import { auth } from './firebase_config.js';
import { signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
  
const googleBtn = document.getElementById("btn-google");
googleBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    googleBtn.disable = true;
    const provider = new GoogleAuthProvider();
    try {
        const rs = await signInWithPopup(auth,provider);
        const user = rs.user;
        alert("Sign in succesfully.");
        window.location.href = './index.html'
    }
    catch (err) {
        console.log(err.message);
    }
});