import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Sparkles } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
const TECH_PAIRS = [
  { symbol: "\u269B", label: "React", color: "#38bdf8" },
  { symbol: "TS", label: "TypeScript", color: "#60a5fa" },
  { symbol: "\u26A1", label: "Vite", color: "#facc15" },
  { symbol: "\u{1F980}", label: "Rust", color: "#f97316" },
  { symbol: "\u{1F40D}", label: "Python", color: "#34d399" },
  { symbol: "\u25B2", label: "Next.js", color: "#ffffff" },
  { symbol: "\u{1F433}", label: "Docker", color: "#38bdf8" },
  { symbol: "\u25C8", label: "GraphQL", color: "#f43f5e" }
];
function generateShuffledCards() {
  const deck = [];
  let id = 0;
  TECH_PAIRS.forEach((item) => {
    deck.push({ id: id++, ...item });
    deck.push({ id: id++, ...item });
  });
  return deck.sort(() => Math.random() - 0.5);
}
export default function MemoryMatch({ onNotifyAchievement }) {
  const [cards, setCards] = useState(generateShuffledCards);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(1);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem("arcade-memory-best") || 0);
    } catch {
      return 0;
    }
  });
  const won = matched.length === cards.length;
  useEffect(() => {
    if (flipped.length !== 2) return;
    const [firstIdx, secondIdx] = flipped;
    const card1 = cards[firstIdx];
    const card2 = cards[secondIdx];
    const isMatch = card1.symbol === card2.symbol;
    const timer = setTimeout(() => {
      if (isMatch) {
        arcadeSound.playTileMerge();
        setMatched((m) => {
          const next = [...m, firstIdx, secondIdx];
          if (next.length === cards.length) {
            arcadeSound.playFanfare();
            const { newBest, unlockedAchievement } = recordScore("memory", moves + 1, 100);
            if (newBest) setBest(moves + 1);
            if (unlockedAchievement && onNotifyAchievement) {
              onNotifyAchievement(unlockedAchievement);
            }
          }
          return next;
        });
        setCombo((c) => c + 1);
      } else {
        arcadeSound.playError();
        setCombo(1);
      }
      setFlipped([]);
    }, isMatch ? 500 : 900);
    return () => clearTimeout(timer);
  }, [flipped, cards, moves, onNotifyAchievement]);
  const handleCardClick = (idx) => {
    if (!started) setStarted(true);
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    arcadeSound.playCardFlip();
    setFlipped((f) => [...f, idx]);
    if (flipped.length === 1) {
      setMoves((m) => m + 1);
    }
  };
  const handleReset = () => {
    setCards(generateShuffledCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setCombo(1);
    setStarted(false);
    arcadeSound.playSuccess();
  };
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      {
    /* Intro */
  }
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-purple-400">FOCUS & PATTERN / 04</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            Memory Matrix<span className="text-purple-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Flip cyber cards to identify tech pairs. Form streaks to build your combo multiplier and solve the board in the fewest moves possible.
          </p>
        </div>

        {
    /* HUD */
  }
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">MOVES</span>
            <span className="text-2xl font-black font-mono text-purple-400">
              {moves.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">PAIRS FOUND</span>
            <span className="text-2xl font-black font-mono text-white">
              {matched.length / 2}/{TECH_PAIRS.length}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">BEST RUN</span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              {best ? `${best} moves` : "\u2014"}
            </span>
          </div>
        </div>

        {
    /* Combo Multiplier */
  }
        {combo > 1 && <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-300 font-mono animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>STREAK ACTIVE: {combo}x COMBO MULTIPLIER!</span>
          </div>}

        {
    /* Action button */
  }
        <div>
          <button
    onClick={handleReset}
    className="w-full px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
  >
            <RotateCcw className="w-4 h-4" /> Reset Board
          </button>
        </div>

        <div className="text-[11px] font-mono text-white/40">
          TOUCH OR CLICK ANY CARD TO FLIP · 16 CARDS · 8 TECH PAIRS
        </div>
      </div>

      {
    /* Grid Viewport */
  }
      <div className="lg:col-span-7">
        <div className="p-4 sm:p-6 rounded-3xl bg-[#0b0c16] border border-white/15 shadow-2xl shadow-purple-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 text-xs font-mono text-white/50 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span
    className={`w-2 h-2 rounded-full ${won ? "bg-emerald-400" : started ? "bg-purple-400" : "bg-slate-400"}`}
  />
              <span className="text-white/80 font-semibold">
                {won ? "ALL PAIRS SECURED" : started ? "SCAN IN PROGRESS" : "READY TO PLAY"}
              </span>
            </div>
            <span>PAIRS: 8</span>
          </div>

          <div className="grid grid-cols-4 gap-3 my-4 aspect-square">
            {cards.map((card, idx) => {
    const isOpen = flipped.includes(idx) || matched.includes(idx);
    const isMatched = matched.includes(idx);
    return <button
      key={card.id}
      onClick={() => handleCardClick(idx)}
      disabled={isOpen}
      className={`relative w-full h-full rounded-2xl perspective-1000 transition-all duration-300 select-none ${isOpen ? "rotate-y-180" : "hover:-translate-y-1 hover:border-purple-400/50"}`}
      style={{
        transformStyle: "preserve-3d"
      }}
      aria-label={isOpen ? card.label : "Hidden card"}
    >
                  {
      /* Card Front (Face) */
    }
                  <div
      className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 ${isMatched ? "bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(52,211,153,0.3)]" : isOpen ? "bg-[#151128] border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-[#100d22] border-white/10 hover:border-white/20"}`}
    >
                    {isOpen ? <div className="flex flex-col items-center gap-1 animate-scaleUp">
                        <span className="text-3xl sm:text-4xl" style={{ color: card.color }}>
                          {card.symbol}
                        </span>
                        <span className="text-[10px] font-mono text-white/60 tracking-wider">
                          {card.label}
                        </span>
                      </div> : <div className="text-white/20 font-mono font-bold text-lg group-hover:text-white/40">
                        N<span className="text-purple-400">.</span>
                      </div>}
                  </div>
                </button>;
  })}
          </div>

          {won && <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 flex items-center justify-between text-white animate-fadeIn">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm">Memory Mastered!</h4>
                  <p className="text-xs text-white/70">Found all 8 pairs in {moves} moves.</p>
                </div>
              </div>
              <button
    onClick={handleReset}
    className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 transition-all"
  >
                Play Again
              </button>
            </div>}

          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1">
            <span>FLIP 2 IDENTICAL CARDS</span>
            <span>MEMORY TRAINING</span>
            <span>FEWER MOVES = HIGHER XP</span>
          </div>
        </div>
      </div>
    </div>;
}
