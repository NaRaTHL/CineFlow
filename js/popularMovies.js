document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = 'e03962f7d0373121b4abd521402d77ae';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_URL = 'https://image.tmdb.org/t/p/w500';

  const movieGrid = document.getElementById('movieGrid');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  let currentPage = 1;
  let totalPages = 1;
  let allMovies = [];
  let isLoading = false;

  // ===== LocalStorage Utilities =====
  function getStorageList(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  function saveStorageList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  function isInList(key, id) {
    const list = getStorageList(key);
    return list.some(item => item.id === id);
  }

  function toggleMovieInList(key, movie) {
    const list = getStorageList(key);
    const index = list.findIndex(item => item.id === movie.id);
    if (index === -1) list.push(movie);
    else list.splice(index, 1);
    saveStorageList(key, list);
  }

  // ===== Fetch Popular Movies =====
  async function fetchMovies(page = 1) {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
    const data = await res.json();
    totalPages = data.total_pages;
    return data.results.slice(0, 18); // only show 18 per load
  }

  // ===== Render Movies =====
  function renderMovies(movies) {
    const basePath = window.location.pathname.includes('/page/') ? '../' : './';

    movies.forEach(movie => {
      const imgSrc = movie.poster_path
        ? `${IMG_URL}${movie.poster_path}`
        : 'https://placehold.co/400x600?text=No+Image';

      const title = movie.title || movie.name;
      const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : movie.first_air_date
        ? new Date(movie.first_air_date).getFullYear()
        : '';
      const formattedTitle = year ? `${title} (${year})` : title;

      const rating = movie.vote_average * 10;
      const color = rating < 50 ? 'red' : rating < 85 ? 'yellow' : 'green';
      const radius = 18;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (rating / 100) * circumference;

      const inWatchlist = isInList('watchlist', movie.id);
      const inWatched = isInList('watched', movie.id);

      const html = `
        <div class="movie-item w-48 flex-shrink-0 group cursor-pointer relative transition-all duration-300 ease-out opacity-0 translate-y-5">
          <div class="overflow-hidden rounded-lg shadow-lg relative">
            <a href="${basePath}page/detail.html?id=${movie.id}&type=movie">
              <img src="${imgSrc}" alt="${title}"
                class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110">
            </a>

            <div class="absolute top-2 left-2 flex items-start justify-between w-[calc(100%-1rem)]">
              <svg class="w-10 h-10" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="${radius}" stroke="rgba(255,255,255,0.25)" stroke-width="4" fill="rgba(0,0,0,0.6)" />
                <circle cx="20" cy="20" r="${radius}" stroke="${color}" stroke-width="4" fill="none"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
                  transform="rotate(-90 20 20)" />
                <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-size="12">${rating.toFixed(0)}%</text>
              </svg>

              <div class="flex flex-col gap-1 items-end">
                <button class="watchlist-btn p-1.5 rounded-md ${inWatchlist ? 'bg-red-600' : 'bg-gray-800 hover:bg-red-600'}" data-id="${movie.id}" title="Add to Watchlist">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/>
                  </svg>
                </button>

                <button class="watched-btn p-1.5 rounded-md ${inWatched ? 'bg-green-600' : 'bg-gray-800 hover:bg-green-600'}" data-id="${movie.id}" title="${inWatched ? 'Viewed ✅' : 'Mark as Watched 👁️'}">
                  ${inWatched 
                    ? `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-4 h-4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>` 
                    : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" class="w-4 h-4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/></svg>`}
                </button>
              </div>
            </div>
          </div>
          <h3 class="mt-3 text-sm font-medium text-center leading-tight">${formattedTitle}</h3>
        </div>
      `;

      movieGrid.insertAdjacentHTML('beforeend', html);
    });

    // Fade-in animation
    setTimeout(() => {
      movieGrid.querySelectorAll('.movie-item').forEach(el => {
        el.classList.remove('opacity-0', 'translate-y-5');
      });
    }, 100);

    // Add click handlers
    movieGrid.querySelectorAll('.watchlist-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const movie = allMovies.find(m => m.id === id);
        toggleMovieInList('watchlist', movie);

        if (isInList('watchlist', id)) {
          btn.classList.remove('bg-gray-800', 'hover:bg-red-600');
          btn.classList.add('bg-red-600');
        } else {
          btn.classList.remove('bg-red-600');
          btn.classList.add('bg-gray-800', 'hover:bg-red-600');
        }
      });
    });

    movieGrid.querySelectorAll('.watched-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const movie = allMovies.find(m => m.id === id);
        toggleMovieInList('watched', movie);

        if (isInList('watched', id)) {
          btn.classList.remove('bg-gray-800', 'hover:bg-green-600');
          btn.classList.add('bg-green-600');
          btn.title = 'Viewed ✅';
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-4 h-4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>`;
        } else {
          btn.classList.remove('bg-green-600');
          btn.classList.add('bg-gray-800', 'hover:bg-green-600');
          btn.title = 'Mark as Watched 👁️';
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" class="w-4 h-4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/></svg>`;
        }
      });
    });
  }

  // ===== Load More =====
  async function loadMovies() {
    if (isLoading) return;
    isLoading = true;

    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.classList.add('opacity-70', 'cursor-not-allowed');
    loadMoreBtn.disabled = true;

    const newMovies = await fetchMovies(currentPage);
    allMovies = allMovies.concat(newMovies);
    renderMovies(newMovies);

    loadMoreBtn.textContent = 'Load More';
    loadMoreBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    loadMoreBtn.disabled = false;

    if (currentPage >= totalPages) {
      loadMoreBtn.classList.add('hidden');
    }

    isLoading = false;
  }

  // ===== Initial Load =====
  loadMovies();

  loadMoreBtn.addEventListener('click', async () => {
    if (!isLoading && currentPage < totalPages) {
      currentPage++;
      loadMovies();
    }
  });
});
