// LandingPage component - First page user sees
function LandingPage({ onStart }) {
  return (
    <div>
      <h1>Anime4U</h1>
      <p>Your personal anime recommendation engine</p>
      <button onClick={onStart}>Get Started</button>
    </div>
  );
}

export default LandingPage;
