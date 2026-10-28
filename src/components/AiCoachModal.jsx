import { useState, useEffect } from "react";
import { Bot, Sparkles, Brain, Target, ShieldAlert, X, RotateCcw, Zap } from "lucide-react";
import { arcadeSound } from "../utils/audio";
export default function AiCoachModal({ stats, onClose, onLaunchDrill }) {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const fetchAnalysis = async () => {
    setLoading(true);
    arcadeSound.playClick(700);
    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            username: stats.playerName,
            level: Math.floor(stats.totalXP / 200) + 1,
            xp: stats.totalXP
          },
          highScores: stats.highScores,
          recentGames: stats.achievements.filter((a) => a.unlocked).map((a) => a.title),
          sessions: (stats.sessions || []).slice(0, 5)
        })
      });
      const data = await res.json();
      if (data.success && data.coach) {
        setFeedback(data.coach);
        arcadeSound.playPowerup();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAnalysis();
  }, []);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0c0a1e] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden max-h-[92vh] flex flex-col">
        {
    /* Glow backdrop */
  }
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {
    /* Header */
  }
        <div className="relative flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400">
                SERVER-SIDE COGNITIVE AI
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                Neural Game Coach
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
    onClick={fetchAnalysis}
    disabled={loading}
    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
    title="Re-analyze Telemetry"
  >
              <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
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
          {loading ? <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 mx-auto flex items-center justify-center text-cyan-300 animate-pulse">
                <Brain className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white font-display">
                  Auditing Cognitive Telemetry...
                </h4>
                <p className="text-xs text-white/60 max-w-sm mx-auto mt-1 font-mono">
                  Synthesizing reaction curves, mistake vectors, and strategy logs via Gemini 3.8 Flash.
                </p>
              </div>
            </div> : feedback ? <div className="space-y-5 animate-fadeIn">
              {
    /* Executive Summary */
  }
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-indigo-950/40 to-slate-900 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>EXECUTIVE COGNITIVE ASSESSMENT</span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed font-sans">
                  {feedback.assessment}
                </p>
              </div>

              {
    /* Strengths & Weaknesses Grid */
  }
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {
    /* Strengths */
  }
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> REINFORCED STRENGTHS
                  </span>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {feedback.strengths.map((str, idx) => <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{str}</span>
                      </li>)}
                  </ul>
                </div>

                {
    /* Weaknesses */
  }
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/30 space-y-2">
                  <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> LATENCY & RISK VECTORS
                  </span>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {feedback.weaknesses.map((w, idx) => <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">!</span>
                        <span>{w}</span>
                      </li>)}
                  </ul>
                </div>
              </div>

              {
    /* Recommended Daily Training Drill */
  }
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-purple-950/50 border border-indigo-400/40 space-y-2">
                <span className="text-xs font-mono text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-300" /> RECOMMENDED TRAINING DRILL
                </span>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-sans">
                  {feedback.recommendedDrill}
                </p>
              </div>

              {
    /* Cyber Quote */
  }
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center font-mono text-xs text-white/50 italic">
                "{feedback.cyberQuote}"
              </div>
            </div> : null}
        </div>

        {
    /* Footer */
  }
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40">Powered by server-side Gemini 3.8 Flash</span>
          <button
    onClick={() => {
      arcadeSound.playClick();
      onClose();
    }}
    className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-transform active:scale-95"
  >
            Acknowledge Debrief
          </button>
        </div>
      </div>
    </div>;
}
