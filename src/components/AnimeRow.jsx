import { useEffect, useState } from 'react';
import AnimeCard from './AnimeCard';

function AnimeRow({
  title,
  fetchFunction,
  fetchLimit = 10,
  displayLimit = 10,
  emptyMessage = 'No anime available right now.',
  onAnimeSelect,
}) {
  const [rowItems, setRowItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  const visibleItems = rowItems.slice(0, displayLimit);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Browse</p>
          <h2>{title}</h2>
        </div>
        {!isLoading && !hasError && rowItems.length > 0 && (
          <span className="section-count">{rowItems.length} titles</span>
        )}
      </div>

      {isLoading && <p className="status-message">Loading...</p>}
      {!isLoading && hasError && <p className="status-message status-message--error">Failed to load</p>}
      {!isLoading && !hasError && rowItems.length === 0 && (
        <p className="status-message">{emptyMessage}</p>
      )}

      {!isLoading && !hasError && visibleItems.length > 0 && (
        <div className="anime-row__grid">
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
