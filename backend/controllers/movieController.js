const axios = require('axios');

// In-memory cache to avoid redundant TMDB API calls
const tmdbCache = new Map();

/**
 * Format TMDB item (handles both Movie and TV objects)
 */
const formatTMDBItem = (item) => {
  if (!item) return null;
  const isTv = !item.title && !!item.name;
  return {
    id: item.id,
    tmdbId: item.id,
    title: item.title || item.name || 'Untitled',
    poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
    posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
    vote_average: item.vote_average || 7.0,
    voteAverage: item.vote_average || 7.0,
    release_date: item.release_date || item.first_air_date || '2026',
    releaseDate: item.release_date || item.first_air_date || '2026',
    overview: item.overview || '',
    media_type: item.media_type || (isTv ? 'tv' : 'movie'),
    genre_ids: item.genre_ids || []
  };
};

/**
 * Fetches real movie/TV data from TMDB Search API based on title.
 */
const fetchTMDBData = async (title) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;
  if (tmdbCache.has(title)) return tmdbCache.get(title);

  try {
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
    const response = await axios.get(searchUrl);
    const results = response.data.results || [];
    const bestMatch = results.find(r => r.poster_path);
    
    if (bestMatch) {
      const data = formatTMDBItem(bestMatch);
      tmdbCache.set(title, data);
      return data;
    }
    return null;
  } catch (error) {
    console.error(`TMDB Search Error for "${title}":`, error.message);
    return null;
  }
};

/**
 * GET /api/movies/trending
 * Returns trending global movies & TV for hero banner and top row
 */
exports.getTrending = async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (apiKey) {
      const response = await axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`);
      const enriched = (response.data.results || [])
        .filter(m => m.poster_path)
        .map(formatTMDBItem);
      return res.json(enriched);
    }
    res.json([]);
  } catch (error) {
    console.error('getTrending error:', error.message);
    res.json([]);
  }
};

/**
 * GET /api/movies/collections
 * Dynamic real-time categories: Trending TV Series, Trending Movies, Latest Releases, Top Rated, Bollywood Hits, Popular Anime
 */
exports.getCollections = async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.json({});
    }

    const [seriesRes, moviesRes, latestRes, topRatedRes, bollywoodRes, animeRes] = await Promise.allSettled([
      axios.get(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=hi&sort_by=popularity.desc`),
      axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=16&sort_by=popularity.desc`)
    ]);

    const formatResults = (resPromise) => {
      if (resPromise.status === 'fulfilled' && resPromise.value.data?.results) {
        return resPromise.value.data.results.filter(m => m.poster_path).map(formatTMDBItem);
      }
      return [];
    };

    const enriched = {
      trending_series: formatResults(seriesRes),
      trending_movies: formatResults(moviesRes),
      latest_releases: formatResults(latestRes),
      top_rated: formatResults(topRatedRes),
      bollywood_hits: formatResults(bollywoodRes),
      popular_anime: formatResults(animeRes)
    };

    res.json(enriched);
  } catch (error) {
    console.error('getCollections error:', error.message);
    res.json({});
  }
};

/**
 * GET /api/movies/by-genre/:genreId
 * Returns dynamic movies/series by OTT, Genre, Year, Quality or Region
 */
exports.getByGenre = async (req, res) => {
  try {
    const { genreId } = req.params;
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return res.json([]);

    let url = '';

    // OTT Platforms
    if (genreId === 'netflix') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_networks=213&sort_by=popularity.desc`;
    } else if (genreId === 'appletv' || genreId === 'apple-tv') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_networks=2552&sort_by=popularity.desc`;
    } else if (genreId === 'amazon-prime' || genreId === 'prime') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_networks=1024&sort_by=popularity.desc`;
    } else if (genreId === 'disney' || genreId === 'hotstar') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_networks=2739&sort_by=popularity.desc`;
    } else if (genreId === 'hbo' || genreId === 'max') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_networks=49&sort_by=popularity.desc`;
    } else if (genreId === 'kdrama' || genreId === 'korean') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_original_language=ko&sort_by=popularity.desc`;
    } else if (genreId === 'turkish') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_original_language=tr&sort_by=popularity.desc`;
    } else if (genreId === 'chinese') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_original_language=zh&sort_by=popularity.desc`;
    } else if (genreId === 'anime') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=16&sort_by=popularity.desc`;
    } else if (genreId === 'series' || genreId === 'tv') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&sort_by=popularity.desc`;
    }
    // Languages & Regions
    else if (genreId === 'bollywood' || genreId === 'hindi') {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=hi&sort_by=popularity.desc`;
    } else if (genreId === 'hollywood' || genreId === 'english') {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=en&sort_by=popularity.desc`;
    } else if (genreId === 'south-indian' || genreId === 'south') {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=te|ta|ml|kn&sort_by=popularity.desc`;
    }
    // Years (e.g. year-2026, year-2025 or numeric 2026)
    else if (genreId.startsWith('year-') || (/^\d{4}$/.test(genreId) && parseInt(genreId) >= 1970)) {
      const year = genreId.replace('year-', '');
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&primary_release_year=${year}&sort_by=popularity.desc`;
    }
    // Qualities / High Bitrate (4K UHD Top Rated / 60fps / 1080p)
    else if (genreId === '4k' || genreId === '2160p') {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=500&vote_average.gte=7.5`;
    } else if (genreId === '1080p') {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&vote_count.gte=200`;
    } else if (genreId === '720p') {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=release_date.desc&vote_count.gte=50`;
    }
    // Standard Genres (numeric ID or slug)
    else {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc`;
    }

    const response = await axios.get(url);
    const results = (response.data.results || []).filter(m => m.poster_path).map(formatTMDBItem);
    res.json(results);
  } catch (error) {
    console.error('getByGenre error:', error.message);
    res.json([]);
  }
};

/**
 * GET /api/movies/details/:id
 * Fetches details + similar + videos for movie or TV show
 */
exports.getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const type = req.query.type; // 'tv' or 'movie'
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return res.status(404).json({ error: 'TMDB API key not configured' });
    }

    let isTv = false;
    let details, similar, videos;

    const fetchMovie = () => Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits`),
      axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`).catch(() => ({ data: { results: [] } }))
    ]);

    const fetchTv = () => Promise.all([
      axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits`),
      axios.get(`https://api.themoviedb.org/3/tv/${id}/similar?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/tv/${id}/videos?api_key=${apiKey}`).catch(() => ({ data: { results: [] } }))
    ]);

    if (type === 'tv') {
      isTv = true;
      try {
        [details, similar, videos] = await fetchTv();
      } catch (e) {
        // Fallback to movie just in case
        isTv = false;
        [details, similar, videos] = await fetchMovie();
      }
    } else if (type === 'movie') {
      isTv = false;
      try {
        [details, similar, videos] = await fetchMovie();
      } catch (e) {
        // Fallback to TV just in case
        isTv = true;
        [details, similar, videos] = await fetchTv();
      }
    } else {
      // Default fallback logic if type not provided
      try {
        isTv = false;
        [details, similar, videos] = await fetchMovie();
      } catch (movieErr) {
        isTv = true;
        [details, similar, videos] = await fetchTv();
      }
    }

    const raw = details.data;
    const enrichedDetails = {
      ...raw,
      id: raw.id,
      tmdbId: raw.id,
      title: raw.title || raw.name,
      media_type: isTv ? 'tv' : 'movie',
      release_date: raw.release_date || raw.first_air_date,
      poster_path: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null,
      backdrop_path: raw.backdrop_path ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}` : null,
      videos: videos?.data?.results || [],
      similar: (similar?.data?.results || []).filter(m => m.poster_path).map(formatTMDBItem)
    };

    res.json(enrichedDetails);
  } catch (error) {
    console.error('getMovieDetails error:', error.message);
    res.status(404).json({ error: 'Media not found' });
  }
};

/**
 * Watchlist & Reviews logic
 */
const { readDB, writeDB } = require('../localDB');

exports.addToWatchlist = async (req, res) => {
  try {
    const { movie } = req.body;
    const db = readDB();
    const user = db.users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Deduplicate movies by tmdbId in the watchlist
    const targetId = movie.tmdbId || movie.id;
    if (!user.watchlist.some(m => m.tmdbId === targetId || m.id === targetId)) {
      user.watchlist.push({
        tmdbId: targetId,
        id: targetId,
        title: movie.title,
        poster_path: movie.poster_path || movie.posterPath,
        backdrop_path: movie.backdrop_path || movie.backdropPath,
        media_type: movie.media_type || 'movie'
      });
      writeDB(db);
    }

    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const db = readDB();
    const user = db.users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.watchlist = user.watchlist.filter(m => String(m.tmdbId) !== String(movieId) && String(m.id) !== String(movieId) && String(m._id) !== String(movieId));
    writeDB(db);

    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const db = readDB();
    const user = db.users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const review = {
      _id: Math.random().toString(36).substr(2, 9),
      user: req.user.id,
      username: user.username,
      movie: movieId,
      rating,
      comment
    };
    db.reviews.push(review);
    writeDB(db);

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMovieReviews = async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const db = readDB();
    const reviews = db.reviews.filter(r => String(r.movie) === String(tmdbId));
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const db = readDB();
    const userReviews = db.reviews.filter(r => String(r.user) === String(req.user.id));
    res.json(userReviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActorMovies = async (req, res) => {
  try {
    const { actorId } = req.params;
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return res.json([]);

    const response = await axios.get(`https://api.themoviedb.org/3/person/${actorId}/combined_credits?api_key=${apiKey}`);
    
    // Filter and sort for the best titles
    const credits = response.data.cast || [];
    const bestMovies = credits
      .filter(m => m.poster_path && (m.media_type === 'movie' || m.media_type === 'tv') && m.vote_count > 50)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 15)
      .map(formatTMDBItem);
      
    res.json(bestMovies);
  } catch (err) {
    console.error('getActorMovies error:', err.message);
    res.json([]);
  }
};

/**
 * GET /api/movies/search?q=query
 * Searches TMDB for movies and TV shows by name
 */
exports.searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    const apiKey = process.env.TMDB_API_KEY;
    if (!q || !apiKey) return res.json([]);

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(q)}&page=1`
    );
    const results = (response.data.results || [])
      .filter(r => r.poster_path && (r.media_type === 'movie' || r.media_type === 'tv'))
      .slice(0, 20)
      .map(formatTMDBItem);
    res.json(results);
  } catch (err) {
    console.error('searchMovies error:', err.message);
    res.json([]);
  }
};

/**
 * GET /api/movies/smart-recommendations/:id?type=movie|tv
 * Returns cast-based recommendations: fetches top cast members and their filmography
 */
exports.getSmartRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const mediaType = req.query.type || 'movie';
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return res.json([]);

    // 1. Get cast & crew for this title
    const creditsUrl = `https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${apiKey}`;
    const creditsRes = await axios.get(creditsUrl);
    const cast = creditsRes.data.cast || [];
    const crew = creditsRes.data.crew || [];

    // 2. Take top 3 cast members + director
    const topCast = cast.slice(0, 3).map(c => ({ id: c.id, name: c.name }));
    const director = crew.find(c => c.job === 'Director');
    const people = director ? [director, ...topCast] : topCast;

    if (people.length === 0) {
      // Fallback to TMDB similar
      const fallbackUrl = `https://api.themoviedb.org/3/${mediaType}/${id}/similar?api_key=${apiKey}`;
      const fallbackRes = await axios.get(fallbackUrl);
      const fallback = (fallbackRes.data.results || []).filter(m => m.poster_path).map(formatTMDBItem);
      return res.json(fallback.slice(0, 15));
    }

    // 3. Fetch filmographies for each person in parallel
    const filmographyPromises = people.map(person =>
      axios
        .get(`https://api.themoviedb.org/3/person/${person.id}/combined_credits?api_key=${apiKey}`)
        .then(r => {
          const credits = r.data.cast || [];
          return credits.filter(m =>
            m.poster_path &&
            m.id !== parseInt(id) &&
            (m.media_type === 'movie' || m.media_type === 'tv') &&
            m.vote_count > 20  // Only show titles with enough votes (quality filter)
          );
        })
        .catch(() => [])
    );

    const filmographies = await Promise.all(filmographyPromises);

    // 4. Merge, deduplicate by TMDB id, sort by popularity
    const seen = new Set();
    const merged = [];
    for (const films of filmographies) {
      for (const film of films) {
        if (!seen.has(film.id)) {
          seen.add(film.id);
          merged.push(film);
        }
      }
    }

    merged.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    const result = merged.slice(0, 15).map(formatTMDBItem);
    res.json(result);
  } catch (err) {
    console.error('getSmartRecommendations error:', err.message);
    res.json([]);
  }
};

