import { useState, useEffect, useRef } from "react";
import {
  Trophy,
  RotateCcw,
  Play,
  Grid,
  Sparkles,
  Heart,
  Flame
} from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore, getPlayerStats } from "../utils/playerStats";
export default function MemoryMatrix({ onNotifyAchievement }) {
  const [level, setLevel] = useState(1);
  const [gridDim, setGridDim] = useState(3);
  const [targetPattern, setTargetPattern] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [mistakeTiles, setMistakeTiles] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [flashCountdown, setFlashCountdown] = useState(0);
  const timerRef = useRef(null);
  const getLevelConfig = (lvl) => {
    let dim = 3;
    let tileCount = 3;
    let displayTime = 1800;
    if (lvl <= 2) {
      dim = 3;
      tileCount = 2 + lvl;
      displayTime = 2e3;
    } else if (lvl <= 5) {
      dim = 4;
      tileCount = lvl + 1;
      displayTime = 2200;
    } else if (lvl <= 9) {
      dim = 5;
      tileCount = lvl + 1;
      displayTime = 2500;
    } else {
      dim = 6;
      tileCount = Math.min(15, 8 + Math.floor((lvl - 9) * 1.2));
      displayTime = 2800;
    }
    return { dim, tileCount, displayTime };
  };
  const startNewLevel = (lvl) => {
    const { dim, tileCount, displayTime } = getLevelConfig(lvl);
    setGridDim(dim);
    setSelectedTiles([]);
    setMistakeTiles([]);
    const totalCells = dim * dim;
    const indices = [];
    while (indices.length < tileCount) {
      const rand = Math.floor(Math.random() * totalCells);
      if (!indices.includes(rand)) {
        indices.push(rand);
      }
    }
    setTargetPattern(indices);
    setPhase("memorize");
    arcadeSound.playLaser();
    let remaining = Math.ceil(displayTime / 1e3);
    setFlashCountdown(remaining);
    const countdownInterval = setInterval(() => {
      remaining -= 1;
      setFlashCountdown(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1e3);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      clearInterval(countdownInterval);
      setPhase("recall");
      arcadeSound.playFlip();
    }, displayTime);
  };
  const startGame = () => {
    setLevel(1);
    setScore(0);
    setStreak(0);
    setLives(3);
    startNewLevel(1);
  };
  const handleTileClick = (index) => {
    if (phase !== "recall") return;
    if (selectedTiles.includes(index) || mistakeTiles.includes(index)) return;
    if (targetPattern.includes(index)) {
      arcadeSound.playClick(600 + selectedTiles.length * 50);
      const newSelected = [...selectedTiles, index];
      setSelectedTiles(newSelected);
      if (newSelected.length === targetPattern.length) {
        setPhase("success");
        arcadeSound.playSuccess();
        const stagePts = 100 * level + streak * 25;
        const newScore = score + stagePts;
        setScore(newScore);
        setStreak((s) => s + 1);
        setTimeout(() => {
          setLevel((l) => l + 1);
          startNewLevel(level + 1);
        }, 1200);
      }
    } else {
      arcadeSound.playError();
      setMistakeTiles((prev) => [...prev, index]);
      setStreak(0);
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          setPhase("gameover");
          arcadeSound.playExplosion();
          const result = recordScore("memory-matrix", score);
          if (result.newAchievements && onNotifyAchievement) {
            result.newAchievements.forEach((a) => onNotifyAchievement(a));
          }
        }
        return next;
      });
    }
  };
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  const high = getPlayerStats().highScores["memory-matrix"] || 0;
  return <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-4">
      {
    /* Top HUD */
  }
      <div className="w-full flex items-center justify-between p-4 bg-slate-900/90 border border-purple-500/30 rounded-2xl backdrop-blur-md shadow-xl shadow-purple-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Memory Matrix</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                LEVEL {level}
              </span>
            </div>
            <p className="text-[11px] font-mono text-purple-400/80">Pattern Synchronization</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => <Heart
    key={heart}
    className={`w-4 h-4 transition-all ${heart <= lives ? "text-rose-400 fill-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "text-white/20"}`}
  />)}
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase">Score</span>
            <div className="text-lg font-black font-mono text-cyan-300 leading-none">{score}</div>
          </div>

          {streak > 1 && <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-white/50 uppercase">Streak</span>
              <div className="text-lg font-black font-mono text-amber-400 flex items-center gap-1 leading-none">
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> {streak}x
              </div>
            </div>}

          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-white/50 uppercase">Best</span>
            <div className="text-lg font-black font-mono text-white/80 leading-none">{high}</div>
          </div>
        </div>
      </div>

      {
    /* Main Play Area */
  }
      <div className="relative w-full aspect-square max-w-[500px] bg-[#070514] rounded-2xl border-2 border-purple-500/40 p-4 sm:p-6 flex flex-col items-center justify-center shadow-2xl shadow-purple-500/10 overflow-hidden select-none">
        {phase === "idle" ? <div className="text-center space-y-4 max-w-sm p-4 z-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white font-display">Neural Pattern Recall</h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Watch the illuminated cyan tiles during the flash sequence. Once hidden, reconstruct the exact matrix configuration without making mistakes.
            </p>
            <button
    onClick={startGame}
    className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-cyan-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-purple-500/25 flex items-center gap-2 mx-auto"
  >
              <Play className="w-4 h-4 fill-current" /> Initialize Matrix
            </button>
          </div> : <div className="w-full h-full flex flex-col items-center justify-between">
            {
    /* Status Indicator Bar */
  }
            <div className="w-full flex items-center justify-between text-xs font-mono py-1 px-2 mb-2">
              <span
    className={`font-bold transition-colors ${phase === "memorize" ? "text-cyan-300 animate-pulse" : phase === "recall" ? "text-purple-300" : "text-emerald-400"}`}
  >
                {phase === "memorize" && `MEMORIZE THE PATTERN (${flashCountdown}s)`}
                {phase === "recall" && `RECALL: ${selectedTiles.length} / ${targetPattern.length} TILES`}
                {phase === "success" && "PATTERN SYNCHRONIZED!"}
              </span>
              <span className="text-white/40">
                Grid: {gridDim}x{gridDim}
              </span>
            </div>

            {
    /* Matrix Tiles Grid */
  }
            <div
    className="grid gap-2.5 sm:gap-3 w-full max-w-[420px] aspect-square my-auto"
    style={{
      gridTemplateColumns: `repeat(${gridDim}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${gridDim}, minmax(0, 1fr))`
    }}
  >
              {Array.from({ length: gridDim * gridDim }).map((_, idx) => {
    const isTarget = targetPattern.includes(idx);
    const isSelected = selectedTiles.includes(idx);
    const isMistake = mistakeTiles.includes(idx);
    let tileClass = "bg-white/5 border-white/10 hover:border-white/30";
    if (phase === "memorize" && isTarget) {
      tileClass = "bg-cyan-400 border-cyan-300 shadow-[0_0_20px_#22d3ee] scale-95";
    } else if (isSelected) {
      tileClass = "bg-emerald-400 border-emerald-300 shadow-[0_0_18px_#34d399]";
    } else if (isMistake) {
      tileClass = "bg-rose-500 border-rose-400 shadow-[0_0_18px_#f43f5e] animate-shake";
    }
    return <button
      key={idx}
      disabled={phase !== "recall"}
      onClick={() => handleTileClick(idx)}
      className={`rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-center ${tileClass}`}
      aria-label={`Matrix tile ${idx + 1}`}
    >
                    {isSelected && <span className="text-slate-950 font-black text-sm">✓</span>}
                    {isMistake && <span className="text-white font-black text-sm">✕</span>}
                  </button>;
  })}
            </div>
          </div>}

        {
    /* Game Over Screen */
  }
        {phase === "gameover" && <div className="absolute inset-0 bg-[#070514]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 shadow-xl shadow-rose-500/20">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-rose-400">SYNAPSE OVERLOAD</span>
              <h3 className="text-2xl font-black text-white">Buffer Depleted</h3>
              <p className="text-sm font-mono text-purple-300 font-bold mt-1">Final Score: {score} PTS · Level {level}</p>
            </div>
            <button
    onClick={startGame}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-purple-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
  >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>}
      </div>

      {
    /* Instructions */
  }
      <div className="flex items-center justify-between w-full max-w-lg text-[11px] font-mono text-white/50 px-2">
        <span>Click / Tap recalled tiles</span>
        <span>Combo streak awards bonus XP</span>
      </div>
    </div>;
}
