import { startTransition, useEffect, useState } from 'react';
import AnimeCard from './AnimeCard';
import AnimeDetailsModal from './AnimeDetailsModal';
import AnimeRow from './AnimeRow';
import QuizModal from './QuizModal';
import SearchPanel from './SearchPanel';
import ThemeToggle from './ThemeToggle';
import {
  fetchAnimeGenres,
  fetchLatest,
  fetchPopular,
  fetchQuizRecommendations,
  fetchTopRated2026,
  fetchUpcoming,
  searchAnime,
} from '../services/animeApi';

const CATEGORY_ROWS = [
  {
    title: 'Top 100 Popular Anime',
    fetchFunction: fetchPopular,
    fetchLimit: 100,
    displayLimit: 10,
  },
  {
    title: '100 Latest Anime',
    fetchFunction: fetchLatest,
    fetchLimit: 100,
    displayLimit: 10,
  },
  {
    title: 'Upcoming Anime',
    fetchFunction: fetchUpcoming,
    fetchLimit: 10,
    displayLimit: 10,
  },
  {
    title: 'Top 10 Rated Anime of 2026',
    fetchFunction: fetchTopRated2026,
    fetchLimit: 10,
    displayLimit: 10,
  },
];

const INITIAL_SEARCH_FILTERS = {
  query: '',
  genreId: '',
  year: '',
  type: '',
  status: '',
  orderBy: 'popularity',
  sort: 'desc',
};

function HomePage({ theme, onToggleTheme }) {
  const [genreOptions, setGenreOptions] = useState([]);
  const [genreLoading, setGenreLoading] = useState(true);
  const [genreError, setGenreError] = useState('');
  const [searchFilters, setSearchFilters] = useState(INITIAL_SEARCH_FILTERS);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [quizRecommendations, setQuizRecommendations] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadGenres = async () => {
      setGenreLoading(true);
      setGenreError('');

      try {
        const genres = await fetchAnimeGenres();

        if (!isActive) {
          return;
        }

        setGenreOptions(genres);
      } catch {
        if (!isActive) {
          return;
        }

        setGenreOptions([]);
        setGenreError('Genre filters could not be loaded.');
      } finally {
        if (isActive) {
          setGenreLoading(false);
        }
      }
    };

    loadGenres();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSearchChange = (field, value) => {
    setSearchFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const handleSearchSubmit = async () => {
    setSearchLoading(true);
    setSearchError('');

    try {
      const results = await searchAnime(searchFilters, 24);

      startTransition(() => {
        setSearchResults(results);
        setHasSearched(true);
      });
    } catch {
      setSearchError('Failed to search anime.');

      startTransition(() => {
        setSearchResults([]);
        setHasSearched(true);
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchReset = () => {
    setSearchFilters(INITIAL_SEARCH_FILTERS);
    setSearchResults([]);
    setSearchError('');
    setHasSearched(false);
  };

  const handleQuizSubmit = async (answers) => {
    setQuizLoading(true);
    setQuizError('');

    try {
      const recommendations = await fetchQuizRecommendations(answers, 5);

      startTransition(() => {
        setQuizRecommendations(recommendations.slice(0, 5));
        setIsQuizOpen(false);
      });
    } catch {
      setQuizError('Failed to load quiz recommendations.');
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <main className="home-page">
      <header className="topbar topbar--home">
        <div>
          <span className="brand-mark">Anime4U</span>
          <h1 className="page-title">Search, hover, and open anime details faster.</h1>
          <p className="page-lead">
            Hover the question mark for quick info. Click any anime card to open a
            deeper details panel with synopsis, season links, and external pages.
          </p>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <SearchPanel
        filters={searchFilters}
        genres={genreOptions}
        genreLoading={genreLoading}
        isLoading={searchLoading}
        onChange={handleSearchChange}
        onSubmit={handleSearchSubmit}
        onReset={handleSearchReset}
      />

      {genreError && (
        <p className="status-message status-message--error">{genreError}</p>
      )}

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Results</p>
            <h2>Filtered anime search</h2>
          </div>
          {hasSearched && !searchLoading && (
            <span className="section-count">{searchResults.length} matches</span>
          )}
        </div>

        {!hasSearched && (
          <p className="status-message">
            Search by title, genre, year, status, and type to build your own list.
          </p>
        )}

        {searchLoading && <p className="status-message">Searching...</p>}
        {!searchLoading && searchError && (
          <p className="status-message status-message--error">{searchError}</p>
        )}
        {!searchLoading && hasSearched && !searchError && searchResults.length === 0 && (
          <p className="status-message">No anime matched those filters.</p>
        )}

        {!searchLoading && searchResults.length > 0 && (
          <div className="anime-grid">
            {searchResults.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                layout="grid"
                onSelect={setSelectedAnime}
              />
            ))}
          </div>
        )}
      </section>

      <section className="content-section quiz-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Personalized</p>
            <h2>Quiz recommendations</h2>
          </div>
          <button
            type="button"
            className="button"
            onClick={() => setIsQuizOpen(true)}
          >
            Take the Quiz
          </button>
        </div>

        {quizLoading && <p className="status-message">Loading quiz picks...</p>}
        {!quizLoading && quizError && (
          <p className="status-message status-message--error">{quizError}</p>
        )}
        {!quizLoading && !quizError && quizRecommendations.length === 0 && (
          <p className="status-message">
            Finish the quiz to generate five franchise-safe recommendations.
          </p>
        )}

        {!quizLoading && quizRecommendations.length > 0 && (
          <div className="anime-grid anime-grid--compact">
            {quizRecommendations.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                layout="grid"
                onSelect={setSelectedAnime}
              />
            ))}
          </div>
        )}
      </section>

      <div className="rows-stack">
        {CATEGORY_ROWS.map((row) => (
        <AnimeRow
          key={row.title}
          title={row.title}
          fetchFunction={row.fetchFunction}
          fetchLimit={row.fetchLimit}
          displayLimit={row.displayLimit}
          onAnimeSelect={setSelectedAnime}
        />
      ))}
      </div>

      {isQuizOpen && (
        <QuizModal
          isLoading={quizLoading}
          onClose={() => {
            if (!quizLoading) {
              setIsQuizOpen(false);
            }
          }}
          onSubmit={handleQuizSubmit}
        />
      )}

      {selectedAnime && (
        <AnimeDetailsModal
          key={selectedAnime.id}
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </main>
  );
}

export default HomePage;
