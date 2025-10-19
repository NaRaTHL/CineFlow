document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = 'e03962f7d0373121b4abd521402d77ae';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_URL = 'https://image.tmdb.org/t/p/w500';

  const params = new URLSearchParams(window.location.search);
  const query = params.get('query');

  const titleEl = document.getElementById('resultsTitle');
  const resultsGrid = document.getElementById('resultsGrid');
  const pagination = document.getElementById('pagination');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageIndicator = document.getElementById('pageIndicator');

  let currentPage = 1;
  let totalPages = 1;
  let currentResults = [];

  if (!query) {
    titleEl.textContent = 'No search query provided.';
    return;
  }

  titleEl.textContent = `Search Results for "${query}"`;
  fetchResults(query, currentPage);

  // --- LocalStorage helpers ---
  function toggleInList(listKey, item) {
    const list = JSON.parse(localStorage.getItem(listKey)) || [];
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) list.splice(index, 1);
    else list.push(item);
    localStorage.setItem(listKey, JSON.stringify(list));
  }

  function isInList(listKey, id) {
    const list = JSON.parse(localStorage.getItem(listKey)) || [];
    return list.some(item => item.id === id);
  }

  // --- Fetch search results ---
  async function fetchResults(q, page = 1) {
    currentPage = page;
    pagination.classList.add('hidden');
    resultsGrid.innerHTML = `<p class="col-span-full text-center text-gray-400">Loading...</p>`;

    try {
      const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=${currentPage}`);
      const data = await res.json();
      totalPages = data.total_pages || 1;
      currentResults = (data.results || []).filter(
        item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.poster_path || item.name || item.title)
      );

      if (currentResults.length === 0) {
        resultsGrid.innerHTML = `<p class="text-gray-400 col-span-full text-center">No results found.</p>`;
        pagination.classList.add('hidden');
        return;
      }

      renderResults();
    } catch (err) {
      console.error('Search results error:', err);
      resultsGrid.innerHTML = `<p class="text-gray-400 col-span-full text-center">Error loading results.</p>`;
    }
  }

  // --- Render results ---
  function renderResults() {
    resultsGrid.innerHTML = currentResults.map(item => createCard(item)).join('');
    pagination.classList.remove('hidden');
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    // Bind buttons
    resultsGrid.querySelectorAll('.watchlist-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const item = currentResults.find(i => i.id === id);
        toggleInList('watchlist', item);
        renderResults();
      });
    });

    resultsGrid.querySelectorAll('.watched-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const item = currentResults.find(i => i.id === id);
        toggleInList('watched', item);
        renderResults();
      });
    });
  }

  // --- Create card HTML ---
  function createCard(item) {
    const title = item.title || item.name;
    const poster = item.poster_path
      ? `${IMG_URL}${item.poster_path}`
      : 'https://placehold.co/400x600?text=No+Image';
    const year = item.release_date
      ? new Date(item.release_date).getFullYear()
      : item.first_air_date
        ? new Date(item.first_air_date).getFullYear()
        : '';
    const formattedTitle = year ? `${title} (${year})` : title;

    const rating = item.vote_average ? item.vote_average * 10 : 0;
    const color = rating < 50 ? 'red' : rating < 85 ? 'yellow' : 'green';
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rating / 100) * circumference;

    const type = item.media_type;
    const typeLabel = type === 'movie' ? 'MOVIE' : 'TV';
    const basePath = window.location.pathname.includes('/page/') ? '../' : './';

    const inWatchlist = isInList('watchlist', item.id);
    const inWatched = isInList('watched', item.id);

    return `
      <div class="group relative">
        <div class="relative overflow-hidden rounded-lg shadow-lg">

          <a href="${basePath}page/detail.html?id=${item.id}&type=${type}">
            <img src="${poster}" alt="${title}" class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110">
          </a>

          <!-- Top-left: Rating -->
          <div class="absolute top-2 left-2">
            <svg class="w-10 h-10" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="${radius}" stroke="rgba(255,255,255,0.25)" stroke-width="4" fill="rgba(0,0,0,0.6)" />
              <circle cx="20" cy="20" r="${radius}" stroke="${color}" stroke-width="4" fill="none"
                stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
                transform="rotate(-90 20 20)" />
              <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-size="12">${rating.toFixed(0)}%</text>
            </svg>
          </div>

          <!-- Top-right: Watchlist & Watched -->
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
  }

  // --- Pagination ---
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchResults(query, currentPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchResults(query, currentPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});
