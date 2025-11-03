import { Router } from "express";
import {
  getMovies,
  addFavorite,
  removeFavorite,
  getFavorites,
  addComment,
  getCommentsByMovie,
  updateComment,
  deleteComment,
  rateMovie,
  getMovieRating,
} from "../controllers/movieController";

const router = Router();

/**
 * Defines the movie-related routes for the application.
 * Includes endpoints for retrieving movies, managing favorites,
 * handling user comments, and movie ratings.
 */

/* ==========================
   MOVIES
   ========================== */

// retrieves a list of available movies
router.get("/movies", getMovies);

/* ==========================
   FAVORITES
   ========================== */

// adds a movie to the user's list of favorites
router.post("/favorites/add", addFavorite);

// removes a movie from the user's list of favorites
router.delete("/favorites/remove", removeFavorite);

// retrieves all movies marked as favorites by the user
router.get("/favorites", getFavorites);

/* ==========================
   COMMENTS
   ========================== */

// creates a new comment for a movie
router.post("/comments", addComment);

// retrieves all comments for a given movie
router.get("/:movieExternalId/comments", getCommentsByMovie);

router.put("/comments/:commentId", updateComment);   // ahora con params
router.delete("/comments/:commentId", deleteComment);

/* ==========================
   RATINGS
   ========================== */

// adds or updates a movie rating by a logged user
router.post("/ratings", rateMovie);

// retrieves average rating for a specific movie
router.get("/:movieExternalId/rating", getMovieRating);

export default router;
