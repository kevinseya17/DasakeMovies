import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  throw new Error("falta la clave de api de pexels en el archivo .env");
}

// categorías de videos que queremos traer
const categories = [
  "accion",
  "naturaleza",
  "deportes",
  "cine",
  "musica",
  "tecnologia",
  "urbano",
  "gastronomia",
  "otros"
];

// estructura de caché en memoria
let cachedMovies: Record<string, any[]> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

export const getMovies = async (req: Request, res: Response) => {
  try {
    const now = Date.now();

    // si los datos están en caché y no ha expirado
    if (cachedMovies && now - lastFetchTime < CACHE_DURATION) {
      console.log("🟢 devolviendo peliculas desde cache");
      return res.json(cachedMovies);
    }

    console.log("🟡 cache expirado o vacío, obteniendo datos de pexels...");

    const groupedMovies: Record<string, any[]> = {};

    for (const cat of categories) {
      const response = await axios.get("https://api.pexels.com/videos/search", {
        headers: { Authorization: API_KEY },
        params: {
          query: cat,
          per_page: 5, // puedes ajustar este número
        },
      });

      const videos = response.data.videos.map((v: any) => ({
        id: v.id,
        url: v.url,
        image: v.image ?? v.video_pictures?.[0]?.picture ?? "",
        category: cat,
        user: {
          name: v.user?.name ?? "autor desconocido",
          url: v.user?.url ?? "",
        },
        video_files: v.video_files ?? [],
      }));

      groupedMovies[cat] = videos;
    }

    // guardar en caché
    cachedMovies = groupedMovies;
    lastFetchTime = now;

    console.log("✅ peliculas actualizadas y guardadas en cache");
    res.json(groupedMovies);
  } catch (err: any) {
    console.error("❌ error al obtener videos de pexels:", err.message);
    res.status(500).json({ error: "no se pudieron cargar los videos" });
  }
};
