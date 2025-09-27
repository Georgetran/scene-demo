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
const type = urlParams.get("type");
const category = urlParams.get("category");

let page = 1;
const listContainer = document.getElementById("movie-list");
const loadBtn = document.getElementById("load-more");
const pageTitle = document.getElementById("page-title");

function Title(type,category)
{
  if (type === "movie") {
    switch (category) {
      case "popular": return "Popular Movies";
      case "now_playing": return "Now Playing";
      case "upcoming": return "Upcoming Movies";
      case "top_rated": return "Top Rated Movies";
    }
  } else if (type === "person") {
    if (category === "popular") return "Popular People";
  }
  return "Results";
}

pageTitle.textContent = Title(type,category)

async function fetchData () 
{
  let url = "";
    if (type === "movie") {
    url = `https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}&page=${page}`;
  } else if (type === "person") {
    url = `https://api.themoviedb.org/3/person/${category}?api_key=${API_KEY}&page=${page}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  renderCards(data.results);
}

function renderCards(items) {
  items.forEach(item => {
    let html = "";
    if (type === "movie") {
      if (!item.poster_path || !item.title) return;
      html = `
        <div class="col-6 col-md-3 col-lg-2">
          <div class="card h-100 shadow-sm">
            <a href="movie-detail.html?id=${item.id}">
              <img src="${IMG_PATH + item.poster_path}" class="card-img-top " alt="${item.title}">
            </a>
            <div class="card-body">
              <h6 class="card-title">
                <a href="movie-detail.html?id=${item.id}" class="text-decoration-none text-light hover-title">${item.title}</a>
              </h6>
              <p class="card-text"><small>${item.release_date}</small></p>
            </div>
          </div>
        </div>`;
    } else if (type === "person") {
      if (!item.profile_path || !item.name) return;
      html = `
        <div class="col-6 col-md-3 col-lg-2">
          <div class="card h-100 shadow-sm">
            <a href="person-detail.html?id=${item.id}">
              <img src="${IMG_PATH + item.profile_path}" class="card-img-top" alt="${item.name}">
            </a>
            <div class="card-body">
              <h6 class="card-title">
                <a href="person-detail.html?id=${item.id}" class="text-decoration-none text-light hover-title">${item.name}</a>
              </h6>
            </div>
          </div>
        </div>`;
    }
    listContainer.innerHTML += html;
  });
}


fetchData();

//Load btn
loadBtn.addEventListener("click", () => {
    page++;
    fetchData();
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
