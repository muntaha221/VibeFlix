import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Star, Clock, Calendar, Bookmark, Play, ArrowLeft, Check, X, Sparkles, ExternalLink, Users } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import './MovieDetail.css';
import { useAuth } from '../context/AuthContext';

const MovieDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const typeParam = location.state?.type;
  
  const { user, refreshUser } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [smartRecs, setSmartRecs] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [castInfo, setCastInfo] = useState([]);

  useEffect(() => {
    if (movie && user) {
      setInWatchlist(user.watchlist?.some(m => m.tmdbId === (movie.tmdbId || movie.id) || m._id === movie.id));
    }
  }, [movie, user]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setSmartRecs([]);
      setCastInfo([]);
      setUserRating(0); // Reset rating state on navigation
      try {
        const res = await axios.get(`/api/movies/details/${id}${typeParam ? `?type=${typeParam}` : ''}`);
        setMovie(res.data);

        // Fetch smart cast-based recommendations via our backend only
        const mediaType = res.data.media_type || 'movie';
        setRecsLoading(true);
        try {
          const recsRes = await axios.get(`/api/movies/smart-recommendations/${id}?type=${mediaType}`);
          setSmartRecs(Array.isArray(recsRes.data) ? recsRes.data : []);
          // Use genres cast from movie details if available
          if (res.data.credits?.cast) {
            setCastInfo((res.data.credits.cast || []).slice(0, 5));
          }
        } catch (e) {
          console.error('Smart recs error:', e);
        } finally {
          setRecsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, typeParam]);


  const handleWatchlist = async () => {
    if (!user) return alert('Please sign in to save titles to your watchlist!');
    try {
      const targetId = movie.tmdbId || movie.id;
      if (inWatchlist) {
        const dbId = user.watchlist.find(m => m.tmdbId === targetId || m._id === targetId)?._id;
        await axios.delete(`/api/movies/watchlist/${dbId || targetId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post(
          '/api/movies/watchlist',
          {
            movie: {
              tmdbId: targetId,
              title: movie.title,
              posterPath: movie.poster_path,
              backdropPath: movie.backdrop_path,
              overview: movie.overview,
              releaseDate: movie.release_date,
              voteAverage: movie.vote_average,
              genres: movie.genres
            }
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
      refreshUser();
    } catch (err) {
      console.error('Watchlist action failed:', err);
    }
  };

  const submitRating = async (rating) => {
    setUserRating(rating);
    if (!user) return;
    try {
      await axios.post(
        '/api/movies/review',
        { movieId: movie.tmdbId || movie.id, rating, comment: 'Rated via Vibeflix UI' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      console.error('Rating failed:', err);
    }
  };

  // Find trailer key — Trailer preferred, fallback to Teaser or any video
  const trailerVideo = movie?.videos?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
    || movie?.videos?.find(v => v.site === 'YouTube' && v.type === 'Teaser')
    || movie?.videos?.find(v => v.site === 'YouTube');
  const trailerKey = trailerVideo?.key;

  // Always open embedded modal — NEVER redirect to YouTube
  const handleWatchTrailer = () => setShowTrailer(true);

  if (loading) {
    return <div className="loading-state container">🎬 Loading Cinematic Details...</div>;
  }
  if (!movie) {
    return (
      <div className="error-state container">
        <h2>Title Not Found</h2>
        <Link to="/" className="back-btn"><ArrowLeft size={18} /> Back to Gallery</Link>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200';
  const posterUrl = movie.poster_path || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500';
  const releaseYear = (movie.release_date || '2026').substring(0, 4);

  return (
    <div className="movie-detail-page reveal">
      {/* YouTube Trailer Modal */}
      {showTrailer && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close-btn" onClick={() => setShowTrailer(false)}>
              <X size={24} />
            </button>
            {trailerKey ? (
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                title={`${movie?.title || 'Movie'} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="trailer-iframe"
              />
            ) : (
              <div className="trailer-no-key">
                <div className="trailer-no-key-icon">🎬</div>
                <h3>Trailer Not Available</h3>
                <p>No official trailer is available for <strong>{movie?.title}</strong> yet.</p>
                <button className="btn btn-primary" onClick={() => setShowTrailer(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="detail-hero">
        <div className="detail-backdrop" style={{ backgroundImage: `url(${backdropUrl})` }}>
          <div className="detail-gradient"></div>
        </div>
        
        <div className="container detail-content">
          <Link to="/" className="back-btn"><ArrowLeft size={18} /> Back to Gallery</Link>
          
          <div className="detail-main">
            <div className="detail-poster-container animate-glow">
              <img src={posterUrl} alt={movie.title} className="detail-poster" />
              <div className="quality-tag">{movie.media_type === 'tv' ? 'WEB SERIES' : '4K ULTRA HD'}</div>
            </div>
            
            <div className="detail-info">
              <h1 className="detail-title">{movie.title}</h1>
              {movie.tagline && <p className="detail-tagline">"{movie.tagline}"</p>}
              
              <div className="detail-meta">
                <span className="meta-item"><Star size={17} fill="#ffc107" color="#ffc107" /> {Number(movie.vote_average || 7.5).toFixed(1)}</span>
                {movie.runtime ? <span className="meta-item"><Clock size={17} /> {movie.runtime} min</span> : null}
                <span className="meta-item"><Calendar size={17} /> {releaseYear}</span>
                <span className="meta-item-type">{movie.media_type === 'tv' ? 'TV Series' : 'Movie'}</span>
              </div>
              
              <div className="detail-genres">
                {movie.genres?.map(g => (
                  <span key={g.id || g} className="genre-pill">
                    {typeof g === 'string' ? g : g.name}
                  </span>
                ))}
              </div>
              
              <div className="detail-story">
                <h3>Storyline 📖</h3>
                <p>{movie.overview || 'No synopsis provided for this title yet.'}</p>
              </div>

              <div className="detail-actions">
                <button className="btn btn-primary" onClick={handleWatchTrailer}>
                  <Play fill="currentColor" size={18} /> Watch Trailer
                </button>
                <button
                  className="btn btn-watch-online"
                  onClick={() => window.open(`https://watch-v2.autoembed.app/search?q=${encodeURIComponent(movie.title || '')}`, '_blank')}
                >
                  <ExternalLink size={18} /> Watch / Download
                </button>
                <button 
                  className={`btn ${inWatchlist ? 'btn-success' : 'btn-outline'}`}
                  onClick={handleWatchlist}
                >
                  {inWatchlist ? <><Check size={18} /> In Watchlist</> : <><Bookmark size={18} /> Add to Watchlist</>}
                </button>
              </div>

              <div className="user-rating-section glass-panel">
                <h4>Rate this title ⭐</h4>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={26} 
                      className={userRating >= star ? 'star active' : 'star'} 
                      onClick={() => submitRating(star)}
                    />
                  ))}
                </div>
                {userRating > 0 && <p className="rating-thanks">You rated this {userRating} / 5 stars!</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Cast-Based Recommendations */}
      <div className="container similar-movies-section">
        <div className="similar-header">
          <Users size={20} color="#e50914" />
          <h2 className="section-title">More From The Same Cast &amp; Director</h2>
        </div>

        {/* Cast badges */}
        {castInfo.length > 0 && (
          <div className="cast-badges">
            {castInfo.map(actor => (
              <div key={actor.id} className="cast-badge">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                    alt={actor.name}
                    className="cast-badge-avatar"
                  />
                ) : (
                  <div className="cast-badge-avatar cast-badge-placeholder">👤</div>
                )}
                <span className="cast-badge-name">{actor.name}</span>
              </div>
            ))}
          </div>
        )}

        {recsLoading ? (
          <div className="recs-loading">
            <span className="spinner-recs" />
            <span>Finding movies from the same cast...</span>
          </div>
        ) : smartRecs.length > 0 ? (
          <div className="movie-grid">
            {smartRecs.map((m, idx) => (
              <MovieCard key={m.tmdbId || m.id || idx} movie={m} />
            ))}
          </div>
        ) : (
          // Fallback to TMDB similar
          movie.similar && movie.similar.length > 0 && (
            <div className="movie-grid">
              {movie.similar.slice(0, 10).map((m, idx) => (
                <MovieCard key={m.tmdbId || m.id || idx} movie={m} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
