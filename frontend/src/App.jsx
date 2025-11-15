import React, { useState } from "react";

export default function App() {
  const [crypto, setCrypto] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleCalculate = async () => {
    if (!crypto || !date || !amount) {
      setError("⚠️ Please fill all fields");
      return;
    }

    try {
      const res = await fetch("https://crypto-what-if-csww.vercel.app/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crypto, date, amount: Number(amount) }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setError("");
      } else {
        setResult(null);
        setError(data.error);
      }
    } catch {
      setError("❌ Server not reachable");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white overflow-hidden">

      {/* Left Panel - Inputs */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10 md:p-20 border-b md:border-b-0 md:border-r border-gray-800">
        <div className="w-full max-w-xl bg-gray-900/60 p-10 rounded-3xl shadow-2xl border border-gray-800 backdrop-blur-lg">
          <h1 className="text-5xl font-extrabold text-green-400 mb-12 text-center drop-shadow-lg">
            💰 Crypto What-If Calculator
          </h1>

          <div className="space-y-8">
            <input
              type="text"
              placeholder="Crypto Symbol (e.g. BTC)"
              className="w-full p-6 rounded-xl bg-gray-800 text-white text-2xl placeholder-gray-400 focus:ring-4 focus:ring-green-400 outline-none transition-all"
              value={crypto}
              onChange={(e) => setCrypto(e.target.value)}
            />

            <input
              type="date"
              className="w-full p-6 rounded-xl bg-gray-800 text-white text-2xl focus:ring-4 focus:ring-green-400 outline-none transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
            />

            <input
              type="number"
              placeholder="Amount in INR"
              className="w-full p-6 rounded-xl bg-gray-800 text-white text-2xl placeholder-gray-400 focus:ring-4 focus:ring-green-400 outline-none transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="10000000"
            />

            <button
              onClick={handleCalculate}
              className="w-full py-5 bg-green-500 hover:bg-green-600 active:scale-95 transition-transform rounded-xl font-bold text-black text-2xl shadow-lg hover:shadow-2xl"
            >
              Calculate
            </button>

            {error && (
              <p className="text-red-400 mt-6 text-center font-semibold text-xl animate-pulse">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10 md:p-20">
        {!result ? (
          <div className="text-gray-400 font-bold text-4xl text-center opacity-80">
            Enter details to see results
          </div>
        ) : (
          <div className="w-full max-w-2xl animate-fadeIn">
            <h2 className="text-4xl font-extrabold text-green-400 mb-10 text-center">
              📊 Investment Summary
            </h2>
            <div className="space-y-8 text-left bg-gray-900/70 p-10 rounded-3xl border border-gray-700 shadow-2xl backdrop-blur-md">
              <p className="text-2xl">
                <span className="font-semibold text-gray-300">Crypto:</span>{" "}
                <span className="text-white">{result.crypto}</span>
              </p>
              <p className="text-2xl">
                <span className="font-semibold text-gray-300">Invested:</span>{" "}
                ₹{result.invested}
              </p>
              <p className="text-2xl">
                <span className="font-semibold text-gray-300">Value Today:</span>{" "}
                <span className="text-blue-300">₹{result.valueToday}</span>
              </p>
              <p className="text-3xl font-bold text-green-400 mt-4">
                Profit: ₹{result.profit}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
