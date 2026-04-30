import ThemeToggle from './ThemeToggle';

function LandingPage({ onStart, theme, onToggleTheme }) {
  return (
    <main className="landing">
      <header className="topbar">
        <span className="brand-mark">Anime4U</span>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <section className="landing__hero">
        <div className="landing__copy">
          <p className="section-kicker">Your Netflix-style anime recommender</p>
          <h1>Anime discovery with smarter filters, quick hover info, and dark mode built in.</h1>
          <p className="landing__lead">
            Browse curated rows, search by genre and year, then click any title for
            richer anime details and streaming links.
          </p>
          <div className="landing__actions">
            <button type="button" className="button" onClick={onStart}>
              Get Started
            </button>
          </div>
        </div>

        <div className="landing__panel">
          <div className="landing__feature">
            <strong>Hover for quick info</strong>
            <p>Use the question mark on each card to preview synopsis, season, and episodes.</p>
          </div>
          <div className="landing__feature">
            <strong>Click for full anime details</strong>
            <p>Open a focused modal with production info, linked seasons, and external links.</p>
          </div>
          <div className="landing__feature">
            <strong>Search with filters</strong>
            <p>Mix title, genre, year, type, status, and sort order with Jikan-powered results.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
