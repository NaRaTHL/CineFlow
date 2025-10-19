document.addEventListener('DOMContentLoaded', () => {
const API_KEY = 'e03962f7d0373121b4abd521402d77ae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';


async function fetchMovies(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=1`);
  const data = await res.json();
  return data.results;
}

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

function renderMovies(movies, containerId, startIndex = 0) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const visibleMovies = movies.slice(startIndex, startIndex + 7);

  visibleMovies.forEach(movie => {
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

    // Rating circle
    const rating = movie.vote_average * 10;
    const color = rating < 50 ? 'red' : rating < 85 ? 'yellow' : 'green';
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rating / 100) * circumference;
    const basePath = window.location.pathname.includes('/page/') ? '../' : './';

    const inWatchlist = isInList('watchlist', movie.id);
    const inWatched = isInList('watched', movie.id);

    const html = `
      <div class="movie-item w-48 flex-shrink-0 group cursor-pointer relative" data-id="${movie.id}">
        <div class="overflow-hidden rounded-lg shadow-lg relative">
          <a href="${basePath}page/detail.html?id=${movie.id}&type=${movie.title ? 'movie' : 'tv'}">
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
    container.insertAdjacentHTML('beforeend', html);
  });

  // Bind button events **once**, updating only the button UI dynamically
  container.querySelectorAll('.watchlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const movie = movies.find(m => m.id === id);
      toggleMovieInList('watchlist', movie);

      // Update button immediately
      if (isInList('watchlist', id)) {
        btn.classList.remove('bg-gray-800', 'hover:bg-red-600');
        btn.classList.add('bg-red-600');
      } else {
        btn.classList.remove('bg-red-600');
        btn.classList.add('bg-gray-800', 'hover:bg-red-600');
      }
    });
  });

  container.querySelectorAll('.watched-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const movie = movies.find(m => m.id === id);
      toggleMovieInList('watched', movie);

      // Update button immediately
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



let movieCache = { recommended: [], popular: [], upcoming: [], tvshows: [] };
let movieIndex = { recommended: 0, popular: 0, upcoming: 0, tvshows: 0 };

async function loadAllMovies() {
  const [recommended, popular, upcoming, tvshows] = await Promise.all([
    fetchMovies('/movie/top_rated'),
    fetchMovies('/movie/popular'),
    fetchMovies('/movie/upcoming'),
    fetchMovies('/tv/popular')
  ]);

  movieCache = {
    recommended: recommended.slice(0, 14),
    popular: popular.slice(0, 14),
    upcoming: upcoming.slice(0, 14),
    tvshows: tvshows.slice(0, 14)
  };

  renderMovies(movieCache.recommended, 'recommended', 0);
  renderMovies(movieCache.popular, 'popular', 0);
  renderMovies(movieCache.upcoming, 'upcoming', 0);
  renderMovies(movieCache.tvshows, 'tvshows', 0);
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.scroll-btn');
  if (!btn) return;

  const target = btn.dataset.target;
  const direction = btn.classList.contains('right') ? 1 : -1;
  const movies = movieCache[target];
  const maxIndex = Math.max(0, movies.length - 7);
  movieIndex[target] = Math.max(0, Math.min(maxIndex, movieIndex[target] + direction * 7));

  renderMovies(movies, target, movieIndex[target]);
});

loadAllMovies();

// Search functionality
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
let typingTimeout;

searchInput.addEventListener('input', () => {
  clearTimeout(typingTimeout);
  const query = searchInput.value.trim();

  if (query.length === 0) {
    suggestions.classList.add('hidden');
    suggestions.innerHTML = '';
    return;
  }

  // delay to avoid excessive API calls
  typingTimeout = setTimeout(() => showSuggestions(query), 300);
});

async function showSuggestions(query) {
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    const results = data.results
      .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.title || item.name))
      .slice(0, 3); // Only show 3 suggestions

    if (results.length === 0) {
      suggestions.classList.add('hidden');
      return;
    }

    suggestions.innerHTML = results.map(item => {
      const title = item.title || item.name;
      const year = item.release_date
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : '';
      const formattedTitle = year ? `${title} (${year})` : title;
      const poster = item.poster_path
        ? `${IMG_URL}${item.poster_path}`
        : 'https://placehold.co/60x90?text=No+Image';

      return `
        <li class="flex items-center gap-3 px-4 py-2 hover:bg-red-600 cursor-pointer transition-colors"
          data-id="${item.id}" data-type="${item.media_type}">
          <img src="${poster}" alt="${title}" class="w-10 h-14 object-cover rounded-md flex-shrink-0">
          <p class="text-sm font-medium text-white leading-tight">${formattedTitle}</p>
        </li>
      `;
    }).join('');

    suggestions.classList.remove('hidden');

    // Handle clicking a suggestion
    document.querySelectorAll('#suggestions li').forEach(li => {
      li.addEventListener('click', () => {
        const id = li.dataset.id;
        const type = li.dataset.type;
        const basePath = window.location.pathname.includes('/page/') ? '../' : './';
        window.location.href = `${basePath}page/detail.html?id=${id}&type=${type}`;
      });

    });

  } catch (err) {
    console.error('Suggestion error:', err);
  }
}

// Hide suggestions when clicking outside
document.addEventListener('click', (event) => {
  const searchBox = document.getElementById('searchInput');
  const suggestionsBox = document.getElementById('suggestions');
  
  // if click target is NOT inside search input or suggestions box
  if (!searchBox.contains(event.target) && !suggestionsBox.contains(event.target)) {
    suggestionsBox.classList.add('hidden');
  }
});

const searchButton = document.getElementById('searchSubmit');

function handleSearch(query) {
  if (!query.trim()) return;
  window.location.href = `${basePath}page/search.html?query=${encodeURIComponent(query.trim())}`;
}

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSearch(searchInput.value);
  }
});

searchButton.addEventListener('click', () => {
  handleSearch(searchInput.value);
});

});

