function ThemeToggle({ theme, onToggle }) {
  return (
    <button type="button" className="theme-toggle" onClick={onToggle}>
      {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  );
}

export default ThemeToggle;
