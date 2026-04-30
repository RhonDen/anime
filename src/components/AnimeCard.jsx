import { useState } from 'react';
import { AUDIO_AVAILABILITY_NOTE } from '../services/animeApi';
import {
  formatEpisodeText,
  formatSeasonYear,
  truncateText,
} from '../utils/animePresentation';

function AnimeCard({ anime, layout = 'rail', onSelect }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const seasonYear = formatSeasonYear(anime);
  const description = truncateText(anime.synopsis, 165);

  return (
    <article className={`anime-card anime-card--${layout}`}>
      <button
        type="button"
        className="anime-card__action"
        onClick={() => onSelect?.(anime)}
      >
        <span className="anime-card__poster-shell">
          <img
            className="anime-card__poster"
            src={anime.images?.jpg?.image_url}
            alt={anime.title}
            loading="lazy"
          />
          {anime.score !== null && anime.score !== undefined && (
            <span className="anime-card__score">{anime.score.toFixed(2)}</span>
          )}
        </span>

        <span className="anime-card__copy">
          <span className="anime-card__title">{anime.title}</span>
          <span className="anime-card__meta">
            {[seasonYear, formatEpisodeText(anime.episodes), anime.type]
              .filter(Boolean)
              .join(' | ')}
          </span>
        </span>
      </button>

      <div
        className="anime-card__info-wrap"
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
      >
        <button
          type="button"
          className="anime-card__info"
          aria-expanded={isTooltipOpen}
          aria-label={`Quick info for ${anime.title}`}
          onFocus={() => setIsTooltipOpen(true)}
          onBlur={() => setIsTooltipOpen(false)}
          onClick={(event) => {
            event.stopPropagation();
            setIsTooltipOpen((currentState) => !currentState);
          }}
        >
          ?
        </button>

        <div className={`anime-card__tooltip${isTooltipOpen ? ' is-open' : ''}`}>
          <strong>{anime.title}</strong>
          <p>{description}</p>
          <p>{seasonYear || 'Release season unavailable'}</p>
          <p>{formatEpisodeText(anime.episodes)}</p>
          <p>Audio: {AUDIO_AVAILABILITY_NOTE}</p>
        </div>
      </div>
    </article>
  );
}

export default AnimeCard;
