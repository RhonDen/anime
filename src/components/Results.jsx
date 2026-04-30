// Results component - Display 5 anime recommendations with images
function Results({ recommendations, onBack }) {
  // Helper to get display title (English or Japanese)
  const getDisplayTitle = (anime) => {
    return anime.title_english || anime.title || 'Unknown Title';
  };

  // Helper to get image URL
  const getImageUrl = (anime) => {
    return anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url || '';
  };

  const truncate = (text, maxLength) => {
    if (!text) return 'No synopsis available.';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
                <img 
                  src={getImageUrl(anime)} 
                  alt={getDisplayTitle(anime)}
                  width="150"
                />
                <h2>{getDisplayTitle(anime)}</h2>
                {anime.title_english && anime.title !== anime.title_english && (
                  <p>Japanese Title: {anime.title}</p>
                )}
                <p>Score: {anime.score || 'N/A'} | Episodes: {anime.episodes || 'Unknown'}</p>
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
