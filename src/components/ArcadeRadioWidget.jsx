import { useState, useEffect } from "react";
import { Radio, Disc3 } from "lucide-react";
import { arcadeSound } from "../utils/audio";
export default function ArcadeRadioWidget() {
  const [currentTrack, setCurrentTrack] = useState(arcadeSound.currentTrack);
  const [visBars, setVisBars] = useState([0.3, 0.5, 0.8, 0.4, 0.6, 0.9, 0.5, 0.3]);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const unsub = arcadeSound.onTrackChange((track) => {
      setCurrentTrack(track);
    });
    return unsub;
  }, []);
  useEffect(() => {
    if (currentTrack === "off") {
      setVisBars([0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15]);
      return;
    }
    const interval = setInterval(() => {
      setVisBars([...arcadeSound.visualizerData]);
    }, 120);
    return () => clearInterval(interval);
  }, [currentTrack]);
  const selectTrack = (track) => {
    arcadeSound.playClick();
    arcadeSound.setTrack(track);
    setCurrentTrack(track);
  };
  const tracks = [
    { id: "synthwave", label: "Neon 1984", vibe: "116 BPM Retro Synthwave", color: "from-pink-500 to-indigo-500" },
    { id: "lofi", label: "Midnight Dev", vibe: "78 BPM Chillhop Rhodes", color: "from-cyan-400 to-teal-500" },
    { id: "ambient", label: "Deep Orbit", vibe: "Space Drone Resonance", color: "from-purple-500 to-blue-600" },
    { id: "off", label: "Radio Mute", vibe: "Sound FX Only", color: "from-slate-600 to-slate-800" }
  ];
  return <div className="relative">
      {
    /* Floating Pill Trigger */
  }
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
        <button
    onClick={() => setExpanded((prev) => !prev)}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${currentTrack !== "off" ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-400/50 text-cyan-300" : "text-white/60 hover:text-white"}`}
    title="Toggle Arcade Radio"
  >
          <Disc3 className={`w-3.5 h-3.5 ${currentTrack !== "off" ? "animate-spin text-cyan-400" : "text-white/40"}`} />
          <span className="hidden sm:inline font-semibold">
            {currentTrack === "off" ? "RADIO" : tracks.find((t) => t.id === currentTrack)?.label}
          </span>

          {
    /* Dancing Audio Visualizer Bars */
  }
          <div className="flex items-end gap-[2px] h-3 px-1">
            {visBars.map((h, i) => <div
    key={i}
    className="w-[2px] bg-gradient-to-t from-indigo-400 to-cyan-300 rounded-full transition-all duration-100"
    style={{
      height: `${Math.max(15, h * 100)}%`,
      opacity: currentTrack === "off" ? 0.3 : 0.9
    }}
  />)}
          </div>
        </button>
      </div>

      {
    /* Dropdown Station Selector */
  }
      {expanded && <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-2xl bg-[#0e0c20]/95 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 backdrop-blur-2xl z-50 animate-fadeIn space-y-2">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> ARCADE SYNTHWAVE FM
            </span>
            <span className="text-[9px] font-mono text-emerald-400">100% SYNTHESIZED</span>
          </div>

          <div className="space-y-1">
            {tracks.map((t) => {
    const isSelected = currentTrack === t.id;
    return <button
      key={t.id}
      onClick={() => selectTrack(t.id)}
      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${isSelected ? "bg-gradient-to-r from-indigo-950/80 to-purple-950/60 border-indigo-400/80 text-white shadow-md" : "bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/5 hover:text-white"}`}
    >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-display">{t.label}</span>
                    <span className="text-[10px] font-mono text-white/50">{t.vibe}</span>
                  </div>
                  {isSelected && <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">LIVE</span>
                    </div>}
                </button>;
  })}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40 px-1">
            <span>BGM LOOPS SYNTHESIZED LIVE</span>
            <button
    onClick={() => setExpanded(false)}
    className="text-indigo-400 hover:text-white"
  >
              Done
            </button>
          </div>
        </div>}
    </div>;
}
