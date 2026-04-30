// Jikan API Service for anime4u app
// API Documentation: https://jikan.moe/

const BASE_URL = 'https://api.jikan.moe/v4';

/**
 * Fetch anime by genre ID
 * @param {number} genreId - Jikan genre ID
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchAnimeByGenre(genreId, limit = 10) {
  const response = await fetch(`${BASE_URL}/anime?genres=${genreId}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch anime by genre');
  }
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch anime by keyword search
 * @param {string} keyword - Search keyword
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchAnimeByKeyword(keyword, limit = 10) {
  const response = await fetch(`${BASE_URL}/anime?q=${encodeURIComponent(keyword)}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch anime by keyword');
  }
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch anime by year range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchAnimeByYear(startDate, endDate, limit = 10) {
  let url = `${BASE_URL}/anime?start_date=${startDate}&limit=${limit}`;
  if (endDate) {
    url += `&end_date=${endDate}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch anime by year');
  }
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch anime by single year
 * @param {string} year - Year (YYYY)
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchAnimeBySingleYear(year, limit = 10) {
  const response = await fetch(`${BASE_URL}/anime?start_date=${year}-01-01&end_date=${year}-12-31&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch anime by year');
  }
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch anime by filters (genre + year + rating)
 * @param {Object} filters - Object containing filters
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchAnimeByFilters(filters) {
  const params = new URLSearchParams();
  
  if (filters.genreId) {
    params.append('genres', filters.genreId);
  }
  
  if (filters.startDate) {
    params.append('start_date', filters.startDate);
  }
  
  if (filters.endDate) {
    params.append('end_date', filters.endDate);
  }
  
  if (filters.rating) {
    params.append('rating', filters.rating);
  }
  
  if (filters.type) {
    params.append('type', filters.type);
  }
  
  params.append('limit', '10');
  
  const url = `${BASE_URL}/anime?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch anime with filters');
  }
  
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch top anime by popularity
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchTopAnime(limit = 10) {
  const response = await fetch(`${BASE_URL}/top/anime?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch top anime');
  }
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch top anime by popular (with offset/pagination)
* @param {number} page - Page number (1, 2, 3...)
 * @param {number} limit - Number of results per page
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchTopAnimeByPopularity(page = 1, limit = 10) {
  const response = await fetch(`${BASE_URL}/top/anime?limit=${limit}&page=${page}`);
  if (!response.ok) {
    throw new Error('Failed to fetch top anime by popularity');
  }
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch currently airing anime (latest episodes)
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchLatestEpisodes(limit = 10) {
  const response = await fetch(`${BASE_URL}/seasons/now?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch latest episodes');
  }
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch upcoming anime
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchUpcomingAnime(limit = 10) {
  const response = await fetch(`${BASE_URL}/seasons/upcoming?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming anime');
  }
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch anime by quiz answers - combines multiple filters
 * @param {Object} filters - Object containing quiz answer filters
 * @returns {Promise<Array>} - Array of anime data
 */
export async function fetchAnimeByQuizFilters(filters) {
  const params = new URLSearchParams();
  
  // Add genre filter
  if (filters.genreId) {
    params.append('genres', filters.genreId);
  }
  
  // Add minimum score filter
  if (filters.minScore) {
    params.append('min_score', filters.minScore);
  }
  
  // Add rating filter
  if (filters.rating) {
    params.append('rating', filters.rating);
  }
  
  // Add start date filter
  if (filters.startDate) {
    params.append('start_date', filters.startDate);
  }
  
  // Add end date filter
  if (filters.endDate) {
    params.append('end_date', filters.endDate);
  }
  
  // Add order by popularity or score
  if (filters.orderBy) {
    params.append('order_by', filters.orderBy);
    if (filters.offset) {
      params.append('offset', filters.offset);
    }
  }
  
  // Add keyword search from quiz
  if (filters.keyword) {
    params.append('q', filters.keyword);
  }
  
  params.append('limit', '10');
  
  const url = `${BASE_URL}/anime?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch anime with quiz filters');
  }
  
  const data = await response.json();
  return data.data || [];
}

/**
 * Take first 5 unique anime from results
 * @param {Array} animeList - Array of anime data
 * @returns {Array} - First 5 anime
 */
export function getRecommendations(animeList) {
  // Remove duplicates and take first 5
  const seen = new Set();
  const unique = [];
  
  for (const anime of animeList) {
    if (!seen.has(anime.mal_id)) {
      seen.add(anime.mal_id);
      unique.push(anime);
    }
    if (unique.length >= 5) break;
  }
  
  return unique;
}
