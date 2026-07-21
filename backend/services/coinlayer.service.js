/**
 * CoinLayer API service — centralises all external API calls.
 * Keeps controllers clean and API logic easy to swap later.
 */

const BASE_URL = "http://api.coinlayer.com";

/**
 * Fetch historical price for a single coin on a given date (in INR).
 * @param {string} symbol - e.g. "BTC"
 * @param {string} date   - e.g. "2021-01-01"
 * @returns {Promise<number>} price in INR
 */
export const getHistoricalPrice = async (symbol, date) => {
  const API_KEY = process.env.COINLAYER_API_KEY;
  const res = await fetch(
    `${BASE_URL}/${date}?access_key=${API_KEY}&target=INR&symbols=${symbol.toUpperCase()}`
  );
  const data = await res.json();

  if (!data.success) {
    throw {
      status: 404,
      message: `${symbol.toUpperCase()} has no data for ${date}.`,
      details: data.error?.info,
    };
  }

  const price = data.rates?.[symbol.toUpperCase()];
  if (!price) {
    throw {
      status: 404,
      message: `${symbol.toUpperCase()} not found for date ${date}.`,
    };
  }

  return price;
};

/**
 * Fetch historical prices for multiple coins on a given date in a single API call (in INR).
 * @param {string[]} symbols - e.g. ["BTC", "ETH", "DOGE"]
 * @param {string} date - e.g. "2021-01-01"
 * @returns {Promise<Record<string, number>>} rates map
 */
export const getMultipleHistoricalPrices = async (symbols, date) => {
  const API_KEY = process.env.COINLAYER_API_KEY;
  const symbolsStr = symbols.map((s) => s.toUpperCase().trim()).join(",");
  const res = await fetch(
    `${BASE_URL}/${date}?access_key=${API_KEY}&target=INR&symbols=${symbolsStr}`
  );
  const data = await res.json();

  if (!data.success) {
    throw {
      status: 404,
      message: `Failed to fetch price data for ${date}.`,
      details: data.error?.info,
    };
  }

  return data.rates || {};
};

/**
 * Fetch the current live price for a single coin (in INR).
 * @param {string} symbol - e.g. "BTC"
 * @returns {Promise<number>} price in INR
 */
export const getLivePrice = async (symbol) => {
  const API_KEY = process.env.COINLAYER_API_KEY;
  const res = await fetch(
    `${BASE_URL}/live?access_key=${API_KEY}&target=INR&symbols=${symbol.toUpperCase()}`
  );
  const data = await res.json();

  if (!data.success) {
    throw {
      status: 500,
      message: "Failed to fetch current price. Please try again later.",
      details: data.error?.info,
    };
  }

  const price = data.rates?.[symbol.toUpperCase()];
  if (!price) {
    throw {
      status: 404,
      message: `${symbol.toUpperCase()} not found in live prices.`,
    };
  }

  return price;
};

/**
 * Fetch current live prices for multiple coins in a single API call (in INR).
 * @param {string[]} symbols - e.g. ["BTC", "ETH", "DOGE"]
 * @returns {Promise<Record<string, number>>} rates map
 */
export const getMultipleLivePrices = async (symbols) => {
  const API_KEY = process.env.COINLAYER_API_KEY;
  const symbolsStr = symbols.map((s) => s.toUpperCase().trim()).join(",");
  const res = await fetch(
    `${BASE_URL}/live?access_key=${API_KEY}&target=INR&symbols=${symbolsStr}`
  );
  const data = await res.json();

  if (!data.success) {
    throw {
      status: 500,
      message: "Failed to fetch live rates. Please try again later.",
      details: data.error?.info,
    };
  }

  return data.rates || {};
};

/**
 * Delay helper to avoid rate limiting.
 * @param {number} ms
 */
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
