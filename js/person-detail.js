
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { auth } from './firebase_config.js';

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

const API_KEY = "aeecf249eb4618206125a27c7b5a6447";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w500";

const urlParams = new URLSearchParams(window.location.search);
const personId = urlParams.get("id");

const photoEl = document.getElementById("person-photo");
const nameEl = document.getElementById("person-name");
const bioEl = document.getElementById("person-bio");
const infoEl = document.getElementById("person-info");
const moviesEl = document.getElementById("person-movies");

if (!personId) {
  nameEl.textContent = "Person not specified";
  bioEl.textContent = "";
} else {
  (async function init() {
    try {
      const [detailsRes, creditsRes] = await Promise.all([
        fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}&language=en-US`)
      ]);
      if (!detailsRes.ok) throw new Error("Failed to fetch person details");
      if (!creditsRes.ok) throw new Error("Failed to fetch person credits");

      const details = await detailsRes.json();
      const credits = await creditsRes.json();

      renderPerson(details, credits);
    } catch (err) {
      console.error(err);
      nameEl.textContent = "Error loading person";
      bioEl.textContent = "";
    }
  })();
}

function renderPerson(details, credits) {
  // photo
  if (details.profile_path) {
    photoEl.src = IMG_PATH + details.profile_path;
  } else {
    photoEl.src = "images/default_avatar.jpg";
  }

  // name
  nameEl.textContent = details.name || "Unknown";

  // biography
  if (details.biography && details.biography.trim().length) {
    bioEl.textContent = details.biography;
  } else {
    bioEl.textContent = "No biography available.";
  }

  // info list (birthday, place_of_birth, gender)
  const infoItems = [];
  if (details.birthday) infoItems.push(`<li><strong>Birthday:</strong> ${details.birthday}</li>`);
  if (details.place_of_birth) infoItems.push(`<li><strong>Place of Birth:</strong> ${details.place_of_birth}</li>`);
  if (typeof details.gender !== "undefined") {
    // TMDB: 0 = Not set, 1 = Female, 2 = Male
    let genderText = "Unknown";
    if (details.gender === 1) genderText = "Female";
    else if (details.gender === 2) genderText = "Male";
    infoItems.push(`<li><strong>Gender:</strong> ${genderText}</li>`);
  }
  // known_for_department
  if (details.known_for_department) infoItems.push(`<li><strong>Department:</strong> ${details.known_for_department}</li>`);

  infoEl.innerHTML = infoItems.join("");

  // Known for / movie credits: use credits.cast (movies where the person acted) and credits.crew as backup.
  // We'll take unique movies, sorted by popularity, and show up to 12.
  const movies = [];
  const pushUnique = (m) => {
    if (!m || !m.id) return;
    if (!movies.some(x => x.id === m.id)) movies.push(m);
  };
  if (credits && Array.isArray(credits.cast)) credits.cast.forEach(pushUnique);
  if (credits && Array.isArray(credits.crew)) credits.crew.forEach(pushUnique);

  // Sort by popularity desc if available, else by vote_count
  movies.sort((a, b) => {
    const pa = a.popularity || a.vote_count || 0;
    const pb = b.popularity || b.vote_count || 0;
    return pb - pa;
  });

  const shown = movies.slice(0, 12);

  if (!shown.length) {
    moviesEl.innerHTML = "<p class='text-muted'>No movie credits available.</p>";
    return;
  }

  moviesEl.innerHTML = shown.map(m => {
    const poster = m.poster_path ? `${IMG_PATH}${m.poster_path}` : "images/default_poster.jpg";
    const title = m.title || m.original_title || m.name || "Untitled";
    return `
      <div class="person-movie-card me-3 text-center hover-type" style="width:140px;">
        <a href="movie-detail.html?id=${m.id}">
          <img src="${poster}" class="rounded mb-2" style="width:120px; height:auto;">
        </a>
        <p class="small text-truncate" style="max-width:120px; margin:0 auto;">${title}</p>
      </div>
    `;
  }).join("");
}
