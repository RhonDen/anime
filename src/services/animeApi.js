const BASE_URL = 'https://api.jikan.moe/v4';
const MAX_PAGE_SIZE = 25;
const MIN_REQUEST_INTERVAL = 350;
const QUIZ_FETCH_LIMIT = 50;

export const AUDIO_AVAILABILITY_NOTE =
  'Dub/sub availability is not provided by Jikan.';

const QUIZ_GENRES = {
  action: 1,
  romance: 22,
  comedy: 4,
  fantasy: 10,
  horror: 14,
};

const LENGTH_FILTERS = {
  short: {
    params: {
      max_episodes: 11,
    },
    rarity: 2,
  },
  medium: {
    params: {
      min_episodes: 13,
      max_episodes: 26,
    },
    rarity: 1,
  },
  long: {
    params: {
      min_episodes: 27,
    },
    rarity: 2,
  },
};

const ERA_FILTERS = {
  classic: {
    params: {
      end_date: '1999-12-31',
    },
    rarity: 4,
  },
  modern: {
    params: {
      start_date: '2000-01-01',
      end_date: '2015-12-31',
    },
    rarity: 2,
  },
  recent: {
    params: {
      start_date: '2016-01-01',
      end_date: '2025-12-31',
    },
    rarity: 1,
  },
  future: {
    params: {
      start_date: '2026-01-01',
    },
    rarity: 5,
  },
};

const MOOD_TAGS = {
  exciting: ['Action', 'Adventure', 'Super Power', 'Sports', 'Sci-Fi', 'Mecha'],
  relaxing: ['Slice of Life', 'Iyashikei', 'Gourmet', 'Music'],
  dark: ['Horror', 'Suspense', 'Psychological', 'Drama', 'Thriller'],
  wholesome: ['Comedy', 'Romance', 'Slice of Life', 'School', 'Family'],
};

let lastRequestStartedAt = 0;
let requestQueue = Promise.resolve();
const cachedLists = new Map();
const animeDetailsCache = new Map();
let cachedGenres = null;

function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function normalizeTitleVariants(anime) {
  return [
    anime.title_english,
    anime.title,
    anime.title_japanese,
    ...(anime.title_synonyms || []),
    ...((anime.titles || []).map((titleEntry) => titleEntry?.title)),
  ].filter(Boolean);
}

function normalizeAnime(anime) {
  return {
    id: anime.mal_id,
    mal_id: anime.mal_id,
    url: anime.url || '',
    title: anime.title_english || anime.title || 'Untitled Anime',
    titleEnglish: anime.title_english || '',
    titleJapanese: anime.title_japanese || '',
    titleVariants: normalizeTitleVariants(anime),
    images: {
      jpg: {
        image_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
      },
    },
    score: anime.score ?? null,
    synopsis: anime.synopsis || 'No synopsis available.',
    background: anime.background || '',
    episodes: anime.episodes ?? null,
    popularity: anime.popularity ?? Number.MAX_SAFE_INTEGER,
    rank: anime.rank ?? null,
    members: anime.members ?? null,
    genres: anime.genres || [],
    themes: anime.themes || [],
    demographics: anime.demographics || [],
    explicitGenres: anime.explicit_genres || [],
    aired: anime.aired || null,
    season: anime.season || '',
    year: anime.year ?? anime.aired?.prop?.from?.year ?? null,
    status: anime.status || 'Unknown',
    type: anime.type || 'Unknown',
    rating: anime.rating || 'Unknown',
    duration: anime.duration || '',
    source: anime.source || 'Unknown',
    studios: anime.studios || [],
    licensors: anime.licensors || [],
    producers: anime.producers || [],
    trailer: anime.trailer?.url || anime.trailer?.embed_url || '',
    broadcast: anime.broadcast?.string || '',
    streaming: anime.streaming || [],
    relations: anime.relations || [],
    approved: anime.approved ?? true,
  };
}

function uniqueAnime(animeList) {
  const seen = new Set();

  return animeList.filter((anime) => {
    if (!anime?.id || seen.has(anime.id)) {
      return false;
    }

    seen.add(anime.id);
    return true;
  });
}

async function queuedFetchJson(url) {
  const nextRequest = requestQueue.then(async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const elapsed = Date.now() - lastRequestStartedAt;

      if (elapsed < MIN_REQUEST_INTERVAL) {
        await wait(MIN_REQUEST_INTERVAL - elapsed);
      }

      lastRequestStartedAt = Date.now();

      const response = await fetch(url);

      if (response.status === 429 && attempt < 2) {
        const retryAfterHeader = Number(response.headers.get('Retry-After'));
        const retryDelay = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
          ? retryAfterHeader * 1000
          : MIN_REQUEST_INTERVAL * 4;

        await wait(retryDelay);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Jikan request failed with status ${response.status}`);
      }

      return response.json();
    }

    throw new Error('Jikan request failed after retries');
  });

  requestQueue = nextRequest.catch(() => undefined);

  return nextRequest;
}

function buildUrl(path, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return `${BASE_URL}${path}${query ? `?${query}` : ''}`;
}

async function fetchAnimePage(path, params = {}) {
  const response = await queuedFetchJson(buildUrl(path, params));
  const rawItems = Array.isArray(response.data) ? response.data : [];

  return {
    items: rawItems.map(normalizeAnime),
    hasNextPage: Boolean(response.pagination?.has_next_page),
  };
}

async function fetchPagedAnimeList(path, totalLimit, params = {}) {
  const combinedResults = [];
  let page = 1;

  while (uniqueAnime(combinedResults).length < totalLimit) {
    const pageResult = await fetchAnimePage(path, {
      ...params,
      limit: Math.min(MAX_PAGE_SIZE, totalLimit),
      page,
    });

    if (pageResult.items.length === 0) {
      break;
    }

    combinedResults.push(...pageResult.items);

    if (!pageResult.hasNextPage) {
      break;
    }

    page += 1;
  }

  return uniqueAnime(combinedResults).slice(0, totalLimit);
}

async function safeFetchPagedAnimeList(path, totalLimit, params = {}) {
  try {
    return await fetchPagedAnimeList(path, totalLimit, params);
  } catch {
    return [];
  }
}

function normalizeFranchiseTitle(title) {
  const cleanedTitle = title
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*]/g, ' ')
    .replace(/:\s+.*$/g, ' ')
    .replace(/\.\s+.*$/g, ' ')
    .replace(/\s-\s.*$/g, ' ')
    .replace(/\bfinal season\b/g, ' ')
    .replace(/\b(\d+)(st|nd|rd|th)\s+(season|part)\b/g, ' ')
    .replace(
      /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+(season|part)\b/g,
      ' ',
    )
    .replace(/\b(season|part|cour)\s+\d+\b/g, ' ')
    .replace(/\b(tv|movie|special|ova|ona)\b/g, ' ')
    .replace(/\b(ii|iii|iv|v|vi|vii|viii|ix|x)\b$/g, ' ')
    .replace(/[^a-z0-9/\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanedTitle || title.toLowerCase().trim();
}

function getFranchiseKey(anime) {
  const primaryKey = normalizeFranchiseTitle(anime.title);

  if (primaryKey.length > 0) {
    return primaryKey;
  }

  const fallbackKey = anime.titleVariants
    ?.map(normalizeFranchiseTitle)
    .find((titleVariant) => titleVariant.length > 0);

  return fallbackKey || `anime-${anime.id}`;
}

function uniqueAnimeByFranchise(animeList) {
  const seenFranchises = new Set();

  return animeList.filter((anime) => {
    const franchiseKey = getFranchiseKey(anime);

    if (seenFranchises.has(franchiseKey)) {
      return false;
    }

    seenFranchises.add(franchiseKey);
    return true;
  });
}

function getMoodMatchCount(anime, mood) {
  const moodTags = MOOD_TAGS[mood];

  if (!moodTags) {
    return 0;
  }

  const tagNames = [...(anime.genres || []), ...(anime.themes || [])]
    .map((entry) => entry?.name)
    .filter(Boolean);

  return tagNames.filter((name) => moodTags.includes(name)).length;
}

function rankQuizResults(animeList, answers) {
  return [...animeList].sort((firstAnime, secondAnime) => {
    const moodDifference =
      getMoodMatchCount(secondAnime, answers.mood) -
      getMoodMatchCount(firstAnime, answers.mood);

    if (moodDifference !== 0) {
      return moodDifference;
    }

    const firstScore = firstAnime.score ?? 0;
    const secondScore = secondAnime.score ?? 0;

    if (secondScore !== firstScore) {
      return secondScore - firstScore;
    }

    const firstPopularity = firstAnime.popularity ?? Number.MAX_SAFE_INTEGER;
    const secondPopularity = secondAnime.popularity ?? Number.MAX_SAFE_INTEGER;

    if (answers.popularity === 'hidden') {
      return secondPopularity - firstPopularity;
    }

    if (answers.popularity === 'mainstream') {
      return firstPopularity - secondPopularity;
    }

    return firstPopularity - secondPopularity;
  });
}

function buildQuizQuery(answers, omittedFilter = null) {
  const queryParams = {
    genres: QUIZ_GENRES[answers.genre],
    order_by: 'score',
    sort: 'desc',
    sfw: true,
  };
  const appliedFilters = [];

  const lengthFilter = LENGTH_FILTERS[answers.length];
  if (lengthFilter && omittedFilter !== 'length') {
    Object.assign(queryParams, lengthFilter.params);
    appliedFilters.push({
      key: 'length',
      rarity: lengthFilter.rarity,
    });
  }

  const eraFilter = ERA_FILTERS[answers.era];
  if (eraFilter && omittedFilter !== 'era') {
    Object.assign(queryParams, eraFilter.params);
    appliedFilters.push({
      key: 'era',
      rarity: eraFilter.rarity,
    });
  }

  return {
    queryParams,
    appliedFilters,
  };
}

function getRarestFilter(appliedFilters) {
  if (appliedFilters.length === 0) {
    return null;
  }

  return [...appliedFilters].sort((firstFilter, secondFilter) => {
    return secondFilter.rarity - firstFilter.rarity;
  })[0].key;
}

async function fetchTopFallback(limit) {
  try {
    return await fetchPopular(Math.max(limit, 20));
  } catch {
    const cachedResults = uniqueAnime([
      ...(cachedLists.get('popular') || []),
      ...(cachedLists.get('latest') || []),
      ...(cachedLists.get('upcoming') || []),
      ...(cachedLists.get('top-rated-2026') || []),
    ]);

    return cachedResults.slice(0, limit);
  }
}

function cacheList(key, animeList) {
  cachedLists.set(key, animeList);
  return animeList;
}

export async function fetchAnimeGenres() {
  if (cachedGenres) {
    return cachedGenres;
  }

  const response = await queuedFetchJson(buildUrl('/genres/anime'));
  const genres = Array.isArray(response.data)
    ? response.data
        .filter((genre) => genre?.mal_id && genre?.name)
        .map((genre) => ({
          id: genre.mal_id,
          name: genre.name,
        }))
        .sort((firstGenre, secondGenre) => {
          return firstGenre.name.localeCompare(secondGenre.name);
        })
    : [];

  cachedGenres = genres;
  return genres;
}

export async function fetchAnimeDetails(id) {
  if (animeDetailsCache.has(id)) {
    return animeDetailsCache.get(id);
  }

  try {
    const response = await queuedFetchJson(buildUrl(`/anime/${id}/full`));
    const details = normalizeAnime(response.data || {});
    animeDetailsCache.set(id, details);
    return details;
  } catch {
    const response = await queuedFetchJson(buildUrl(`/anime/${id}`));
    const details = normalizeAnime(response.data || {});
    animeDetailsCache.set(id, details);
    return details;
  }
}

export async function searchAnime(filters, limit = 24) {
  const params = {
    sfw: true,
    order_by: filters.orderBy || 'popularity',
    sort: filters.sort || 'desc',
  };

  const trimmedQuery = filters.query?.trim();
  if (trimmedQuery) {
    params.q = trimmedQuery;
  }

  if (filters.genreId) {
    params.genres = filters.genreId;
  }

  if (filters.type) {
    params.type = filters.type;
  }

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.year) {
    params.start_date = `${filters.year}-01-01`;
    params.end_date = `${filters.year}-12-31`;
  }

  return fetchPagedAnimeList('/anime', limit, params);
}

export async function fetchPopular(limit = 10) {
  const animeList = await fetchPagedAnimeList('/top/anime', limit, {
    filter: 'bypopularity',
    sfw: true,
  });

  return cacheList('popular', animeList).slice(0, limit);
}

export async function fetchLatest(limit = 10) {
  const animeList = await fetchPagedAnimeList('/anime', limit, {
    order_by: 'start_date',
    sort: 'desc',
    sfw: true,
  });

  return cacheList('latest', animeList).slice(0, limit);
}

export async function fetchUpcoming(limit = 10) {
  const animeList = await fetchPagedAnimeList('/seasons/upcoming', limit, {
    sfw: true,
  });

  return cacheList('upcoming', animeList).slice(0, limit);
}

export async function fetchTopRated2026(limit = 10) {
  const animeList = await fetchPagedAnimeList('/anime', limit, {
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    order_by: 'score',
    sort: 'desc',
    sfw: true,
  });

  return cacheList('top-rated-2026', animeList).slice(0, limit);
}

export async function fetchQuizRecommendations(answers, fallbackLimit = 5) {
  const strictQuery = buildQuizQuery(answers);
  const strictMatches = await safeFetchPagedAnimeList(
    '/anime',
    QUIZ_FETCH_LIMIT,
    strictQuery.queryParams,
  );
  const rankedStrictMatches = uniqueAnimeByFranchise(
    rankQuizResults(strictMatches, answers),
  );

  if (rankedStrictMatches.length >= fallbackLimit) {
    return rankedStrictMatches.slice(0, fallbackLimit);
  }

  const rarestFilter = getRarestFilter(strictQuery.appliedFilters);
  const relaxedMatches = rarestFilter
    ? await safeFetchPagedAnimeList(
        '/anime',
        QUIZ_FETCH_LIMIT,
        buildQuizQuery(answers, rarestFilter).queryParams,
      )
    : [];

  const rankedRelaxedMatches = rankQuizResults(relaxedMatches, answers);
  const combinedMatches = uniqueAnimeByFranchise(
    uniqueAnime([...rankedStrictMatches, ...rankedRelaxedMatches]),
  );

  if (combinedMatches.length >= fallbackLimit) {
    return combinedMatches.slice(0, fallbackLimit);
  }

  const topFallback = await fetchTopFallback(fallbackLimit);
  const finalRecommendations = uniqueAnimeByFranchise(
    uniqueAnime([...combinedMatches, ...topFallback]),
  );

  return finalRecommendations.slice(0, fallbackLimit);
}
