document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "e03962f7d0373121b4abd521402d77ae";
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMG_URL = "https://image.tmdb.org/t/p/w500";

  const grid = document.getElementById("movieGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  let allMovies = [];
  let currentPage = 1;
  let totalPages = 1;
  const moviesPerBatch = 18;
  let isLoading = false;

  // ===== Helpers =====
  function toggleMovieInList(listKey, movie) {
    const list = JSON.parse(localStorage.getItem(listKey)) || [];
    const index = list.findIndex(item => item.id === movie.id);
    if (index >= 0) list.splice(index, 1);
    else list.push(movie);
    localStorage.setItem(listKey, JSON.stringify(list));
  }

  function isInList(listKey, movieId) {
    const list = JSON.parse(localStorage.getItem(listKey)) || [];
    return list.some(item => item.id === movieId);
  }

  // ===== Fetch Movies =====
  async function fetchMovies(page = 1) {
    try {
      const endpoint = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      totalPages = data.total_pages;
      return data.results.slice(0, moviesPerBatch);
    } catch (err) {
      console.error("Error fetching movies:", err);
      return [];
    }
  }

  // ===== Render Movies =====
  function renderMovies(movies) {
    const html = movies.map(item => {
      const title = item.title || "Untitled";
      const poster = item.poster_path
        ? `${IMG_URL}${item.poster_path}`
        : "https://placehold.co/400x600?text=No+Image";
      const year = item.release_date
        ? new Date(item.release_date).getFullYear()
        : "";
      const formattedTitle = year ? `${title} (${year})` : title;

      const rating = item.vote_average ? item.vote_average * 10 : 0;
      const color = rating < 50 ? "red" : rating < 85 ? "yellow" : "green";
      const radius = 18;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (rating / 100) * circumference;

      const inWatchlist = isInList("watchlist", item.id);
      const inWatched = isInList("watched", item.id);

      return `
        <div class="group relative transition-all duration-500 opacity-0 translate-y-4">
          <div class="relative overflow-hidden rounded-lg shadow-lg">
            <a href="../page/detail.html?id=${item.id}&type=movie">
              <img src="${poster}" alt="${title}" 
                class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110">
            </a>

            <!-- Rating -->
            <div class="absolute top-2 left-2">
              <svg class="w-10 h-10" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="${radius}" stroke="rgba(255,255,255,0.25)" stroke-width="4" fill="rgba(0,0,0,0.6)" />
                <circle cx="20" cy="20" r="${radius}" stroke="${color}" stroke-width="4" fill="none"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
                  transform="rotate(-90 20 20)" />
                <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-size="12">${rating.toFixed(0)}%</text>
              </svg>
            </div>

            <!-- Buttons -->
            <div class="absolute top-2 right-2 flex flex-col gap-1">
              <button class="watchlist-btn p-1.5 rounded-md ${inWatchlist ? "bg-red-600" : "bg-gray-800 hover:bg-red-600"} transition-transform active:scale-90" data-id="${item.id}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/>
                </svg>
              </button>
              <button class="watched-btn p-1.5 rounded-md ${inWatched ? "bg-green-600" : "bg-gray-800 hover:bg-green-600"} transition-transform active:scale-90" data-id="${item.id}">
                ${inWatched 
                  ? `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-4 h-4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>`
                  : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" class="w-4 h-4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/></svg>`}
              </button>
            </div>
          </div>
          <p class="mt-2 text-sm font-medium text-center">${formattedTitle}</p>
        </div>
      `;
    }).join("");

    grid.insertAdjacentHTML("beforeend", html);

    // Smooth fade-in animation
    setTimeout(() => {
      grid.querySelectorAll(".group").forEach(el => {
        el.classList.remove("opacity-0", "translate-y-4");
      });
    }, 50);

    // Button bindings
    grid.querySelectorAll(".watchlist-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const movie = allMovies.find(m => m.id === id);
        toggleMovieInList("watchlist", movie);
        btn.classList.toggle("bg-red-600");
      });
    });

    grid.querySelectorAll(".watched-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const movie = allMovies.find(m => m.id === id);
        toggleMovieInList("watched", movie);
        btn.classList.toggle("bg-green-600");
      });
    });
  }

  // ===== Load More Logic =====
  async function loadMovies() {
    if (isLoading) return;
    isLoading = true;

    // Animate like script.js
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = `
      <svg class="animate-spin h-5 w-5 mr-2 inline-block text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      Loading...
    `;
    loadMoreBtn.classList.add("scale-95", "opacity-70");
    setTimeout(() => loadMoreBtn.classList.remove("scale-95"), 150);

    const movies = await fetchMovies(currentPage);
    if (movies.length === 0) {
      loadMoreBtn.textContent = "No More Movies";
      loadMoreBtn.classList.add("hidden");
      return;
    }

    allMovies.push(...movies);
    renderMovies(movies);

    loadMoreBtn.disabled = false;
    loadMoreBtn.innerHTML = "Load More";
    loadMoreBtn.classList.remove("opacity-70", "cursor-not-allowed");

    window.scrollTo({ top: document.body.scrollHeight - 600, behavior: "smooth" });

    if (currentPage >= totalPages) {
      loadMoreBtn.textContent = "All Movies Loaded ✅";
      loadMoreBtn.disabled = true;
      loadMoreBtn.classList.add("opacity-60", "cursor-not-allowed");
    }

    isLoading = false;
  }

  // ===== Init =====
  loadMovies();
  loadMoreBtn.addEventListener("click", () => {
    if (!isLoading && currentPage < totalPages) {
      currentPage++;
      loadMovies();
    }
  });
});
