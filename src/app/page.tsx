"use client";

import { useState } from "react";

type LogEntry = {
  message: string;
  change: number;
};

export default function Home() {
  const [wealth, setWealth] = useState(5000); // Start with salary minus fixed expenses
  const [needs, setNeeds] = useState(0);
  const [wants, setWants] = useState(0);
  const [savings, setSavings] = useState(0);
  const [month, setMonth] = useState(1);
  const [log, setLog] = useState<LogEntry[]>([
    { message: "Month 1: Received salary of ₹10000 — Wealth increased by ₹10000", change: 10000 },
    { message: "Month 1: Paid recurring bills of ₹5000 — Wealth decreased by ₹5000", change: -5000 }
  ]);
  const [gameOver, setGameOver] = useState(false);

  const paycheckAmount = 10000; // monthly salary
  const fixedExpenses = 5000;   // recurring bills

  const addLog = (message: string, change: number) => {
    const changeText =
      change > 0
        ? `Wealth increased by ₹${change}`
        : change < 0
        ? `Wealth decreased by ₹${Math.abs(change)}`
        : "";
    setLog((prev) => [{ message: `${message} — ${changeText}`, change }, ...prev]);
  };

  const nextMonth = () => {
    if (month > 12) return;

    // Salary
    setWealth((prev) => prev + paycheckAmount);
    addLog(`Month ${month}: Received salary of ₹${paycheckAmount}`, paycheckAmount);

    // Fixed expenses
    setWealth((prev) => prev - fixedExpenses);
    addLog(`Month ${month}: Paid recurring bills of ₹${fixedExpenses}`, -fixedExpenses);

    // Random events on months 3, 6, 9, 12
    if ([3, 6, 9, 12].includes(month)) {
      const events = [
        { message: "🚗 Car repair expense", change: -5000 },
        { message: "🏥 Medical bill", change: -3000 },
        { message: "🎉 Won a lucky draw!", change: 4000 },
        { message: "🛍️ Shopping discount saved money", change: 2000 },
        { message: "📱 Phone broke, replacement needed", change: -8000 },
        { message: "💼 Side hustle income", change: 6000 },
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setWealth((prev) => prev + randomEvent.change);
      addLog(`Month ${month}: ${randomEvent.message}`, randomEvent.change);
    }

    // Advance month
    if (month === 12) {
      setGameOver(true);
      addLog("🎉 Year complete! See final summary below.", 0);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const allocate = (category: "needs" | "wants" | "savings", amount: number) => {
    if (wealth < amount) {
      addLog(`Not enough wealth to allocate ₹${amount} to ${category}`, 0);
      return;
    }

    setWealth((prev) => prev - amount);
    if (category === "needs") setNeeds((prev) => prev + amount);
    if (category === "wants") setWants((prev) => prev + amount);
    if (category === "savings") setSavings((prev) => prev + amount);

    addLog(`Allocated ₹${amount} to ${category}`, -amount);
  };

  const restartGame = () => {
    setWealth(5000); // Start with salary minus fixed expenses
    setNeeds(0);
    setWants(0);
    setSavings(0);
    setMonth(1);
    setLog([
      { message: "Month 1: Received salary of ₹10000 — Wealth increased by ₹10000", change: 10000 },
      { message: "Month 1: Paid recurring bills of ₹5000 — Wealth decreased by ₹5000", change: -5000 }
    ]);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Restart always available */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">💰 Financial Literacy Game</h1>
            <button
              onClick={restartGame}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              🔄 Restart Game
            </button>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              📅 Progress: Month {month} of 12
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(month / 12) * 100}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              {Math.round((month / 12) * 100)}% Complete
            </div>
          </div>
        </div>

        {!gameOver ? (
          <>
            {/* Stats Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-green-600 mb-2">₹{wealth.toLocaleString()}</p>
                <p className="text-gray-600">Available Wealth</p>
              </div>
              <div className="text-center">
                <p className="text-lg text-gray-700">
                  📅 Current Month: {month <= 12 ? month : "Year Complete"}
                </p>
              </div>
            </div>

            {/* Actions Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="text-center mb-6">
                <button
                  onClick={nextMonth}
                  disabled={month > 12}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-lg font-semibold"
                >
                  {month <= 12 ? "⏭️ Advance to Next Month" : "Year Complete"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => allocate("needs", 3000)}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Allocate ₹3,000 to Needs
                </button>
                <button
                  onClick={() => allocate("wants", 2000)}
                  className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Allocate ₹2,000 to Wants
                </button>
                <button
                  onClick={() => allocate("savings", 5000)}
                  className="px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Allocate ₹5,000 to Savings
                </button>
              </div>
            </div>

            {/* Categories Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-center">📊 Financial Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">₹{needs.toLocaleString()}</p>
                  <p className="text-blue-700">📌 Needs</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">₹{wants.toLocaleString()}</p>
                  <p className="text-yellow-700">🎉 Wants</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <p className="text-2xl font-bold text-teal-600">₹{savings.toLocaleString()}</p>
                  <p className="text-teal-700">🏦 Savings</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-6">📊 Final Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-lg font-semibold text-blue-700">Total Wealth</p>
                <p className="text-2xl font-bold text-blue-600">₹{wealth.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-lg font-semibold text-yellow-700">Total Needs</p>
                <p className="text-2xl font-bold text-yellow-600">₹{needs.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <p className="text-lg font-semibold text-teal-700">Total Savings</p>
                <p className="text-2xl font-bold text-teal-600">₹{savings.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-lg text-green-700 font-semibold">
              🎉 Great job! You completed a year of financial decisions
            </p>
          </div>
        )}

        {/* Activity Log Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📝 Activity Log</h2>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {log.map((entry, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  entry.change >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                <span>{entry.message}</span>
                {entry.change !== 0 && (
                  <span className="font-semibold">
                    {entry.change >= 0 ? "+" : ""}₹{entry.change.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
