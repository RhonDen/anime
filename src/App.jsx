import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import './App.css';

const PAGES = {
  LANDING: 'landing',
  HOME: 'home',
  QUIZ: 'quiz',
};

const THEME_KEY = 'anime4u-theme';
const LIVE_REFRESH_MS = 120000;

const PAGE_HASHES = {
  [PAGES.LANDING]: '#/',
  [PAGES.HOME]: '#/browse',
  [PAGES.QUIZ]: '#/quiz',
};

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function getPageFromHash(hashValue) {
  const normalizedHash = (hashValue || '#/').toLowerCase();

  if (normalizedHash === '#/browse') {
    return PAGES.HOME;
  }

  if (normalizedHash === '#/quiz') {
    return PAGES.QUIZ;
  }

  return PAGES.LANDING;
}

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === 'undefined') {
      return PAGES.LANDING;
    }

    return getPageFromHash(window.location.hash);
  });
  const [theme, setTheme] = useState(getInitialTheme);
  const [liveRefreshTick, setLiveRefreshTick] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncPageFromHash = () => {
      setCurrentPage(getPageFromHash(window.location.hash));
    };

    syncPageFromHash();
    window.addEventListener('hashchange', syncPageFromHash);

    return () => {
      window.removeEventListener('hashchange', syncPageFromHash);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const triggerLiveRefresh = () => {
      if (document.hidden) {
        return;
      }

      setLiveRefreshTick((currentTick) => currentTick + 1);
    };

    const intervalId = window.setInterval(triggerLiveRefresh, LIVE_REFRESH_MS);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        triggerLiveRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const navigateTo = (page) => {
    if (typeof window === 'undefined') {
      setCurrentPage(page);
      return;
    }

    const nextHash = PAGE_HASHES[page] || PAGE_HASHES[PAGES.LANDING];

    if (window.location.hash === nextHash) {
      setCurrentPage(page);
      return;
    }

    window.location.hash = nextHash;
  };

  return (
    <div className="app-shell">
      {currentPage === PAGES.LANDING && (
        <LandingPage
          onStart={() => navigateTo(PAGES.HOME)}
          onOpenQuiz={() => navigateTo(PAGES.QUIZ)}
          theme={theme}
          onToggleTheme={() => {
            setTheme((currentTheme) => {
              return currentTheme === 'dark' ? 'light' : 'dark';
            });
          }}
        />
      )}
      {currentPage === PAGES.HOME && (
        <HomePage
          theme={theme}
          liveRefreshMs={LIVE_REFRESH_MS}
          liveRefreshTick={liveRefreshTick}
          onNavigateToQuiz={() => navigateTo(PAGES.QUIZ)}
          onToggleTheme={() => {
            setTheme((currentTheme) => {
              return currentTheme === 'dark' ? 'light' : 'dark';
            });
          }}
        />
      )}
      {currentPage === PAGES.QUIZ && (
        <QuizPage
          theme={theme}
          liveRefreshMs={LIVE_REFRESH_MS}
          liveRefreshTick={liveRefreshTick}
          onNavigateHome={() => navigateTo(PAGES.HOME)}
          onToggleTheme={() => {
            setTheme((currentTheme) => {
              return currentTheme === 'dark' ? 'light' : 'dark';
            });
          }}
        />
      )}
    </div>
  );
}

export default App;
