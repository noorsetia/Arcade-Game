import { useState, useEffect } from "react";
import { Flame, Clock, Award, ArrowRight, X } from "lucide-react";
import { arcadeSound } from "../utils/audio";
export default function DailyArenaModal({ onClose, onCompletedBonus }) {
  const [arenaData, setArenaData] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [stage1Choice, setStage1Choice] = useState(null);
  const [stage2Input, setStage2Input] = useState("");
  const [stage2Showing, setStage2Showing] = useState(true);
  const [stage3Choice, setStage3Choice] = useState(null);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  useEffect(() => {
    const fetchArena = async () => {
      try {
        const res = await fetch("/api/daily-arena");
        const data = await res.json();
        if (data.success && data.arena) {
          setArenaData(data.arena);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchArena();
  }, []);
  useEffect(() => {
    if (currentStage === 1 && stage2Showing) {
      const timer = setTimeout(() => {
        setStage2Showing(false);
        arcadeSound.playLaser();
      }, 3e3);
      return () => clearTimeout(timer);
    }
  }, [currentStage, stage2Showing]);
  const handleSubmitAll = async () => {
    let score = 0;
    if (stage1Choice === arenaData.stages[0].correct) score += 100;
    if (stage2Input.trim() === arenaData.stages[1].answer) score += 100;
    if (stage3Choice === arenaData.stages[2].correct) score += 100;
    setFinalScore(score);
    setFinished(true);
    if (score >= 200) {
      arcadeSound.playFanfare();
    } else {
      arcadeSound.playSuccess();
    }
    try {
      const res = await fetch("/api/daily-arena/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, completed: true })
      });
      const data = await res.json();
      if (data.success && onCompletedBonus) {
        onCompletedBonus(data.bonusXP);
      }
    } catch (err) {
      console.error(err);
    }
  };
  if (!arenaData) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0c0a1e] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 overflow-hidden max-h-[92vh] flex flex-col">
        {
    /* Glow */
  }
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {
    /* Header */
  }
        <div className="relative flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-400">
                DAILY SYNAPTIC GAUNTLET
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                Daily Brain Arena
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5" /> REFRESH: {arenaData.expiresInHours}H
            </span>

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
        </div>

        {
    /* Content */
  }
        <div className="overflow-y-auto pr-1 py-5 space-y-6 flex-1 scrollbar-thin">
          {finished ? <div className="py-8 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 mx-auto flex items-center justify-center text-3xl">
                🏆
              </div>
              <h4 className="text-3xl font-extrabold text-white font-display">
                Gauntlet Complete!
              </h4>
              <p className="text-sm text-white/70 max-w-sm mx-auto">
                You scored <strong className="text-amber-400 font-mono text-base">{finalScore} / 300 points</strong>. Bounty rewarded: <strong className="text-emerald-400 font-mono">+250 XP</strong>.
              </p>
              <button
    onClick={onClose}
    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-md"
  >
                Return to Arcade
              </button>
            </div> : <div className="space-y-6">
              {
    /* Stepper */
  }
              <div className="flex items-center justify-between text-xs font-mono text-white/60">
                <span className="text-amber-400 font-bold">STAGE {currentStage + 1} OF 3: {arenaData.stages[currentStage].type.toUpperCase()}</span>
                <span>+{arenaData.bountyXP} XP TOTAL BOUNTY</span>
              </div>

              {
    /* Stage 1: Logic */
  }
              {currentStage === 0 && <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-lg font-bold text-white">
                    {arenaData.stages[0].prompt}
                  </h4>
                  <div className="space-y-2">
                    {arenaData.stages[0].options.map((opt, i) => <button
    key={i}
    onClick={() => {
      arcadeSound.playClick();
      setStage1Choice(i);
    }}
    className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${stage1Choice === i ? "bg-amber-500/20 border-amber-400 text-white shadow-md" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"}`}
  >
                        {opt}
                      </button>)}
                  </div>
                  <button
    onClick={() => {
      arcadeSound.playClick();
      setCurrentStage(1);
    }}
    disabled={stage1Choice === null}
    className="w-full py-3 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300 transition-all flex items-center justify-center gap-2"
  >
                    <span>Proceed to Stage 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>}

              {
    /* Stage 2: Memory Buffer */
  }
              {currentStage === 1 && <div className="space-y-5 animate-fadeIn">
                  <h4 className="text-lg font-bold text-white">
                    {stage2Showing ? "Commit this cipher to memory (3s):" : "Reconstruct the 5-digit cipher:"}
                  </h4>

                  {stage2Showing ? <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-400 text-center text-3xl font-mono font-black text-amber-300 animate-pulse">
                      9 · 4 · 7 · 1 · 8
                    </div> : <div className="space-y-3">
                      <input
    type="text"
    maxLength={5}
    value={stage2Input}
    onChange={(e) => setStage2Input(e.target.value.replace(/\D/g, ""))}
    placeholder="Enter 5 digits"
    className="w-full p-4 rounded-xl bg-black/60 border border-white/15 text-center font-mono font-bold text-2xl text-white focus:outline-none focus:border-amber-400"
    autoFocus
  />
                      <button
    onClick={() => {
      arcadeSound.playClick();
      setCurrentStage(2);
    }}
    disabled={stage2Input.length !== 5}
    className="w-full py-3 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300 transition-all flex items-center justify-center gap-2"
  >
                        <span>Proceed to Final Stage</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>}
                </div>}

              {
    /* Stage 3: Syntax Audit */
  }
              {currentStage === 2 && <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-lg font-bold text-white">
                    {arenaData.stages[2].prompt}
                  </h4>
                  <div className="space-y-2">
                    {arenaData.stages[2].options.map((opt, i) => <button
    key={i}
    onClick={() => {
      arcadeSound.playClick();
      setStage3Choice(i);
    }}
    className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${stage3Choice === i ? "bg-amber-500/20 border-amber-400 text-white shadow-md" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"}`}
  >
                        {opt}
                      </button>)}
                  </div>
                  <button
    onClick={handleSubmitAll}
    disabled={stage3Choice === null}
    className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
  >
                    <span>Submit Gauntlet Results</span>
                    <Award className="w-4 h-4" />
                  </button>
                </div>}
            </div>}
        </div>
      </div>
    </div>;
}
