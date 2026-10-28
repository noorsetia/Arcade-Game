import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  RotateCcw,
  Play,
  Compass,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore, getPlayerStats } from "../utils/playerStats";
export default function NeonMaze({ onNotifyAchievement }) {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(11);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [maze, setMaze] = useState([]);
  const [shardsLeft, setShardsLeft] = useState(0);
  const [totalShards, setTotalShards] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [trail, setTrail] = useState([]);
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const generateMaze = useCallback((size) => {
    const grid = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        row.push({
          x,
          y,
          visited: false,
          walls: { top: true, right: true, bottom: true, left: true },
          hasShard: false
        });
      }
      grid.push(row);
    }
    const stack = [];
    let current = grid[0][0];
    current.visited = true;
    while (true) {
      const neighbors = [];
      const { x, y } = current;
      if (y > 0 && !grid[y - 1][x].visited) neighbors.push({ cell: grid[y - 1][x], dir: "top", opp: "bottom" });
      if (x < size - 1 && !grid[y][x + 1].visited) neighbors.push({ cell: grid[y][x + 1], dir: "right", opp: "left" });
      if (y < size - 1 && !grid[y + 1][x].visited) neighbors.push({ cell: grid[y + 1][x], dir: "bottom", opp: "top" });
      if (x > 0 && !grid[y][x - 1].visited) neighbors.push({ cell: grid[y][x - 1], dir: "left", opp: "right" });
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        current.walls[next.dir] = false;
        next.cell.walls[next.opp] = false;
        next.cell.visited = true;
        stack.push(current);
        current = next.cell;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        break;
      }
    }
    let shardCount = 0;
    const targetShards = Math.floor(size / 3) + 2;
    for (let i = 0; i < targetShards * 3 && shardCount < targetShards; i++) {
      const rx = Math.floor(Math.random() * size);
      const ry = Math.floor(Math.random() * size);
      if (!(rx === 0 && ry === 0) && !(rx === size - 1 && ry === size - 1) && !grid[ry][rx].hasShard) {
        grid[ry][rx].hasShard = true;
        shardCount++;
      }
    }
    setShardsLeft(shardCount);
    setTotalShards(shardCount);
    setMaze(grid);
    setPlayer({ x: 0, y: 0 });
    setTrail([{ x: 0, y: 0 }]);
  }, []);
  const startLevel = (lvl) => {
    const size = lvl === 1 ? 11 : lvl === 2 ? 15 : lvl === 3 ? 19 : 23;
    const time = lvl === 1 ? 60 : lvl === 2 ? 75 : lvl === 3 ? 90 : 100;
    setGridSize(size);
    setTimeLeft(time);
    setIsGameOver(false);
    setIsCompleted(false);
    setIsPaused(false);
    setIsPlaying(true);
    generateMaze(size);
    arcadeSound.playLaser();
  };
  const handleStartGame = () => {
    setLevel(1);
    setScore(0);
    startLevel(1);
  };
  const movePlayer = useCallback(
    (dx, dy) => {
      if (!isPlaying || isPaused || isGameOver || isCompleted || maze.length === 0) return;
      const currentCell = maze[player.y]?.[player.x];
      if (!currentCell) return;
      let canMove = false;
      if (dx === 1 && !currentCell.walls.right) canMove = true;
      if (dx === -1 && !currentCell.walls.left) canMove = true;
      if (dy === 1 && !currentCell.walls.bottom) canMove = true;
      if (dy === -1 && !currentCell.walls.top) canMove = true;
      if (!canMove) {
        arcadeSound.playError();
        return;
      }
      const nx = player.x + dx;
      const ny = player.y + dy;
      arcadeSound.playClick(500 + (nx + ny) * 15);
      const nextCell = maze[ny]?.[nx];
      let collected = false;
      if (nextCell && nextCell.hasShard) {
        nextCell.hasShard = false;
        setShardsLeft((prev) => Math.max(0, prev - 1));
        setScore((s) => s + 150);
        arcadeSound.playPowerup();
        collected = true;
      }
      setPlayer({ x: nx, y: ny });
      setTrail((prev) => [...prev.slice(-12), { x: nx, y: ny }]);
      if (nx === gridSize - 1 && ny === gridSize - 1) {
        arcadeSound.playSuccess();
        const stageBonus = 500 + timeLeft * 25 + (totalShards - shardsLeft + (collected ? 1 : 0)) * 100;
        const newScore = score + stageBonus;
        setScore(newScore);
        if (level < 4) {
          setIsCompleted(true);
        } else {
          setIsGameOver(true);
          const result = recordScore("neon-maze", newScore);
          if (result.newAchievements && onNotifyAchievement) {
            result.newAchievements.forEach((a) => onNotifyAchievement(a));
          }
        }
      }
    },
    [isPlaying, isPaused, isGameOver, isCompleted, maze, player, gridSize, timeLeft, totalShards, shardsLeft, score, level, onNotifyAchievement]
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
      else if (e.key === "p" || e.key === "P") setIsPaused((p) => !p);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    const threshold = 25;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) movePlayer(1, 0);
      else if (deltaX < -threshold) movePlayer(-1, 0);
    } else {
      if (deltaY > threshold) movePlayer(0, 1);
      else if (deltaY < -threshold) movePlayer(0, -1);
    }
  };
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver || isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          arcadeSound.playExplosion();
          recordScore("neon-maze", score);
          return 0;
        }
        return t - 1;
      });
    }, 1e3);
    return () => clearInterval(timer);
  }, [isPlaying, isPaused, isGameOver, isCompleted, score]);
  const high = getPlayerStats().highScores["neon-maze"] || 0;
  return <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-4">
      {
    /* Top HUD */
  }
      <div className="w-full flex items-center justify-between p-4 bg-slate-900/90 border border-cyan-500/30 rounded-2xl backdrop-blur-md shadow-xl shadow-cyan-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Neon Maze</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                SECTOR {level}/4
              </span>
            </div>
            <p className="text-[11px] font-mono text-cyan-400/80">Procedural Neural Labyrinth</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase">Score</span>
            <div className="text-lg font-black font-mono text-cyan-300 leading-none">{score}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase">Time</span>
            <div className={`text-lg font-black font-mono leading-none ${timeLeft < 15 ? "text-rose-400 animate-pulse" : "text-amber-300"}`}>
              {timeLeft}s
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-white/50 uppercase">Shards</span>
            <div className="text-lg font-black font-mono text-purple-300 leading-none">
              {totalShards - shardsLeft}/{totalShards}
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
      <div
    ref={containerRef}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    className="relative w-full aspect-square max-w-[540px] bg-[#050814] rounded-2xl border-2 border-cyan-500/40 p-3 flex items-center justify-center shadow-2xl shadow-cyan-500/10 overflow-hidden select-none"
  >
        {isPlaying && maze.length > 0 ? <div
    className="grid w-full h-full"
    style={{
      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
    }}
  >
            {maze.map(
    (row, y) => row.map((cell, x) => {
      const isPlayer = player.x === x && player.y === y;
      const isGoal = x === gridSize - 1 && y === gridSize - 1;
      const isTrail = trail.some((t) => t.x === x && t.y === y);
      return <div
        key={`${x}-${y}`}
        className="relative flex items-center justify-center transition-all duration-75"
        style={{
          borderTop: cell.walls.top ? "2px solid rgba(34, 211, 238, 0.45)" : "none",
          borderRight: cell.walls.right ? "2px solid rgba(34, 211, 238, 0.45)" : "none",
          borderBottom: cell.walls.bottom ? "2px solid rgba(34, 211, 238, 0.45)" : "none",
          borderLeft: cell.walls.left ? "2px solid rgba(34, 211, 238, 0.45)" : "none",
          backgroundColor: isTrail && !isPlayer ? "rgba(34, 211, 238, 0.06)" : "transparent"
        }}
      >
                    {
        /* Goal Beacon */
      }
                    {isGoal && <div className="w-3/4 h-3/4 rounded-full bg-emerald-400/80 animate-ping shadow-[0_0_15px_#10b981]" />}
                    {isGoal && <div className="absolute w-1/2 h-1/2 rounded-full bg-emerald-300 shadow-[0_0_10px_#34d399] flex items-center justify-center text-[8px] font-black text-black">
                        ★
                      </div>}

                    {
        /* Shard Item */
      }
                    {cell.hasShard && <div className="w-2.5 h-2.5 rotate-45 bg-purple-400 rounded-sm shadow-[0_0_8px_#c084fc] animate-pulse" />}

                    {
        /* Glowing Player Avatar */
      }
                    {isPlayer && <div className="relative w-3/4 h-3/4 rounded-full bg-cyan-300 shadow-[0_0_20px_#22d3ee] flex items-center justify-center ring-2 ring-white">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      </div>}
                  </div>;
    })
  )}
          </div> : <div className="text-center space-y-4 max-w-sm p-6 z-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white font-display">Sector Grid Awaiting</h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Navigate procedurally generated cyber labyrinths. Collect neon data shards and reach the green terminal beacon before your telemetry clock expires.
            </p>
            <button
    onClick={handleStartGame}
    className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-cyan-500/25 flex items-center gap-2 mx-auto"
  >
              <Play className="w-4 h-4 fill-current" /> Initialize Maze
            </button>
          </div>}

        {
    /* Level Complete Overlay */
  }
        {isCompleted && <div className="absolute inset-0 bg-[#070b19]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-xl shadow-emerald-500/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400">SECTOR {level} CLEARED</span>
              <h3 className="text-2xl font-black text-white">Grid Breach Successful</h3>
              <p className="text-xs text-white/60 mt-1 font-mono">Current Score: {score} PTS</p>
            </div>
            <button
    onClick={() => {
      setLevel((l) => l + 1);
      startLevel(level + 1);
    }}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
  >
              <span>Advance to Sector {level + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>}

        {
    /* Game Over Overlay */
  }
        {isGameOver && <div className="absolute inset-0 bg-[#070b19]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 shadow-xl shadow-rose-500/20">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-rose-400">MISSION TERMINATED</span>
              <h3 className="text-2xl font-black text-white">{timeLeft <= 0 ? "Telemetry Timeout" : "All Sectors Conquered!"}</h3>
              <p className="text-sm font-mono text-cyan-300 font-bold mt-1">Final Score: {score} PTS</p>
            </div>
            <button
    onClick={handleStartGame}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-cyan-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
  >
              <RotateCcw className="w-4 h-4" /> Restart Run
            </button>
          </div>}

        {
    /* Pause Overlay */
  }
        {isPaused && <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-20">
            <h3 className="text-2xl font-black text-white font-mono">GRID PAUSED</h3>
            <button
    onClick={() => setIsPaused(false)}
    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 text-slate-950 hover:bg-cyan-300"
  >
              Resume
            </button>
          </div>}
      </div>

      {
    /* On-screen Touch D-Pad for Mobile */
  }
      <div className="flex flex-col items-center gap-1.5 md:hidden pt-2">
        <button
    onClick={() => movePlayer(0, -1)}
    className="w-12 h-12 rounded-xl bg-white/10 active:bg-cyan-400 active:text-slate-950 border border-white/20 text-white font-bold text-lg flex items-center justify-center shadow"
  >
          ▲
        </button>
        <div className="flex items-center gap-4">
          <button
    onClick={() => movePlayer(-1, 0)}
    className="w-12 h-12 rounded-xl bg-white/10 active:bg-cyan-400 active:text-slate-950 border border-white/20 text-white font-bold text-lg flex items-center justify-center shadow"
  >
            ◀
          </button>
          <button
    onClick={() => movePlayer(0, 1)}
    className="w-12 h-12 rounded-xl bg-white/10 active:bg-cyan-400 active:text-slate-950 border border-white/20 text-white font-bold text-lg flex items-center justify-center shadow"
  >
            ▼
          </button>
          <button
    onClick={() => movePlayer(1, 0)}
    className="w-12 h-12 rounded-xl bg-white/10 active:bg-cyan-400 active:text-slate-950 border border-white/20 text-white font-bold text-lg flex items-center justify-center shadow"
  >
            ▶
          </button>
        </div>
      </div>

      {
    /* Control instructions */
  }
      <div className="flex items-center justify-between w-full max-w-lg text-[11px] font-mono text-white/50 px-2">
        <span>Controls: WASD / Arrow Keys or Swipe</span>
        <span>Pause: P</span>
        <span>Goal: Reach Beacon (★)</span>
      </div>
    </div>;
}
