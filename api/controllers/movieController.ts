import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

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
