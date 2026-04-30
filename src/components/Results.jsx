// Results component - Display 5 anime recommendations
function Results({ recommendations, onBack }) {
  const truncate = (text, maxLength) => {
    if (!text) return 'No synopsis available.';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getImageUrl = (anime) => {
    return anime.images?.jpg?.image_url || anime.images?.jpg?.small_image_url || '';
  };

const getScore = (anime) => {
    return anime.score || anime.mal_score || 'N/A';
  };

  const getEpisodes = (anime) => {
    return anime.episodes || 'Unknown';
  };

  return (
    <div>
      <h1>Your Anime Recommendations</h1>
      
      {recommendations.length === 0 ? (
        <div>
          <p>No recommendations found. Try a different search.</p>
          <button onClick={onBack}>Back to Home</button>
        </div>
      ) : (
        <>
          <div>
            {recommendations.map((anime) => (
              <div key={anime.mal_id}>
                <div>
                  <img 
                    src={getImageUrl(anime)} 
                    alt={anime.title} 
                    width="150"
                  />
                </div>
                <h2>{anime.title}</h2>
                <p>Score: {getScore(anime)}</p>
                <p>Episodes: {getEpisodes(anime)}</p>
                <p>{truncate(anime.synopsis, 150)}</p>
              </div>
            ))}
          </div>
          
          <div>
            <button onClick={onBack}>Back to Home</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Results;
