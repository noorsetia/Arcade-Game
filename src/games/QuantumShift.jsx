import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  RotateCcw,
  Play,
  Layers,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore, getPlayerStats } from "../utils/playerStats";
const PUZZLE_LEVELS = [
  {
    id: 1,
    name: "Waveform Calibration",
    initialPhase: "cyan",
    start: { x: 1, y: 1 },
    parMoves: 8,
    grid: [
      [
        { type: "wall" },
        { type: "wall" },
        { type: "wall" },
        { type: "wall" },
        { type: "wall" },
        { type: "wall" },
        { type: "wall" }
      ],
      [
        { type: "wall" },
        { type: "empty" },
        { type: "gate", color: "cyan" },
        { type: "shift-pad", color: "magenta" },
        { type: "gate", color: "magenta" },
        { type: "exit" },
        { type: "wall" }
      ],
      [
        { type: "wall" },
        { type: "wall" },
        { type: "wall" },
        { type: "wall" },
        { type: "wall" },
        { type: "wall" },
        { type: "wall" }
      ]
    ]
  },
  {
    id: 2,
    name: "Chromatic Barrier Bypass",
    initialPhase: "cyan",
    start: { x: 1, y: 1 },
    parMoves: 14,
    grid: [
      [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
      [{ type: "wall" }, { type: "empty" }, { type: "empty" }, { type: "gate", color: "cyan" }, { type: "key", color: "magenta" }, { type: "empty" }, { type: "wall" }],
      [{ type: "wall" }, { type: "wall" }, { type: "shift-pad", color: "magenta" }, { type: "wall" }, { type: "wall" }, { type: "gate", color: "magenta" }, { type: "wall" }],
      [{ type: "wall" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "exit" }, { type: "wall" }],
      [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }]
    ]
  },
  {
    id: 3,
    name: "Tri-Phase Resonator",
    initialPhase: "cyan",
    start: { x: 1, y: 1 },
    parMoves: 22,
    grid: [
      [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
      [{ type: "wall" }, { type: "empty" }, { type: "shift-pad", color: "magenta" }, { type: "gate", color: "cyan" }, { type: "empty" }, { type: "key", color: "amber" }, { type: "wall" }],
      [{ type: "wall" }, { type: "gate", color: "magenta" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "gate", color: "amber" }, { type: "wall" }],
      [{ type: "wall" }, { type: "empty" }, { type: "shift-pad", color: "amber" }, { type: "gate", color: "magenta" }, { type: "empty" }, { type: "exit" }, { type: "wall" }],
      [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }]
    ]
  },
  {
    id: 4,
    name: "Quantum Entanglement Core",
    initialPhase: "amber",
    start: { x: 1, y: 1 },
    parMoves: 26,
    grid: [
      [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
      [{ type: "wall" }, { type: "empty" }, { type: "gate", color: "amber" }, { type: "shift-pad", color: "cyan" }, { type: "empty" }, { type: "gate", color: "cyan" }, { type: "key", color: "cyan" }, { type: "wall" }],
      [{ type: "wall" }, { type: "empty" }, { type: "wall" }, { type: "wall" }, { type: "shift-pad", color: "magenta" }, { type: "wall" }, { type: "gate", color: "magenta" }, { type: "wall" }],
      [{ type: "wall" }, { type: "empty" }, { type: "gate", color: "magenta" }, { type: "empty" }, { type: "empty" }, { type: "shift-pad", color: "amber" }, { type: "exit" }, { type: "wall" }],
      [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }]
    ]
  }
];
export default function QuantumShift({ onNotifyAchievement }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [phase, setPhase] = useState("cyan");
  const [grid, setGrid] = useState([]);
  const [collectedKeys, setCollectedKeys] = useState([]);
  const [moves, setMoves] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const currentLevel = PUZZLE_LEVELS[levelIdx];
  const loadLevel = useCallback((lvlIndex) => {
    const lvl = PUZZLE_LEVELS[lvlIndex];
    if (!lvl) return;
    const clonedGrid = lvl.grid.map(
      (row) => row.map((cell) => ({ ...cell }))
    );
    setGrid(clonedGrid);
    setPlayer({ ...lvl.start });
    setPhase(lvl.initialPhase);
    setCollectedKeys([]);
    setMoves(0);
    setIsLevelCleared(false);
    arcadeSound.playLaser();
  }, []);
  const startGame = () => {
    setLevelIdx(0);
    setTotalScore(0);
    setIsGameWon(false);
    setIsPlaying(true);
    loadLevel(0);
  };
  const shiftPhase = (newPhase) => {
    if (phase === newPhase) return;
    setPhase(newPhase);
    arcadeSound.playFlip();
  };
  const movePlayer = useCallback(
    (dx, dy) => {
      if (!isPlaying || isLevelCleared || isGameWon || grid.length === 0) return;
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) return;
      const cell = grid[ny][nx];
      if (cell.type === "wall") {
        arcadeSound.playError();
        return;
      }
      if (cell.type === "gate") {
        if (cell.color !== phase) {
          arcadeSound.playError();
          return;
        }
      }
      if (cell.type === "key") {
        if (cell.color === phase) {
          arcadeSound.playPowerup();
          cell.type = "empty";
          setCollectedKeys((prev) => [...prev, `${nx}-${ny}`]);
        } else {
          arcadeSound.playError();
          return;
        }
      }
      setPlayer({ x: nx, y: ny });
      setMoves((m) => m + 1);
      arcadeSound.playClick(480 + (nx + ny) * 20);
      if (cell.type === "shift-pad" && cell.color) {
        shiftPhase(cell.color);
      }
      if (cell.type === "exit") {
        arcadeSound.playSuccess();
        const efficiencyBonus = Math.max(0, (currentLevel.parMoves * 2 - moves) * 50);
        const stagePts = 500 + efficiencyBonus;
        setTotalScore((s) => s + stagePts);
        if (levelIdx < PUZZLE_LEVELS.length - 1) {
          setIsLevelCleared(true);
        } else {
          setIsGameWon(true);
          const finalScore = totalScore + stagePts;
          const res = recordScore("quantum-shift", finalScore);
          if (res.newAchievements && onNotifyAchievement) {
            res.newAchievements.forEach((a) => onNotifyAchievement(a));
          }
        }
      }
    },
    [isPlaying, isLevelCleared, isGameWon, grid, player, phase, moves, currentLevel, levelIdx, totalScore, onNotifyAchievement]
  );
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") movePlayer(0, -1);
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") movePlayer(0, 1);
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") movePlayer(-1, 0);
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") movePlayer(1, 0);
      else if (e.key === "1") shiftPhase("cyan");
      else if (e.key === "2") shiftPhase("magenta");
      else if (e.key === "3") shiftPhase("amber");
      else if (e.key === "r" || e.key === "R") loadLevel(levelIdx);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer, levelIdx, loadLevel]);
  const high = getPlayerStats().highScores["quantum-shift"] || 0;
  return <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-4">
      {
    /* Top HUD */
  }
      <div className="w-full flex items-center justify-between p-4 bg-slate-900/90 border border-fuchsia-500/30 rounded-2xl backdrop-blur-md shadow-xl shadow-fuchsia-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Quantum Shift</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30">
                CHAMBER {levelIdx + 1}/{PUZZLE_LEVELS.length}
              </span>
            </div>
            <p className="text-[11px] font-mono text-fuchsia-400/80">{currentLevel?.name || "Dimensional Logic"}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase">Score</span>
            <div className="text-lg font-black font-mono text-cyan-300 leading-none">{totalScore}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase">Moves</span>
            <div className="text-lg font-black font-mono text-amber-300 leading-none">
              {moves} <span className="text-xs text-white/40 font-normal">/ {currentLevel?.parMoves} par</span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-white/50 uppercase">Best</span>
            <div className="text-lg font-black font-mono text-white/80 leading-none">{high}</div>
          </div>
        </div>
      </div>

      {
    /* Main Play Area */
  }
      <div className="relative w-full aspect-square max-w-[540px] bg-[#080516] rounded-2xl border-2 border-fuchsia-500/40 p-4 sm:p-6 flex flex-col items-center justify-center shadow-2xl shadow-fuchsia-500/10 overflow-hidden select-none">
        {!isPlaying ? <div className="text-center space-y-4 max-w-sm p-4 z-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300 shadow-lg shadow-fuchsia-500/20">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white font-display">Dimensional Matrix</h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Navigate logic chambers where space changes rules based on your Quantum Phase. Pass matching colored forcefields, step on phase pads, and reach the singularity rift.
            </p>
            <button
    onClick={startGame}
    className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-fuchsia-500/25 flex items-center gap-2 mx-auto"
  >
              <Play className="w-4 h-4 fill-current" /> Initialize Chamber 1
            </button>
          </div> : <div className="w-full h-full flex flex-col items-center justify-between">
            {
    /* Phase Selector Ribbon */
  }
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
              <span className="text-white/60">ACTIVE QUANTUM STATE:</span>
              <div className="flex items-center gap-2">
                {["cyan", "magenta", "amber"].map((p, idx) => <button
    key={p}
    onClick={() => shiftPhase(p)}
    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 border ${phase === p ? p === "cyan" ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_12px_#22d3ee]" : p === "magenta" ? "bg-fuchsia-400 text-slate-950 border-fuchsia-300 shadow-[0_0_12px_#e879f9]" : "bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_#fbbf24]" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}
  >
                    <span>{idx + 1}</span>
                    <span>{p}</span>
                  </button>)}
              </div>
            </div>

            {
    /* Grid Container */
  }
            <div
    className="grid gap-2 w-full max-w-[420px] aspect-square my-auto p-2 bg-black/40 rounded-xl border border-white/10"
    style={{
      gridTemplateColumns: `repeat(${grid[0]?.length || 7}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${grid.length || 5}, minmax(0, 1fr))`
    }}
  >
              {grid.map(
    (row, y) => row.map((cell, x) => {
      const isPlayer = player.x === x && player.y === y;
      const isExit = cell.type === "exit";
      let cellBg = "bg-white/5";
      let borderStyle = "border-white/5";
      let content = null;
      if (cell.type === "wall") {
        cellBg = "bg-slate-800/80";
        borderStyle = "border-slate-700";
      } else if (cell.type === "gate") {
        const match = cell.color === phase;
        cellBg = match ? cell.color === "cyan" ? "bg-cyan-500/20" : cell.color === "magenta" ? "bg-fuchsia-500/20" : "bg-amber-500/20" : "bg-white/10";
        borderStyle = cell.color === "cyan" ? "border-cyan-400" : cell.color === "magenta" ? "border-fuchsia-400" : "border-amber-400";
        content = <span className={`text-[10px] font-mono font-black ${match ? "animate-pulse" : "opacity-40"}`}>
                        {match ? "OPEN" : "LOCKED"}
                      </span>;
      } else if (cell.type === "shift-pad") {
        cellBg = cell.color === "cyan" ? "bg-cyan-500/30" : cell.color === "magenta" ? "bg-fuchsia-500/30" : "bg-amber-500/30";
        content = <span className="text-xs">🌀</span>;
      } else if (cell.type === "key") {
        content = <span className="text-xs">🔑</span>;
      }
      return <div
        key={`${x}-${y}`}
        className={`relative rounded-lg border flex items-center justify-center transition-all ${cellBg} ${borderStyle}`}
      >
                      {content}

                      {
        /* Exit Beacon */
      }
                      {isExit && <div className="w-3/4 h-3/4 rounded-full bg-emerald-400/80 animate-ping shadow-[0_0_15px_#10b981]" />}
                      {isExit && <div className="absolute w-1/2 h-1/2 rounded-full bg-emerald-300 shadow-[0_0_10px_#34d399] flex items-center justify-center text-[8px] font-black text-black">
                          ★
                        </div>}

                      {
        /* Player Avatar */
      }
                      {isPlayer && <div
        className={`relative w-3/4 h-3/4 rounded-full flex items-center justify-center shadow-lg transition-all ${phase === "cyan" ? "bg-cyan-300 shadow-[0_0_16px_#22d3ee]" : phase === "magenta" ? "bg-fuchsia-300 shadow-[0_0_16px_#e879f9]" : "bg-amber-300 shadow-[0_0_16px_#fbbf24]"}`}
      >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>}
                    </div>;
    })
  )}
            </div>
          </div>}

        {
    /* Level Complete Modal */
  }
        {isLevelCleared && <div className="absolute inset-0 bg-[#080516]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-xl shadow-emerald-500/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400">CHAMBER SOLVED</span>
              <h3 className="text-2xl font-black text-white">Quantum Resonance Achieved</h3>
              <p className="text-xs text-white/60 mt-1 font-mono">Moves: {moves} · Total Score: {totalScore}</p>
            </div>
            <button
    onClick={() => {
      const next = levelIdx + 1;
      setLevelIdx(next);
      loadLevel(next);
    }}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
  >
              <span>Advance to Chamber {levelIdx + 2}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>}

        {
    /* Victory Screen */
  }
        {isGameWon && <div className="absolute inset-0 bg-[#080516]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-500/20">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400">SINGULARITY STABILIZED</span>
              <h3 className="text-2xl font-black text-white">All Chambers Completed!</h3>
              <p className="text-sm font-mono text-fuchsia-300 font-bold mt-1">Final Score: {totalScore} PTS</p>
            </div>
            <button
    onClick={startGame}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-cyan-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
  >
              <RotateCcw className="w-4 h-4" /> Replay Chambers
            </button>
          </div>}
      </div>

      {
    /* Instructions */
  }
      <div className="flex items-center justify-between w-full max-w-lg text-[11px] font-mono text-white/50 px-2">
        <span>WASD / Arrows to Move</span>
        <span>Keys 1, 2, 3 to Shift Phase</span>
        <span>Press R to Reset Level</span>
      </div>
    </div>;
}
