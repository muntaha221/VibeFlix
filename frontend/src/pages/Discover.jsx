import React, { useState } from 'react';
import AiRecommender from '../components/AiRecommender';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Calendar, Info } from 'lucide-react';
import './Discover.css';

const Discover = () => {
  const [recommendations, setRecommendations] = useState([]);

  return (
    <div className="discover-page container animate-fade-in">
      <div className="discover-header text-center">
        <div className="vibe-badge">
          <Sparkles size={16} /> <span>SMART DISCOVERY</span>
        </div>
        <h1 className="page-title">What are you in the <span className="peachy-text">mood</span> for?</h1>
        <p className="page-subtitle">Type anything — a mood, a genre, or a specific vibe. We'll find your next obsession.</p>
      </div>

      <div className="recommender-container">
        <AiRecommender onRecommendations={setRecommendations} />
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations-results animate-fade-in">
          <div className="results-header">
            <h2 className="section-title">Matches for your mood</h2>
            <span className="results-count">{recommendations.length} recommendations</span>
          </div>
          
          <div className="recommendation-compact-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="movie-card-simple has-poster">
                {rec.posterPath ? (
                  <div className="card-poster-wrapper">
                    <img src={rec.posterPath} alt={rec.title} className="card-poster-img" loading="lazy" />
                  </div>
                ) : (
                  <div className="card-poster-wrapper no-poster">
                    <span>No Poster</span>
                  </div>
                )}
                <div className="card-content-wrapper">
                  <div className="card-top">
                    <h3 className="card-title">{rec.title}</h3>
                    <div className="card-rating">
                      <Star size={14} fill="#ffc107" color="#ffc107" /> 
                      <span>{rec.voteAverage?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="card-bottom">
                    <span className="card-year">{rec.releaseYear}</span>
                    <p className="card-reason">{rec.reason}</p>
                  </div>
                  {rec.tmdbId && (
                    <Link to={`/movie/${rec.tmdbId}`} className="card-link">
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;
