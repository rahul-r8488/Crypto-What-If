import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";

import calculateRoutes from "./routes/calculate.routes.js";
import historyRoutes from "./routes/history.routes.js";
import compareRoutes from "./routes/compare.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Crypto What-If API is running",
    version: "2.0.0",
    docs: "/api/docs",
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use("/api/calculate", calculateRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/compare", compareRoutes);

// ── Swagger Docs ──────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Expose the raw OpenAPI JSON spec (useful for Postman import)
app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

// ── Global Error Handler (must be last) ──────────────────────
app.use(errorHandler);

export default app;
