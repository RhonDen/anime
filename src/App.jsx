// Main App component with page routing
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import SearchLibraries from './components/SearchLibraries';
import Quiz from './components/Quiz';
import Results from './components/Results';
import './App.css';

// Page types
const PAGES = {
  LANDING: 'landing',
  HOME: 'home',
  SEARCH_LIBRARIES: 'searchLibraries',
  QUIZ: 'quiz',
  RESULTS: 'results'
};

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);
  const [recommendations, setRecommendations] = useState([]);

  const goToHome = () => {
    setCurrentPage(PAGES.HOME);
  };

  const goToSearchLibraries = () => {
    setCurrentPage(PAGES.SEARCH_LIBRARIES);
  };

  const goToQuiz = () => {
    setCurrentPage(PAGES.QUIZ);
  };

  const handleResults = (results) => {
    setRecommendations(results);
    setCurrentPage(PAGES.RESULTS);
  };

  const handleBack = () => {
    setRecommendations([]);
    setCurrentPage(PAGES.HOME);
  };

  return (
    <div>
      {currentPage === PAGES.LANDING && (
        <LandingPage onStart={goToHome} />
      )}

      {currentPage === PAGES.HOME && (
        <HomePage 
          onSearchLibraries={goToSearchLibraries} 
          onQuiz={goToQuiz} 
        />
      )}

      {currentPage === PAGES.SEARCH_LIBRARIES && (
        <SearchLibraries 
          onResults={handleResults} 
          onBack={handleBack} 
        />
      )}

      {currentPage === PAGES.QUIZ && (
        <Quiz 
          onResults={handleResults} 
          onBack={handleBack} 
        />
      )}

      {currentPage === PAGES.RESULTS && (
        <Results 
          recommendations={recommendations} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
}

export default App;
