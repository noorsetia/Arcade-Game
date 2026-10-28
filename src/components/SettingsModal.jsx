import { useState, useEffect } from "react";
import {
  X,
  Volume2,
  VolumeX,
  Sliders,
  Monitor,
  Eye,
  Maximize2,
  Minimize2,
  Palette
} from "lucide-react";
import { arcadeSound } from "../utils/audio";
export default function SettingsModal({
  crtMode,
  onToggleCrt,
  reducedMotion,
  onToggleReducedMotion,
  theme,
  onChangeTheme,
  onClose
}) {
  const [sfxVol, setSfxVol] = useState(Math.round(arcadeSound.sfxVolume * 100));
  const [musicVol, setMusicVol] = useState(Math.round(arcadeSound.musicVolume * 100));
  const [soundEnabled, setSoundEnabled] = useState(arcadeSound.enabled);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  const handleToggleFullscreen = () => {
    arcadeSound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
      });
    } else {
      document.exitFullscreen().catch(() => {
      });
    }
  };
  const handleToggleSound = () => {
    const next = arcadeSound.toggle();
    setSoundEnabled(next);
  };
  const handleSfxChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSfxVol(val);
    arcadeSound.setSfxVolume(val / 100);
    arcadeSound.playClick();
  };
  const handleMusicChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setMusicVol(val);
    arcadeSound.setMusicVolume(val / 100);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#080718] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 text-white space-y-6">
        {
    /* Header */
  }
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-cyan-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display tracking-tight text-white">Arcade Settings</h2>
              <p className="text-xs font-mono text-indigo-400">Audio, Visual & Control Calibration</p>
            </div>
          </div>
          <button
    onClick={() => {
      arcadeSound.playClick();
      onClose();
    }}
    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Audio Volume Controls */
  }
        <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/70 uppercase tracking-wider">Audio Synthesizer</span>
            <button
    onClick={handleToggleSound}
    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${soundEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "bg-white/5 text-white/40 border border-white/10"}`}
  >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? "ENABLED" : "MUTED"}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-white/60">SFX Volume</span>
                <span className="text-cyan-300 font-bold">{sfxVol}%</span>
              </div>
              <input
    type="range"
    min="0"
    max="100"
    value={sfxVol}
    onChange={handleSfxChange}
    disabled={!soundEnabled}
    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
  />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-white/60">Music & Ambient Radio</span>
                <span className="text-purple-300 font-bold">{musicVol}%</span>
              </div>
              <input
    type="range"
    min="0"
    max="100"
    value={musicVol}
    onChange={handleMusicChange}
    disabled={!soundEnabled}
    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
  />
            </div>
          </div>
        </div>

        {
    /* Visual & Monitor Shaders */
  }
        <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/10">
          <span className="text-xs font-mono text-white/70 uppercase tracking-wider block">Visual Experience</span>

          <div className="grid grid-cols-2 gap-3">
            <button
    onClick={() => {
      arcadeSound.playClick();
      onToggleCrt();
    }}
    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${crtMode ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}`}
  >
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span className="text-xs font-semibold">CRT Scanlines</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">
                {crtMode ? "ON" : "OFF"}
              </span>
            </button>

            <button
    onClick={() => {
      arcadeSound.playClick();
      onToggleReducedMotion();
    }}
    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${reducedMotion ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}`}
  >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-semibold">Reduced Motion</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">
                {reducedMotion ? "ON" : "OFF"}
              </span>
            </button>
          </div>

          <button
    onClick={handleToggleFullscreen}
    className="w-full p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
  >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? "Exit Full Screen" : "Enable Full Screen Arcade"}</span>
          </button>
        </div>

        {
    /* Theme Palette Selector */
  }
        <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-white/70 uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5" />
            <span>Arcade Color Spectrum</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
    { id: "cyber-neon", name: "Cyber Neon", colors: "from-indigo-500 to-cyan-400" },
    { id: "tokyo-sunset", name: "Tokyo Sunset", colors: "from-rose-500 to-amber-400" },
    { id: "radioactive", name: "Radioactive", colors: "from-emerald-500 to-lime-400" },
    { id: "deep-void", name: "Deep Void", colors: "from-sky-400 to-slate-200" }
  ].map((t) => <button
    key={t.id}
    onClick={() => {
      arcadeSound.playClick();
      onChangeTheme(t.id);
    }}
    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${theme === t.id ? "border-indigo-400 bg-indigo-500/20 text-white shadow" : "border-white/10 bg-white/5 text-white/60 hover:text-white"}`}
  >
                <span>{t.name}</span>
                <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${t.colors} shadow-sm`} />
              </button>)}
          </div>
        </div>

        {
    /* Footer close button */
  }
        <button
    onClick={() => {
      arcadeSound.playClick();
      onClose();
    }}
    className="w-full py-3 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-cyan-300 transition-colors shadow-lg"
  >
          Save & Return to Arcade
        </button>
      </div>
    </div>;
}
