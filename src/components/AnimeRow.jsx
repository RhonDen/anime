import { useEffect, useState } from 'react';
import AnimeCard from './AnimeCard';

function getItemsPerPage(viewportWidth) {
  if (viewportWidth < 640) {
    return 2;
  }

  if (viewportWidth < 860) {
    return 3;
  }

  if (viewportWidth < 1080) {
    return 4;
  }

  if (viewportWidth < 1320) {
    return 5;
  }

  return 6;
}

function formatSyncTime(timestamp) {
  if (!timestamp) {
    return 'Not synced yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

function AnimeRow({
  title,
  fetchFunction,
  fetchLimit = 10,
  displayLimit = 10,
  emptyMessage = 'No anime available right now.',
  liveRefreshMs = 120000,
  onAnimeSelect,
  refreshToken = 0,
}) {
  const [rowItems, setRowItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === 'undefined') {
      return 6;
    }

    return getItemsPerPage(window.innerWidth);
  });
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadAnime = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const results = await fetchFunction(fetchLimit);

        if (!isActive) {
          return;
        }

        setRowItems(Array.isArray(results) ? results : []);
        setLastUpdatedAt(Date.now());
      } catch {
        if (!isActive) {
          return;
        }

        setRowItems([]);
        setHasError(true);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadAnime();

    return () => {
      isActive = false;
    };
  }, [fetchFunction, fetchLimit]);

  useEffect(() => {
    if (refreshToken === 0) {
      return undefined;
    }

    let isActive = true;

    const refreshAnime = async () => {
      setIsRefreshing(true);

      try {
        const results = await fetchFunction(fetchLimit);

        if (!isActive) {
          return;
        }

        setRowItems(Array.isArray(results) ? results : []);
        setLastUpdatedAt(Date.now());
      } catch {
        if (!isActive) {
          return;
        }
      } finally {
        if (isActive) {
          setIsRefreshing(false);
        }
      }
    };

    refreshAnime();

    return () => {
      isActive = false;
    };
  }, [fetchFunction, fetchLimit, refreshToken]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      setItemsPerPage(getItemsPerPage(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const visiblePool = rowItems.slice(0, displayLimit);
  const pageCount = Math.max(1, Math.ceil(visiblePool.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, Math.max(0, pageCount - 1));
  const pageStart = safeCurrentPage * itemsPerPage;
  const visibleItems = visiblePool.slice(pageStart, pageStart + itemsPerPage);
  const pageEnd = Math.min(visiblePool.length, pageStart + visibleItems.length);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Browse</p>
          <h2>{title}</h2>
        </div>

        <div className="section-heading__meta">
          {visiblePool.length > 0 && (
            <span className="section-count">
              Showing {visiblePool.length === 0 ? 0 : pageStart + 1}-{pageEnd} of {visiblePool.length}
            </span>
          )}
          {isRefreshing && (
            <span className="section-count">
              Syncing every {Math.round(liveRefreshMs / 60000)} min...
            </span>
          )}
          {lastUpdatedAt && !isLoading && (
            <span className="section-count">Updated {formatSyncTime(lastUpdatedAt)}</span>
          )}
          {pageCount > 1 && (
            <div className="row-nav">
              <button
                type="button"
                className="row-nav__button"
                onClick={() => {
                  setCurrentPage((currentValue) => Math.max(0, currentValue - 1));
                }}
                disabled={safeCurrentPage === 0 || isLoading}
                aria-label={`Show previous titles in ${title}`}
              >
                &larr;
              </button>
              <span className="section-count">
                Page {safeCurrentPage + 1} / {pageCount}
              </span>
              <button
                type="button"
                className="row-nav__button"
                onClick={() => {
                  setCurrentPage((currentValue) => Math.min(pageCount - 1, currentValue + 1));
                }}
                disabled={safeCurrentPage >= pageCount - 1 || isLoading}
                aria-label={`Show next titles in ${title}`}
              >
                &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading && <p className="status-message">Loading...</p>}
      {!isLoading && hasError && (
        <p className="status-message status-message--error">Failed to load.</p>
      )}
      {!isLoading && !hasError && visiblePool.length === 0 && (
        <p className="status-message">{emptyMessage}</p>
      )}

      {!isLoading && !hasError && visibleItems.length > 0 && (
        <div
          key={`${title}-${safeCurrentPage}`}
          className="anime-row__grid anime-row__grid--paged"
        >
          {visibleItems.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              layout="grid"
              onSelect={onAnimeSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default AnimeRow;
