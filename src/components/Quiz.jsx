// Quiz component - Quiz with multiple genre selections
import { useState } from 'react';
import { fetchTopAnime, fetchAnimeByGenre, getRecommendations } from '../services/animeApi';

// Quiz questions - first question allows multiple selections
const quizQuestions = [
  {
    number: 1,
    question: "What genres do you prefer? (Select all that apply)",
    options: [
      { label: "Action", value: "1" },
      { label: "Adventure", value: "2" },
      { label: "Comedy", value: "4" },
      { label: "Drama", value: "8" },
      { label: "Fantasy", value: "10" },
      { label: "Horror", value: "14" },
      { label: "Romance", value: "22" },
      { label: "Sci-Fi", value: "24" },
      { label: "Slice of Life", value: "36" },
      { label: "Sports", value: "30" }
    ],
    multiple: true
  },
  {
    number: 2,
    question: "What is your preferred anime length?",
    options: [
      { label: "Short (1-12 eps)", value: "short" },
      { label: "Medium (13-26 eps)", value: "medium" },
      { label: "Long (27+ eps)", value: "long" },
      { label: "No preference", value: "any" }
    ]
  },
  {
    number: 3,
    question: "What kind of protagonist do you like?",
    options: [
      { label: "Male lead", value: "male" },
      { label: "Female lead", value: "female" },
      { label: "No preference", value: "any" }
    ]
  },
  {
    number: 4,
    question: "How much action do you want?",
    options: [
      { label: "Lots of action", value: "action" },
      { label: "Some action", value: "some" },
      { label: "Mostly dialogue/character-driven", value: "drama" },
      { label: "No preference", value: "any" }
    ]
  },
  {
    number: 5,
    question: "What is the ideal anime rating (score)?",
    options: [
      { label: "High (8+)", value: "8" },
      { label: "Medium (7-8)", value: "7" },
      { label: "Any (no filter)", value: "0" }
    ]
  },
  {
    number: 6,
    question: "Do you want mature themes or family-friendly?",
    options: [
      { label: "Mature (seinen/josei)", value: "r" },
      { label: "All ages (shonen/shojo)", value: "pg13" },
      { label: "No preference", value: "any" }
    ]
  },
  {
    number: 7,
    question: "Sub vs Dub?",
    options: [
      { label: "Sub only", value: "sub" },
      { label: "Dub only", value: "dub" },
      { label: "No preference", value: "any" }
    ]
  },
  {
    number: 8,
    question: "Do you prefer popular series or hidden gems?",
    options: [
      { label: "Very popular", value: "popular" },
      { label: "Hidden gems", value: "gems" },
      { label: "No preference", value: "any" }
    ]
  }
];

function Quiz({ onResults, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Handle single selection
  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });
  };

  // Handle multiple selection (for question 1)
  const handleMultipleAnswer = (value) => {
    const current = answers[0] || [];
    const newSelection = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setAnswers({
      ...answers,
      [0]: newSelection
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const filterByLength = (animeList, lengthPref) => {
    if (!lengthPref || lengthPref === 'any') return animeList;
    
    return animeList.filter(anime => {
      const eps = anime.episodes || 0;
      if (lengthPref === 'short') return eps >= 1 && eps <= 12;
      if (lengthPref === 'medium') return eps >= 13 && eps <= 26;
      if (lengthPref === 'long') return eps >= 27;
      return true;
    });
  };

  // Helper to get fallback
  const getFallback = async () => {
    setLoadingMessage('Loading popular anime...');
    try {
      const list = await fetchTopAnime(50);
      if (list && list.length > 0) {
        return getRecommendations(list, 10);
      }
      return [];
    } catch {
      return [];
    }
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    setLoadingMessage('Finding your anime recommendations...');
    
    try {
      let animeList = [];
      
      // Get answers
      const genreIds = answers[0] || [];
      const lengthPref = answers[1];
      const minScore = answers[4];
      
      console.log('Genre IDs selected:', genreIds);
      console.log('Length preference:', lengthPref);
      console.log('Min score:', minScore);
      
      // Build search based on preferences
      if (genreIds.length > 0) {
        // Multiple genres selected - fetch by first genre
        setLoadingMessage(`Loading ${quizQuestions[0].options.find(o => o.value === genreIds[0])?.label || 'anime'}...`);
        console.log('Fetching by genre:', genreIds[0]);
        animeList = await fetchAnimeByGenre(parseInt(genreIds[0]), 50);
        
        // Also fetch from additional genres and combine
        for (let i = 1; i < Math.min(genreIds.length, 3); i++) {
          try {
            setLoadingMessage(`Loading more ${quizQuestions[0].options.find(o => o.value === genreIds[i])?.label || 'anime'}...`);
            console.log('Fetching additional genre:', genreIds[i]);
            const more = await fetchAnimeByGenre(parseInt(genreIds[i]), 30);
            animeList = [...animeList, ...more];
          } catch (e) {
            console.log('Failed to fetch genre:', genreIds[i], e);
          }
        }
      } else {
        // Default to top anime
        setLoadingMessage('Loading popular anime...');
        console.log('Fetching top anime...');
        animeList = await fetchTopAnime(50);
      }
      
      console.log('Got results:', animeList?.length);
      
      // Check for valid results
      if (!animeList || !Array.isArray(animeList) || animeList.length === 0) {
        console.log('No results, trying fallback...');
        setLoadingMessage('Trying fallback...');
        animeList = await fetchTopAnime(50);
      }
      
      // Filter by length
      if (lengthPref && lengthPref !== 'any') {
        animeList = filterByLength(animeList, lengthPref);
      }
      
      // Filter by score if specified
      if (minScore && minScore !== '0') {
        const scoreVal = parseInt(minScore);
        animeList = animeList.filter(anime => anime.score && anime.score >= scoreVal);
      }
      
      // Get recommendations
      const recommendations = getRecommendations(animeList, 10);
      
      console.log('Recommendations:', recommendations?.length);
      
      if (recommendations && recommendations.length > 0) {
        onResults(recommendations);
      } else {
        setLoadingMessage('Trying fallback...');
        const fallback = await getFallback();
        if (fallback.length > 0) {
          onResults(fallback);
        } else {
          setError('No recommendations found. Please try again.');
        }
      }
    } catch (err) {
      console.error('Quiz error:', err);
      setLoadingMessage('Trying fallback...');
      const fallback = await getFallback();
      if (fallback.length > 0) {
        onResults(fallback);
      } else {
        setError('Failed to load. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const question = quizQuestions[currentQuestion];
  const someAnswered = Object.keys(answers).length >= 1;

  if (loading) {
    return (
      <div>
        <h1>Quiz</h1>
        <p>{loadingMessage || 'Loading...'}</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Quiz</h1>
      
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={handleGetRecommendations}>Retry</button>
        </div>
      )}
      
{!error && (
        <>
          <div>
            <p>{question.question}</p>
          </div>
          
          <div>
            {question.options.map((option, index) => (
              <div key={index}>
                {question.multiple ? (
                  <label>
                    <input
                      type="checkbox"
                      checked={(answers[0] || []).includes(option.value)}
                      onChange={() => handleMultipleAnswer(option.value)}
                    />
                    {option.label}
                  </label>
                ) : (
                  <label>
                    <input
                      type="radio"
                      name={`q${question.number}`}
                      value={option.value}
                      checked={answers[currentQuestion] === option.value}
                      onChange={() => handleAnswer(option.value)}
                    />
                    {option.label}
                  </label>
                )}
              </div>
            ))}
          </div>
          
          <div>
            <button onClick={handlePrev} disabled={currentQuestion === 0}>
              Previous
            </button>
            
            {currentQuestion < quizQuestions.length - 1 ? (
              <button onClick={handleNext}>Next</button>
            ) : (
              <button 
                onClick={handleGetRecommendations} 
                disabled={!someAnswered}
              >
                Get Recommendations
              </button>
            )}
          </div>
        </>
      )}
      
      <div>
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

export default Quiz;
