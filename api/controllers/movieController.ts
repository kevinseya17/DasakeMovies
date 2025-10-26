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
];

// estructura de caché en memoria
let cachedMovies: any[] | null = null;
let lastFetchTime = 0; // timestamp de la última actualización
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

export const getMovies = async (req: Request, res: Response) => {
  try {
    const now = Date.now();

    // si los datos están en caché y no ha pasado una hora, devolverlos
    if (cachedMovies && now - lastFetchTime < CACHE_DURATION) {
      console.log("🟢 devolviendo peliculas desde cache");
      return res.json(cachedMovies);
    }

    console.log("🟡 cache expirado o vacío, obteniendo datos de pexels...");

    const allMovies: any[] = [];

    // traer videos por categoría
    for (const cat of categories) {
      const response = await axios.get("https://api.pexels.com/videos/search", {
        headers: { Authorization: API_KEY },
        params: {
          query: cat,
          per_page: 5, // puedes subirlo a 10-15 si deseas más
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

      allMovies.push(...videos);
    }

    // guardar en caché
    cachedMovies = allMovies;
    lastFetchTime = now;

    console.log("✅ peliculas actualizadas y guardadas en cache");
    res.json(allMovies);
  } catch (err: any) {
    console.error("❌ error al obtener videos de pexels:", err.message);
    res.status(500).json({ error: "no se pudieron cargar los videos" });
  }
};
