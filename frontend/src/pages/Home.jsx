import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { Sparkles, Film, Flame, Loader2, Tv, Star } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import MovieCard from '../components/MovieCard';
import CategoryBar from '../components/CategoryBar';
import './Home.css';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [collections, setCollections] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [genreMovies, setGenreMovies] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const rowsRef = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, collRes] = await Promise.all([
          axios.get('/api/movies/trending'),
          axios.get('/api/movies/collections')
        ]);
        setTrending(Array.isArray(trendRes.data) ? trendRes.data : []);
        setCollections(collRes.data && typeof collRes.data === 'object' ? collRes.data : {});
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectCategory = async (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      setGenreMovies([]);
      return;
    }

    setCategoryLoading(true);
    try {
      const res = await axios.get(`/api/movies/by-genre/${catId}`);
      setGenreMovies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch category movies:', err);
      setGenreMovies([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && rowsRef.current.length > 0) {
      gsap.fromTo(
        rowsRef.current.filter(Boolean),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
      );
    }
  }, [loading, activeCategory]);

  if (loading) {
    return (
      <div className="loader-clean">
        <div className="loader-glow-box">
          <Loader2 className="loader-spin" size={40} />
          <span>Curating Vibeflix 2026...</span>
        </div>
      </div>
    );
  }

  const allSections = [
    { id: 'trending', title: 'Trending Global', data: trending },
    { key: 'trending_series', title: 'Trending Web Series' },
    { key: 'latest_releases', title: 'Latest Releases' },
    { key: 'top_rated', title: 'All-Time Top Rated' },
    { key: 'bollywood_hits', title: 'Bollywood Hits' },
    { key: 'popular_anime', title: 'Popular Anime' }
  ];

  return (
    <div className="home-clean">
      <HeroSection movies={Array.isArray(trending) ? trending.slice(0, 8) : []} />
      
      {/* Sticky Category Bar */}
      <CategoryBar activeCategory={activeCategory} onSelectCategory={handleSelectCategory} />

      <div className="container main-content">
        {/* If a specific category is selected, render a responsive grid */}
        {activeCategory !== 'all' ? (
          <div className="category-view-section">
            <div className="category-view-header">
              <h2 className="section-title-glow">
                Explore Category ({genreMovies.length} Titles)
              </h2>
            </div>

            {categoryLoading ? (
              <div className="category-inline-loader">
                <Loader2 className="loader-spin" size={32} />
                <span>Fetching live titles...</span>
              </div>
            ) : (
              <div className="category-movie-grid">
                {genreMovies.map((m, idx) => (
                  <div key={m.tmdbId || m.id || idx} className="grid-movie-wrapper">
                    <MovieCard movie={m} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default All-Sections View with live dynamic sliders */
          allSections.map((section, idx) => {
            const raw = section.data || (collections && collections[section.key]) || [];
            const sectionData = Array.isArray(raw) ? raw : [];
            if (sectionData.length === 0) return null;
            return (
              <section key={section.id || section.key || idx} className="row-section" ref={(el) => (rowsRef.current[idx] = el)}>
                <div className="row-header">
                  <h3 className="section-title-glow">{section.title}</h3>
                  <span className="row-count-badge">{sectionData.length} Fresh</span>
                </div>
                <div className="horizontal-scroll premium-scroll">
                  {sectionData.map((m, mIdx) => (
                    <div key={m?.tmdbId || m?.id || mIdx} className="scroll-item">
                      <MovieCard movie={m} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
