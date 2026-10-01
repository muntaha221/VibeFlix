import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, User, LogOut, Sun, Moon, Menu, X, Compass, Home as HomeIcon, Search } from 'lucide-react';
import axios from 'axios';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Scroll detection for glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    closeSearch();
  }, [location.pathname]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) closeSearch();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Core search function (used by both debounce and Enter)
  const doSearch = useCallback(async (query) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await axios.get(`/api/movies/search?q=${encodeURIComponent(query.trim())}`);
      setSearchResults(Array.isArray(res.data) ? res.data.slice(0, 8) : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search on typing
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  // Enter = immediate search
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current);
      doSearch(searchQuery);
    }
    if (e.key === 'Escape') closeSearch();
  };

  const handleResultClick = (movie) => {
    navigate(`/movie/${movie.tmdbId || movie.id}`, { state: { type: movie.media_type } });
    closeSearch();
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const openSearch = () => {
    setSearchOpen(true);
    setMobileMenuOpen(false);
  };

  // Shared search input JSX
  const SearchInput = () => (
    <>
      <Search size={15} className="search-icon-inside" />
      <input
        ref={inputRef}
        type="text"
        className="nav-search-input"
        placeholder="Search movies, series… or press Enter"
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
      />
      {searchQuery && (
        <button className="search-close-btn" onClick={() => { setSearchQuery(''); setSearchResults([]); inputRef.current?.focus(); }}>
          <X size={14} />
        </button>
      )}

      {/* Shared Dropdown */}
      {(searchResults.length > 0 || searchLoading) && (
        <div className="search-dropdown">
          {searchLoading && (
            <div className="search-loading">
              <span className="spinner-small" /> Searching…
            </div>
          )}
          {!searchLoading && searchResults.map((movie) => (
            <button
              key={movie.tmdbId || movie.id}
              className="search-result-item"
              onClick={() => handleResultClick(movie)}
            >
              {movie.poster_path ? (
                <img src={movie.poster_path} alt={movie.title} className="search-result-poster" loading="lazy" />
              ) : (
                <div className="search-result-poster-placeholder">🎬</div>
              )}
              <div className="search-result-info">
                <span className="search-result-title">{movie.title}</span>
                <span className="search-result-meta">
                  {movie.media_type === 'tv' ? 'TV Series' : 'Movie'} · {(movie.release_date || movie.releaseDate || '').slice(0, 4)}
                </span>
              </div>
            </button>
          ))}
          {!searchLoading && searchResults.length === 0 && searchQuery.length > 1 && (
            <div className="search-no-results">No results for "{searchQuery}"</div>
          )}
        </div>
      )}
    </>
  );

  return (
    <header className={`navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
      <nav className="navbar pro-nav">
        <div className="container nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
            <div className="logo-icon">
              <Sparkles size={18} />
            </div>
            <span className="logo-text">VIBE<span className="cyan-text">FLIX</span></span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="nav-links desktop-only">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <HomeIcon size={15} /> Home
            </Link>
            <Link to="/discover" className={`nav-link ${location.pathname === '/discover' ? 'active' : ''}`}>
              <Compass size={15} /> Discover AI
            </Link>

            {/* Single Search (desktop) */}
            <div className="nav-search-wrap" ref={searchRef}>
              {searchOpen ? (
                <div className="nav-search-box">
                  <SearchInput />
                </div>
              ) : (
                <button className="nav-search-btn" onClick={openSearch} title="Search">
                  <Search size={17} />
                </button>
              )}
            </div>

            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {user ? (
              <div className="nav-user-menu">
                <Link to="/profile" className="nav-user-profile">
                  <User size={15} /> <span>{user.username}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn" title="Log Out">
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-peachy btn-sm">Join VibeFlix</Link>
            )}
          </div>

          {/* ── Mobile Actions ── */}
          <div className="mobile-nav-actions mobile-only">
            <button className="icon-btn" onClick={toggleTheme}>{theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-btn" onClick={openSearch} title="Search"><Search size={18} /></button>
            <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Single Mobile Search Bar (below nav, full width) ── */}
        {searchOpen && (
          <div className="mobile-search-bar" ref={!searchOpen ? null : (el) => { /* handled by document click */ }}>
            <div className="mobile-search-inner" ref={searchRef}>
              <SearchInput />
            </div>
          </div>
        )}
      </nav>

      {/* ── Mobile Drawer ── */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-content">
          <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <HomeIcon size={18} /><span>Home</span>
          </Link>
          <Link to="/discover" className={`mobile-nav-link ${location.pathname === '/discover' ? 'active' : ''}`}>
            <Compass size={18} /><span>Discover AI</span>
          </Link>
          <div className="mobile-divider" />
          {user ? (
            <div className="mobile-user-section">
              <Link to="/profile" className="mobile-nav-link">
                <User size={18} /><span>Profile ({user.username})</span>
              </Link>
              <button onClick={handleLogout} className="mobile-logout-btn">
                <LogOut size={17} /><span>Log Out</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-peachy btn-block">Sign In / Join</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
