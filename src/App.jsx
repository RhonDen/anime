import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import './App.css';

const PAGES = {
  LANDING: 'landing',
  HOME: 'home',
};

const THEME_KEY = 'anime4u-theme';

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

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="app-shell">
      {currentPage === PAGES.LANDING && (
        <LandingPage
          onStart={() => setCurrentPage(PAGES.HOME)}
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
