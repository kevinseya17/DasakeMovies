import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { supabase } from "../config/database";

dotenv.config();

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) throw new Error("falta la clave de api de pexels en el archivo .env");

/**
 * Default video categories used for fetching movies.
 * constant
 * type {string[]}
 */
const categories = ["accion", "naturaleza", "deportes", "cine", "musica", "tecnologia"];

/**
 * In-memory cache for fetched movies.
 * type {any[] | null}
 */
let cachedMovies: any[] | null = null;

/**
 * Timestamp of the last cache update.
 * type {number}
 */
let lastFetchTime = 0;

/**
 * Cache validity duration in milliseconds (1 hour).
 * constant
 * type {number}
 */
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * List of trusted video domains allowed in the results.
 * constant
 * type {string[]}
 */
const ALLOWED_DOMAINS = ["pexels.com", "videos.pexels.com", "player.vimeo.com"];

/**
 * Fetches videos from the Pexels API by category and caches them securely.
 *
 * Uses a one-hour cache to reduce redundant API calls.
 * Filters video files to ensure they come from trusted domains and have valid HTTPS URLs.
 *
 * async
 * function getMovies
 * param {Request} req - Express request object.
 * param {Response} res - Express response object.
 * returns {Promise<void>} JSON response with cached or freshly fetched videos.
 */
export const getMovies = async (req: Request, res: Response) => {
  try {
    const now = Date.now();

    if (cachedMovies && now - lastFetchTime < CACHE_DURATION) {
      console.log("🟢 devolviendo peliculas desde cache segura");
      return res.json(cachedMovies);
    }

    console.log("🟡 actualizando cache de peliculas seguras...");
    const allMovies: any[] = [];

    for (const cat of categories) {
      const response = await axios.get("https://api.pexels.com/videos/search", {
        headers: { Authorization: API_KEY },
        params: { query: cat, per_page: 6 },
      });

      const videos = response.data.videos
        .map((v: any) => {
          const safeFiles = (v.video_files || []).filter((f: any) => {
            if (!f.file_type?.startsWith("video/")) return false;
            if (!f.link?.startsWith("https://")) return false;

            try {
              const urlDomain = new URL(f.link).hostname;
              return ALLOWED_DOMAINS.some((domain) => urlDomain.endsWith(domain));
            } catch {
              return false;
            }
          });

          // si no hay archivos seguros, no incluir el video
          if (!safeFiles.length) return null;

          return {
            id: v.id,
            url: v.url,
            image: v.image ?? v.video_pictures?.[0]?.picture ?? "",
            category: cat,
            user: {
              name: v.user?.name ?? "autor desconocido",
              url: v.user?.url ?? "",
            },
            video_files: safeFiles,
          };
        })
        .filter(Boolean); // elimina los null

      allMovies.push(...videos);
    }

    cachedMovies = allMovies;
    lastFetchTime = now;
    console.log("✅ peliculas seguras guardadas en cache");
    res.json(allMovies);
  } catch (err: any) {
    console.error("❌ error al obtener videos:", err.message);
    res.status(500).json({ error: "no se pudieron cargar los videos" });
  }
};

/**
 * Adds a video to the user's list of favorites in the database.
 *
 * async
 * function addFavorite
 * param {Request} req - Express request object containing `userId`, `videoId`, `videoUrl`, and optional `videoImage`.
 * param {Response} res - Express response object.
 * returns {Promise<void>} JSON message confirming success or error.
 */
export const addFavorite = async (req: Request, res: Response) => {
  const { userId, videoId, videoUrl, videoImage } = req.body;

  if (!userId || !videoId || !videoUrl)
    return res.status(400).json({ message: "faltan datos obligatorios" });

  const { data, error } = await supabase
    .from("favorites")
    .insert([{ user_id: userId, video_id: videoId, video_url: videoUrl, video_image: videoImage }]);

  if (error) return res.status(500).json({ message: "error al agregar favorito", error });

  res.status(201).json({ message: "favorito agregado correctamente", data });
};

/**
 * Removes a video from the user's list of favorites in the database.
 *
 * async
 * function removeFavorite
 * param {Request} req - Express request object containing `userId` and `videoId`.
 * param {Response} res - Express response object.
 * returns {Promise<void>} JSON message confirming success or error.
 */
export const removeFavorite = async (req: Request, res: Response) => {
  const { userId, videoId } = req.body;

  if (!userId || !videoId)
    return res.status(400).json({ message: "faltan datos obligatorios" });

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("video_id", videoId);

  if (error) return res.status(500).json({ message: "error al eliminar favorito", error });

  res.status(200).json({ message: "favorito eliminado correctamente" });
};

/**
 * Retrieves all favorite videos of a specific user.
 *
 * async
 * function getFavorites
 * param {Request} req - Express request object containing `userId` as a query parameter.
 * param {Response} res - Express response object.
 * returns {Promise<void>} JSON array of the user's favorite videos.
 */
export const getFavorites = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  if (!userId) return res.status(400).json({ message: "falta userId" });

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: "error al obtener favoritos", error });

  res.status(200).json(data);
};
/**
 * ===============================
 * COMENTARIOS DE USUARIOS
 * ===============================
 */

/**
 * crea un comentario nuevo en una pelicula
 */
export const addComment = async (req: Request, res: Response) => {
  const { userId, movieExternalId, content, title, posterUrl } = req.body;

  if (!userId || !movieExternalId || !content)
    return res.status(400).json({ message: "faltan datos obligatorios" });

  try {
    // 1️⃣ verificar si la pelicula ya existe en la tabla movies
    const { data: existingMovie, error: movieError } = await supabase
      .from("movies")
      .select("id")
      .eq("external_id", movieExternalId)
      .single();

    if (movieError && movieError.code !== "PGRST116")
      throw new Error(movieError.message);

    let movieId = existingMovie?.id;

    // 2️⃣ si no existe, crearla
    if (!movieId) {
      const { data: newMovie, error: createError } = await supabase
        .from("movies")
        .insert([{ external_id: movieExternalId, title, poster_url: posterUrl }])
        .select("id")
        .single();

      if (createError) throw new Error(createError.message);
      movieId = newMovie.id;
    }

    // 3️⃣ crear comentario
    const { data, error } = await supabase
      .from("comments")
      .insert([{ user_id: userId, movie_id: movieId, content }])
      .select();

    if (error) throw new Error(error.message);

    res.status(201).json({ message: "comentario agregado correctamente", data });
  } catch (err: any) {
    res.status(500).json({ message: "error al agregar comentario", error: err.message });
  }
};

/**
 * obtiene todos los comentarios de una pelicula
 */
export const getCommentsByMovie = async (req: Request, res: Response) => {
  const movieExternalId = req.params.movieExternalId;
  const { title, posterUrl } = req.query; // opcionalmente se pueden pasar por query

  if (!movieExternalId)
    return res.status(400).json({ message: "falta el id externo de la pelicula" });

  try {
    // buscar película
    let { data: movie, error: movieError } = await supabase
      .from("movies")
      .select("id")
      .eq("external_id", movieExternalId)
      .single();

    // si no existe, crearla automáticamente
    if (!movie) {
      const { data: newMovie, error: createError } = await supabase
        .from("movies")
        .insert([{
          external_id: movieExternalId,
          title: (title as string) ?? "titulo desconocido",
          poster_url: (posterUrl as string) ?? "",
        }])
        .select("id")
        .single();
      if (createError) throw new Error(createError.message);
      movie = newMovie;
    }

    // obtener comentarios
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, created_at, updated_at, user_id")
      .eq("movie_id", movie.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    res.status(200).json(data || []);
  } catch (err: any) {
    res.status(500).json({ message: "error al obtener comentarios", error: err.message });
  }
};

/**
 * edita un comentario existente
 */
export const updateComment = async (req: Request, res: Response) => {
  const { commentId, userId, content } = req.body;

  if (!commentId || !userId || !content)
    return res.status(400).json({ message: "faltan datos obligatorios" });

  try {
    const { error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    res.status(200).json({ message: "comentario actualizado correctamente" });
  } catch (err: any) {
    res.status(500).json({ message: "error al actualizar comentario", error: err.message });
  }
};

/**
 * elimina un comentario existente
 */
export const deleteComment = async (req: Request, res: Response) => {
  const { commentId, userId } = req.body;

  if (!commentId || !userId)
    return res.status(400).json({ message: "faltan datos obligatorios" });

  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    res.status(200).json({ message: "comentario eliminado correctamente" });
  } catch (err: any) {
    res.status(500).json({ message: "error al eliminar comentario", error: err.message });
  }
};

/**
 * ===============================
 * CALIFICACIONES / RATINGS
 * ===============================
 */

/**
 * crea o actualiza la calificacion de una pelicula
 */
export const rateMovie = async (req: Request, res: Response) => {
  const { userId, movieExternalId, rating, title, posterUrl } = req.body;

  if (!userId || !movieExternalId || !rating)
    return res.status(400).json({ message: "faltan datos obligatorios" });

  if (rating < 1 || rating > 5)
    return res.status(400).json({ message: "la calificacion debe estar entre 1 y 5" });

  try {
    // 1️⃣ obtener o crear la pelicula
    const { data: existingMovie, error: movieError } = await supabase
      .from("movies")
      .select("id")
      .eq("external_id", movieExternalId)
      .single();

    if (movieError && movieError.code !== "PGRST116")
      throw new Error(movieError.message);

    let movieId = existingMovie?.id;

    if (!movieId) {
      const { data: newMovie, error: createError } = await supabase
        .from("movies")
        .insert([{ external_id: movieExternalId, title, poster_url: posterUrl }])
        .select("id")
        .single();

      if (createError) throw new Error(createError.message);
      movieId = newMovie.id;
    }

    // 2️⃣ insertar o actualizar calificacion
    const { error: upsertError } = await supabase
      .from("rankings")
      .upsert([{ user_id: userId, movie_id: movieId, rating }], { onConflict: "user_id, movie_id" });

    if (upsertError) throw new Error(upsertError.message);

    res.status(201).json({ message: "calificacion registrada correctamente" });
  } catch (err: any) {
    res.status(500).json({ message: "error al registrar calificacion", error: err.message });
  }
};

/**
 * obtiene la calificacion promedio de una pelicula
 */
export const getMovieRating = async (req: Request, res: Response) => {
  const movieExternalId = req.params.movieExternalId;
  const { title, posterUrl } = req.query;

  if (!movieExternalId)
    return res.status(400).json({ message: "falta el id externo de la pelicula" });

  try {
    let { data: movie, error: movieError } = await supabase
      .from("movies")
      .select("id")
      .eq("external_id", movieExternalId)
      .single();

    if (!movie) {
      const { data: newMovie, error: createError } = await supabase
        .from("movies")
        .insert([{
          external_id: movieExternalId,
          title: (title as string) ?? "titulo desconocido",
          poster_url: (posterUrl as string) ?? "",
        }])
        .select("id")
        .single();
      if (createError) throw new Error(createError.message);
      movie = newMovie;
    }

    const { data, error } = await supabase
      .from("rankings")
      .select("rating")
      .eq("movie_id", movie.id);

    if (error) throw new Error(error.message);

    const promedio =
      data && data.length > 0
        ? data.reduce((acc, cur) => acc + cur.rating, 0) / data.length
        : 0;

    res.status(200).json({ promedio });
  } catch (err: any) {
    res.status(500).json({ message: "error al obtener promedio", error: err.message });
  }
};
