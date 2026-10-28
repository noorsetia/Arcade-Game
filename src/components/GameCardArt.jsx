export default function GameCardArt({ id }) {
  if (id === "neon-maze") {
    return <div className="relative w-full h-full bg-[#050814] flex items-center justify-center overflow-hidden">
        {
      /* Neon maze path lines */
    }
        <div className="absolute inset-4 border-2 border-cyan-500/40 rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 border-t-2 border-r-2 border-cyan-400/80 rounded-tl-lg" />
          <div className="w-16 h-16 border-b-2 border-l-2 border-cyan-400/80 rounded-br-lg -ml-4" />
        </div>
        {
      /* Glowing Player in maze */
    }
        <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_15px_#22d3ee] flex items-center justify-center z-10 animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        {
      /* Goal Beacon */
    }
        <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-ping" />
      </div>;
  }
  if (id === "memory-matrix") {
    return <div className="relative w-full h-full bg-[#070514] flex items-center justify-center p-4 overflow-hidden">
        <div className="grid grid-cols-3 gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse" />
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15" />
          <div className="w-7 h-7 rounded-lg bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse" />
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15" />
          <div className="w-7 h-7 rounded-lg bg-emerald-400 shadow-[0_0_12px_#34d399] flex items-center justify-center text-slate-950 font-bold text-xs">
            ✓
          </div>
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15" />
        </div>
      </div>;
  }
  if (id === "gravity-flip") {
    return <div className="relative w-full h-full bg-[#060515] flex items-center justify-between px-6 overflow-hidden">
        {
      /* Rails */
    }
        <div className="absolute top-3 left-0 right-0 h-1 bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
        <div className="absolute bottom-3 left-0 right-0 h-1 bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
        {
      /* Obstacle spike */
    }
        <div className="absolute bottom-3 right-14 w-5 h-8 bg-rose-500 shadow-[0_0_10px_#f43f5e] rounded-t" />
        {
      /* Craft inverting */
    }
        <div className="w-6 h-6 rotate-45 bg-sky-300 shadow-[0_0_15px_#38bdf8] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        {
      /* Gravity arrow */
    }
        <div className="text-xl text-purple-400 animate-bounce">⇅</div>
      </div>;
  }
  if (id === "quantum-shift") {
    return <div className="relative w-full h-full bg-[#080516] flex items-center justify-center gap-2 p-4 overflow-hidden">
        <div className="w-8 h-10 rounded-lg bg-cyan-500/30 border border-cyan-400 shadow-[0_0_10px_#22d3ee] flex items-center justify-center text-xs font-mono text-cyan-200">
          Ψ1
        </div>
        <div className="text-sm text-white/40">➔</div>
        <div className="w-8 h-10 rounded-lg bg-fuchsia-500/30 border border-fuchsia-400 shadow-[0_0_10px_#e879f9] flex items-center justify-center text-xs font-mono text-fuchsia-200">
          Ψ2
        </div>
        <div className="text-sm text-white/40">➔</div>
        <div className="w-8 h-10 rounded-lg bg-amber-500/30 border border-amber-400 shadow-[0_0_10px_#fbbf24] flex items-center justify-center text-xs font-mono text-amber-200">
          Ψ3
        </div>
      </div>;
  }
  if (id === "boss-rush") {
    return <div className="relative w-full h-full bg-[#050411] flex flex-col items-center justify-center p-3 overflow-hidden">
        <div className="w-14 h-9 rounded-lg bg-rose-600 border border-rose-400 shadow-[0_0_20px_#f43f5e] flex items-center justify-center text-xs text-white font-mono font-bold">
          OVERLORD
        </div>
        <div className="flex gap-4 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
        </div>
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-cyan-400 mt-2 shadow-[0_0_10px_#22d3ee]" />
      </div>;
  }
  if (id === "snake") {
    return <div className="relative w-full h-full bg-[#080c14] flex items-center justify-center overflow-hidden">
        <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: "linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)",
        backgroundSize: "16px 16px"
      }}
    />
        <div className="flex items-center gap-1.5 z-10">
          <div className="w-5 h-5 rounded-md bg-emerald-400 shadow-[0_0_12px_#34d399] flex items-center justify-center text-[10px] text-slate-950 font-bold">
            ◆
          </div>
          <div className="w-4 h-4 rounded-md bg-emerald-500/80 shadow-[0_0_8px_#10b981]" />
          <div className="w-4 h-4 rounded-md bg-emerald-600/70" />
          <div className="w-3.5 h-3.5 rounded-md bg-emerald-700/50" />
        </div>
        <div className="absolute right-8 top-6 w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-ping" />
        <div className="absolute right-8 top-6 w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
      </div>;
  }
  if (id === "space-shooter") {
    return <div className="relative w-full h-full bg-[#060914] flex items-center justify-center overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => <div
      key={i}
      className="absolute rounded-full bg-sky-300 opacity-60"
      style={{
        width: i % 3 === 0 ? "3px" : "2px",
        height: i % 3 === 0 ? "3px" : "2px",
        left: `${i * 29 % 94}%`,
        top: `${i * 47 % 86}%`
      }}
    />)}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[24px] border-b-cyan-400 drop-shadow-[0_0_12px_#38bdf8]" />
          <div className="w-2 h-3 bg-amber-400 rounded-b-full shadow-[0_0_8px_#f59e0b] animate-pulse" />
        </div>
        <div className="absolute right-10 top-5 w-7 h-7 rounded-full bg-purple-950 border-2 border-purple-400 shadow-[0_0_15px_#a855f7]" />
      </div>;
  }
  if (id === "code-quiz") {
    return <div className="relative w-full h-full bg-[#080718] p-4 flex flex-col justify-center font-mono text-[11px] overflow-hidden">
        <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 text-white/40 text-[9px]">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="ml-1 text-white/60">quiz.js</span>
        </div>
        <div className="pt-2 text-indigo-300 space-y-0.5 leading-relaxed">
          <p><span className="text-purple-400">const</span> score = <span className="text-amber-400">100</span>;</p>
          <p><span className="text-cyan-400">if</span> (curious) &#123;</p>
          <p className="pl-3"><span className="text-emerald-400">learnMastery</span>();</p>
          <p>&#125;</p>
        </div>
      </div>;
  }
  if (id === "memory") {
    return <div className="relative w-full h-full bg-[#0d091e] flex items-center justify-center gap-2.5 p-3 overflow-hidden">
        <div className="w-11 h-14 rounded-xl bg-purple-900/60 border border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center text-xl text-cyan-300">
          ⚛
        </div>
        <div className="w-11 h-14 rounded-xl bg-purple-950/80 border border-white/15 flex items-center justify-center text-xs font-mono text-white/30">
          N.
        </div>
        <div className="w-11 h-14 rounded-xl bg-purple-900/60 border border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center text-xl text-cyan-300">
          ⚛
        </div>
      </div>;
  }
  if (id === "brain-teaser") {
    return <div className="relative w-full h-full bg-[#12081c] flex items-center justify-center overflow-hidden">
        <div className="text-4xl font-extrabold text-pink-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]">
          ?
        </div>
        <span className="absolute left-7 top-6 text-xl text-purple-400/60 font-mono">∑</span>
        <span className="absolute right-8 bottom-6 text-xl text-pink-300/60 font-mono">∴</span>
        <span className="absolute right-12 top-7 text-sm text-cyan-300/60 font-mono">∎</span>
      </div>;
  }
  if (id === "2048") {
    return <div className="relative w-full h-full bg-[#080b18] flex items-center justify-center p-3 overflow-hidden">
        <div className="grid grid-cols-3 gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-900 border border-indigo-400 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
            8
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-700 border border-amber-400 text-white font-mono font-bold text-xs flex items-center justify-center">
            64
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-600 border border-rose-300 text-white font-mono font-bold text-xs flex items-center justify-center shadow-[0_0_10px_#f43f5e]">
            256
          </div>
        </div>
      </div>;
  }
  if (id === "reaction-test") {
    return <div className="relative w-full h-full bg-[#071311] flex items-center justify-center overflow-hidden">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/80 shadow-[0_0_25px_#10b981] flex items-center justify-center text-2xl text-emerald-300 animate-pulse">
          ⚡
        </div>
        <div className="absolute w-24 h-24 rounded-full border border-emerald-400/20" />
      </div>;
  }
  if (id === "cyber-hacker") {
    return <div className="relative w-full h-full bg-[#050906] p-4 flex flex-col justify-center font-mono text-[10px] text-emerald-400 overflow-hidden">
        <div className="flex items-center gap-1.5 pb-1 border-b border-emerald-500/30 text-[9px] text-emerald-500/60">
          <span>PORT: 22</span>
          <span>·</span>
          <span>MEM_DUMP</span>
        </div>
        <div className="pt-2 space-y-1">
          <p className="text-emerald-500/50">0xF4A2: .!.@#SYNTAX#.</p>
          <p className="text-emerald-300 font-bold bg-emerald-950/60 p-0.5 rounded border border-emerald-500/40">
            0xF4B0: [CIPHER_KEY]
          </p>
          <p className="text-emerald-500/50">0xF4C0: &lt;RESET_DUD&gt;</p>
        </div>
      </div>;
  }
  if (id === "hyper-pong") {
    return <div className="relative w-full h-full bg-[#060814] flex items-center justify-between px-6 overflow-hidden">
        <div className="w-2.5 h-12 rounded bg-cyan-400 shadow-[0_0_12px_#38bdf8]" />
        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_15px_#38bdf8] animate-ping" />
        <div className="w-2.5 h-12 rounded bg-rose-500 shadow-[0_0_12px_#f43f5e]" />
      </div>;
  }
  return <div className="relative w-full h-full bg-[#120a06] flex items-center justify-center gap-2 p-3 overflow-hidden">
      {["7", "2", "9", "4"].map((digit, idx) => <div
    key={idx}
    className="w-8 h-10 rounded-lg bg-orange-950/70 border border-orange-500/80 shadow-[0_0_10px_rgba(249,115,22,0.3)] flex items-center justify-center text-lg font-bold font-mono text-orange-200"
  >
          {digit}
        </div>)}
    </div>;
}
