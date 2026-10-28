import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw, Undo2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
const createEmptyBoard = () => Array(16).fill(0);
function addRandomTile(board) {
  const emptyIndices = board.map((v, i) => v === 0 ? i : -1).filter((i) => i >= 0);
  if (emptyIndices.length === 0) return board;
  const next = [...board];
  const chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  next[chosenIndex] = Math.random() < 0.9 ? 2 : 4;
  return next;
}
function slideRow(row) {
  let scoreGained = 0;
  const filtered = row.filter((v) => v !== 0);
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      scoreGained += filtered[i];
      filtered.splice(i + 1, 1);
    }
  }
  while (filtered.length < 4) {
    filtered.push(0);
  }
  return { result: filtered, scoreGained };
}
function moveGrid(board, direction) {
  let next = Array(16).fill(0);
  let totalScoreGained = 0;
  for (let n = 0; n < 4; n++) {
    const indices = [];
    for (let i = 0; i < 4; i++) {
      if (direction === "left") indices.push(n * 4 + i);
      else if (direction === "right") indices.push(n * 4 + (3 - i));
      else if (direction === "up") indices.push(i * 4 + n);
      else if (direction === "down") indices.push((3 - i) * 4 + n);
    }
    const row = indices.map((idx) => board[idx]);
    const { result, scoreGained } = slideRow(row);
    totalScoreGained += scoreGained;
    indices.forEach((idx, i) => {
      next[idx] = result[i];
    });
  }
  const changed = next.some((v, i) => v !== board[i]);
  if (!changed) {
    return { board, changed: false, scoreGained: 0 };
  }
  next = addRandomTile(next);
  return { board: next, changed: true, scoreGained: totalScoreGained };
}
function getTileStyle(val) {
  switch (val) {
    case 2:
      return "bg-slate-800 text-slate-100 border border-slate-700";
    case 4:
      return "bg-indigo-950 text-indigo-200 border border-indigo-700/60 shadow-[0_0_10px_rgba(99,102,241,0.2)]";
    case 8:
      return "bg-blue-900 text-cyan-200 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]";
    case 16:
      return "bg-teal-900 text-teal-200 border border-teal-400 shadow-[0_0_14px_rgba(45,212,191,0.3)]";
    case 32:
      return "bg-emerald-800 text-emerald-100 border border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.35)]";
    case 64:
      return "bg-amber-800 text-amber-100 border border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.4)]";
    case 128:
      return "bg-orange-700 text-orange-100 border border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.45)]";
    case 256:
      return "bg-rose-700 text-rose-100 border border-rose-400 shadow-[0_0_22px_rgba(244,63,94,0.5)]";
    case 512:
      return "bg-purple-700 text-purple-100 border border-purple-400 shadow-[0_0_24px_rgba(192,132,252,0.55)]";
    case 1024:
      return "bg-fuchsia-600 text-white border border-fuchsia-300 shadow-[0_0_28px_rgba(217,70,239,0.6)] font-extrabold";
    case 2048:
      return "bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 text-white border-2 border-white shadow-[0_0_35px_rgba(251,191,36,0.8)] font-black animate-pulse";
    default:
      return "bg-white/[0.03] text-transparent border border-white/5";
  }
}
export default function Game2048({ onNotifyAchievement }) {
  const [board, setBoard] = useState(() => {
    let b = createEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    return b;
  });
  const [prevBoard, setPrevBoard] = useState(null);
  const [prevScore, setPrevScore] = useState(0);
  const [score, setScore] = useState(0);
  const [undoAvailable, setUndoAvailable] = useState(true);
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem("arcade-2048-best") || 0);
    } catch {
      return 0;
    }
  });
  const touchStart = useRef(null);
  const triggerMove = useCallback(
    (dir) => {
      const res = moveGrid(board, dir);
      if (res.changed) {
        setPrevBoard(board);
        setPrevScore(score);
        setBoard(res.board);
        if (res.scoreGained > 0) {
          arcadeSound.playTileMerge();
          const newScore = score + res.scoreGained;
          setScore(newScore);
          const maxTile2 = Math.max(...res.board);
          const { newBest, unlockedAchievement } = recordScore("2048", maxTile2, Math.round(res.scoreGained / 2));
          if (newBest) setBest(maxTile2);
          if (unlockedAchievement && onNotifyAchievement) {
            onNotifyAchievement(unlockedAchievement);
          }
        } else {
          arcadeSound.playSlide();
        }
      }
    },
    [board, score, onNotifyAchievement]
  );
  const resetGame = () => {
    let b = createEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setPrevBoard(null);
    setScore(0);
    setUndoAvailable(true);
    arcadeSound.playSuccess();
  };
  const handleUndo = () => {
    if (!prevBoard || !undoAvailable) return;
    setBoard(prevBoard);
    setScore(prevScore);
    setPrevBoard(null);
    setUndoAvailable(false);
    arcadeSound.playClick();
  };
  useEffect(() => {
    const handleKey = (e) => {
      const map = {
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down",
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right"
      };
      if (map[e.key]) {
        e.preventDefault();
        triggerMove(map[e.key]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [triggerMove]);
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist >= 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        triggerMove(dx > 0 ? "right" : "left");
      } else {
        triggerMove(dy > 0 ? "down" : "up");
      }
    }
    touchStart.current = null;
  };
  const maxTile = Math.max(...board);
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      {
    /* Intro & Controls */
  }
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-amber-400">NUMBER STRATEGY / 06</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            2048 Neon<span className="text-amber-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Slide tiles in any direction. When two tiles with the same number collide, they merge into one. Can you forge the mythical 2048 tile?
          </p>
        </div>

        {
    /* HUD */
  }
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">CURRENT SCORE</span>
            <span className="text-3xl font-black font-mono text-amber-400">{score}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">HIGHEST TILE</span>
            <span className="text-3xl font-black font-mono text-white">{maxTile || 0}</span>
          </div>
        </div>

        {
    /* Actions */
  }
        <div className="flex items-center gap-3">
          <button
    onClick={resetGame}
    className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
  >
            <RotateCcw className="w-4 h-4" /> New Board
          </button>

          <button
    onClick={handleUndo}
    disabled={!prevBoard || !undoAvailable}
    className="px-4 py-3 rounded-xl font-semibold text-xs border border-white/15 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
    title="Undo last move"
  >
            <Undo2 className="w-4 h-4" /> Undo Move
          </button>
        </div>

        {
    /* Tactile D-pad */
  }
        <div className="pt-2">
          <div className="text-[10px] font-mono text-white/40 tracking-wider mb-2 text-center sm:text-left">
            SWIPE BOARD OR USE TOUCH ARROWS
          </div>
          <div className="flex flex-col items-center gap-2 max-w-[180px] mx-auto sm:mx-0">
            <button
    onClick={() => triggerMove("up")}
    className="w-12 h-11 rounded-xl bg-white/10 hover:bg-amber-500/30 active:scale-90 border border-white/15 flex items-center justify-center text-white transition-all shadow-md"
    aria-label="Slide Up"
  >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <button
    onClick={() => triggerMove("left")}
    className="w-12 h-11 rounded-xl bg-white/10 hover:bg-amber-500/30 active:scale-90 border border-white/15 flex items-center justify-center text-white transition-all shadow-md"
    aria-label="Slide Left"
  >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
    onClick={() => triggerMove("down")}
    className="w-12 h-11 rounded-xl bg-white/10 hover:bg-amber-500/30 active:scale-90 border border-white/15 flex items-center justify-center text-white transition-all shadow-md"
    aria-label="Slide Down"
  >
                <ChevronDown className="w-6 h-6" />
              </button>
              <button
    onClick={() => triggerMove("right")}
    className="w-12 h-11 rounded-xl bg-white/10 hover:bg-amber-500/30 active:scale-90 border border-white/15 flex items-center justify-center text-white transition-all shadow-md"
    aria-label="Slide Right"
  >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {
    /* Grid Viewport */
  }
      <div className="lg:col-span-7">
        <div className="p-4 sm:p-6 rounded-3xl bg-[#0b0c16] border border-white/15 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 text-xs font-mono text-white/50 border-b border-white/10">
            <span className="text-white/80 font-semibold">4x4 QUANTUM GRID</span>
            <span>TARGET: 2048</span>
          </div>

          <div
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    className="grid grid-cols-4 gap-2.5 p-3 sm:p-4 my-3 aspect-square rounded-2xl bg-[#070810] border border-white/10 select-none touch-none"
  >
            {board.map((val, idx) => <div
    key={idx}
    className={`flex items-center justify-center rounded-xl font-bold font-mono transition-all duration-150 text-xl sm:text-2xl ${getTileStyle(
      val
    )}`}
  >
                {val > 0 ? val : ""}
              </div>)}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1">
            <span>SWIPE ANYWHERE TO MERGE</span>
            <span>WASD OR ARROW KEYS</span>
            <span>PERSONAL BEST TILE: {best || 2048}</span>
          </div>
        </div>
      </div>
    </div>;
}
