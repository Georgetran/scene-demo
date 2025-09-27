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
const IMG_PATH = "https://image.tmdb.org/t/p/w500";

const urlParams = new URLSearchParams(window.location.search);
let query = urlParams.get("query") || "";
let type = urlParams.get("type") || "movie";
let page = 1;

const resultsContainer = document.getElementById("search-results");
const title1 = document.getElementById("search-title");
const toggleBtn = document.getElementById("toggleType");
const loadMoreBtn = document.getElementById("load-more");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

function updateTitle() {
  title1.textContent = `Search results for "${query}" (${type})`;
  if (type === "movie") {
    toggleBtn.textContent = "Switch to People";
  } else {
    toggleBtn.textContent = "Switch to Movies";
  }
}

async function fetchSearch() {
  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  renderResults(data.results);
}

function renderResults(items) {
  items.forEach(item => {
    let html = "";
    if (type === "movie") {
      if (!item.poster_path || !item.title) return;

      html = `
        <div class="col-6 col-md-3 col-lg-2 mb-4">
          <div class="card h-100 shadow-sm">
            <a href="movie-detail.html?id=${item.id}">
              <img src="${IMG_PATH + item.poster_path}" class="card-img-top" alt="${item.title}">
            </a>
            <div class="card-body">
              <h6 class="card-title text-light hover-title">${item.title}</h6>
              <p class="card-text"><small>${item.release_date || "N/A"}</small></p>
            </div>
          </div>
        </div>`;
    } else if (type === "person") {
      if (!item.profile_path || !item.name) return;

      html = `
        <div class="col-6 col-md-3 col-lg-2 mb-4">
          <div class="card h-100 shadow-sm">
            <a href="person-detail.html?id=${item.id}">
              <img src="${IMG_PATH + item.profile_path}" class="card-img-top" alt="${item.name}">
            </a>
            <div class="card-body">
              <h6 class="card-title text-light hover-title">${item.name}</h6>
            </div>
          </div>
        </div>`;
    }
    resultsContainer.innerHTML += html;
  });
}

function resetResults() {
  resultsContainer.innerHTML = "";
  page = 1;
  fetchSearch();
  updateTitle();
}
resetResults();

toggleBtn.addEventListener("click", () => {
  type = type === "movie" ? "person" : "movie";
  resetResults();
});

loadMoreBtn.addEventListener("click", () => {
  page+=2;
  fetchSearch();
});

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    query = searchInput.value.trim();
    if (query) {
      type = "movie"; 
      resetResults();
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchBtn.click();
    }
  });
}