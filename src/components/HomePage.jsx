import { startTransition, useEffect, useState } from 'react';
import AnimeCard from './AnimeCard';
import AnimeDetailsModal from './AnimeDetailsModal';
import AnimeRow from './AnimeRow';
import SearchPanel from './SearchPanel';
import ThemeToggle from './ThemeToggle';
import {
  fetchAnimeGenres,
  fetchLatest,
  fetchPopular,
  fetchTopRated2026,
  fetchUpcoming,
  searchAnime,
} from '../services/animeApi';

const CATEGORY_ROWS = [
  {
    title: 'Top 100 Popular Anime',
    fetchFunction: fetchPopular,
    fetchLimit: 100,
    displayLimit: 100,
  },
  {
    title: '100 Latest Anime',
    fetchFunction: fetchLatest,
    fetchLimit: 100,
    displayLimit: 100,
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

function formatSyncTime(timestamp) {
  if (!timestamp) {
    return 'Not synced yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

function HomePage({
  theme,
  liveRefreshMs,
  liveRefreshTick,
  onNavigateToQuiz,
  onToggleTheme,
}) {
  const [genreOptions, setGenreOptions] = useState([]);
  const [genreLoading, setGenreLoading] = useState(true);
  const [genreError, setGenreError] = useState('');
  const [searchFilters, setSearchFilters] = useState(INITIAL_SEARCH_FILTERS);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchRefreshing, setSearchRefreshing] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSubmittedFilters, setLastSubmittedFilters] = useState(null);
  const [searchLastUpdatedAt, setSearchLastUpdatedAt] = useState(null);
  const [selectedAnime, setSelectedAnime] = useState(null);

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

  const executeSearch = async (filtersSnapshot, isBackgroundRefresh) => {
    if (isBackgroundRefresh) {
      setSearchRefreshing(true);
    } else {
      setSearchLoading(true);
      setSearchError('');
    }

    try {
      const results = await searchAnime(filtersSnapshot, 24);

      startTransition(() => {
        setSearchResults(results);
        setHasSearched(true);
        setSearchLastUpdatedAt(Date.now());
      });

      if (isBackgroundRefresh) {
        setSearchError('');
      }
    } catch {
      if (isBackgroundRefresh) {
        setSearchError('Live refresh missed once, showing your last successful search.');
      } else {
        setSearchError('Failed to search anime.');

        startTransition(() => {
          setSearchResults([]);
          setHasSearched(true);
        });
      }
    } finally {
      if (isBackgroundRefresh) {
        setSearchRefreshing(false);
      } else {
        setSearchLoading(false);
      }
    }
  };

  useEffect(() => {
    if (liveRefreshTick === 0 || !hasSearched || !lastSubmittedFilters) {
      return;
    }

    const refreshTimeoutId = window.setTimeout(() => {
      void executeSearch(lastSubmittedFilters, true);
    }, 0);

    return () => {
      window.clearTimeout(refreshTimeoutId);
    };
  }, [hasSearched, lastSubmittedFilters, liveRefreshTick]);

  const handleSearchChange = (field, value) => {
    setSearchFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const handleSearchSubmit = async () => {
    const filtersSnapshot = {
      ...searchFilters,
    };

    setLastSubmittedFilters(filtersSnapshot);
    await executeSearch(filtersSnapshot, false);
  };

  const handleSearchReset = () => {
    setSearchFilters(INITIAL_SEARCH_FILTERS);
    setSearchResults([]);
    setSearchError('');
    setSearchRefreshing(false);
    setHasSearched(false);
    setLastSubmittedFilters(null);
    setSearchLastUpdatedAt(null);
  };

  return (
    <main className="home-page">
      <header className="topbar topbar--home">
        <div>
          <span className="brand-mark">Anime4U</span>
          <h1 className="page-title">Browse more than the first page.</h1>
          <p className="page-lead">
            Search fast, page through full 100-title rows with arrows, and jump to a
            dedicated quiz page when you want the recommendations to feel more
            intentional than a modal can.
          </p>
        </div>

        <div className="topbar__actions">
          <button type="button" className="button" onClick={onNavigateToQuiz}>
            Open Quiz Page
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      <section className="content-section home-page__highlight">
        <div>
          <p className="section-kicker">Live browse</p>
          <h2>Rows and active searches refresh automatically.</h2>
          <p className="status-message">
            While this tab stays visible, browse rows and active search results sync
            against the API every {Math.round(liveRefreshMs / 60000)} minutes.
          </p>
        </div>

        <div className="home-page__highlight-metrics">
          <div className="home-page__metric">
            <span>Search sync</span>
            <strong>{formatSyncTime(searchLastUpdatedAt)}</strong>
          </div>
          <div className="home-page__metric">
            <span>Rows available</span>
            <strong>{CATEGORY_ROWS.length}</strong>
          </div>
        </div>
      </section>

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

          <div className="section-heading__meta">
            {searchRefreshing && (
              <span className="section-count">Refreshing live data...</span>
            )}
            {hasSearched && !searchLoading && (
              <span className="section-count">{searchResults.length} matches</span>
            )}
          </div>
        </div>

        {!hasSearched && (
          <p className="status-message">
            Search by title, genre, year, status, and type to build your own list.
          </p>
        )}

        {hasSearched && searchLastUpdatedAt && !searchLoading && (
          <p className="status-message">
            Last refreshed at {formatSyncTime(searchLastUpdatedAt)}.
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

      <section className="content-section home-page__quiz-cta">
        <div>
          <p className="section-kicker">Personalized</p>
          <h2>Need sharper recommendations?</h2>
          <p className="status-message">
            The new quiz page supports multi-select genres, multiple release eras,
            stronger main-character archetypes, and extra preference questions without
            stuffing everything into a hover or modal.
          </p>
        </div>

        <button type="button" className="button" onClick={onNavigateToQuiz}>
          Go to the Quiz
        </button>
      </section>

      <div className="rows-stack">
        {CATEGORY_ROWS.map((row) => (
          <AnimeRow
            key={row.title}
            displayLimit={row.displayLimit}
            fetchFunction={row.fetchFunction}
            fetchLimit={row.fetchLimit}
            liveRefreshMs={liveRefreshMs}
            onAnimeSelect={setSelectedAnime}
            refreshToken={liveRefreshTick}
            title={row.title}
          />
        ))}
      </div>

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
