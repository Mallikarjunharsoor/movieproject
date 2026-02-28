import express from "express";
import { authRequired } from "../authMiddleware.js";

const router = express.Router();

async function fetchOmdb(query) {
  const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&${query}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch from OMDb");
  }
  return response.json();
}

router.get("/featured", authRequired, async (_req, res) => {
  try {
    const sections = [
      { title: "Trending Now", term: "avengers" },
      { title: "Action Hits", term: "batman" },
      { title: "Top Picks For You", term: "harry" },
      { title: "Sci-Fi Worlds", term: "star" },
      { title: "Crime & Suspense", term: "mission" }
    ];

    const rows = await Promise.all(
      sections.map(async (section) => {
        const data = await fetchOmdb(`s=${encodeURIComponent(section.term)}&type=movie&page=1`);
        return {
          title: section.title,
          items: (data.Search || []).filter((item) => item.Poster && item.Poster !== "N/A")
        };
      })
    );

    return res.json({ rows });
  } catch (error) {
    return res.status(500).json({ message: "Could not load featured movies", error: error.message });
  }
});

router.get("/search", authRequired, async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const data = await fetchOmdb(`s=${encodeURIComponent(q)}&type=movie&page=1`);
    return res.json({ items: data.Search || [] });
  } catch (error) {
    return res.status(500).json({ message: "Search failed", error: error.message });
  }
});

export default router;