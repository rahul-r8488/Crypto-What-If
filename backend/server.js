import app from "./app.js";

// ── Local dev server (not used on Vercel serverless) ─────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📚 API Docs:       http://localhost:${PORT}/api/docs`);
  });
}

// ── Vercel serverless handler ─────────────────────────────────
export default function handler(req, res) {
  return app(req, res);
}
