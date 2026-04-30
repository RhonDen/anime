// SearchLibraries component - Extended search with more options
import { useState } from 'react';
import { 
  fetchAnimeByGenre, 
  fetchAnimeByKeyword, 
  fetchAnimeByFilters,
  fetchTopAnime,
  fetchLatestEpisodes,
  fetchUpcomingAnime,
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
  { id: 12, name: 'Hentai' },
  { id: 7, name: 'Mystery' },
  { id: 19, name: 'Music' },
  { id: 18, name: 'Mecha' },
  { id: 23, name: 'School' },
  { id: 21, name: 'Shounen' },
  { id: 17, name: 'Martial Arts' },
  { id: 16, name: 'Magic' },
];

// Pre-defined year ranges
const yearRanges = [
  { label: 'Any', value: '' },
  { label: '1990-1999', value: '1990-1999' },
  { label: '2000-2010', value: '2000-2010' },
  { label: '2011-2015', value: '2011-2015' },
  { label: '2016-2020', value: '2016-2020' },
  { label: '2021-2025', value: '2021-2025' },
];

// Pre-defined single years
const singleYears = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];

function SearchLibraries({ onResults, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search form state
  const [selectedGenre, setSelectedGenre] = useState('');
  const [yearType, setYearType] = useState('range'); // 'range' or 'single'
  const [yearRange, setYearRange] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [customKeyword, setCustomKeyword] = useState('');
const [rating, setRating] = useState(''); // 'r', 'pg13', 'g'

  const handleSearch = async (searchFn) => {
    setLoading(true);
    setError(null);
    try {
      const animeList = await searchFn();
      const recommendations = getRecommendations(animeList);
      onResults(recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Genre search
  const handleGenreSearch = () => {
    if (!selectedGenre) return;
    
    const filters = {
      genreId: selectedGenre,
    };
    
    if (yearType === 'range' && yearRange) {
      const [start, end] = yearRange.split('-');
      filters.startDate = `${start}-01-01`;
      filters.endDate = `${end}-12-31`;
    } else if (yearType === 'single' && selectedYear) {
      filters.startDate = `${selectedYear}-01-01`;
      filters.endDate = `${selectedYear}-12-31`;
    }
    
    if (rating) {
      filters.rating = rating;
    }
    
handleSearch(() => fetchAnimeByFilters(filters));
  };

  // Custom keyword search
  const handleCustomSearch = () => {
    if (customKeyword.trim()) {
      handleSearch(() => fetchAnimeByKeyword(customKeyword.trim(), 10));
    }
  };

  // Quick filters
  const handleQuickFilter = (filterType) => {
    switch (filterType) {
      case 'top100':
        handleSearch(() => fetchTopAnime(100));
        break;
      case 'latest':
        handleSearch(() => fetchLatestEpisodes(50));
        break;
      case 'upcoming':
        handleSearch(() => fetchUpcomingAnime(50));
        break;
      case 'romance':
        handleSearch(() => fetchAnimeByGenre(22, 50));
        break;
      case 'isekai':
        handleSearch(() => fetchAnimeByKeyword('isekai', 50));
        break;
      default:
        break;
    }
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

  return (
    <div>
      <h1>Search Libraries</h1>
      
      {error && (
        <div>
          <p>Failed to load. Please try again.</p>
          <button onClick={handleGenreSearch}>Retry</button>
        </div>
      )}
      
      {!error && (
        <>
          {/* Quick Filters */}
          <div>
            <h2>Quick Filters</h2>
            <button onClick={() => handleQuickFilter('top100')}>Top 100 Popularity</button>
            <button onClick={() => handleQuickFilter('latest')}>Latest Episodes</button>
            <button onClick={() => handleQuickFilter('upcoming')}>Upcoming</button>
            <button onClick={() => handleQuickFilter('romance')}>Romance</button>
            <button onClick={() => handleQuickFilter('isekai')}>Isekai</button>
          </div>
          
          <hr />
          
          {/* Advanced Search */}
          <div>
            <h2>Advanced Search</h2>
            
            {/* Genre Selection */}
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
            
            {/* Year Selection */}
            <div>
              <label>Year: </label>
              <select 
                value={yearType}
                onChange={(e) => setYearType(e.target.value)}
              >
                <option value="range">Range</option>
                <option value="single">Single Year</option>
              </select>
              
              {yearType === 'range' ? (
                <select 
                  value={yearRange}
                  onChange={(e) => setYearRange(e.target.value)}
                >
                  <option value="">Select Range</option>
                  {yearRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              ) : (
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">Select Year</option>
                  {singleYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Rating (maturity) */}
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
                <option value="rx">R+ (Adult)</option>
              </select>
            </div>
            
            <button onClick={handleGenreSearch} disabled={!selectedGenre}>
              Search
            </button>
          </div>
          
          <hr />
          
          {/* Custom Keyword Search */}
          <div>
            <h2>Custom Keyword</h2>
            <input
              type="text"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              placeholder="Enter keyword (e.g., magic school)"
            />
            <button onClick={handleCustomSearch} disabled={!customKeyword.trim()}>
              Search
            </button>
          </div>
        </>
      )}
      
      <div>
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

export default SearchLibraries;
