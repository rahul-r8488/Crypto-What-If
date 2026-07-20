/**
 * Global Express error handler — catches anything thrown by next(err).
 * Returns a clean JSON response instead of leaking stack traces.
 */
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "An unexpected server error occurred.",
    details:
      process.env.NODE_ENV !== "production" ? err.message : undefined,
  });
};

export default errorHandler;
