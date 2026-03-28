import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { initDb } from "./db/database.js";
import fs from "fs";

// Helper to manually load env files
const loadEnv = (file: string) => {
  try {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`[System] Loading environment config from ${filePath}`);
      const content = fs.readFileSync(filePath, "utf-8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          // Strip quotes if present
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);

          if (!process.env[key]) {
            process.env[key] = value.trim();
          }
        }
      });
    }
  } catch (err) {
    console.error(`Failed to load ${file}`, err);
  }
};

// Load environment variables
loadEnv(".env.local");
loadEnv(".env");

// Debug: Print status of API keys (masked)
if (process.env.GROQ_API_KEY) {
  console.log(`[System] GROQ_API_KEY loaded: ${process.env.GROQ_API_KEY.substring(0, 10)}...`);
} else {
  console.warn(`[System] Warning: GROQ_API_KEY is missing.`);
}
if (process.env.XAI_API_KEY) {
  console.log(`[System] XAI_API_KEY loaded (fallback): ${process.env.XAI_API_KEY.substring(0, 10)}...`);
}

// Routes
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";
import departmentRoutes from "./routes/departments.js";
import aiRoutes from "./routes/ai.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  initDb();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/complaints", complaintRoutes);
  app.use("/api/departments", departmentRoutes);
  app.use("/api/ai", aiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(process.cwd(), 'frontend'),
      configFile: path.join(process.cwd(), 'vite.config.ts'),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
