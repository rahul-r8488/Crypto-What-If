  import express from "express";
  import cors from "cors";
  import fetch from "node-fetch";

  const app = express();
  app.use(cors());
  app.use(express.json());

  const API_KEY = "7a3fd650450b27cf555d780d35ea8697"; //  key

  // Health check
  app.get("/", (req, res) => {
    res.send(" Backend is running ");
  });

  // Calculate endpoint
  app.post("/api/calculate", async (req, res) => {
    const { crypto, date, amount } = req.body;

    // Validation for inputs
    if (!crypto || !date || !amount) {
      return res
        .status(400)
        .json({ error: "Please provide crypto, date and amount" });
    }

    if (amount < 1 || amount > 100000) {
      return res
        .status(400)
        .json({ error: "Amount must be between 1 and 10000000" });
    }

    try {
      // Fetch historical data
      const response = await fetch(
        `http://api.coinlayer.com/${date}?access_key=${API_KEY}&target=INR&symbols=${crypto.toUpperCase()}`
      );
      const data = await response.json();
      console.log("Historical Data:", data);

      if (!data.success) {
        return res
          .status(404)
          .json({
            error: `${crypto.toUpperCase()} does not exist on ${date} or API has no data.`,
          });
      }

      const priceThen = data.rates?.[crypto.toUpperCase()];
      if (!priceThen) {
        return res
          .status(404)
          .json({
            error: `${crypto.toUpperCase()} does not exist for selected date`,
          });
      }

      // Fetch current price
      const currentRes = await fetch(
        `http://api.coinlayer.com/live?access_key=${API_KEY}&target=INR&symbols=${crypto.toUpperCase()}`
      );
      const currentData = await currentRes.json();

      if (!currentData.success) {
        return res
          .status(500)
          .json({
            error: "Failed to fetch current price. Please try again later.",
          });
      }

      const priceNow = currentData.rates?.[crypto.toUpperCase()];
      if (!priceNow) {
        return res
          .status(404)
          .json({ error: `${crypto.toUpperCase()} does not exist today.` });
      }

      // Calculate values
      const unitsBought = amount / priceThen;
      const valueToday = unitsBought * priceNow;

      res.json({
        crypto: crypto.toUpperCase(),
        date,
        invested: amount,
        valueToday: Number(valueToday.toFixed(2)),
        profit: Number((valueToday - amount).toFixed(2)),
      });
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  const PORT = 5000;
  app.listen(PORT, () =>
    console.log(`Backend running on http://localhost:${PORT}`)
  );
