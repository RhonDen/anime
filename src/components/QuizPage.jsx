import { startTransition, useEffect, useState } from 'react';
import AnimeCard from './AnimeCard';
import AnimeDetailsModal from './AnimeDetailsModal';
import ThemeToggle from './ThemeToggle';
import {
  fetchAnimeGenres,
  fetchQuizRecommendations,
} from '../services/animeApi';
import {
  QUIZ_ERA_OPTIONS,
  QUIZ_INITIAL_ANSWERS,
  QUIZ_LENGTH_OPTIONS,
  QUIZ_MOOD_OPTIONS,
  QUIZ_POPULARITY_OPTIONS,
  QUIZ_PROTAGONIST_OPTIONS,
  QUIZ_SETTING_OPTIONS,
  QUIZ_STATUS_OPTIONS,
  QUIZ_TYPE_OPTIONS,
} from '../utils/quizPreferences';

const RECOMMENDATION_LIMIT = 8;

function formatSyncTime(timestamp) {
  if (!timestamp) {
    return 'Not yet run';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

function summarizeSelection(items, emptyLabel = 'Open to anything') {
  if (items.length === 0) {
    return emptyLabel;
  }

  if (items.length <= 3) {
    return items.join(', ');
  }

  return `${items.slice(0, 3).join(', ')} +${items.length - 3} more`;
}

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || 'Open to anything';
}

function cloneAnswers(answers) {
  return {
    ...answers,
    eras: [...answers.eras],
    genres: [...answers.genres],
  };
}

function QuizPage({
  theme,
  liveRefreshMs,
  liveRefreshTick,
  onNavigateHome,
  onToggleTheme,
}) {
  const [genreOptions, setGenreOptions] = useState([]);
  const [genreLoading, setGenreLoading] = useState(true);
  const [genreError, setGenreError] = useState('');
  const [answers, setAnswers] = useState(() => cloneAnswers(QUIZ_INITIAL_ANSWERS));
  const [currentStep, setCurrentStep] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizRefreshing, setQuizRefreshing] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [lastSubmittedAnswers, setLastSubmittedAnswers] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
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
        setGenreError('Quiz genres could not be loaded right now.');
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

  const questionSteps = [
    {
      id: 'genres',
      title: 'Which genres do you want more of?',
      description: 'Pick as many as fit your mood. Leaving it blank keeps the net wide.',
      multiple: true,
      options: genreOptions.map((genre) => ({
        value: String(genre.id),
        label: genre.name,
        hint: 'Genre signal',
      })),
    },
    {
      id: 'eras',
      title: 'Which release eras are you open to?',
      description: 'Mix classics with newer titles instead of forcing one decade.',
      multiple: true,
      options: QUIZ_ERA_OPTIONS,
    },
    {
      id: 'length',
      title: 'How much time do you want to commit?',
      description: 'Choose the episode range that fits your schedule.',
      options: QUIZ_LENGTH_OPTIONS,
    },
    {
      id: 'mood',
      title: 'What tone should lead the recommendations?',
      description: 'This steers the emotional texture of the list.',
      options: QUIZ_MOOD_OPTIONS,
    },
    {
      id: 'protagonist',
      title: 'What kind of main character energy do you want?',
      description: 'This helps the recommender lean toward a lead archetype.',
      options: QUIZ_PROTAGONIST_OPTIONS,
    },
    {
      id: 'setting',
      title: 'What kind of world should the story live in?',
      description: 'Use this when genre alone is not specific enough.',
      options: QUIZ_SETTING_OPTIONS,
    },
    {
      id: 'type',
      title: 'What format are you in the mood for?',
      description: 'Keep it broad or narrow it to series or films.',
      options: QUIZ_TYPE_OPTIONS,
    },
    {
      id: 'status',
      title: 'Do you want finished, airing, or upcoming titles?',
      description: 'Useful when you only want complete shows or new releases.',
      options: QUIZ_STATUS_OPTIONS,
    },
    {
      id: 'popularity',
      title: 'How mainstream should the final list feel?',
      description: 'This adjusts whether famous titles or quieter gems surface first.',
      options: QUIZ_POPULARITY_OPTIONS,
    },
  ];

  const activeStep = questionSteps[currentStep];
  const isLastStep = currentStep === questionSteps.length - 1;

  const executeRecommendations = async (answersSnapshot, isBackgroundRefresh) => {
    if (isBackgroundRefresh) {
      setQuizRefreshing(true);
    } else {
      setQuizLoading(true);
    }

    setQuizError('');

    try {
      const nextRecommendations = await fetchQuizRecommendations(
        answersSnapshot,
        RECOMMENDATION_LIMIT,
      );

      startTransition(() => {
        setRecommendations(nextRecommendations);
        setLastUpdatedAt(Date.now());
      });
    } catch {
      setQuizError(
        isBackgroundRefresh
          ? 'Live refresh missed once, showing your last successful quiz results.'
          : 'Failed to load quiz recommendations.',
      );
    } finally {
      if (isBackgroundRefresh) {
        setQuizRefreshing(false);
      } else {
        setQuizLoading(false);
      }
    }
  };

  useEffect(() => {
    if (liveRefreshTick === 0 || !lastSubmittedAnswers) {
      return;
    }

    const refreshTimeoutId = window.setTimeout(() => {
      void executeRecommendations(lastSubmittedAnswers, true);
    }, 0);

    return () => {
      window.clearTimeout(refreshTimeoutId);
    };
  }, [lastSubmittedAnswers, liveRefreshTick]);

  const handleMultiToggle = (field, value) => {
    setAnswers((currentAnswers) => {
      const nextValues = currentAnswers[field].includes(value)
        ? currentAnswers[field].filter((currentValue) => currentValue !== value)
        : [...currentAnswers[field], value];

      return {
        ...currentAnswers,
        [field]: nextValues,
      };
    });
  };

  const handleSingleSelect = (field, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const answersSnapshot = cloneAnswers(answers);

    setLastSubmittedAnswers(answersSnapshot);
    await executeRecommendations(answersSnapshot, false);
  };

  const handleReset = () => {
    setAnswers(cloneAnswers(QUIZ_INITIAL_ANSWERS));
    setCurrentStep(0);
    setRecommendations([]);
    setQuizError('');
    setQuizLoading(false);
    setQuizRefreshing(false);
    setLastSubmittedAnswers(null);
    setLastUpdatedAt(null);
  };

  const selectedGenreLabels = answers.genres
    .map((genreId) => {
      return genreOptions.find((genre) => String(genre.id) === genreId)?.name;
    })
    .filter(Boolean);
  const selectedEraLabels = QUIZ_ERA_OPTIONS
    .filter((option) => answers.eras.includes(option.value))
    .map((option) => option.label);

  return (
    <main className="quiz-page">
      <header className="topbar topbar--home">
        <div>
          <span className="brand-mark">Anime4U</span>
          <h1 className="page-title">Build a cleaner recommendation profile.</h1>
          <p className="page-lead">
            The quiz now lives on its own page, supports multi-select genres and eras,
            and leans on character vibe, tone, format, and release preferences instead
            of unsupported audio filters.
          </p>
        </div>

        <div className="topbar__actions">
          <button type="button" className="button button--ghost" onClick={onNavigateHome}>
            Back to Browse
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      <section className="content-section quiz-page__hero">
        <div>
          <p className="section-kicker">Quiz Lab</p>
          <h2>Guide the recommendations instead of fighting a modal.</h2>
          <p className="status-message">
            Use the step rail to jump around. Recommendations auto-refresh every{' '}
            {Math.round(liveRefreshMs / 60000)} minutes while this tab is visible so
            new API changes can surface without a full reload.
          </p>
        </div>

        <div className="quiz-page__hero-metrics">
          <div className="quiz-page__metric">
            <span>Steps</span>
            <strong>{questionSteps.length}</strong>
          </div>
          <div className="quiz-page__metric">
            <span>Genres chosen</span>
            <strong>{answers.genres.length}</strong>
          </div>
          <div className="quiz-page__metric">
            <span>Last sync</span>
            <strong>{formatSyncTime(lastUpdatedAt)}</strong>
          </div>
        </div>
      </section>

      {genreError && (
        <p className="status-message status-message--error">{genreError}</p>
      )}

      <section className="quiz-page__workspace">
        <aside className="content-section quiz-page__sidebar">
          <div className="section-heading section-heading--stacked">
            <div>
              <p className="section-kicker">Progress</p>
              <h2>Recommendation profile</h2>
            </div>
          </div>

          <div className="quiz-page__step-list">
            {questionSteps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`quiz-page__step-button${index === currentStep ? ' is-active' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <span>{index + 1}</span>
                <strong>{step.title}</strong>
              </button>
            ))}
          </div>

          <div className="quiz-page__summary">
            <div className="quiz-page__summary-card">
              <span>Genres</span>
              <strong>{summarizeSelection(selectedGenreLabels)}</strong>
            </div>
            <div className="quiz-page__summary-card">
              <span>Eras</span>
              <strong>{summarizeSelection(selectedEraLabels)}</strong>
            </div>
            <div className="quiz-page__summary-card">
              <span>Main character</span>
              <strong>{getOptionLabel(QUIZ_PROTAGONIST_OPTIONS, answers.protagonist)}</strong>
            </div>
            <div className="quiz-page__summary-card">
              <span>Tone</span>
              <strong>{getOptionLabel(QUIZ_MOOD_OPTIONS, answers.mood)}</strong>
            </div>
          </div>

          <div className="quiz-page__sidebar-actions">
            <button
              type="button"
              className="button"
              onClick={handleSubmit}
              disabled={quizLoading}
            >
              {quizLoading ? 'Building your picks...' : 'Generate Recommendations'}
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={handleReset}
              disabled={quizLoading}
            >
              Reset Quiz
            </button>
          </div>
        </aside>

        <section className="content-section quiz-page__stage">
<div className="section-heading section-heading--stacked">
            <div>
              <h2>{activeStep.title}</h2>
            </div>
            <p className="status-message">{activeStep.description}</p>
          </div>

          {activeStep.id === 'genres' && genreLoading ? (
            <p className="status-message">Loading every available genre...</p>
          ) : (
            <div
              className={`quiz-choice-grid${
                activeStep.id === 'genres' ? ' quiz-choice-grid--dense' : ''
              }`}
            >
              {activeStep.options.map((option) => {
                const isSelected = activeStep.multiple
                  ? answers[activeStep.id].includes(option.value)
                  : answers[activeStep.id] === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-choice${isSelected ? ' is-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (activeStep.multiple) {
                        handleMultiToggle(activeStep.id, option.value);
                        return;
                      }

                      handleSingleSelect(activeStep.id, option.value);
                    }}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.hint}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="quiz-page__stage-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setCurrentStep((currentValue) => Math.max(0, currentValue - 1))}
              disabled={currentStep === 0 || quizLoading}
            >
              Previous
            </button>

            {!isLastStep && (
              <button
                type="button"
                className="button"
                onClick={() => {
                  setCurrentStep((currentValue) => {
                    return Math.min(questionSteps.length - 1, currentValue + 1);
                  });
                }}
                disabled={quizLoading}
              >
                Next
              </button>
            )}

            {isLastStep && (
              <button
                type="button"
                className="button"
                onClick={handleSubmit}
                disabled={quizLoading}
              >
                {quizLoading ? 'Building your picks...' : 'Get Recommendations'}
              </button>
            )}
          </div>
        </section>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Results</p>
            <h2>Your tailored recommendations</h2>
          </div>

          <div className="section-heading__meta">
            {quizRefreshing && <span className="section-count">Refreshing live data...</span>}
            {recommendations.length > 0 && (
              <span className="section-count">{recommendations.length} matches</span>
            )}
          </div>
        </div>

        {!quizLoading && !quizError && recommendations.length === 0 && (
          <p className="status-message">
            Build your profile, then generate the list. Once results exist, this page
            will quietly refresh them using the latest API data while you stay here.
          </p>
        )}
        {quizLoading && <p className="status-message">Building recommendations...</p>}
        {!quizLoading && quizError && (
          <p className="status-message status-message--error">{quizError}</p>
        )}
        {!quizLoading && recommendations.length > 0 && (
          <>
            <p className="status-message">
              Last refreshed at {formatSyncTime(lastUpdatedAt)}.
            </p>

            <div className="anime-grid anime-grid--compact">
              {recommendations.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  layout="grid"
                  onSelect={setSelectedAnime}
                />
              ))}
            </div>
          </>
        )}
      </section>

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

export default QuizPage;
