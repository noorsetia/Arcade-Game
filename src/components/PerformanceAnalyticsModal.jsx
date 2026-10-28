import { useState, useEffect } from "react";
import { Activity, Clock, BarChart3, X, Zap } from "lucide-react";
import { arcadeSound } from "../utils/audio";
export default function PerformanceAnalyticsModal({ onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        if (json.success && json.stats) {
          setData(json.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0c0a1e] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden max-h-[92vh] flex flex-col">
        {
    /* Glow */
  }
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {
    /* Header */
  }
        <div className="relative flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/30 font-black">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400">
                COGNITIVE PERFORMANCE TELEMETRY
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                Player Analytics
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
    /* Body Content */
  }
        <div className="overflow-y-auto pr-1 py-5 space-y-6 flex-1 scrollbar-thin">
          {loading ? <div className="py-12 text-center text-xs font-mono text-white/40 animate-pulse">
              Computing cognitive performance telemetry...
            </div> : data ? <div className="space-y-6 animate-fadeIn">
              {
    /* Category Mastery Bars */
  }
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" /> DISCIPLINE PROFICIENCY MATRIX
                  </span>
                  <span className="text-xs font-mono text-white/50">OUT OF 100</span>
                </div>

                <div className="space-y-2.5">
                  {data.categoryMastery.map((cat) => <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/80 font-medium">{cat.category}</span>
                        <span className="font-mono font-bold text-cyan-300">{cat.score}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/5">
                        <div
    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
    style={{ width: `${cat.score}%` }}
  />
                      </div>
                    </div>)}
                </div>
              </div>

              {
    /* Reaction Latency Progression */
  }
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> REACTION LATENCY CURVE (LOWER IS FASTER)
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">184 ms BEST</span>
                </div>

                <div className="flex items-end justify-between gap-3 h-28 pt-4 px-2 bg-black/40 rounded-xl border border-white/5">
                  {data.reactionHistory.map((ms, idx) => {
    const heightPercent = Math.max(20, Math.min(100, ms / 300 * 100));
    return <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <span className="text-[10px] font-mono text-white/70">{ms}</span>
                        <div
      className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.3)] transition-all"
      style={{ height: `${heightPercent}%` }}
    />
                        <span className="text-[9px] font-mono text-white/40">#{idx + 1}</span>
                      </div>;
  })}
                </div>
              </div>

              {
    /* Playtime Distribution */
  }
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> TIME ALLOCATION
                  </span>
                  <span className="text-xs font-mono text-white/50">48 MINS LOGGED</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {data.timeDistribution.map((item) => <div key={item.game} className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[11px] text-white/60 truncate block">{item.game}</span>
                      <span className="text-sm font-bold font-mono text-purple-300 mt-0.5 block">
                        {item.minutes}m
                      </span>
                    </div>)}
                </div>
              </div>
            </div> : null}
        </div>

        {
    /* Footer */
  }
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40">Real-time session analytics synced</span>
          <button
    onClick={() => {
      arcadeSound.playClick();
      onClose();
    }}
    className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-transform active:scale-95"
  >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>;
}
