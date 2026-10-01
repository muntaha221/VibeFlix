const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const auth = require('../middleware/auth');

router.get('/search', movieController.searchMovies);
router.get('/smart-recommendations/:id', movieController.getSmartRecommendations);
router.get('/trending', movieController.getTrending);
router.get('/collections', movieController.getCollections);
router.get('/by-genre/:genreId', movieController.getByGenre);
router.get('/details/:id', movieController.getMovieDetails);
router.post('/watchlist', auth, movieController.addToWatchlist);
router.delete('/watchlist/:movieId', auth, movieController.removeFromWatchlist);
router.post('/review', auth, movieController.addReview);
router.get('/:tmdbId/reviews', movieController.getMovieReviews);
router.get('/user-reviews', auth, movieController.getUserReviews);
router.get('/actor/:actorId', movieController.getActorMovies);

module.exports = router;

