import ThemeToggle from './ThemeToggle';

function LandingPage({ onOpenQuiz, onStart, theme, onToggleTheme }) {
  return (
    <main className="landing">
      <header className="topbar">
        <span className="brand-mark">Anime4U</span>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <section className="landing__hero">
        <div className="landing__copy">
          <p className="section-kicker">Your Netflix-style anime recommender</p>
          <h1>Anime discovery with full browse rows, sharper filters, and a cleaner quiz flow.</h1>
          <p className="landing__lead">
            Browse full 100-title rows with arrow controls, search by genre and year,
            then open a dedicated recommendation quiz page when you want something
            more tailored than a quick filter pass.
          </p>
          <div className="landing__actions">
            <button type="button" className="button" onClick={onStart}>
              Start Browsing
            </button>
            <button type="button" className="button button--ghost" onClick={onOpenQuiz}>
              Open Quiz Page
            </button>
          </div>
        </div>

        <div className="landing__panel">
          <div className="landing__feature">
            <strong>Page through real rows</strong>
            <p>Browse beyond the first screen with arrow-driven row navigation instead of static grids.</p>
          </div>
          <div className="landing__feature">
            <strong>Dedicated quiz page</strong>
            <p>Use multi-select genres, multiple eras, and character-type questions in a cleaner flow.</p>
          </div>
          <div className="landing__feature">
            <strong>Search with live refresh</strong>
            <p>Active search results and browse rows can resync while the site stays open.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
