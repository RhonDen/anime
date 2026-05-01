export const QUIZ_INITIAL_ANSWERS = {
  genres: [],
  eras: [],
  length: 'any',
  mood: 'any',
  protagonist: 'any',
  setting: 'any',
  type: 'any',
  status: 'any',
  popularity: 'balanced',
};

export const QUIZ_ERA_OPTIONS = [
  {
    value: 'retro',
    label: 'Retro roots',
    hint: 'Pre-2000 classics, foundational hits, and older cult favorites.',
  },
  {
    value: 'millennium',
    label: '2000s surge',
    hint: '2000 to 2009 staples from the early streaming era.',
  },
  {
    value: 'modern',
    label: '2010s wave',
    hint: '2010 to 2019 crowd favorites and critical standouts.',
  },
  {
    value: 'current',
    label: 'Fresh 2020s',
    hint: '2020 onward with newer releases and current production styles.',
  },
];

export const QUIZ_LENGTH_OPTIONS = [
  {
    value: 'any',
    label: 'Open to anything',
    hint: 'No episode-count filtering.',
  },
  {
    value: 'short',
    label: 'Short sprint',
    hint: 'About 1 to 12 episodes.',
  },
  {
    value: 'medium',
    label: 'One-season sweet spot',
    hint: 'About 13 to 26 episodes.',
  },
  {
    value: 'long',
    label: 'Long-form commitment',
    hint: '27 episodes or more.',
  },
];

export const QUIZ_MOOD_OPTIONS = [
  {
    value: 'any',
    label: 'Any mood',
    hint: 'Let score and your other picks lead the result.',
  },
  {
    value: 'adrenaline',
    label: 'High energy',
    hint: 'Action-heavy, hyped, and momentum-driven.',
  },
  {
    value: 'comfort',
    label: 'Comfort watch',
    hint: 'Soft, cozy, funny, or easy to settle into.',
  },
  {
    value: 'emotional',
    label: 'Emotional pull',
    hint: 'Character drama, romance, and cathartic stories.',
  },
  {
    value: 'dark',
    label: 'Dark edge',
    hint: 'Suspense, danger, and heavier themes.',
  },
  {
    value: 'brainy',
    label: 'Mind games',
    hint: 'Mystery, strategy, and puzzle-box tension.',
  },
  {
    value: 'romantic',
    label: 'Romance forward',
    hint: 'Relationship-centered chemistry and payoff.',
  },
];

export const QUIZ_PROTAGONIST_OPTIONS = [
  {
    value: 'any',
    label: 'No strong preference',
    hint: 'Keep the lead archetype flexible.',
  },
  {
    value: 'loner',
    label: 'Lone wolf',
    hint: 'Reserved, isolated, or outsider-type leads.',
  },
  {
    value: 'ambitious',
    label: 'Ambitious climber',
    hint: 'Driven leads chasing mastery, status, or victory.',
  },
  {
    value: 'chaotic',
    label: 'Chaotic wildcard',
    hint: 'Unpredictable, messy, or mischievous energy.',
  },
  {
    value: 'protector',
    label: 'Warm protector',
    hint: 'Supportive leads who carry others with them.',
  },
  {
    value: 'strategist',
    label: 'Sharp strategist',
    hint: 'Calculated leads who win with planning and intellect.',
  },
  {
    value: 'ensemble',
    label: 'Ensemble chemistry',
    hint: 'Shared spotlight and group dynamics over one dominant lead.',
  },
];

export const QUIZ_SETTING_OPTIONS = [
  {
    value: 'any',
    label: 'Any setting',
    hint: 'Worldbuilding is flexible.',
  },
  {
    value: 'fantasy',
    label: 'Fantasy worlds',
    hint: 'Magic, myths, supernatural rules, or isekai energy.',
  },
  {
    value: 'modern',
    label: 'Modern-day',
    hint: 'Grounded or urban settings closer to real life.',
  },
  {
    value: 'scifi',
    label: 'Sci-fi future',
    hint: 'Technology, space, mecha, or speculative systems.',
  },
  {
    value: 'historical',
    label: 'Historical flavor',
    hint: 'Past eras, war stories, or period drama atmosphere.',
  },
  {
    value: 'school',
    label: 'School-life focus',
    hint: 'Campus stories, clubs, youth drama, and coming-of-age beats.',
  },
];

export const QUIZ_TYPE_OPTIONS = [
  {
    value: 'any',
    label: 'Any format',
    hint: 'Series, movies, and side formats are all fair game.',
  },
  {
    value: 'tv',
    label: 'TV series',
    hint: 'Traditional episodic shows.',
  },
  {
    value: 'movie',
    label: 'Movie',
    hint: 'Single-film experiences.',
  },
  {
    value: 'ova',
    label: 'OVA',
    hint: 'Original video animation releases.',
  },
  {
    value: 'ona',
    label: 'ONA',
    hint: 'Original net animation releases.',
  },
];

export const QUIZ_STATUS_OPTIONS = [
  {
    value: 'any',
    label: 'Any release status',
    hint: 'Completed, airing, and upcoming can all appear.',
  },
  {
    value: 'complete',
    label: 'Completed only',
    hint: 'Finished shows you can start right away.',
  },
  {
    value: 'airing',
    label: 'Currently airing',
    hint: 'Shows still releasing now.',
  },
  {
    value: 'upcoming',
    label: 'Upcoming only',
    hint: 'Not out yet but worth watching.',
  },
];

export const QUIZ_POPULARITY_OPTIONS = [
  {
    value: 'balanced',
    label: 'Balanced mix',
    hint: 'Blend stronger scores with reasonable visibility.',
  },
  {
    value: 'mainstream',
    label: 'Big mainstream hits',
    hint: 'Favor proven crowd-pleasers and recognizable titles.',
  },
  {
    value: 'hidden',
    label: 'More hidden gems',
    hint: 'Push less obvious picks upward when they match.',
  },
];

export const QUIZ_ERA_FILTERS = {
  retro: {
    params: {
      end_date: '1999-12-31',
    },
  },
  millennium: {
    params: {
      start_date: '2000-01-01',
      end_date: '2009-12-31',
    },
  },
  modern: {
    params: {
      start_date: '2010-01-01',
      end_date: '2019-12-31',
    },
  },
  current: {
    params: {
      start_date: '2020-01-01',
      end_date: '2026-12-31',
    },
  },
};

export const QUIZ_LENGTH_FILTERS = {
  short: {
    params: {
      max_episodes: 12,
    },
  },
  medium: {
    params: {
      min_episodes: 13,
      max_episodes: 26,
    },
  },
  long: {
    params: {
      min_episodes: 27,
    },
  },
};

export const QUIZ_MOOD_TAGS = {
  adrenaline: [
    'Action',
    'Adventure',
    'Martial Arts',
    'Military',
    'Mecha',
    'Sci-Fi',
    'Sports',
    'Super Power',
  ],
  comfort: [
    'Comedy',
    'Family',
    'Gourmet',
    'Iyashikei',
    'School',
    'Slice of Life',
  ],
  emotional: [
    'Drama',
    'Josei',
    'Music',
    'Romance',
    'Shoujo',
    'Workplace',
  ],
  dark: [
    'Horror',
    'Psychological',
    'Seinen',
    'Suspense',
    'Thriller',
  ],
  brainy: [
    'Detective',
    'Military',
    'Mystery',
    'Psychological',
    'Sci-Fi',
    'Seinen',
  ],
  romantic: [
    'Drama',
    'Josei',
    'Romance',
    'School',
    'Shoujo',
    'Slice of Life',
  ],
};

export const QUIZ_PROTAGONIST_TAGS = {
  loner: [
    'Mystery',
    'Psychological',
    'Seinen',
    'Supernatural',
    'Suspense',
  ],
  ambitious: [
    'Action',
    'Adventure',
    'Martial Arts',
    'Military',
    'Shounen',
    'Sports',
  ],
  chaotic: [
    'Action',
    'Adventure',
    'Comedy',
    'Fantasy',
    'Parody',
  ],
  protector: [
    'Adventure',
    'Family',
    'Fantasy',
    'Shoujo',
    'Slice of Life',
  ],
  strategist: [
    'Detective',
    'Military',
    'Mystery',
    'Psychological',
    'Sci-Fi',
    'Seinen',
  ],
  ensemble: [
    'Comedy',
    'Drama',
    'Music',
    'School',
    'Slice of Life',
  ],
};

export const QUIZ_SETTING_TAGS = {
  fantasy: [
    'Adventure',
    'Fantasy',
    'Isekai',
    'Mythology',
    'Supernatural',
  ],
  modern: [
    'Adult Cast',
    'Detective',
    'Romance',
    'Urban Fantasy',
    'Workplace',
  ],
  scifi: [
    'Cyberpunk',
    'Mecha',
    'Sci-Fi',
    'Space',
    'Strategy Game',
  ],
  historical: [
    'Historical',
    'Military',
    'Mythology',
    'Samurai',
  ],
  school: [
    'Comedy',
    'Romance',
    'School',
    'Shoujo',
    'Shounen',
  ],
};
