// Import the functions you need from the SDKs you need
import { auth } from './firebase_config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Initialize Firebase

  const formInput = document.getElementById("form-signin");

  formInput.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth,email,pass);
        const user = userCredential.user;
        alert("Signed in succesfully." );
        window.location.href = "./index.html";
    }
    catch (err) {
        alert("Error occured while signing in." + err.message);
    }
  });
