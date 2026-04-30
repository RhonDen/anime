// Quiz component - 10 question quiz to get anime recommendations
import { useState } from 'react';
import { fetchAnimeByQuizFilters, fetchTopAnime, getRecommendations } from '../services/animeApi';

const quizQuestions = [
  {
    number: 1,
    question: "What genre do you prefer most?",
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
    ]
  },
  {
    number: 2,
    question: "What is your preferred anime length?",
    options: [
      { label: "Short (1-12 eps)", value: "short" },
      { label: "Medium (13-26 eps)", value: "medium" },
      { label: "Long (27+ eps)", value: "long" }
    ]
  },
  {
    number: 3,
    question: "Which era do you prefer?",
    options: [
      { label: "Classic (pre-2000)", value: "classic" },
      { label: "Old School (2000-2010)", value: "old-school" },
      { label: "Modern (2011-2020)", value: "modern" },
      { label: "Recent (2021+)", value: "recent" }
    ]
  },
  {
    number: 4,
    question: "What kind of protagonist do you like?",
    options: [
      { label: "Male lead", value: "male" },
      { label: "Female lead", value: "female" },
      { label: "No preference", value: "any" }
    ]
  },
  {
    number: 5,
    question: "How much action do you want?",
    options: [
      { label: "Lots of action", value: "high" },
      { label: "Some action", value: "medium" },
      { label: "Mostly dialogue/character-driven", value: "low" }
    ]
  },
  {
    number: 6,
    question: "What is the ideal anime rating (score)?",
    options: [
      { label: "High (8+)", value: "8" },
      { label: "Medium (7-8)", value: "7" },
      { label: "Any (no filter)", value: "0" }
    ]
  },
  {
    number: 7,
    question: "Do you want mature themes or family-friendly?",
    options: [
      { label: "Mature (seinen/josei)", value: "r" },
      { label: "All ages (shonen/shojo)", value: "pg13" },
      { label: "No preference", value: "any" }
    ]
  },
  {
    number: 8,
    question: "Sub vs Dub?",
    options: [
      { label: "Sub only", value: "sub" },
      { label: "Dub only", value: "dub" },
      { label: "No preference", value: "any" }
    ]
  },
  {
    number: 9,
    question: "What kind of art style?",
    options: [
      { label: "Modern (2015+)", value: "modern" },
      { label: "Retro (pre-2010)", value: "retro" },
      { label: "Classic (pre-2000)", value: "classic" }
    ]
  },
  {
    number: 10,
    question: "Do you prefer popular series or hidden gems?",
    options: [
      { label: "Very popular (top 100)", value: "top100" },
      { label: "Popular (top 1000)", value: "top1000" },
      { label: "Hidden gems (less known)", value: "gems" }
    ]
  }
];

function Quiz({ onResults, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
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

  const buildFilters = () => {
    const filters = {};
    
    // Question 1: Genre
    if (answers[0]) {
      filters.genreId = answers[0];
    }
    
    // Question 2: Anime length (filter client-side)
    const lengthPref = answers[1];
    
    // Question 3: Era
    const era = answers[2];
    if (era === 'classic') {
      filters.startDate = '1980-01-01';
      filters.endDate = '1999-12-31';
    } else if (era === 'old-school') {
      filters.startDate = '2000-01-01';
      filters.endDate = '2010-12-31';
    } else if (era === 'modern') {
      filters.startDate = '2011-01-01';
      filters.endDate = '2020-12-31';
    } else if (era === 'recent') {
      filters.startDate = '2021-01-01';
    }
    
    // Question 4: Protagonist (add as keyword)
    if (answers[3] && answers[3] !== 'any') {
      filters.keyword = answers[3] + ' protagonist';
    }
    
    // Question 6: Score
    if (answers[5] && answers[5] !== '0') {
      filters.minScore = answers[5];
    }
    
    // Question 7: Rating
    if (answers[6] && answers[6] !== 'any') {
      filters.rating = answers[6];
    }
    
    // Question 9: Art style (similar to era)
    const artStyle = answers[8];
    if (artStyle === 'modern' && !filters.startDate) {
      filters.startDate = '2015-01-01';
    } else if (artStyle === 'retro' && !filters.startDate) {
      filters.startDate = '1990-01-01';
      filters.endDate = '2009-12-31';
    } else if (artStyle === 'classic' && !filters.startDate) {
      filters.endDate = '1999-12-31';
    }
    
    // Question 10: Popularity
    const popularity = answers[9];
    if (popularity === 'top100') {
      filters.orderBy = 'popularity';
      filters.offset = 0;
    } else if (popularity === 'top1000') {
      filters.orderBy = 'popularity';
      filters.offset = 100;
    } else if (popularity === 'gems') {
      filters.orderBy = 'score';
      filters.offset = 500;
    }
    
    return { filters, lengthPref };
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

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { filters, lengthPref } = buildFilters();
      
      let animeList = [];
      
      // Try to fetch with filters
      if (Object.keys(filters).length > 0) {
        try {
          animeList = await fetchAnimeByQuizFilters(filters);
} catch {
          // Fallback to top anime if filter fails
          animeList = await fetchTopAnime();
        }
      } else {
        // No filters, get top anime
        animeList = await fetchTopAnime();
      }
      
      // Filter by length if specified
      animeList = filterByLength(animeList, lengthPref);
      
      const recommendations = getRecommendations(animeList);
      onResults(recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const question = quizQuestions[currentQuestion];
  const allAnswered = Object.keys(answers).length === quizQuestions.length;

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Quiz</h1>
      
      {error && (
        <div>
          <p>Failed to load. Please try again.</p>
          <button onClick={handleGetRecommendations}>Retry</button>
        </div>
      )}
      
      {!error && (
        <>
          <div>
            <p>Question {question.number} of {quizQuestions.length}</p>
            <p>{question.question}</p>
          </div>
          
          <div>
            {question.options.map((option, index) => (
              <div key={index}>
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
                disabled={!allAnswered}
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
