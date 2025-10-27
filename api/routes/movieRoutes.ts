import { Router } from "express";
import { getMovies, addFavorite, removeFavorite, getFavorites } from "../controllers/movieController";

const router = Router();

/**
 * Defines the movie-related routes for the application.
 * Includes endpoints for retrieving movies and managing user favorites.
 */

// retrieves a list of available movies
router.get("/movies", getMovies);

// adds a movie to the user's list of favorites
router.post("/favorites/add", addFavorite);

// removes a movie from the user's list of favorites
router.delete("/favorites/remove", removeFavorite);

// retrieves all movies marked as favorites by the user
router.get("/favorites", getFavorites);

export default router;
