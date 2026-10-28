import { useState, useRef, useEffect } from "react";
import { Zap, Activity, AlertTriangle } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
export default function ReactionTest({ onNotifyAchievement }) {
  const [phase, setPhase] = useState("ready");
  const [currentMs, setCurrentMs] = useState(null);
  const [history, setHistory] = useState([]);
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem("arcade-reaction-best") || 0);
    } catch {
      return 0;
    }
  });
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const startTest = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentMs(null);
    setPhase("waiting");
    arcadeSound.playClick(440);
    const delay = 1400 + Math.random() * 2600;
    timerRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setPhase("go");
      arcadeSound.playLaser();
    }, delay);
  };
  const handleClickTarget = () => {
    if (phase === "ready" || phase === "early" || phase === "result") {
      startTest();
    } else if (phase === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("early");
      arcadeSound.playError();
    } else if (phase === "go") {
      const elapsed = Date.now() - startTimeRef.current;
      setCurrentMs(elapsed);
      setHistory((prev) => [elapsed, ...prev.slice(0, 4)]);
      setPhase("result");
      arcadeSound.playSuccess();
      const { newBest, unlockedAchievement } = recordScore("reaction-test", elapsed, 80);
      if (newBest) setBest(elapsed);
      if (unlockedAchievement && onNotifyAchievement) {
        onNotifyAchievement(unlockedAchievement);
      }
    }
  };
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  const avgMs = history.length > 0 ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;
  const getTier = (ms) => {
    if (ms < 190) return { title: "GODLIKE QUANTUM REFLEXES", color: "text-amber-400", badge: "Top 1%" };
    if (ms < 230) return { title: "F1 PILOT NEURO-SYNAPSE", color: "text-cyan-400", badge: "Top 5%" };
    if (ms < 280) return { title: "SHARP DEVELOPER SENSES", color: "text-emerald-400", badge: "Top 20%" };
    return { title: "WARMING UP THE CIRCUIT", color: "text-purple-400", badge: "Average" };
  };
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      {
    /* Intro & History */
  }
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400">REFLEX LAB / 07</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            Reaction Test<span className="text-emerald-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Measure synaptic latency down to the millisecond. Wait for the dark matrix to flash neon green, then tap immediately. Avoid false triggers.
          </p>
        </div>

        {
    /* HUD */
  }
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">LAST ATTEMPT</span>
            <span className="text-3xl font-black font-mono text-emerald-400">
              {currentMs !== null ? `${currentMs} ms` : "\u2014"}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">PERSONAL BEST</span>
            <span className="text-3xl font-black font-mono text-white">
              {best ? `${best} ms` : "\u2014"}
            </span>
          </div>
        </div>

        {
    /* Recent Attempts Graph */
  }
        {history.length > 0 && <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-white/60">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> RECENT RUNS
              </span>
              <span>AVG: {avgMs} ms</span>
            </div>
            <div className="space-y-1.5">
              {history.map((ms, idx) => <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-white/40 w-5">#{history.length - idx}</span>
                  <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden p-0.5">
                    <div
    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
    style={{ width: `${Math.min(100, Math.max(15, (450 - ms) / 3))}%` }}
  />
                  </div>
                  <span className="w-14 text-right text-white font-semibold">{ms} ms</span>
                </div>)}
            </div>
          </div>}

        <div className="text-[11px] font-mono text-white/40">
          AVERAGE HUMAN REACTION IS ~250MS · SUB-200MS UNLOCKS TROPHY
        </div>
      </div>

      {
    /* Interactive Reactor Surface */
  }
      <div className="lg:col-span-7">
        <div className="p-4 sm:p-6 rounded-3xl bg-[#0b0c16] border border-white/15 shadow-2xl shadow-emerald-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 text-xs font-mono text-white/50 border-b border-white/10">
            <span className="text-white/80 font-semibold">SYNAPSE DETECTOR</span>
            <span>HIGH FREQUENCY CLOCK</span>
          </div>

          {
    /* Glowing Reactor Target Surface */
  }
          <button
    onClick={handleClickTarget}
    className={`w-full aspect-[4/3] my-3 rounded-2xl border flex flex-col items-center justify-center p-6 text-center transition-all duration-200 relative overflow-hidden select-none active:scale-[0.99] ${phase === "ready" ? "bg-gradient-to-br from-indigo-950/70 to-slate-900 border-indigo-500/30 hover:border-indigo-400/60 shadow-lg shadow-indigo-500/10" : phase === "waiting" ? "bg-gradient-to-br from-rose-950/90 to-red-950 border-rose-500 shadow-2xl shadow-rose-500/30 cursor-wait" : phase === "go" ? "bg-gradient-to-br from-emerald-500 to-teal-400 border-white text-slate-950 shadow-[0_0_50px_rgba(52,211,153,0.7)] animate-pulse" : phase === "early" ? "bg-gradient-to-br from-rose-900/80 to-slate-950 border-rose-400 text-rose-200" : "bg-gradient-to-br from-indigo-950/90 via-slate-900 to-teal-950 border-cyan-400/60 shadow-xl shadow-cyan-500/20"}`}
  >
            {
    /* Concentric rings */
  }
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-48 h-48 rounded-full border border-current animate-ping" />
              <div className="w-80 h-80 rounded-full border border-current" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-3 rounded-2xl bg-black/30 border border-white/15 backdrop-blur-md">
                {phase === "early" ? <AlertTriangle className="w-8 h-8 text-rose-400 animate-bounce" /> : <Zap className={`w-8 h-8 ${phase === "go" ? "text-slate-950 fill-current" : "text-cyan-400"}`} />}
              </div>

              {phase === "ready" && <>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Tap to Initialize</h3>
                  <p className="text-xs text-white/60 max-w-xs">
                    When the panel flashes neon green, click or tap as fast as your reflexes allow.
                  </p>
                </>}

              {phase === "waiting" && <>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-200 animate-pulse">
                    Hold Steady...
                  </h3>
                  <p className="text-xs text-rose-300/80">Wait for the green signal. Do not click yet!</p>
                </>}

              {phase === "go" && <>
                  <h3 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
                    TAP NOW!
                  </h3>
                  <p className="text-xs font-mono font-bold text-slate-900">REACT IMMEDIATELY</p>
                </>}

              {phase === "early" && <>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-200">Too Early!</h3>
                  <p className="text-xs text-rose-300 max-w-xs">
                    You jumped the trigger before green. Tap to reset and try again.
                  </p>
                </>}

              {phase === "result" && currentMs !== null && <>
                  <div className="text-4xl sm:text-6xl font-black font-mono text-emerald-300 tracking-tight">
                    {currentMs} <span className="text-2xl text-white/70">ms</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-xs font-mono font-bold tracking-wider ${getTier(currentMs).color}`}>
                      {getTier(currentMs).title}
                    </span>
                    <p className="text-xs text-white/60">Tap anywhere to run another trial.</p>
                  </div>
                </>}
            </div>
          </button>

          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1">
            <span>NEUROMODULATION LATENCY</span>
            <span>HIGH FIDELITY TIMER</span>
            <span>TAP TO TRIGGER</span>
          </div>
        </div>
      </div>
    </div>;
}
