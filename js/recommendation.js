document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "e03962f7d0373121b4abd521402d77ae";
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMG_URL = "https://image.tmdb.org/t/p/w500";

  const recommendBtn = document.getElementById("recommendBtn");
  const resultsSection = document.getElementById("recommendationResults");
  const grid = document.getElementById("recommendationGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  // Pagination state
  let currentPage = 1;
  let totalPages = 1;
  let finalResults = [];
  let filteredOptions = {};

  // LocalStorage helpers
  function getStorageList(key) { return JSON.parse(localStorage.getItem(key)) || []; }
  function saveStorageList(key, list) { localStorage.setItem(key, JSON.stringify(list)); }
  function isInList(key, id) { return getStorageList(key).some(item => item.id === id); }
  function toggleMovieInList(key, movie) {
    const list = getStorageList(key);
    const index = list.findIndex(item => item.id === movie.id);
    if (index === -1) list.push(movie); else list.splice(index, 1);
    saveStorageList(key, list);
  }

  // Save quiz state
  function saveQuizState() {
    const state = {
      currentStep,
      type: document.getElementById("typeSelect").value,
      genre: document.getElementById("genreSelect").value,
      violence: document.getElementById("violenceSelect").value,
      pacing: document.getElementById("pacingSelect").value,
      mood: document.getElementById("moodSelect").value,
      fame: document.getElementById("fameSelect").value,
      decade: document.getElementById("decadeSelect").value,
    };
    localStorage.setItem("cine_quiz_state", JSON.stringify(state));
  }

  // Render movies
  function renderMovies(movies) {
    movies.forEach(movie => {
      const imgSrc = movie.poster_path ? `${IMG_URL}${movie.poster_path}` : "https://placehold.co/400x600?text=No+Image";
      const title = movie.title || movie.name;
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() :
                   movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : "";
      const formattedTitle = year ? `${title} (${year})` : title;
      const rating = movie.vote_average ? movie.vote_average * 10 : 0;
      const color = rating < 50 ? "red" : rating < 85 ? "yellow" : "green";
      const radius = 18;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (rating / 100) * circumference;
      const basePath = window.location.pathname.includes("/page/") ? "../" : "./";
      const inWatchlist = isInList("watchlist", movie.id);
      const inWatched = isInList("watched", movie.id);

      const html = `
        <div class="movie-item w-48 mx-auto group cursor-pointer relative">
          <div class="overflow-hidden rounded-xl shadow-lg relative bg-gray-900">
            <a href="${basePath}page/detail.html?id=${movie.id}&type=${movie.title?"movie":"tv"}">
              <img src="${imgSrc}" alt="${title}" class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110">
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
                <button class="watchlist-btn p-1.5 rounded-md ${inWatchlist?"bg-red-600":"bg-gray-800 hover:bg-red-600"}" data-id="${movie.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/>
                  </svg>
                </button>
                <button class="watched-btn p-1.5 rounded-md ${inWatched?"bg-green-600":"bg-gray-800 hover:bg-green-600"}" data-id="${movie.id}">
                  ${inWatched ? `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-4 h-4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>` :
                  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" class="w-4 h-4" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/>
                  </svg>`}
                </button>
              </div>
            </div>
          </div>
          <h3 class="mt-3 text-sm font-medium text-center leading-tight">${formattedTitle}</h3>
        </div>
      `;
      grid.insertAdjacentHTML("beforeend", html);
    });

    // Attach button events
    grid.querySelectorAll(".watchlist-btn").forEach(btn=>{
      btn.addEventListener("click", e=>{
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const movie = finalResults.find(m=>m.id===id);
        toggleMovieInList("watchlist", movie);
        btn.classList.toggle("bg-red-600");
        btn.classList.toggle("bg-gray-800");
      });
    });

    grid.querySelectorAll(".watched-btn").forEach(btn=>{
      btn.addEventListener("click", e=>{
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const movie = finalResults.find(m=>m.id===id);
        toggleMovieInList("watched", movie);
        btn.classList.toggle("bg-green-600");
        btn.classList.toggle("bg-gray-800");
      });
    });
  }

  // Fetch top movies for seed
  async function fetchTopMovies(type, genre, fame, decade){
    let endpoint = `${BASE_URL}/discover/${type}?api_key=${API_KEY}&language=en-US&include_adult=false&sort_by=vote_average.desc&vote_count.gte=50`;
    if(genre) endpoint += `&with_genres=${genre}`;
    if(fame==="popular") endpoint += "&sort_by=popularity.desc";
    if(decade){
      const start=`${decade}-01-01`;
      const end=`${parseInt(decade)+9}-12-31`;
      endpoint+=`&primary_release_date.gte=${start}&primary_release_date.lte=${end}`;
    }
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.results || [];
  }

  // Fetch recommendations from top seed movies
  async function fetchRecommendedFromSeed(type, topMovies){
    const recommended = [];
    for(const movie of topMovies.slice(0,5)){
      try{
        const res = await fetch(`${BASE_URL}/${type}/${movie.id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await res.json();
        if(data.results) recommended.push(...data.results);
      } catch(e){console.warn("Failed to fetch recommendations for", movie.title);}
    }
    return recommended;
  }

  // Filter & score movies
  function filterAndScoreMovies(movies, options){
    return movies.map(item=>{
      let score = item.vote_average || 0;
      const overview = (item.overview||"").toLowerCase();
      const {mood, violence, pacing} = options;

      if(mood==="feel-good" && !/crime|horror|war|dark|death|violence/.test(overview)) score+=1;
      if(mood==="dark" && /crime|thriller|horror|war|mystery/.test(overview)) score+=1;
      if(mood==="romantic" && /love|romance|relationship/.test(overview)) score+=1;
      if(mood==="exciting" && /action|adventure|battle|chase/.test(overview)) score+=1;
      if(mood==="mystery" && /mystery|detective|investigation|secret/.test(overview)) score+=1;

      if(violence==="light" && !/crime|war|horror|murder|blood|death/.test(overview)) score+=1;
      if(violence==="dark" && /crime|war|horror|thriller|murder|death/.test(overview)) score+=1;

      if(pacing==="slow" && !/action|battle|fast|chase|explosion/.test(overview)) score+=1;
      if(pacing==="fast" && /drama|slow|emotional|quiet|romance/.test(overview)) score+=1;

      return {...item, score};
    }).sort((a,b)=>b.score-a.score);
  }

  // Handle recommendations
  recommendBtn.addEventListener("click", async ()=>{
    filteredOptions = {
      mood: document.getElementById("moodSelect").value,
      violence: document.getElementById("violenceSelect").value,
      pacing: document.getElementById("pacingSelect").value,
    };
    const type = document.getElementById("typeSelect").value;
    const genre = document.getElementById("genreSelect").value;
    const fame = document.getElementById("fameSelect").value;
    const decade = document.getElementById("decadeSelect").value;

    grid.innerHTML=`<p class="text-gray-400 text-center col-span-full">Finding your recommendations...</p>`;
    resultsSection.classList.remove("hidden");
    window.scrollTo({top: resultsSection.offsetTop, behavior:"smooth"});

    try{
      const topMovies = await fetchTopMovies(type, genre, fame, decade);
      const recommendations = await fetchRecommendedFromSeed(type, topMovies);
      let allResults = [...topMovies, ...recommendations];
      const seen = new Set();
      allResults = allResults.filter(m=>{
        if(seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      finalResults = filterAndScoreMovies(allResults, filteredOptions);
      currentPage = 1;
      totalPages = Math.ceil(finalResults.length/10);
      grid.innerHTML="";
      renderMovies(finalResults.slice(0,10));
      loadMoreBtn.style.display = currentPage<totalPages ? "inline-block":"none";

      // Save recommendations
      localStorage.setItem("cine_recommendations", JSON.stringify(finalResults));
      localStorage.setItem("cine_recommendation_page", currentPage);
      saveQuizState();
    } catch(e){
      console.error("Failed to fetch recommendations:", e);
      grid.innerHTML=`<p class="text-gray-400 text-center col-span-full">Failed to load recommendations.</p>`;
      loadMoreBtn.style.display="none";
    }
  });

  // Load More button
  loadMoreBtn.addEventListener("click", ()=>{
    currentPage++;
    const start = (currentPage-1)*10;
    const end = start+10;
    renderMovies(finalResults.slice(start,end));
    loadMoreBtn.style.display = currentPage<totalPages ? "inline-block":"none";
    localStorage.setItem("cine_recommendation_page", currentPage);
  });

  // Restore saved quiz & recommendations
  const savedState = JSON.parse(localStorage.getItem("cine_quiz_state"));
  if(savedState){
    currentStep = savedState.currentStep || 0;
    document.getElementById("typeSelect").value = savedState.type || "movie";
    document.getElementById("genreSelect").value = savedState.genre || "";
    document.getElementById("violenceSelect").value = savedState.violence || "";
    document.getElementById("pacingSelect").value = savedState.pacing || "";
    document.getElementById("moodSelect").value = savedState.mood || "";
    document.getElementById("fameSelect").value = savedState.fame || "";
    document.getElementById("decadeSelect").value = savedState.decade || "";
  }

  const savedRecommendations = JSON.parse(localStorage.getItem("cine_recommendations"));
  if(savedRecommendations && savedRecommendations.length>0){
    finalResults = savedRecommendations;
    currentPage = parseInt(localStorage.getItem("cine_recommendation_page") || 1);
    grid.innerHTML = "";
    renderMovies(finalResults.slice(0, currentPage*10));
    resultsSection.classList.remove("hidden");
    loadMoreBtn.style.display = currentPage*10 < finalResults.length ? "inline-block" : "none";
  }

});
