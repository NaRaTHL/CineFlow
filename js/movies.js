document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = 'e03962f7d0373121b4abd521402d77ae';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_URL = 'https://image.tmdb.org/t/p/w500';

  const grid = document.getElementById('moviesGrid');
  const sortSelect = document.getElementById('sortSelect');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageIndicator = document.getElementById('pageIndicator');

  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || 'popular';

  let allMovies = [];
  let currentPage = 1;
  const moviesPerPage = 20;
  const pagesToFetch = 5;
  let totalPages = 1;

  // Fetch movies
  async function fetchAllMovies() {
    grid.innerHTML = `<p class="text-gray-400 text-center col-span-full">Loading movies...</p>`;
    allMovies = [];

    try {
      for (let page = 1; page <= pagesToFetch; page++) {
        let endpoint;
        if (category === 'trending') {
          endpoint = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`;
        } else {
          endpoint = `${BASE_URL}/movie/${category}?api_key=${API_KEY}&language=en-US&page=${page}`;
        }

        const res = await fetch(endpoint);
        const data = await res.json();
        allMovies.push(...data.results);
      }

      allMovies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      totalPages = Math.ceil(allMovies.length / moviesPerPage);
      currentPage = 1;

      renderMoviesForPage(currentPage);
      updatePagination();
    } catch (err) {
      console.error('Error fetching movies:', err);
      grid.innerHTML = `<p class="text-gray-400 col-span-full text-center">Failed to load movies.</p>`;
    }
  }

  // Helpers
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

  // Render movies
  function renderMoviesForPage(page) {
    const start = (page - 1) * moviesPerPage;
    const movies = allMovies.slice(start, start + moviesPerPage);

    if (!movies.length) {
      grid.innerHTML = `<p class="text-gray-400 col-span-full text-center">No movies found.</p>`;
      return;
    }

    grid.innerHTML = movies.map(item => {
      const title = item.title || 'Untitled';
      const poster = item.poster_path
        ? `${IMG_URL}${item.poster_path}`
        : 'https://placehold.co/400x600?text=No+Image';
      const year = item.release_date ? new Date(item.release_date).getFullYear() : '';
      const formattedTitle = year ? `${title} (${year})` : title;

      const rating = item.vote_average ? item.vote_average * 10 : 0;
      const color = rating < 50 ? 'red' : rating < 85 ? 'yellow' : 'green';
      const radius = 18;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (rating / 100) * circumference;

      const inWatchlist = isInList('watchlist', item.id);
      const inWatched = isInList('watched', item.id);

      return `
        <div class="group relative opacity-0 translate-y-4 transition-all duration-500 ease-out">
          <div class="relative overflow-hidden rounded-lg shadow-lg">

            <a href="detail.html?id=${item.id}&type=movie">
              <img src="${poster}" alt="${title}" 
                class="w-full aspect-[2/3] object-cover rounded-lg transition-transform duration-300 group-hover:scale-110">
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
              <button class="watchlist-btn p-1.5 rounded-md ${inWatchlist ? 'bg-red-600' : 'bg-gray-800 hover:bg-red-600'}" data-id="${item.id}" title="Add to Watchlist">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/>
                </svg>
              </button>

              <button class="watched-btn p-1.5 rounded-md ${inWatched ? 'bg-green-600' : 'bg-gray-800 hover:bg-green-600'}" data-id="${item.id}" title="${inWatched ? 'Viewed ✅' : 'Mark as Watched 👁️'}">
                ${inWatched 
                  ? `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-4 h-4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>` 
                  : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" class="w-4 h-4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/></svg>`}
              </button>
            </div>

          </div>
          <p class="mt-2 text-sm font-medium text-center">${formattedTitle}</p>
        </div>
      `;
    }).join('');

    // Animate fade-in
    setTimeout(() => {
      grid.querySelectorAll('.group').forEach((el, i) => {
        setTimeout(() => {
          el.classList.remove('opacity-0', 'translate-y-4');
          el.classList.add('opacity-100', 'translate-y-0');
        }, i * 50);
      });
    }, 50);

    // Watchlist & watched button events
    grid.querySelectorAll('.watchlist-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const movie = allMovies.find(m => m.id === id);
        toggleMovieInList('watchlist', movie);
        renderMoviesForPage(currentPage);
      });
    });

    grid.querySelectorAll('.watched-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const movie = allMovies.find(m => m.id === id);
        toggleMovieInList('watched', movie);
        renderMoviesForPage(currentPage);
      });
    });
  }

  // Sorting
  sortSelect.addEventListener('change', () => {
    const val = sortSelect.value;
    if (val === 'az') allMovies.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else if (val === 'za') allMovies.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    else if (val === 'rating') allMovies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    else if (val === 'year') allMovies.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));

    currentPage = 1;
    renderMoviesForPage(currentPage);
    updatePagination();
  });

  // Pagination
  function updatePagination() {
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderMoviesForPage(currentPage);
      updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderMoviesForPage(currentPage);
      updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Initial fetch
  fetchAllMovies();
});
