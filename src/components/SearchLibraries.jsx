// SearchLibraries component - Extended search with pagination
import { useState } from 'react';
import { 
  fetchAnimeByGenre, 
  fetchAnimeByKeyword, 
  fetchAnimeByFilters,
  fetchTopAnime,
  fetchLatestEpisodes,
  fetchUpcomingAnime,
  fetchAllAnime,
  getRecommendations 
} from '../services/animeApi';

// Genre list from Jikan API
const genres = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Adventure' },
  { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 14, name: 'Horror' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 30, name: 'Sports' },
  { id: 37, name: 'Supernatural' },
  { id: 35, name: 'Ecchi' },
  { id: 7, name: 'Mystery' },
  { id: 19, name: 'Music' },
  { id: 18, name: 'Mecha' },
  { id: 23, name: 'School' },
  { id: 21, name: 'Shounen' },
  { id: 17, name: 'Martial Arts' },
  { id: 16, name: 'Magic' },
];

// Helper to get display title (English or Japanese)
function getDisplayTitle(anime) {
  return anime.title_english || anime.title || 'Unknown Title';
}

// Helper to get image URL
function getImageUrl(anime) {
  return anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url || '';
}

function SearchLibraries({ onResults, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search form state
  const [selectedGenre, setSelectedGenre] = useState('');
  const [customKeyword, setCustomKeyword] = useState('');
  const [rating, setRating] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [currentResults, setCurrentResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Settings
  const ITEMS_PER_PAGE = 10;
  const MAX_FETCH = 100;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  // Helper to get fallback
  const getFallback = async () => {
    try {
      const list = await fetchTopAnime(MAX_FETCH);
      if (list && list.length > 0) {
        return getRecommendations(list, 10);
      }
      const allList = await fetchAllAnime(MAX_FETCH);
      return getRecommendations(allList, 10);
    } catch {
      return [];
    }
  };

  const handleGenreSearch = async (page = 1) => {
    if (!selectedGenre) return;
    
    setCurrentFilter('genre');
    setLoading(true);
    setError(null);
    
    try {
      const filters = { genreId: selectedGenre };
      if (rating) filters.rating = rating;
      
      let animeList = await fetchAnimeByFilters(filters, MAX_FETCH);
      
      if (!animeList || animeList.length === 0) {
        animeList = await fetchTopAnime(MAX_FETCH);
      }
      
      setCurrentResults(animeList);
      setTotalResults(animeList.length);
      setCurrentPage(page);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      const fallback = await getFallback();
      if (fallback.length > 0) {
        setCurrentResults(fallback);
        setTotalResults(fallback.length);
        setShowResults(true);
      } else {
        setError('Failed to load. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearch = async (page = 1) => {
    if (!customKeyword.trim()) return;
    
    setCurrentFilter('keyword');
    setLoading(true);
    setError(null);
    
    try {
      let animeList = await fetchAnimeByKeyword(customKeyword.trim(), MAX_FETCH);
      
      if (!animeList || animeList.length === 0) {
        animeList = await fetchTopAnime(MAX_FETCH);
      }
      
      setCurrentResults(animeList);
      setTotalResults(animeList.length);
      setCurrentPage(page);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      const fallback = await getFallback();
      if (fallback.length > 0) {
        setCurrentResults(fallback);
        setTotalResults(fallback.length);
        setShowResults(true);
      } else {
        setError('Failed to load. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick filters with pagination
  const handleQuickFilter = async (filterType, page = 1) => {
    setCurrentFilter(filterType);
    setLoading(true);
    setError(null);
    
    try {
      let animeList = [];
      
      switch (filterType) {
        case 'top':
          animeList = await fetchTopAnime(MAX_FETCH);
          break;
        case 'latest':
          animeList = await fetchLatestEpisodes(MAX_FETCH);
          break;
        case 'upcoming':
          animeList = await fetchUpcomingAnime(MAX_FETCH);
          break;
        case 'romance':
          animeList = await fetchAnimeByGenre(22, MAX_FETCH);
          break;
        case 'isekai':
          animeList = await fetchAnimeByKeyword('isekai', MAX_FETCH);
          break;
        case 'action':
          animeList = await fetchAnimeByGenre(1, MAX_FETCH);
          break;
        case 'fantasy':
          animeList = await fetchAnimeByGenre(10, MAX_FETCH);
          break;
        case 'comedy':
          animeList = await fetchAnimeByGenre(4, MAX_FETCH);
          break;
        case 'sci-fi':
          animeList = await fetchAnimeByGenre(24, MAX_FETCH);
          break;
        case 'horror':
          animeList = await fetchAnimeByGenre(14, MAX_FETCH);
          break;
        case 'drama':
          animeList = await fetchAnimeByGenre(8, MAX_FETCH);
          break;
        case 'slice':
          animeList = await fetchAnimeByGenre(36, MAX_FETCH);
          break;
        case 'sports':
          animeList = await fetchAnimeByGenre(30, MAX_FETCH);
          break;
        case 'mecha':
          animeList = await fetchAnimeByGenre(18, MAX_FETCH);
          break;
        case 'mystery':
          animeList = await fetchAnimeByGenre(7, MAX_FETCH);
          break;
        default:
          animeList = await fetchTopAnime(MAX_FETCH);
      }
      
      if (!animeList || animeList.length === 0) {
        animeList = await fetchTopAnime(MAX_FETCH);
      }
      
      setCurrentResults(animeList);
      setTotalResults(animeList.length);
      setCurrentPage(page);
      setShowResults(true);
    } catch (err) {
      console.error('Filter error:', err);
      const fallback = await getFallback();
      if (fallback.length > 0) {
        setCurrentResults(fallback);
        setTotalResults(fallback.length);
        setShowResults(true);
      } else {
        setError('Failed to load. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages && currentFilter) {
      const nextPage = currentPage + 1;
      if (currentFilter === 'keyword') {
        handleCustomSearch(nextPage);
      } else if (currentFilter === 'genre') {
        handleGenreSearch(nextPage);
      } else {
        handleQuickFilter(currentFilter, nextPage);
      }
    }
  };

  // Handle prev page
  const handlePrevPage = () => {
    if (currentPage > 1 && currentFilter) {
      const prevPage = currentPage - 1;
      if (currentFilter === 'keyword') {
        handleCustomSearch(prevPage);
      } else if (currentFilter === 'genre') {
        handleGenreSearch(prevPage);
      } else {
        handleQuickFilter(currentFilter, prevPage);
      }
    }
  };

  // Save current page results as recommendations
  const handleSaveResults = () => {
    const recommendations = getRecommendations(currentResults, 10);
    onResults(recommendations);
  };

  // Back to search
  const handleBackToSearch = () => {
    setShowResults(false);
    setCurrentResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setCurrentFilter(null);
  };

  if (loading) {
    return (
      <div>
        <h1>Search Libraries</h1>
        <p>Loading...</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  // Results view with pagination and images
  if (showResults && currentResults.length > 0) {
    return (
      <div>
        <h1>Search Results</h1>
        
        <p>Page {currentPage} of {totalPages} (Total: {totalResults} results)</p>
        
        <div>
          {currentResults.slice(0, 10).map((anime, index) => (
            <div key={anime.mal_id || index}>
              <img 
                src={getImageUrl(anime)} 
                alt={getDisplayTitle(anime)}
                width="120"
                height="170"
              />
              <h3>{getDisplayTitle(anime)}</h3>
              <p>Score: {anime.score || 'N/A'} | Episodes: {anime.episodes || 'Unknown'}</p>
              {anime.title_english && anime.title !== anime.title_english && (
                <p>Japanese: {anime.title}</p>
              )}
            </div>
          ))}
        </div>
        
        <div>
          <button onClick={handlePrevPage} disabled={currentPage <= 1}>
            Previous Page
          </button>
          <span> Page {currentPage} </span>
          <button onClick={handleNextPage} disabled={currentPage >= totalPages}>
            Next Page
          </button>
        </div>
        
        <div>
          <button onClick={handleSaveResults}>Get These Recommendations</button>
        </div>
        
        <div>
          <button onClick={handleBackToSearch}>Back to Search</button>
        </div>
        
        <div>
          <button onClick={onBack}>Back to Home</button>
        </div>
      </div>
    );
  }

  // Search form view
  return (
    <div>
      <h1>Search Libraries</h1>
      
      {error && <p>{error}</p>}
      
      <>
        <div>
          <h2>Browse by Category</h2>
          <button onClick={() => handleQuickFilter('top')}>Top 100</button>
          <button onClick={() => handleQuickFilter('latest')}>Latest</button>
          <button onClick={() => handleQuickFilter('upcoming')}>Upcoming</button>
        </div>
        
        <div>
          <h2>Browse by Genre</h2>
          <button onClick={() => handleQuickFilter('action')}>Action</button>
          <button onClick={() => handleQuickFilter('adventure')}>Adventure</button>
          <button onClick={() => handleQuickFilter('comedy')}>Comedy</button>
          <button onClick={() => handleQuickFilter('drama')}>Drama</button>
          <button onClick={() => handleQuickFilter('fantasy')}>Fantasy</button>
          <button onClick={() => handleQuickFilter('horror')}>Horror</button>
          <button onClick={() => handleQuickFilter('romance')}>Romance</button>
          <button onClick={() => handleQuickFilter('sci-fi')}>Sci-Fi</button>
          <button onClick={() => handleQuickFilter('slice')}>Slice of Life</button>
          <button onClick={() => handleQuickFilter('sports')}>Sports</button>
          <button onClick={() => handleQuickFilter('mecha')}>Mecha</button>
          <button onClick={() => handleQuickFilter('mystery')}>Mystery</button>
          <button onClick={() => handleQuickFilter('isekai')}>Isekai</button>
        </div>
        
        <hr />
        
        <div>
          <h2>Advanced Search</h2>
          
          <div>
            <label>Genre: </label>
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">Select Genre</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Rating: </label>
            <select 
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="">Any</option>
              <option value="g">All Ages</option>
              <option value="pg13">PG-13</option>
              <option value="r">R (Mature)</option>
            </select>
          </div>
          
          <button onClick={() => handleGenreSearch(1)} disabled={!selectedGenre}>
            Search
          </button>
        </div>
        
        <hr />
        
        <div>
          <h2>Custom Keyword</h2>
          <input
            type="text"
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            placeholder="Enter keyword (e.g., magic school)"
          />
          <button onClick={() => handleCustomSearch(1)} disabled={!customKeyword.trim()}>
            Search
          </button>
        </div>
      </>
      
      <div>
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

export default SearchLibraries;
