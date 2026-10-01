import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bookmark, Star, UserCircle, Settings } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('watchlist');
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && activeTab === 'ratings') {
      const fetchRatings = async () => {
        setLoadingRatings(true);
        try {
          const res = await axios.get('/api/movies/user-reviews', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setRatings(res.data);
        } catch (err) {
          console.error("Error fetching ratings", err);
        } finally {
          setLoadingRatings(false);
        }
      };
      fetchRatings();
    }
  }, [user, activeTab]);

  if (!user) return <div className="profile-loading">Loading your dashboard...</div>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-page animate-fade-in">
      {/* Premium Header */}
      <div className="profile-hero glass-panel">
        <div className="container profile-hero-content">
          <div className="profile-user-info">
            <div className="profile-avatar">
              <UserCircle size={80} color="var(--accent-color)" />
            </div>
            <div className="profile-details">
              <h1 className="profile-name">{user.username}</h1>
              <p className="profile-email">VibeFlix Premium Member</p>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-outline profile-btn">
              <Settings size={18} /> Settings
            </button>
            <button onClick={handleLogout} className="btn profile-logout-btn">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="container">
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            <Bookmark size={18} /> My Saved List
          </button>
          <button 
            className={`profile-tab ${activeTab === 'ratings' ? 'active' : ''}`}
            onClick={() => setActiveTab('ratings')}
          >
            <Star size={18} /> My Ratings
          </button>
        </div>

        {/* Tab Content: Watchlist */}
        {activeTab === 'watchlist' && (
          <div className="profile-content-section animate-fade-in">
            <div className="section-header">
              <h2 className="section-title">Saved Movies & Series</h2>
              <span className="count-badge">{user.watchlist?.length || 0} items</span>
            </div>
            
            {user.watchlist && user.watchlist.length > 0 ? (
              <div className="movie-grid">
                {user.watchlist.map(movie => (
                  <MovieCard key={movie.tmdbId || movie._id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="empty-state glass-panel">
                <Bookmark size={40} className="empty-icon" />
                <h3>Your watchlist is empty</h3>
                <p>Browse the gallery and click "Add to Watchlist" to save your favorite titles here.</p>
                <button onClick={() => navigate('/')} className="btn btn-primary mt-3">Discover Now</button>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Ratings */}
        {activeTab === 'ratings' && (
          <div className="profile-content-section animate-fade-in">
            <div className="section-header">
              <h2 className="section-title">Titles You've Rated</h2>
            </div>
            
            {loadingRatings ? (
              <div className="profile-loading"><span className="spinner-small" /> Loading your ratings...</div>
            ) : ratings.length > 0 ? (
              <div className="ratings-list">
                {ratings.map(rating => (
                  <div key={rating._id} className="rating-item glass-panel">
                    <div className="rating-movie-info">
                      <Star size={20} fill="#ffc107" color="#ffc107" />
                      <span className="rating-score">{rating.rating} / 5</span>
                    </div>
                    <div className="rating-details">
                      <p>You rated Title ID: <strong>{rating.movie}</strong></p>
                      <button onClick={() => navigate(`/movie/${rating.movie}`)} className="btn btn-outline btn-sm">View Title</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state glass-panel">
                <Star size={40} className="empty-icon" />
                <h3>No ratings yet</h3>
                <p>Rate movies and TV shows to keep track of what you loved.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
