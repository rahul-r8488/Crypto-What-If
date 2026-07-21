import connectDB from "../config/db.js";
import Calculation from "../models/Calculation.model.js";
import {
  getHistoricalPrice,
  getLivePrice,
  getMultipleHistoricalPrices,
  getMultipleLivePrices,
  delay,
} from "../services/coinlayer.service.js";

const MAX_COINS = 3; // Vercel free plan serverless timeout safety

/**
 * @swagger
 * /api/compare:
 *   post:
 *     summary: Compare multiple crypto investments for the same date and amount
 *     description: Fetches historical and live prices for up to 3 coins sequentially, calculates results, saves to history, and returns a ranked comparison. The winner is the coin with the highest ROI.
 *     tags: [Compare]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coins, date, amount]
 *             properties:
 *               coins:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["BTC", "ETH", "DOGE"]
 *                 maxItems: 3
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2021-01-01"
 *               amount:
 *                 type: number
 *                 example: 10000
 *     responses:
 *       200:
 *         description: Comparison results ranked by ROI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 winner:
 *                   type: string
 *                   example: BTC
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CalculationResult'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export const compare = async (req, res, next) => {
  const { coins, date, amount } = req.body;

  // Validate
  if (!coins || !Array.isArray(coins) || coins.length < 2) {
    return res
      .status(400)
      .json({ error: "Provide at least 2 coins to compare." });
  }

  if (coins.length > MAX_COINS) {
    return res
      .status(400)
      .json({ error: `Maximum ${MAX_COINS} coins allowed per comparison.` });
  }

  if (!date || !amount) {
    return res.status(400).json({ error: "Please provide a date and amount." });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 1 || numAmount > 10000000) {
    return res
      .status(400)
      .json({ error: "Amount must be between ₹1 and ₹1,00,00,000." });
  }

  const results = [];
  const errors = [];
  const sanitizedCoins = coins.map((c) => c.toUpperCase().trim());

  for (let i = 0; i < sanitizedCoins.length; i++) {
    const symbol = sanitizedCoins[i];

    // Wait 5 seconds between consecutive coin API calls
    if (i > 0) {
      await delay(5000);
    }

    try {
      const priceThen = await getHistoricalPrice(symbol, date);
      await delay(1000); // 1 sec delay between historical and live call for same coin
      const priceNow = await getLivePrice(symbol);

      const units = numAmount / priceThen;
      const valueToday = units * priceNow;
      const profit = valueToday - numAmount;
      const roiNum = ((profit / numAmount) * 100).toFixed(2);
      const roi = `${roiNum >= 0 ? "+" : ""}${roiNum}%`;

      results.push({
        crypto: symbol,
        date,
        invested: numAmount,
        priceThen,
        priceNow,
        units: Number(units.toFixed(8)),
        valueToday: Number(valueToday.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        roi,
        roiNum: parseFloat(roiNum),
      });
    } catch (err) {
      errors.push({ crypto: symbol, error: err.message || "Unknown error" });
    }
  }

  if (results.length === 0) {
    return res.status(404).json({
      error: "No valid data found for any of the provided coins.",
      errors,
    });
  }

  // Sort by ROI descending — winner first
  results.sort((a, b) => b.roiNum - a.roiNum);
  const winner = results[0].crypto;

  // Save each result to MongoDB
  try {
    await connectDB();
    const docs = results.map((r) => ({
      crypto: r.crypto,
      date: r.date,
      invested: r.invested,
      priceThen: r.priceThen,
      priceNow: r.priceNow,
      units: r.units,
      valueToday: r.valueToday,
      profit: r.profit,
      roi: r.roi,
      type: "compare",
    }));
    await Calculation.insertMany(docs);
  } catch (dbErr) {
    // DB save failure shouldn't break the response — just log it
    console.error("Failed to save compare results to DB:", dbErr.message);
  }

  // Strip numeric roiNum from response (internal use only)
  const cleanResults = results.map(({ roiNum, ...rest }) => rest);

  return res.json({ winner, results: cleanResults, errors });
};
