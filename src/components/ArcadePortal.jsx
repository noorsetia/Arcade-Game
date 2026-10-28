import { useState, useRef } from "react";
import { Play, Zap } from "lucide-react";
import { arcadeSound } from "../utils/audio";
export default function ArcadePortal({
  onLaunch,
  featuredTitle = "Neon Maze"
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };
  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };
  return <div
    ref={containerRef}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    onClick={() => {
      arcadeSound.playPowerup();
      onLaunch();
    }}
    className="relative w-full max-w-[440px] aspect-square mx-auto flex items-center justify-center cursor-pointer select-none group perspective-1000"
    title="Enter Neon Arcade Portal"
  >
      {
    /* Background radial ambient illumination */
  }
      <div
    className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/25 via-purple-600/25 to-cyan-400/25 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110"
    style={{
      transform: `translate(${mousePos.x * 14}px, ${mousePos.y * 14}px)`
    }}
  />

      {
    /* Main 3D Tilting Portal Rig */
  }
      <div
    className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
    style={{
      transform: `rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`
    }}
  >
        {
    /* Layer 1: Outermost dashed orbital ring */
  }
        <div className="absolute w-[94%] h-[94%] rounded-full border border-cyan-500/20 border-dashed animate-spin-slow pointer-events-none" />

        {
    /* Layer 2: Cardinal nodes on orbital track */
  }
        <div className="absolute w-[94%] h-[94%] rounded-full animate-spin-slow pointer-events-none">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_12px_#818cf8]" />
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_#c084fc]" />
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-pink-400 shadow-[0_0_12px_#f472b6]" />
        </div>

        {
    /* Layer 3: Second Ring with tick marks & counter-rotation */
  }
        <div className="absolute w-[78%] h-[78%] rounded-full border-2 border-indigo-500/30 border-t-cyan-400/80 border-b-purple-400/80 animate-spin-reverse-slow pointer-events-none shadow-[0_0_25px_rgba(99,102,241,0.2)]" />

        {
    /* Layer 4: Deep Singularity Core Chamber */
  }
        <div className="relative w-[62%] h-[62%] rounded-full bg-gradient-to-b from-[#09081d] via-[#050414] to-[#02020a] border-2 border-white/15 p-4 flex flex-col items-center justify-center shadow-2xl shadow-indigo-950/80 overflow-hidden group-hover:border-cyan-400/60 transition-colors duration-500">
          {
    /* Internal neon horizon grid */
  }
          <div
    className="absolute inset-0 opacity-25 pointer-events-none"
    style={{
      backgroundImage: "linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      perspective: "180px",
      transform: "rotateX(55deg) translateY(20%)"
    }}
  />

          {
    /* Central floating Hologram Crystal / Cyber Glyph */
  }
          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2 group-hover:scale-105 transition-transform duration-300">
            {
    /* Holographic Glowing Emblem */
  }
            <div className="relative w-16 h-16 flex items-center justify-center">
              {
    /* Outer diamond frame */
  }
              <div className="absolute inset-0 rotate-45 rounded-xl bg-gradient-to-tr from-cyan-500/30 via-indigo-500/40 to-purple-500/30 border border-cyan-300/60 shadow-[0_0_25px_rgba(34,211,238,0.5)] group-hover:shadow-[0_0_35px_rgba(34,211,238,0.8)] transition-all duration-300" />
              {
    /* Inner energetic core */
  }
              <div className="relative z-10 w-8 h-8 rotate-45 bg-white/95 rounded-sm flex items-center justify-center shadow-[0_0_15px_#ffffff]">
                <Play className="w-4 h-4 text-slate-950 -rotate-45 ml-0.5 fill-current" />
              </div>
            </div>

            {
    /* Portal Labels */
  }
            <div className="space-y-0.5 pt-1">
              <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-bold flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                NEURAL PORTAL
              </span>
              <p className="text-xs font-mono text-white/90 font-bold group-hover:text-cyan-200 transition-colors">
                ENTER ARCADE
              </p>
            </div>
          </div>

          {
    /* Core pulse ripple */
  }
          <div className="absolute inset-3 rounded-full border border-cyan-400/20 animate-pulse pointer-events-none" />
        </div>

        {
    /* Floating Telemetric Satellite Chips */
  }
        {
    /* Chip 1: Top-Right Status */
  }
        <div
    className="absolute top-4 right-1 sm:right-3 z-20 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-2 shadow-lg shadow-cyan-950/40 pointer-events-none transition-transform duration-500"
    style={{
      transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`
    }}
  >
          <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>60 FPS HARDWARE ACCEL</span>
        </div>

        {
    /* Chip 2: Bottom-Left Featured Highlight */
  }
        <div
    className="absolute bottom-4 left-1 sm:left-3 z-20 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-purple-500/30 text-[10px] font-mono text-white flex items-center gap-2 shadow-lg shadow-purple-950/40 pointer-events-none transition-transform duration-500"
    style={{
      transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`
    }}
  >
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-white/60">FEATURED:</span>
          <span className="text-purple-300 font-bold">{featuredTitle}</span>
        </div>
      </div>
    </div>;
}
