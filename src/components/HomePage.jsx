// HomePage component - Main navigation page
function HomePage({ onSearchLibraries, onQuiz }) {
  return (
    <div>
      <h1>Welcome to Anime4U</h1>
      <div>
        <button onClick={onSearchLibraries}>Search Libraries</button>
      </div>
      <div>
        <button onClick={onQuiz}>Quiz</button>
      </div>
    </div>
  );
}

export default HomePage;
