import connectDB from "../config/db.js";
import Calculation from "../models/Calculation.model.js";

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Fetch public calculation history
 *     description: Returns all past calculations made by anyone on the platform, sorted by most recent first.
 *     tags: [History]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip (for pagination)
 *     responses:
 *       200:
 *         description: List of calculations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 342
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CalculationResult'
 *       500:
 *         description: Server error
 */
export const getHistory = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // cap at 100
    const skip = parseInt(req.query.skip) || 0;

    await connectDB();

    const [data, total] = await Promise.all([
      Calculation.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Calculation.countDocuments(),
    ]);

    return res.json({ total, data });
  } catch (err) {
    next(err);
  }
};
