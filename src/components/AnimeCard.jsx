import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  formatEpisodeText,
  formatSeasonYear,
  truncateText,
} from '../utils/animePresentation';

function AnimeCard({ anime, layout = 'rail', onSelect }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipShift, setTooltipShift] = useState(0);
  const tooltipRef = useRef(null);
  const seasonYear = formatSeasonYear(anime);
  const description = truncateText(anime.synopsis, 165);
  const imageUrl = anime.images?.jpg?.image_url;

  // Prefetch image when component mounts for faster loading
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
    }
  }, [imageUrl]);

  useLayoutEffect(() => {
    if (!isTooltipOpen) {
      return undefined;
    }

    const updateTooltipShift = () => {
      const tooltipElement = tooltipRef.current;

      if (!tooltipElement) {
        return;
      }

      const viewportPadding = 16;
      const tooltipRect = tooltipElement.getBoundingClientRect();
      let correction = 0;

      if (tooltipRect.left < viewportPadding) {
        correction = viewportPadding - tooltipRect.left;
      } else if (tooltipRect.right > window.innerWidth - viewportPadding) {
        correction = window.innerWidth - viewportPadding - tooltipRect.right;
      }

      if (correction !== 0) {
        setTooltipShift((currentShift) => currentShift + correction);
      }
    };

    updateTooltipShift();
    window.addEventListener('resize', updateTooltipShift);

    return () => {
      window.removeEventListener('resize', updateTooltipShift);
    };
  }, [isTooltipOpen]);

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

        <div
          ref={tooltipRef}
          className={`anime-card__tooltip${isTooltipOpen ? ' is-open' : ''}`}
          style={{ '--tooltip-shift': `${isTooltipOpen ? tooltipShift : 0}px` }}
        >
          <strong>{anime.title}</strong>
          <p>{description}</p>
          <p>{seasonYear || 'Release season unavailable'}</p>
          <p>{formatEpisodeText(anime.episodes)}</p>
        </div>
      </div>
    </article>
  );
}

export default AnimeCard;
