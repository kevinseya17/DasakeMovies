import { Router } from "express";
import { getMovies, addFavorite, removeFavorite, getFavorites } from "../controllers/movieController";

const router = Router();

router.get("/movies", getMovies);

router.post("/favorites/add", addFavorite);
router.delete("/favorites/remove", removeFavorite);
router.get("/favorites", getFavorites);

export default router;