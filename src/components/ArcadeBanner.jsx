import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Sparkles, X } from "lucide-react";
import { arcadeSound } from "../utils/audio";
export default function ArcadeBanner({
  type,
  title,
  message,
  icon = "\u{1F3C6}",
  onClose
}) {
  useEffect(() => {
    arcadeSound.playFanfare();
    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.15 },
        colors: ["#818cf8", "#38bdf8", "#34d399", "#f472b6", "#fbbf24"],
        disableForReducedMotion: true
      });
    } catch {
    }
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-slideInRight">
      <div className="p-4 rounded-2xl bg-[#140e2b]/95 border-2 border-indigo-400/80 shadow-2xl shadow-indigo-500/30 backdrop-blur-xl flex items-start gap-3.5 relative overflow-hidden">
        {
    /* Glow sheen */
  }
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/15 to-pink-500/10 pointer-events-none" />

        <div className="text-3xl shrink-0 p-2 rounded-xl bg-white/10 border border-white/15">
          {icon}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-indigo-300">
            {type === "achievement" ? <>
                <Sparkles className="w-3 h-3 text-amber-400" /> ACHIEVEMENT UNLOCKED!
              </> : <>
                <Trophy className="w-3 h-3 text-emerald-400" /> NEW HIGH SCORE RECORD!
              </>}
          </div>
          <h4 className="text-sm font-bold text-white truncate mt-0.5">{title}</h4>
          <p className="text-xs text-white/70 line-clamp-2 mt-0.5">{message}</p>
        </div>

        <button
    onClick={onClose}
    className="absolute top-3 right-3 text-white/40 hover:text-white p-1"
  >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>;
}
