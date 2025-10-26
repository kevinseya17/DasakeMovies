import { Request, Response } from "express";
import fetch from "node-fetch";

const categorizeMovie = (movie: any): string => {
  const name =
    (movie.user?.name?.toLowerCase() || "") +
    " " +
    (movie.url?.toLowerCase() || "");

  if (name.includes("sport") || name.includes("deporte") || name.includes("run")) {
    return "deportes";
  } else if (
    name.includes("nature") ||
    name.includes("mountain") ||
    name.includes("sky") ||
    name.includes("forest") ||
    name.includes("beach")
  ) {
    return "naturaleza";
  } else if (
    name.includes("city") ||
    name.includes("street") ||
    name.includes("urban")
  ) {
    return "urbano";
  } else if (name.includes("music") || name.includes("concert")) {
    return "musica";
  } else if (name.includes("tech") || name.includes("computer") || name.includes("device")) {
    return "tecnologia";
  } else if (name.includes("food") || name.includes("kitchen") || name.includes("cook")) {
    return "gastronomia";
  } else {
    return "otros";
  }
};

export const getMovies = async (req: Request, res: Response) => {
  const query = (req.query.q as string) || "action";
  const perPage = Number(req.query.perPage) || 10;
  const API_KEY = process.env.PEXELS_API_KEY;

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${query}&per_page=${perPage}`,
      {
        headers: { Authorization: API_KEY! },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ message: "Error al obtener videos" });
    }

    const data = (await response.json()) as { videos: any[] };

    // agregar categoría
    const categorized = data.videos.map((movie) => ({
      ...movie,
      category: categorizeMovie(movie),
    }));

    // agrupar por categoría
    const grouped: Record<string, any[]> = {};
    categorized.forEach((movie) => {
      if (!grouped[movie.category]) {
        grouped[movie.category] = [];
      }
      grouped[movie.category].push(movie);
    });

    res.json(grouped);
  } catch (err) {
    console.error("Error al consumir Pexels API:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
