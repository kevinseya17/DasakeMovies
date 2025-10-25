import { Request, Response } from "express";
import fetch from "node-fetch";

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

    const data = (await response.json()) as { videos: unknown[] };
    res.json(data.videos);
  } catch (err) {
    console.error("Error al consumir Pexels API:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
