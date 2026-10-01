import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const getPosterUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500&auto=format&fit=crop';
    if (path.startsWith('http')) return path;
    return `https://images.weserv.nl/?url=${encodeURIComponent(`https://image.tmdb.org/t/p/w500${path}`)}`;
  };

  const movieId = movie.tmdbId || movie.id;
  const rating = Number(movie.vote_average || movie.voteAverage || 7.5).toFixed(1);
  const releaseYear = (movie.release_date || movie.releaseDate || '2026').substring(0, 4);
  const isSeries = movie.media_type === 'tv' || !movie.release_date && !!movie.first_air_date;

  return (
    <Link to={`/movie/${movieId}`} state={{ type: movie.media_type }} className="movie-card-pro">
      <div className="pro-poster-wrapper">
        <div className="card-badge-quality">{isSeries ? 'WEB SERIES' : '4K HDR'}</div>
        <div className="card-badge-rating">
          <Star size={11} fill="#ffc107" color="#ffc107" />
          <span>{rating}</span>
        </div>
        <img 
          src={getPosterUrl(movie.poster_path || movie.posterPath)} 
          alt={movie.title || 'Movie Poster'} 
          className="pro-img" 
          loading="lazy"
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500&auto=format&fit=crop'; 
          }}
        />
        <div className="card-overlay-hover">
          <div className="play-icon-vibe">
            <Play size={20} fill="#ffffff" />
          </div>
        </div>
      </div>
      <div className="pro-details">
        <h4 className="pro-title" title={movie.title}>{movie.title}</h4>
        <div className="pro-meta-row">
          <span className="pro-date">{releaseYear}</span>
          <span className="pro-type-pill">{isSeries ? 'Series' : 'Movie'}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
