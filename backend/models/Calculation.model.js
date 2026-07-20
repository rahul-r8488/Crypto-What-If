import mongoose from "mongoose";

const CalculationSchema = new mongoose.Schema(
  {
    crypto: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    date: {
      type: String, // "YYYY-MM-DD" — the historical investment date
      required: true,
    },
    invested: {
      type: Number,
      required: true,
    },
    priceThen: {
      type: Number,
      required: true,
    },
    priceNow: {
      type: Number,
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
    valueToday: {
      type: Number,
      required: true,
    },
    profit: {
      type: Number,
      required: true,
    },
    roi: {
      type: String, // e.g. "+4400.00%"
    },
    type: {
      type: String,
      enum: ["single", "compare"],
      default: "single",
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

const Calculation = mongoose.model("Calculation", CalculationSchema);
export default Calculation;
