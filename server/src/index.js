import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import { initDb } from "./initDb.js";

dotenv.config();

// DEBUG: Run this once to make sure the host doesn't have a space at the end
console.log("Connecting to host:", `"${process.env.MYSQL_HOST}"`); 

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({
    origin: "http://localhost:5173", // Explicitly allow your Vite dev server
    credentials: true
}));

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);

// Database initialization
initDb()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize DB:", error.message);
    process.exit(1);
  });