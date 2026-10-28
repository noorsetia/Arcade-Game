import { useEffect } from "react";
import {
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Zap,
  Award,
  CheckCircle,
  Clock,
  Gauge,
  X
} from "lucide-react";
import confetti from "canvas-confetti";
import { arcadeSound } from "../utils/audio";
export default function GameResultModal({ session, onPlayAgain, onClose }) {
  if (!session) return null;
  useEffect(() => {
    if (session.isNewBest) {
      arcadeSound.playFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.55 },
          colors: ["#22d3ee", "#818cf8", "#c084fc", "#f59e0b"]
        });
      } catch {
      }
    } else {
      arcadeSound.playSuccess();
    }
  }, [session]);
  const minutes = Math.floor(session.durationSeconds / 60);
  const seconds = session.durationSeconds % 60;
  const formattedDuration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-[#09071c] border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/60 text-white space-y-5 overflow-hidden">
        {
    /* Ambient background glows */
  }
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {
    /* Close Button */
  }
        <button
    onClick={onClose}
    className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
    aria-label="Close Results"
  >
          <X className="w-4 h-4" />
        </button>

        {
    /* Header */
  }
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            MISSION COMPLETED · {session.gameName}
          </span>
          <h2 className="text-2xl font-black font-display tracking-tight text-white">
            Run Telemetry
          </h2>
        </div>

        {
    /* Score & Personal Best Display */
  }
        <div className="p-5 rounded-2xl bg-gradient-to-b from-black/60 to-black/30 border border-white/10 text-center space-y-2 relative overflow-hidden">
          {session.isNewBest && <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold animate-pulse shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
              <span>NEW PERSONAL BEST!</span>
            </div>}

          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
              FINAL SCORE
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              {session.score.toLocaleString()}
            </div>
          </div>

          {session.previousBest > 0 && !session.isNewBest && <p className="text-[11px] font-mono text-white/45">
              Personal Best: {session.previousBest.toLocaleString()}
            </p>}

          {session.isNewBest && session.previousBest > 0 && <p className="text-[11px] font-mono text-emerald-400 font-semibold">
              Previous Record: {session.previousBest.toLocaleString()}
            </p>}

          {
    /* Server Confirmation vs Local Guest Status */
  }
          <div className="pt-1 flex items-center justify-center">
            {session.isServerConfirmed !== false ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>SERVER CONFIRMED</span>
              </span> : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>LOCAL RECORD (SYNC QUEUED)</span>
              </span>}
          </div>
        </div>

        {
    /* XP Bounty & Progression Strip */
  }
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-cyan-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">XP Bounty Awarded</span>
              <span className="text-[10px] font-mono text-white/50">Progression Applied</span>
            </div>
          </div>
          <span className="text-sm font-mono font-black text-cyan-300">
            +{session.xpAwarded} XP
          </span>
        </div>

        {
    /* Unlocked Achievements in this Run */
  }
        {session.achievementsUnlocked && session.achievementsUnlocked.length > 0 && <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-amber-300 tracking-wider font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Trophy Unlocked!</span>
            </span>
            {session.achievementsUnlocked.map((ach) => <div
    key={ach.id}
    className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center gap-3 animate-scaleUp"
  >
                <span className="text-2xl">{ach.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">{ach.title}</div>
                  <div className="text-[11px] text-white/60 leading-tight">{ach.desc}</div>
                </div>
              </div>)}
          </div>}

        {
    /* Run Telemetry Metrics */
  }
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-white/70">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Time: {formattedDuration}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-white/70">
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <span>Tier: {session.difficulty}</span>
          </div>
        </div>

        {
    /* Action Buttons */
  }
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
    onClick={() => {
      arcadeSound.playClick();
      onClose();
    }}
    className="w-full py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center justify-center gap-2"
  >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Arcade Menu</span>
          </button>

          <button
    onClick={() => {
      arcadeSound.playPowerup();
      onPlayAgain();
    }}
    className="w-full py-3 rounded-xl font-black text-xs bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
  >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>;
}
