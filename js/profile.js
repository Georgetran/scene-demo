import { auth, db } from "./firebase_config.js";
import { 
  onAuthStateChanged, signOut, updateProfile, updatePassword, 
  EmailAuthProvider, reauthenticateWithCredential 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// DOM elements
const usernameInput = document.getElementById("usernameInput");
const phoneInput = document.getElementById("phoneInput");
const countryInput = document.getElementById("countryInput");
const bioInput = document.getElementById("bioInput");
const saveBtn = document.getElementById("saveProfileBtn");

const usernameDisplay = document.getElementById("usernameDisplay");
const emailDisplay = document.getElementById("emailDisplay");

const editProfileBtn = document.getElementById("editProfileBtn");
const editForm = document.getElementById("editForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const changePasswordBtn = document.getElementById("changePasswordBtn");
const passwordModal = document.getElementById("passwordModal");
const savePasswordBtn = document.getElementById("savePasswordBtn");
const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");

let currentUser = null;

// Load user info
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;

  const displayName = user.displayName || user.email.split("@")[0];
  const userDropdownMenu = document.getElementById("userDropdownMenu");
  if (userDropdownMenu) {
    userDropdownMenu.innerHTML = `
      <li><h6 class="dropdown-header">👤 ${displayName}</h6></li>
      <li><a class="dropdown-item" href="profile.html">Profile</a></li>
      <li><a class="dropdown-item" id="logoutBtn">Logout</a></li>
    `;
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "login.html";
    });
  }

  const docRef = doc(db, "users", user.uid);
  let docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      username: displayName, 
      email: user.email,
      phone: "",
      country: "",
      bio: "",
      favorites: [],
      mylist: []
    });
    docSnap = await getDoc(docRef);
  }

  const userData = docSnap.data();

  // Populate inputs
  usernameInput.value = userData.username || "";
  phoneInput.value = userData.phone || "";
  countryInput.value = userData.country || "";
  bioInput.value = userData.bio || "";

  // Populate profile display
  usernameDisplay.textContent = userData.username || displayName;
  emailDisplay.textContent = userData.email || user.email;

  // Render favorites + mylist
  renderList(user.uid, "favorites", "favoritesList");
  renderList(user.uid, "mylist", "myList");
});

// --- Edit profile ---
editProfileBtn?.addEventListener("click", () => {
  editForm.classList.remove("hidden");
});
cancelEditBtn?.addEventListener("click", () => {
  editForm.classList.add("hidden");
});
saveBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  await updateProfile(user, { displayName: usernameInput.value });
  await setDoc(doc(db, "users", user.uid), {
    username: usernameInput.value,
    phone: phoneInput.value,
    country: countryInput.value,
    bio: bioInput.value,
    email: user.email
  }, { merge: true });

  usernameDisplay.textContent = usernameInput.value;
  emailDisplay.textContent = user.email;
  alert("✅ Profile updated!");
});

// --- Change password modal ---
changePasswordBtn?.addEventListener("click", () => {
  passwordModal.classList.remove("hidden");
});
cancelPasswordBtn?.addEventListener("click", () => {
  passwordModal.classList.add("hidden");
});
savePasswordBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const oldPass = document.getElementById("oldPassword").value;
  const newPass = document.getElementById("newPassword").value;
  const confirmPass = document.getElementById("confirmPassword").value;

  if (!oldPass || !newPass || !confirmPass) {
    alert("❌ Please fill all fields.");
    return;
  }
  if (newPass !== confirmPass) {
    alert("❌ New passwords do not match.");
    return;
  }

  try {
    const cred = EmailAuthProvider.credential(user.email, oldPass);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPass);
    alert("✅ Password changed successfully!");
    passwordModal.classList.add("hidden");
  } catch (err) {
    console.error(err);
    alert("❌ Error: " + err.message);
  }
});

// --- Remove from list ---
async function removeFromList(uid, listName, movieId) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const list = data[listName] || [];
  const newList = list.filter(m => m.id !== movieId);
  await updateDoc(userRef, { [listName]: newList });
  renderList(uid, listName, listName === "favorites" ? "favoritesList" : "myList");
}

// --- Render movie lists ---
async function renderList(uid, listName, containerId) {
  const container = document.getElementById(containerId);
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data()[listName] || [];

  if (!data.length) {
    container.innerHTML = "<p class=' text-no-movie'>No movies added yet.</p>";
    return;
  }

  container.innerHTML = `
    <div class="d-flex flex-row overflow-auto">
      ${data.map(m => `
        <div class="movie-card me-3 text-center position-relative" style="width:120px;">
          <a href="movie-detail.html?id=${m.id}">
            <img src="https://image.tmdb.org/t/p/w200${m.poster_path}" 
                 class="rounded shadow mb-2 movie-thumb" style="width:100px;">
          </a>
          <p class="small">${m.title}</p>
          <button class="btn btn-sm btn-danger position-absolute top-0 end-0 remove-btn" data-id="${m.id}" style="border-radius:50%;">×</button>
        </div>
      `).join("")}
    </div>
  `;

  container.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromList(uid, listName, parseInt(btn.dataset.id));
    });
  });
}

