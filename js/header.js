const basePath = window.location.pathname.includes('/page/') ? '../' : './';
document.addEventListener("DOMContentLoaded", () => {
  const headerHTML = `
  <header class="bg-[#0b1120]/70 shadow-lg fixed top-0 left-0 right-0 z-50 backdrop-blur">
    <nav class="container mx-auto px-4 flex justify-between items-center h-16 text-white">
      <!-- Logo -->
      <a href="${basePath}index.html" class="text-3xl font-bold text-white">
        Cine<span class="text-red-600">Flow</span>
      </a>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center space-x-6">
        <!-- Movies Dropdown -->
        <div class="relative group">
          <a href="${basePath}page/movies.html" class="hover:text-red-600 flex items-center gap-1">Movies ▾</a>
          <div class="absolute bg-[#101830] rounded-md shadow-lg w-44 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <a href="${basePath}page/movies.html?category=top_rated" class="block px-4 py-2 hover:bg-red-600">Top Rated</a>
            <a href="${basePath}page/movies.html?category=trending" class="block px-4 py-2 hover:bg-red-600">Trending</a>
          </div>
        </div>


        <!-- TV Shows Dropdown -->
        <div class="relative group">
          <a href="${basePath}page/tv.html" class="hover:text-red-600 flex items-center gap-1">TV Shows ▾</a>
          <div class="absolute bg-[#101830] rounded-md shadow-lg w-44 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <a href="${basePath}page/tv.html?category=top_rated" class="block px-4 py-2 hover:bg-red-600">Top Rated</a>
            <a href="${basePath}page/tv.html?category=trending" class="block px-4 py-2 hover:bg-red-600">Trending</a>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative w-72 lg:w-96">
          <input id="searchInput" type="text" placeholder="Search movies, TV shows..."
            class="w-full py-2 pl-4 pr-10 rounded-full bg-[#1a2238] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 text-white text-sm placeholder-gray-400">
          <button id="searchSubmit"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 p-2 rounded-full hover:bg-red-700">
            <svg class="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 10-14 0 7 7 0 0014 0z" />
            </svg>
          </button>
          <ul id="suggestions"
            class="absolute left-0 right-0 top-full mt-2 bg-[#1a2238] border border-gray-700 rounded-lg shadow-lg divide-y divide-gray-700 max-h-60 overflow-y-auto hidden z-50"></ul>
        </div>

       <!-- Profile -->
        <div class="relative group">
          <button class="hover:text-red-600">
            <svg class="w-8 h-8 rounded-full bg-[#1a2238] p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM12 12a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </button>
          <div
            class="absolute right-0 bg-[#101830] rounded-md shadow-lg w-40 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <a href="${basePath}page/profile.html" class="block px-4 py-2 hover:bg-red-600">Profile</a>
            <a href="${basePath}page/settings.html" class="block px-4 py-2 hover:bg-red-600">Settings</a>
            <a href="#" id="logout-btn" class="block px-4 py-2 hover:bg-red-600">Logout</a>
          </div>
        </div>
      </div>
    </nav>
  </header>
  `;

  document.getElementById("header-placeholder").innerHTML = headerHTML;

});
