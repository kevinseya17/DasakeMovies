import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { supabase } from "../config/database";

dotenv.config();

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) throw new Error("falta la clave de api de pexels en el archivo .env");

// categorias base
const categories = ["accion", "naturaleza", "deportes", "cine", "musica", "tecnologia"];

// cache en memoria
let cachedMovies: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

// dominios de confianza
const ALLOWED_DOMAINS = ["pexels.com", "videos.pexels.com", "player.vimeo.com"];

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

// agregar a favoritos
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

// eliminar de favoritos
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

// obtener favoritos de un usuario
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
