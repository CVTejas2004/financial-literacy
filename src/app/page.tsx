"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

type LogEntry = {
  message: string;
  change: number;
};

// ---- 50/30/20 helpers (end-of-year only) ----
const TARGETS = { needs: 50, wants: 30, savings: 20 };

function pct(n: number, d: number) {
  if (d <= 0) return 0;
  return Math.round((n / d) * 100);
}

function budgetPersona(pNeeds: number, pWants: number, pSavings: number): string {
  const within = (p: number, t: number, tol = 5) => Math.abs(p - t) <= tol;
  if (within(pNeeds, TARGETS.needs) && within(pWants, TARGETS.wants) && within(pSavings, TARGETS.savings)) {
    return "Balanced Budgeter";
  }
  if (pSavings >= 25 && pWants <= 25) return "Saver";
  if (pWants >= 40) return "Spender";
  if (pNeeds >= 60) return "Needs-Stretched";
  return "Mixed Budgeter";
}

function ruleSummaryLine(pNeeds: number, pWants: number, pSavings: number) {
  return `Needs ${pNeeds}% (50), Wants ${pWants}% (30), Savings ${pSavings}% (20)`;
}

export default function Home() {
  // refs for FX targets & source
  const needsRef = useRef<HTMLDivElement | null>(null);
  const wantsRef = useRef<HTMLDivElement | null>(null);
  const savingsRef = useRef<HTMLDivElement | null>(null);
  const checkoutBtnRef = useRef<HTMLButtonElement | null>(null);

  const [wealth, setWealth] = useState(10000); // Start with full salary
  const [needs, setNeeds] = useState(0);
  const [wants, setWants] = useState(0);
  const [savings, setSavings] = useState(0);
  const [month, setMonth] = useState(1);
  const [log, setLog] = useState<LogEntry[]>([
    { message: "Month 1: Received salary of ₹10000 — Wealth increased by ₹10000", change: 10000 }
  ]);
  const [gameOver, setGameOver] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [hasShoppedThisMonth, setHasShoppedThisMonth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);

  const SHOP_CATALOG = [
    { id: "rent", name: "Rent", price: 3000, category: "need" as const, img: "🏠", recurring: true },
    { id: "groceries", name: "Groceries", price: 1500, category: "need" as const, img: "🛒", recurring: true },
    { id: "utilities", name: "Utilities", price: 500, category: "need" as const, img: "⚡", recurring: true },
    { id: "entertainment", name: "Entertainment", price: 800, category: "want" as const, img: "🎬", recurring: false },
    { id: "clothing", name: "Clothing", price: 1200, category: "want" as const, img: "👕", recurring: false },
    { id: "dining", name: "Dining Out", price: 600, category: "want" as const, img: "🍕", recurring: false },
    { id: "gadgets", name: "Gadgets", price: 2500, category: "want" as const, img: "📱", recurring: false },
    { id: "savings", name: "Emergency Fund", price: 1000, category: "need" as const, img: "🛡️", recurring: false }
  ];

  // Check if onboarding has been seen
  useEffect(() => {
    const onboardingSeen = localStorage.getItem('onboardingSeen');
    if (!onboardingSeen) {
      setShowOnboarding(true);
      setIsFirstTime(true);
    } else {
      setIsFirstTime(false);
      setShowOnboarding(false);
    }
  }, []);

  // Preselect recurring items when shop opens
  useEffect(() => {
    if (shopOpen) {
      const recurringItems = SHOP_CATALOG.filter(item => item.recurring);
      const initialCart: Record<string, number> = {};
      recurringItems.forEach(item => {
        initialCart[item.id] = 1;
      });
      setCart(initialCart);
    }
  }, [shopOpen]);

  // Confetti effect when game finishes
  useEffect(() => {
    if (!gameOver) return;
    // center burst
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.3 } });
    // side blasts
    setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 55, origin: { x: 0 } }), 250);
    setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 55, origin: { x: 1 } }), 250);
  }, [gameOver]);

  const paycheckAmount = 10000; // monthly salary

  const addLog = (message: string, change: number) => {
    const changeText =
      change > 0
        ? `Wealth increased by ₹${change}`
        : change < 0
        ? `Wealth decreased by ₹${Math.abs(change)}`
        : "";
    setLog((prev) => [{ message: `${message} — ${changeText}`, change }, ...prev]);
  };

  function centerOf(el: HTMLElement) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function spawnEmojiFlight(from: {x:number; y:number}, to: {x:number; y:number}, emoji = "🪙", durationMs = 800) {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.className = "coin-fx";
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    span.style.left = `${from.x}px`;
    span.style.top = `${from.y}px`;
    span.style.setProperty("--dx", `${dx}px`);
    span.style.setProperty("--dy", `${dy}px`);
    span.style.setProperty("--dur", `${durationMs}ms`);
    document.body.appendChild(span);
    window.setTimeout(() => span.remove(), durationMs + 50);
  }

  function flyEmojisToTarget(sourceEl: HTMLElement | null, targetEl: HTMLElement | null, count: number, emoji = "🪙") {
    if (!sourceEl || !targetEl) return;
    const from = centerOf(sourceEl);
    const to = centerOf(targetEl);
    const n = Math.max(1, Math.min(15, count));
    for (let i = 0; i < n; i++) {
      const jitterX = (Math.random() - 0.5) * 40;
      const jitterY = (Math.random() - 0.5) * 40;
      window.setTimeout(() => {
        spawnEmojiFlight(
          { x: from.x + jitterX, y: from.y + jitterY },
          { x: to.x, y: to.y },
          emoji,
          700 + Math.floor(Math.random() * 300)
        );
      }, i * 40);
    }
  }

  const nextMonth = () => {
    if (month > 12) return;

    if (!hasShoppedThisMonth) {
      addLog("⚠️ You must shop and checkout before advancing to the next month!", 0);
      return;
    }

    // If we just finished Month 12 (after shopping), end the year.
    if (month === 12) {
      setGameOver(true);
      addLog("🎉 Year complete! See final summary below.", 0);
      return;
    }

    const upcoming = month + 1; // label the NEW month

    // Credit salary for the new month
    setWealth(prev => prev + paycheckAmount);
    addLog(`Month ${upcoming}: Received salary of ₹${paycheckAmount}`, paycheckAmount);

    // Reset for new month + open shop
    setHasShoppedThisMonth(false);
    setShopOpen(true);

    // Random event tied to the NEW month
    if ([3, 6, 9, 12].includes(upcoming)) {
      const events = [
        { message: "🚗 Car repair expense", change: -5000 },
        { message: "🏥 Medical bill", change: -3000 },
        { message: "🎉 Won a lucky draw!", change: 4000 },
        { message: "🛍️ Shopping discount saved money", change: 2000 },
        { message: "📱 Phone broke, replacement needed", change: -8000 },
        { message: "💼 Side hustle income", change: 6000 },
      ];
      const ev = events[Math.floor(Math.random() * events.length)];
      setWealth(prev => prev + ev.change);
      addLog(`Month ${upcoming}: ${ev.message}`, ev.change);
    }

    // Finally advance the month
    setMonth(upcoming);
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
    setWealth(10000); // Start with full salary
    setNeeds(0);
    setWants(0);
    setSavings(0);
    setMonth(1);
    setLog([
      { message: "Month 1: Received salary of ₹10000 — Wealth increased by ₹10000", change: 10000 }
    ]);
    setGameOver(false);
    setHasShoppedThisMonth(false);
    setShopOpen(false);
    setCart({});
    // Reset onboarding to show "Start Playing" on restart
    setShowOnboarding(true);
    setIsFirstTime(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Restart always available */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">💰 Financial Literacy Game</h1>
            <div className="flex gap-3">
              {!gameOver && (
                <button
                  onClick={() => setShopOpen(true)}
                  disabled={hasShoppedThisMonth}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  🛒 Shop {hasShoppedThisMonth ? "(Already Shopped)" : ""}
                </button>
              )}
              <button
                onClick={() => {
                  setShowOnboarding(true);
                  setIsFirstTime(false);
                }}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                title="Help & How to Play"
              >
                ?
              </button>
              <button
                onClick={restartGame}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                🔄 Restart Game
              </button>
            </div>
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
          
          {/* Monthly Instructions */}
          {!gameOver && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-800 mb-2">📋 This Month's Steps:</h3>
              <div className="text-sm text-blue-700 space-y-1">
                {month === 1 && (
                  <>
                    <p>1️⃣ <strong>Start:</strong> You have ₹10,000 salary to begin!</p>
                    <p>2️⃣ <strong>Shop:</strong> Click "🛒 Shop" to buy essentials and wants</p>
                    <p>3️⃣ <strong>Checkout:</strong> Review your cart and click "Checkout"</p>
                    <p>4️⃣ <strong>Advance:</strong> Click "Advance to Next Month" to continue</p>
                  </>
                )}
                {month > 1 && month < 12 && (
                  <>
                    <p>1️⃣ <strong>Shop:</strong> Click "🛒 Shop" to buy items for this month</p>
                    <p>2️⃣ <strong>Checkout:</strong> Review your cart and click "Checkout"</p>
                    <p>3️⃣ <strong>Advance:</strong> Click "Advance to Next Month" to continue</p>
                  </>
                )}
                {month === 12 && (
                  <>
                    <p>1️⃣ <strong>Shop:</strong> Click "🛒 Shop" to buy items for your final month</p>
                    <p>2️⃣ <strong>Checkout:</strong> Review your cart and click "Checkout"</p>
                    <p>3️⃣ <strong>Finish:</strong> Click "Advance to Next Month" to see your final summary!</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {!gameOver ? (
          <>
            {/* Stats Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-green-600 mb-2">₹{wealth.toLocaleString()}</p>
                <p className="text-gray-600">Available Balance</p>
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
                  {month === 12 ? "🏁 Finish Game" : month < 12 ? "⏭️ Advance to Next Month" : "Year Complete"}
                </button>
              </div>

              {/* Allocation buttons removed - now handled through Shop */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => allocate("needs", 3000)}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Allocate ₹3,000 to Needs
                </button>
                <button
                  onClick={() => allocate("needs", 2000)}
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
              </div> */}
            </div>

            {/* Categories Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-center">📊 Financial Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div ref={needsRef} className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">₹{needs.toLocaleString()}</p>
                  <p className="text-blue-700">📌 Needs</p>
                </div>
                <div ref={wantsRef} className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">₹{wants.toLocaleString()}</p>
                  <p className="text-yellow-700">🎉 Wants</p>
                </div>
                <div ref={savingsRef} className="text-center p-4 bg-teal-50 rounded-lg">
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
                <p className="text-lg font-semibold text-blue-700">Total Needs</p>
                <p className="text-2xl font-bold text-blue-600">₹{needs.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-lg font-semibold text-yellow-700">Total Wants</p>
                <p className="text-2xl font-bold text-yellow-600">₹{wants.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <p className="text-lg font-semibold text-teal-700">Total Savings</p>
                <p className="text-2xl font-bold text-teal-600">₹{savings.toLocaleString()}</p>
              </div>
            </div>

            {/* Overall 50/30/20 alignment + persona */}
            {(() => {
              const totalIncome = 12 * paycheckAmount; // assumes fixed income per month
              const pNeedsTotal = pct(needs, totalIncome);
              const pWantsTotal = pct(wants, totalIncome);
              const pSavingsTotal = pct(savings, totalIncome);
              const overallPersona = budgetPersona(pNeedsTotal, pWantsTotal, pSavingsTotal);

              return (
                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 mb-6">
                  <p className="text-lg font-semibold text-indigo-800 mb-1">Overall 50/30/20 Alignment</p>
                  <p className="text-sm text-indigo-700 mb-2">
                    {ruleSummaryLine(pNeedsTotal, pWantsTotal, pSavingsTotal)}
                  </p>
                  <p className="text-indigo-900 font-bold">Persona: {overallPersona}</p>
                </div>
              );
            })()}

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

        {/* Shop Modal */}
        {shopOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🛒 Shop</h2>
                <button
                  onClick={() => setShopOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {/* Available Balance Display */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <p className="text-sm text-green-600 mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-green-700">₹{wealth.toLocaleString()}</p>
                </div>
              </div>

              {/* Shop Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {SHOP_CATALOG.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{item.img}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.recurring && <span className="text-blue-600 text-sm">(Monthly)</span>}
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        ₹{item.price.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCart(prev => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] || 0) - 1) }))}
                          disabled={(cart[item.id] || 0) === 0}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {cart[item.id] || 0}
                        </span>
                        <button
                          onClick={() => setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 active:bg-gray-400 transition-all duration-150"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t pt-4">
                {(() => {
                  const spentNeeds = SHOP_CATALOG.reduce((total, item) => {
                    return total + (item.category === "need" ? item.price * (cart[item.id] || 0) : 0);
                  }, 0);
                  const spentWants = SHOP_CATALOG.reduce((total, item) => {
                    return total + (item.category === "want" ? item.price * (cart[item.id] || 0) : 0);
                  }, 0);
                  const totalSpent = spentNeeds + spentWants;
                  const canAfford = totalSpent <= wealth;
                  
                  return (
                    <>
                      {!canAfford && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">
                            ⚠️ Insufficient funds. You need ₹{totalSpent.toLocaleString()} but only have ₹{wealth.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Cart Total</p>
                          <p className="text-2xl font-bold text-gray-800">₹{totalSpent.toLocaleString()}</p>
                          {totalSpent > 0 && (
                            <p className="text-sm text-gray-500">
                              Remaining: ₹{(wealth - totalSpent).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 active:bg-gray-500 transition-all duration-150"
                            onClick={() => setShopOpen(false)}
                          >
                            Cancel
                          </button>
                          <button
                            ref={checkoutBtnRef}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                            disabled={!canAfford || totalSpent === 0}
                            onClick={() => {
                              // Allocate purchases
                              setNeeds(n => n + spentNeeds);
                              setWants(w => w + spentWants);
                              const leftover = wealth - totalSpent;
                              setWealth(0);
                              setSavings(s => s + leftover);
                              
                              // Visual FX: fly coins from Checkout to category cards.
                              // Use a small count scaled to amounts so it feels responsive.
                              const needsCoins = Math.max(1, Math.min(12, Math.round(spentNeeds / 800)));
                              const wantsCoins = Math.max(1, Math.min(12, Math.round(spentWants / 800)));
                              const savingsCoins = Math.max(1, Math.min(12, Math.round(leftover / 800)));

                              flyEmojisToTarget(checkoutBtnRef.current, needsRef.current, needsCoins, "🪙");
                              flyEmojisToTarget(checkoutBtnRef.current, wantsRef.current, wantsCoins, "🪙");
                              flyEmojisToTarget(checkoutBtnRef.current, savingsRef.current, savingsCoins, "💵");
                              
                              // Add activity log entries for each purchased item
                              SHOP_CATALOG.forEach(item => {
                                const quantity = cart[item.id] || 0;
                                if (quantity > 0) {
                                  addLog(`Bought ${quantity} × ${item.name}`, -(item.price * quantity));
                                }
                              });
                              
                              // Add reflection summary
                              addLog(`This month you spent ₹${spentNeeds.toLocaleString()} on essentials, ₹${spentWants.toLocaleString()} on non-essentials, and saved ₹${leftover.toLocaleString()}.`, 0);
                              
                              // Mark as shopped and close modal
                              setHasShoppedThisMonth(true);
                              setShopOpen(false);
                              setCart({});
                            }}
                          >
                            Checkout
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Welcome to Financial Literacy!</h2>
                
                <div className="space-y-6 mb-8">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">🎯 Goal</h3>
                    <p className="text-blue-700 text-sm">Learn to manage your monthly salary by making smart spending and saving decisions.</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">🎮 How to Play</h3>
                    <p className="text-green-700 text-sm">Each month: Shop for essentials & wants → Checkout → Advance to next month. Make it through 12 months!</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">💰 50/30/20 Rule</h3>
                    <p className="text-purple-700 text-sm">Aim to spend 50% on needs, 30% on wants, and save 20% of your income each month.</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowOnboarding(false);
                    if (isFirstTime) {
                      localStorage.setItem('onboardingSeen', 'true');
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {isFirstTime ? "Start Playing! 🚀" : "Resume Playing! ▶️"}
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes fly {
            0%   { transform: translate(0,0) scale(1); opacity: 1; }
            60%  { opacity: 1; }
            100% { transform: translate(var(--dx), var(--dy)) scale(0.6); opacity: 0; }
          }
          .coin-fx {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
            font-size: 20px;
            animation: fly var(--dur) ease-in forwards;
            transform: translate(-50%, -50%);
            will-change: transform, opacity;
          }
        `}</style>
      </div>
    </div>
  );
}
