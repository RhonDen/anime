import { useEffect, useState } from 'react';
import {
  AUDIO_AVAILABILITY_NOTE,
  fetchAnimeDetails,
} from '../services/animeApi';
import {
  countLinkedSeasons,
  formatEpisodeText,
  formatLargeNumber,
  formatSeasonYear,
} from '../utils/animePresentation';

function AnimeDetailsModal({ anime, onClose }) {
  const [details, setDetails] = useState(anime);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    document.body.style.overflow = 'hidden';

    const loadDetails = async () => {
      try {
        const nextDetails = await fetchAnimeDetails(anime.id);

        if (!isActive) {
          return;
        }

        setDetails(nextDetails);
      } catch {
        if (!isActive) {
          return;
        }

        setHasError(true);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadDetails();

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      isActive = false;
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [anime, onClose]);

  const activeAnime = details || anime;
  const linkedSeasons = countLinkedSeasons(activeAnime);
  const seasonYear = formatSeasonYear(activeAnime);
  const factItems = [
    {
      label: 'Season',
      value: seasonYear || 'Unknown',
    },
    {
      label: 'Episodes',
      value: formatEpisodeText(activeAnime.episodes),
    },
    {
      label: 'Linked seasons',
      value: `${linkedSeasons}`,
    },
    {
      label: 'Status',
      value: activeAnime.status,
    },
    {
      label: 'Type',
      value: activeAnime.type,
    },
    {
      label: 'Rating',
      value: activeAnime.rating,
    },
    {
      label: 'Audio',
      value: AUDIO_AVAILABILITY_NOTE,
    },
    {
      label: 'Members',
      value: formatLargeNumber(activeAnime.members),
    },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="anime-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="anime-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="anime-modal__close" onClick={onClose}>
          Close
        </button>

        <div className="anime-modal__layout">
          <div className="anime-modal__poster-column">
            <img
              className="anime-modal__poster"
              src={activeAnime.images?.jpg?.image_url}
              alt={activeAnime.title}
            />

            <div className="anime-modal__links">
              {activeAnime.url && (
                <a
                  className="button button--secondary"
                  href={activeAnime.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on MyAnimeList
                </a>
              )}
              {activeAnime.trailer && (
                <a
                  className="button button--ghost"
                  href={activeAnime.trailer}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch trailer
                </a>
              )}
            </div>
          </div>

          <div className="anime-modal__content">
            <p className="section-kicker">Anime details</p>
            <h2 id="anime-modal-title">{activeAnime.title}</h2>
            {activeAnime.titleJapanese && (
              <p className="anime-modal__subhead">{activeAnime.titleJapanese}</p>
            )}

            <div className="tag-list">
              {(activeAnime.genres || []).slice(0, 5).map((genre) => (
                <span key={genre.mal_id} className="tag">
                  {genre.name}
                </span>
              ))}
            </div>

            {isLoading && <p className="status-message">Loading full details...</p>}
            {!isLoading && hasError && (
              <p className="status-message status-message--error">
                Full details could not be loaded, showing basic card data instead.
              </p>
            )}

            <div className="anime-modal__facts">
              {factItems.map((factItem) => (
                <div key={factItem.label} className="anime-modal__fact">
                  <span>{factItem.label}</span>
                  <strong>{factItem.value}</strong>
                </div>
              ))}
            </div>

            <div className="anime-modal__section">
              <h3>Synopsis</h3>
              <p>{activeAnime.synopsis}</p>
            </div>

            {activeAnime.background && (
              <div className="anime-modal__section">
                <h3>Background</h3>
                <p>{activeAnime.background}</p>
              </div>
            )}

            <div className="anime-modal__section">
              <h3>Production</h3>
              <p>
                Studios: {(activeAnime.studios || []).map((studio) => studio.name).join(', ') || 'Unknown'}
              </p>
              <p>
                Licensors:{' '}
                {(activeAnime.licensors || []).map((licensor) => licensor.name).join(', ') || 'Unknown'}
              </p>
              <p>Source: {activeAnime.source}</p>
              {activeAnime.broadcast && <p>Broadcast: {activeAnime.broadcast}</p>}
            </div>

            {activeAnime.streaming?.length > 0 && (
              <div className="anime-modal__section">
                <h3>Streaming links</h3>
                <div className="anime-modal__streaming">
                  {activeAnime.streaming.map((streamItem) => (
                    <a
                      key={streamItem.name}
                      className="button button--ghost"
                      href={streamItem.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {streamItem.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AnimeDetailsModal;
