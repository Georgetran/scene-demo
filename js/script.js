
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

// TMDB API
const API_KEY = "aeecf249eb4618206125a27c7b5a6447"; 
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const sections = {
  "popular-movies": `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`,
  "high-rated-movies": `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`,
  "upcoming-movies": `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
};

async function fetchMovies(endpoint, containerId) {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    data.results.forEach(movie => {
      const card = document.createElement("div");
      card.classList.add("movie-card");
      card.innerHTML = `
        <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'images/no-poster.png'}" alt="${movie.title}">
        <div class="movie-info">
          <p class="movie-title hover-title">${movie.title}</p>
          <p class="movie-date">${movie.release_date || "Coming Soon"}</p>
        </div>
      `;
      card.addEventListener("click", () => {
        window.location.href = `movie-detail.html?id=${movie.id}`;
      });
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching movies:", err);
  }
}

for (let sectionId in sections) {
  fetchMovies(sections[sectionId], sectionId);
}

document.querySelectorAll(".more-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    const category = btn.dataset.category;
    window.location.href = `movielist.html?type=${type}&category=${category}`;
  });
});

const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `search-results.html?query=${encodeURIComponent(query)}&type=movie`;
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      searchBtn.click();
    }
  });
}
