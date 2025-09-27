import { auth, db } from './firebase_config.js'; // vì file ở trong thư mục js/
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"; 

const registerFormInput = document.getElementById("form-register");

registerFormInput.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();
    const confirmpass = document.getElementById("confirmPassword").value.trim();    
    const role_id = 2;

    const lowerCase = /[a-z]/g;
    const upperCase = /[A-Z]/g;
    const number = /[0-9]/g;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }  
    if (username.length < 6) {
        alert("Username must be at least 6 characters!");
        return;
    }  
    if (pass !== confirmpass) {
        alert("The passwords do not match!");
        return;
    }  
    if (!pass.match(lowerCase)) {
        alert("Password must include lowercase letters!");
        return;
    }  
    if (!pass.match(upperCase)) {
        alert("Password must include uppercase letters!");
        return;
    }  
    if (!pass.match(number)) {
        alert("Password must include a number!");
        return;
    }

    try {
        // Tạo user auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Cập nhật displayName để lưu tên user vào profile auth
        await updateProfile(user, { displayName: username });

        // Lưu vào Firestore theo UID (document id = uid)
        const userData = {
            username,
            email,
            role_id,
            favorites: [],
            mylist: [],
            phone: "",
            country: "",
            bio: ""
        };
        await setDoc(doc(db, "users", user.uid), userData);

        alert("✅ Register Successfully");
        window.location.href = "login.html";
    }
    catch (err) {
        alert("❌ Register error: " + err.message);
    }
});
