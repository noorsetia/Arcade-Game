import { useState, useEffect } from "react";
import { Trophy, Crown, X } from "lucide-react";
import { arcadeSound } from "../utils/audio";
export default function LeaderboardModal({ onClose, onLaunchGame }) {
  const [selectedGame, setSelectedGame] = useState("all");
  const [timeframe, setTimeframe] = useState("all-time");
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboards?game=${selectedGame}&timeframe=${timeframe}`);
        const data = await res.json();
        if (data.success && data.leaderboards) {
          setLeaderboards(data.leaderboards);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedGame, timeframe]);
  const gameFilters = [
    { id: "all", label: "Composite XP" },
    { id: "neon-maze", label: "Neon Maze" },
    { id: "cyber-hacker", label: "Cyber Hacker" },
    { id: "memory-matrix", label: "Memory Matrix" },
    { id: "gravity-flip", label: "Gravity Flip" },
    { id: "quantum-shift", label: "Quantum Shift" },
    { id: "boss-rush", label: "Boss Rush" },
    { id: "snake", label: "Neon Snake" },
    { id: "space-shooter", label: "Space Shooter" },
    { id: "hyper-pong", label: "Hyper Pong" },
    { id: "2048", label: "2048 Neon" },
    { id: "reaction-test", label: "Reaction Test" },
    { id: "number-recall", label: "Number Recall" },
    { id: "memory", label: "Memory Pairs" },
    { id: "code-quiz", label: "Code Quiz" },
    { id: "brain-teaser", label: "Brain Teasers" }
  ];
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0c0a1e] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 overflow-hidden max-h-[92vh] flex flex-col">
        {
    /* Glow */
  }
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {
    /* Header */
  }
        <div className="relative flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 font-black">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-400">
                GLOBAL ARCADE STANDINGS
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                Hall of Legends
              </h3>
            </div>
          </div>

          <button
    onClick={() => {
      arcadeSound.playClick();
      onClose();
    }}
    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Controls: Timeframe & Game Segment */
  }
        <div className="py-4 space-y-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            {
    /* Game tabs */
  }
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-black/40 rounded-xl border border-white/10 scrollbar-none">
              {gameFilters.map((gf) => <button
    key={gf.id}
    onClick={() => {
      arcadeSound.playClick();
      setSelectedGame(gf.id);
    }}
    className={`px-3 py-1 text-xs font-mono rounded-lg transition-all whitespace-nowrap ${selectedGame === gf.id ? "bg-amber-400 text-slate-950 font-bold shadow-sm" : "text-white/60 hover:text-white"}`}
  >
                  {gf.label}
                </button>)}
            </div>

            {
    /* Timeframe selector */
  }
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 text-xs font-mono">
              <button
    onClick={() => {
      arcadeSound.playClick();
      setTimeframe("all-time");
    }}
    className={`px-2.5 py-1 rounded-lg transition-colors ${timeframe === "all-time" ? "bg-white/15 text-white font-bold" : "text-white/40 hover:text-white"}`}
  >
                All-Time
              </button>
              <button
    onClick={() => {
      arcadeSound.playClick();
      setTimeframe("weekly");
    }}
    className={`px-2.5 py-1 rounded-lg transition-colors ${timeframe === "weekly" ? "bg-white/15 text-white font-bold" : "text-white/40 hover:text-white"}`}
  >
                Weekly
              </button>
            </div>
          </div>
        </div>

        {
    /* Roster List */
  }
        <div className="overflow-y-auto pr-1 py-4 space-y-2 flex-1 scrollbar-thin">
          {loading ? <div className="py-12 text-center text-xs font-mono text-white/40 animate-pulse">
              Syncing global leaderboard records...
            </div> : leaderboards.map((entry) => {
    const isTop1 = entry.rank === 1;
    const isTop2 = entry.rank === 2;
    const isTop3 = entry.rank === 3;
    return <div
      key={entry.rank}
      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${entry.isCurrentPlayer ? "bg-gradient-to-r from-amber-950/40 via-indigo-950/40 to-slate-900 border-amber-400/80 shadow-lg shadow-amber-500/10" : isTop1 ? "bg-amber-500/10 border-amber-500/40" : "bg-white/[0.02] border-white/5 hover:border-white/15"}`}
    >
                  <div className="flex items-center gap-3">
                    {
      /* Rank Badge */
    }
                    <div
      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${isTop1 ? "bg-amber-400 text-slate-950 shadow-[0_0_12px_#fbbf24]" : isTop2 ? "bg-slate-300 text-slate-950" : isTop3 ? "bg-amber-700 text-white" : "bg-white/5 text-white/50"}`}
    >
                      {isTop1 ? <Crown className="w-4 h-4 fill-current" /> : `#${entry.rank}`}
                    </div>

                    <span className="text-xl p-1 rounded-lg bg-black/40 border border-white/5">
                      {entry.avatar}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white font-display">
                          {entry.username}
                        </span>
                        {entry.isCurrentPlayer && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-400 text-slate-950 font-bold">
                            YOU
                          </span>}
                      </div>
                      <span className="text-[10px] font-mono text-white/40">{entry.tier}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black font-mono text-amber-300">
                      {entry.score} {selectedGame === "reaction-test" ? "ms" : "pts"}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 block">{entry.date}</span>
                  </div>
                </div>;
  })}
        </div>

        {
    /* Footer */
  }
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40">Anti-cheat checksum verification active</span>
          <button
    onClick={() => {
      arcadeSound.playClick();
      onClose();
    }}
    className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition-transform active:scale-95"
  >
            Close Standings
          </button>
        </div>
      </div>
    </div>;
}
