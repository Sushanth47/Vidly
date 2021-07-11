require('dotenv').config()
const {Movie, validate} = require('../models/movie');
const {Requested} = require('../models/requestedModel');
const express = require('express');
const {getMovies, createMovies, updateMovies, deleteMovies, displayMovieSearch,createMoviesPage, displayMovie} = require('../controllers/movieController');
const router = express.Router();

router.get('/movies', getMovies);

router.get('/createmoviespage', createMoviesPage);

router.post('/createmovies', createMovies)
router.get('/:title', displayMovie);
router.post('/search', displayMovieSearch);
router.put('/updatemovies/:id',updateMovies )
 
 //to delete a genre
 router.delete('/deletemovies/:id', deleteMovies)
 
 
 
 //to get by id
//  router.post('/getspecificmovies', getSpecificMovie);

 module.exports = router, Movie;

