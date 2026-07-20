import connectDB from "../config/db.js";
import Calculation from "../models/Calculation.model.js";
import {
  getHistoricalPrice,
  getLivePrice,
  delay,
} from "../services/coinlayer.service.js";

/**
 * @swagger
 * /api/calculate:
 *   post:
 *     summary: Calculate hypothetical crypto investment return
 *     description: Given a crypto symbol, a past date, and an INR amount, returns what that investment would be worth today. Result is saved to the public history.
 *     tags: [Calculator]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [crypto, date, amount]
 *             properties:
 *               crypto:
 *                 type: string
 *                 example: BTC
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2021-01-01"
 *               amount:
 *                 type: number
 *                 example: 10000
 *     responses:
 *       200:
 *         description: Calculation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalculationResult'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Coin or date not found
 *       500:
 *         description: Server error
 */
export const calculate = async (req, res, next) => {
  const { crypto, date, amount } = req.body;

  // Basic validation
  if (!crypto || !date || !amount) {
    return res
      .status(400)
      .json({ error: "Please provide crypto, date and amount." });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 1 || numAmount > 10000000) {
    return res
      .status(400)
      .json({ error: "Amount must be between ₹1 and ₹1,00,00,000." });
  }

  try {
    // 1. Fetch historical price
    const priceThen = await getHistoricalPrice(crypto, date);

    // 2. Delay to respect CoinLayer rate limit (1 req/sec on free plan)
    await delay(1000);

    // 3. Fetch live price
    const priceNow = await getLivePrice(crypto);

    // 4. Calculate result
    const units = numAmount / priceThen;
    const valueToday = units * priceNow;
    const profit = valueToday - numAmount;
    const roiNum = ((profit / numAmount) * 100).toFixed(2);
    const roi = `${roiNum >= 0 ? "+" : ""}${roiNum}%`;

    // 5. Save to MongoDB Atlas
    await connectDB();
    await Calculation.create({
      crypto: crypto.toUpperCase(),
      date,
      invested: numAmount,
      priceThen,
      priceNow,
      units: Number(units.toFixed(8)),
      valueToday: Number(valueToday.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      roi,
      type: "single",
    });

    // 6. Return result
    return res.json({
      crypto: crypto.toUpperCase(),
      date,
      invested: numAmount,
      priceThen,
      priceNow,
      units: Number(units.toFixed(8)),
      valueToday: Number(valueToday.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      roi,
    });
  } catch (err) {
    if (err.status) {
      return res
        .status(err.status)
        .json({ error: err.message, details: err.details });
    }
    next(err);
  }
};
