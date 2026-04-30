export function formatSeasonYear(anime) {
  const seasonName = anime.season
    ? `${anime.season.charAt(0).toUpperCase()}${anime.season.slice(1)}`
    : '';
  const yearValue = anime.year || anime.aired?.prop?.from?.year || '';

  if (seasonName && yearValue) {
    return `${seasonName} ${yearValue}`;
  }

  if (yearValue) {
    return `${yearValue}`;
  }

  return '';
}

export function formatEpisodeText(episodes) {
  if (!episodes) {
    return 'Episodes TBA';
  }

  return `${episodes} episode${episodes === 1 ? '' : 's'}`;
}

export function truncateText(text, maxLength = 180) {
  if (!text || text.length <= maxLength) {
    return text || 'No synopsis available.';
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

export function countLinkedSeasons(anime) {
  const seasonEntries = (anime.relations || [])
    .filter((relationItem) => {
      return relationItem.relation === 'Prequel' || relationItem.relation === 'Sequel';
    })
    .flatMap((relationItem) => relationItem.entry || [])
    .filter((entryItem) => entryItem.type === 'anime')
    .map((entryItem) => entryItem.mal_id);

  return new Set([anime.id, ...seasonEntries]).size;
}

export function formatLargeNumber(value) {
  if (!value) {
    return 'Unknown';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
