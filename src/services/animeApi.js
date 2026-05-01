import {
  QUIZ_ERA_FILTERS,
  QUIZ_LENGTH_FILTERS,
  QUIZ_MOOD_TAGS,
  QUIZ_PROTAGONIST_TAGS,
  QUIZ_SETTING_TAGS,
} from '../utils/quizPreferences';

const BASE_URL = 'https://api.jikan.moe/v4';
const MAX_PAGE_SIZE = 25;
const MIN_REQUEST_INTERVAL = 100;
const QUIZ_FETCH_LIMIT = 60;

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

function getAnimeTagNames(anime) {
  return [
    ...(anime.genres || []),
    ...(anime.themes || []),
    ...(anime.demographics || []),
    ...(anime.explicitGenres || []),
  ]
    .map((entry) => entry?.name)
    .filter(Boolean);
}

function getTagMatchCount(anime, preferredTags) {
  if (!preferredTags?.length) {
    return 0;
  }

  const tagNames = getAnimeTagNames(anime);

  return preferredTags.filter((tagName) => tagNames.includes(tagName)).length;
}

function getGenreMatchCount(anime, selectedGenres) {
  if (!selectedGenres?.length) {
    return 0;
  }

  const selectedGenreIds = new Set(
    selectedGenres
      .map((genreId) => Number(genreId))
      .filter((genreId) => Number.isFinite(genreId)),
  );

  if (selectedGenreIds.size === 0) {
    return 0;
  }

  return [
    ...(anime.genres || []),
    ...(anime.themes || []),
    ...(anime.demographics || []),
    ...(anime.explicitGenres || []),
  ].filter((entry) => selectedGenreIds.has(entry?.mal_id)).length;
}

function matchesEraKey(animeYear, eraKey) {
  const eraFilter = QUIZ_ERA_FILTERS[eraKey];

  if (!eraFilter || !animeYear) {
    return false;
  }

  const startYear = eraFilter.params.start_date
    ? Number(eraFilter.params.start_date.slice(0, 4))
    : null;
  const endYear = eraFilter.params.end_date
    ? Number(eraFilter.params.end_date.slice(0, 4))
    : null;

  if (startYear !== null && animeYear < startYear) {
    return false;
  }

  if (endYear !== null && animeYear > endYear) {
    return false;
  }

  return true;
}

function getEraMatchCount(anime, selectedEras) {
  if (!selectedEras?.length) {
    return 0;
  }

  const animeYear = anime.year ?? anime.aired?.prop?.from?.year ?? null;

  return selectedEras.filter((eraKey) => matchesEraKey(animeYear, eraKey)).length;
}

function matchesLengthPreference(anime, lengthPreference) {
  const episodeCount = anime.episodes ?? 0;

  if (lengthPreference === 'short') {
    return episodeCount >= 1 && episodeCount <= 12;
  }

  if (lengthPreference === 'medium') {
    return episodeCount >= 13 && episodeCount <= 26;
  }

  if (lengthPreference === 'long') {
    return episodeCount >= 27;
  }

  return false;
}

function matchesStatusPreference(anime, statusPreference) {
  const normalizedStatus = anime.status?.toLowerCase() || '';

  if (statusPreference === 'complete') {
    return normalizedStatus.includes('finished') || normalizedStatus.includes('complete');
  }

  if (statusPreference === 'airing') {
    return normalizedStatus.includes('airing');
  }

  if (statusPreference === 'upcoming') {
    return normalizedStatus.includes('not yet') || normalizedStatus.includes('upcoming');
  }

  return false;
}

function getQuizPreferenceScore(anime, answers) {
  let preferenceScore = (anime.score ?? 0) * 0.45;

  preferenceScore += getGenreMatchCount(anime, answers.genres) * 8;
  preferenceScore += getEraMatchCount(anime, answers.eras) * 5;
  preferenceScore += getTagMatchCount(anime, QUIZ_MOOD_TAGS[answers.mood]) * 4;
  preferenceScore += getTagMatchCount(anime, QUIZ_PROTAGONIST_TAGS[answers.protagonist]) * 4;
  preferenceScore += getTagMatchCount(anime, QUIZ_SETTING_TAGS[answers.setting]) * 3;

  if (answers.length !== 'any' && matchesLengthPreference(anime, answers.length)) {
    preferenceScore += 2.5;
  }

  if (answers.type !== 'any' && anime.type?.toLowerCase() === answers.type) {
    preferenceScore += 2;
  }

  if (answers.status !== 'any' && matchesStatusPreference(anime, answers.status)) {
    preferenceScore += 2;
  }

  return preferenceScore;
}

function comparePopularityPreference(firstAnime, secondAnime, popularityPreference) {
  const firstPopularity = firstAnime.popularity ?? Number.MAX_SAFE_INTEGER;
  const secondPopularity = secondAnime.popularity ?? Number.MAX_SAFE_INTEGER;

  if (popularityPreference === 'hidden') {
    return secondPopularity - firstPopularity;
  }

  if (popularityPreference === 'mainstream') {
    return firstPopularity - secondPopularity;
  }

  return 0;
}

function rankQuizResults(animeList, answers) {
  return [...animeList].sort((firstAnime, secondAnime) => {
    const firstPreferenceScore = getQuizPreferenceScore(firstAnime, answers);
    const secondPreferenceScore = getQuizPreferenceScore(secondAnime, answers);

    if (secondPreferenceScore !== firstPreferenceScore) {
      return secondPreferenceScore - firstPreferenceScore;
    }

    const popularityDifference = comparePopularityPreference(
      firstAnime,
      secondAnime,
      answers.popularity,
    );

    if (popularityDifference !== 0) {
      return popularityDifference;
    }

    const firstScore = firstAnime.score ?? 0;
    const secondScore = secondAnime.score ?? 0;

    if (secondScore !== firstScore) {
      return secondScore - firstScore;
    }

    const firstPopularity = firstAnime.popularity ?? Number.MAX_SAFE_INTEGER;
    const secondPopularity = secondAnime.popularity ?? Number.MAX_SAFE_INTEGER;

    return firstPopularity - secondPopularity;
  });
}

function buildQuizQueryParams(answers, options = {}) {
  const queryParams = {
    order_by: 'score',
    sort: 'desc',
    sfw: true,
  };

  if (!options.omitGenres && answers.genres?.length > 0) {
    queryParams.genres = answers.genres.join(',');
  }

  if (!options.omitType && answers.type && answers.type !== 'any') {
    queryParams.type = answers.type;
  }

  if (!options.omitStatus && answers.status && answers.status !== 'any') {
    queryParams.status = answers.status;
  }

  if (!options.omitLength) {
    const lengthFilter = QUIZ_LENGTH_FILTERS[answers.length];

    if (lengthFilter) {
      Object.assign(queryParams, lengthFilter.params);
    }
  }

  return queryParams;
}

async function fetchQuizMatches(answers, options = {}) {
  const selectedEras = !options.omitEras && answers.eras?.length > 0
    ? answers.eras
    : [null];
  const limitPerEra = Math.max(15, Math.ceil(QUIZ_FETCH_LIMIT / selectedEras.length));
  const baseQueryParams = buildQuizQueryParams(answers, options);
  const combinedMatches = [];

  for (const eraKey of selectedEras) {
    const eraQueryParams = eraKey ? QUIZ_ERA_FILTERS[eraKey]?.params || {} : {};
    const matches = await safeFetchPagedAnimeList('/anime', limitPerEra, {
      ...baseQueryParams,
      ...eraQueryParams,
    });

    combinedMatches.push(...matches);
  }

  return uniqueAnime(combinedMatches);
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

export async function fetchQuizRecommendations(answers, fallbackLimit = 8) {
  const strictMatches = await fetchQuizMatches(answers);
  const relaxedMatches = strictMatches.length < fallbackLimit
    ? await fetchQuizMatches(answers, {
        omitLength: true,
        omitStatus: true,
        omitType: true,
      })
    : [];
  const strictAndRelaxedMatches = uniqueAnime([...strictMatches, ...relaxedMatches]);
  const broadMatches = strictAndRelaxedMatches.length < fallbackLimit
    ? await fetchQuizMatches(answers, {
        omitEras: true,
        omitLength: true,
        omitStatus: true,
        omitType: true,
      })
    : [];
  const combinedMatches = uniqueAnimeByFranchise(
    uniqueAnime([...strictMatches, ...relaxedMatches, ...broadMatches]),
  );

  if (combinedMatches.length >= fallbackLimit) {
    return rankQuizResults(combinedMatches, answers).slice(0, fallbackLimit);
  }

  const topFallback = await fetchTopFallback(Math.max(fallbackLimit, 20));
  const finalRecommendations = uniqueAnimeByFranchise(
    uniqueAnime([...combinedMatches, ...topFallback]),
  );

  return rankQuizResults(finalRecommendations, answers).slice(0, fallbackLimit);
}
