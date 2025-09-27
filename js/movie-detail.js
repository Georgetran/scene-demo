import { auth, db } from "./firebase_config.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const userDropdownMenu = document.getElementById("userDropdownMenu");
onAuthStateChanged(auth, (user) => {
  if (user) {
    const username = user.displayName || user.email.split("@")[0];
    userDropdownMenu.innerHTML = `
      <li><h6 class="dropdown-header">👤 ${username}</h6></li>
      <li><a class="dropdown-item" href="profile.html">Profile</a></li>
      <li><a class="dropdown-item" id="logoutBtn">Logout</a></li>
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      alert("User had logged out.")
      signOut(auth);
    });
  } else {
    userDropdownMenu.innerHTML = `
      <li><h6 class="dropdown-header">👤 Guest</h6></li>
      <li><a class="dropdown-item" href="login.html">Sign In</a></li>
      <li><a class="dropdown-item" href="signup.html">Sign Up</a></li>
    `;
  }
});
// ================= API Config =================
const API_KEY = "aeecf249eb4618206125a27c7b5a6447";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w500";

// lấy movieId từ URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

// DOM elements
const posterEl = document.getElementById("movie-poster");
const titleEl = document.getElementById("movie-title");
const metaEl = document.getElementById("movie-meta");
const taglineEl = document.getElementById("movie-tagline");
const overviewEl = document.getElementById("movie-overview");
const crewEl = document.getElementById("movie-crew");
const castListEl = document.getElementById("cast-list");
const reviewsEl = document.getElementById("reviews");
const trailerVideo = document.getElementById("trailer-video");
const trailerBtn = document.getElementById("play-trailer");
const userScore = document.getElementById("user-score");

const favBtn = document.getElementById("btn-fav");
const myListBtn = document.getElementById("btn-mylist");

let currentUser = null;

// ================= Fetch Data =================
async function getMovieDetail() {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos,reviews`
  );
  return res.json();
}

// ================= Firestore Toggle =================
async function toggleMovie(listName, movie, btn, activeClass) {
  if (!currentUser) {
    alert("⚠️ Please sign in first!");
    return;
  }
  const userRef = doc(db, "users", currentUser.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    await setDoc(userRef, { favorites: [], mylist: [] });
  }

  const movieData = { id: movie.id, title: movie.title, poster_path: movie.poster_path };
  const userData = snapshot.data() || {};
  const list = userData[listName] || [];
  const exists = list.some((m) => m.id === movie.id);

  if (exists) {
    const newList = list.filter((m) => m.id !== movie.id);
    await updateDoc(userRef, { [listName]: newList });
    btn.classList.remove(activeClass);
  } else {
    const newList = [...list, movieData];
    await updateDoc(userRef, { [listName]: newList });
    btn.classList.add(activeClass);
  }
}

// ================= Render =================
function renderMovie(movie) {
  posterEl.src = IMG_PATH + movie.poster_path;
  titleEl.textContent = movie.title;
  metaEl.textContent = `${movie.release_date} • ${movie.runtime} min • ${movie.genres
    .map((g) => g.name)
    .join(", ")}`;
  taglineEl.textContent = movie.tagline;
  overviewEl.textContent = movie.overview;
  userScore.textContent = Math.round(movie.vote_average * 10) + "%";

  // crew
  crewEl.innerHTML = "";
  movie.credits.crew
    .filter((c) => ["Director", "Writer", "Screenplay"].includes(c.job))
    .forEach((c) => {
      const div = document.createElement("div");
      div.className = "col-md-4";
      div.innerHTML = `<p><b>${c.name}</b><br><small>${c.job}</small></p>`;
      crewEl.appendChild(div);
    });

  // cast
  castListEl.innerHTML = movie.credits.cast
    .slice(0, 10)
    .map(
      (c) => `
      <div class="cast-card me-3 text-center" style="width:120px;">
        <a href="person-detail.html?id=${c.id}">
          <img src="${
            c.profile_path ? IMG_PATH + c.profile_path : "images/default_avatar.jpg"
          }" class="rounded mb-2" style="width:100px;">
        </a>
        <p class="small"><b>${c.name}</b><br>${c.character}</p>
      </div>
    `
    )
    .join("");

  // reviews
  reviewsEl.innerHTML = movie.reviews.results.length
    ? movie.reviews.results
        .slice(0, 3)
        .map(
          (r) => `
      <div class="border p-3 mb-2 rounded">
        <p><b>${r.author}</b></p>
        <p>${r.content.slice(0, 300)}...</p>
      </div>
    `
        )
        .join("")
    : "<p>No reviews yet.</p>";

  // trailer
  const trailer = movie.videos.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  if (trailer) {
    trailerBtn.addEventListener("click", () => {
      const modalEl = document.getElementById("trailerModal");
      const modal = new bootstrap.Modal(modalEl);

      trailerVideo.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
      modal.show();

      modalEl.addEventListener("hidden.bs.modal", () => {
        trailerVideo.src = "";
      });
    });
  } else {
    trailerBtn.style.display = "none";
  }

  // Fav/MyList toggle
  favBtn.addEventListener("click", () =>
    toggleMovie("favorites", movie, favBtn, "btn-danger")
  );
  myListBtn.addEventListener("click", () =>
    toggleMovie("mylist", movie, myListBtn, "btn-success")
  );
}

// ================= Init =================
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  const movie = await getMovieDetail();
  renderMovie(movie);

  if (user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if ((data.favorites || []).some((m) => m.id == movieId)) {
        favBtn.classList.add("btn-danger");
      }
      if ((data.mylist || []).some((m) => m.id == movieId)) {
        myListBtn.classList.add("btn-success");
      }
    }
  }
});
