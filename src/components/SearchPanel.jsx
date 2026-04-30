import { AUDIO_AVAILABILITY_NOTE } from '../services/animeApi';

const TYPE_OPTIONS = [
  { value: '', label: 'Any type' },
  { value: 'tv', label: 'TV' },
  { value: 'movie', label: 'Movie' },
  { value: 'ova', label: 'OVA' },
  { value: 'ona', label: 'ONA' },
  { value: 'special', label: 'Special' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'airing', label: 'Currently airing' },
  { value: 'complete', label: 'Completed' },
  { value: 'upcoming', label: 'Upcoming' },
];

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'score', label: 'Score' },
  { value: 'start_date', label: 'Release date' },
  { value: 'title', label: 'Title' },
];

function SearchPanel({
  filters,
  genres,
  genreLoading,
  isLoading,
  onChange,
  onSubmit,
  onReset,
}) {
  return (
    <section className="content-section search-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Search</p>
          <h2>Find anime by filters</h2>
        </div>
      </div>

      <form
        className="search-panel__form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="search-panel__grid">
          <label className="search-panel__field">
            <span>Title or keyword</span>
            <input
              type="text"
              value={filters.query}
              placeholder="Search Naruto, Frieren, romance..."
              onChange={(event) => onChange('query', event.target.value)}
            />
          </label>

          <label className="search-panel__field">
            <span>Genre</span>
            <select
              value={filters.genreId}
              onChange={(event) => onChange('genreId', event.target.value)}
              disabled={genreLoading}
            >
              <option value="">
                {genreLoading ? 'Loading genres...' : 'Any genre'}
              </option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </label>

          <label className="search-panel__field">
            <span>Year</span>
            <input
              type="number"
              min="1960"
              max="2035"
              value={filters.year}
              placeholder="2024"
              onChange={(event) => onChange('year', event.target.value)}
            />
          </label>

          <label className="search-panel__field">
            <span>Type</span>
            <select
              value={filters.type}
              onChange={(event) => onChange('type', event.target.value)}
            >
              {TYPE_OPTIONS.map((typeOption) => (
                <option key={typeOption.value || 'all'} value={typeOption.value}>
                  {typeOption.label}
                </option>
              ))}
            </select>
          </label>

          <label className="search-panel__field">
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(event) => onChange('status', event.target.value)}
            >
              {STATUS_OPTIONS.map((statusOption) => (
                <option
                  key={statusOption.value || 'all'}
                  value={statusOption.value}
                >
                  {statusOption.label}
                </option>
              ))}
            </select>
          </label>

          <label className="search-panel__field">
            <span>Sort by</span>
            <select
              value={filters.orderBy}
              onChange={(event) => onChange('orderBy', event.target.value)}
            >
              {SORT_OPTIONS.map((sortOption) => (
                <option key={sortOption.value} value={sortOption.value}>
                  {sortOption.label}
                </option>
              ))}
            </select>
          </label>

          <label className="search-panel__field">
            <span>Order</span>
            <select
              value={filters.sort}
              onChange={(event) => onChange('sort', event.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>

          <label className="search-panel__field">
            <span>Audio</span>
            <select disabled value="unsupported" onChange={() => undefined}>
              <option value="unsupported">Dub/sub unavailable from Jikan</option>
            </select>
          </label>
        </div>

        <p className="search-panel__hint">Audio filter note: {AUDIO_AVAILABILITY_NOTE}</p>

        <div className="search-panel__actions">
          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search Anime'}
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={onReset}
            disabled={isLoading}
          >
            Reset Filters
          </button>
        </div>
      </form>
    </section>
  );
}

export default SearchPanel;
