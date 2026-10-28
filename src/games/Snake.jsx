import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Zap, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
const SIZE = 20;
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 }
];
function getRandomFood(snake) {
  let f;
  do {
    f = {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE)
    };
  } while (snake.some((p) => p.x === f.x && p.y === f.y));
  return f;
}
export default function Snake({ onNotifyAchievement }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 13, y: 10 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem("arcade-snake-best") || 0);
    } catch {
      return 0;
    }
  });
  const dirRef = useRef(dir);
  dirRef.current = dir;
  const stateRef = useRef({ snake, food, dir, score, running, over });
  stateRef.current = { snake, food, dir, score, running, over };
  const [particles, setParticles] = useState([]);
  const boardTouchStart = useRef(null);
  const spawnParticles = (x, y) => {
    const newParticles = Array.from({ length: 8 }, () => ({
      x: (x + 0.5) * (100 / SIZE),
      y: (y + 0.5) * (100 / SIZE),
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 1,
      color: ["#34d399", "#6ee7b7", "#f43f5e", "#fbbf24"][Math.floor(Math.random() * 4)]
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };
  const changeDirection = useCallback((newDir) => {
    const current = dirRef.current;
    if (newDir.x !== -current.x || newDir.y !== -current.y) {
      dirRef.current = newDir;
      setDir(newDir);
      arcadeSound.playClick(500);
    }
  }, []);
  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    const newFood = getRandomFood(INITIAL_SNAKE);
    setFood(newFood);
    dirRef.current = { x: 1, y: 0 };
    setDir({ x: 1, y: 0 });
    setScore(0);
    setOver(false);
    setRunning(true);
    arcadeSound.playSuccess();
  };
  useEffect(() => {
    const handleKey = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D", " "].includes(e.key)) {
        e.preventDefault();
      }
      const map = {
        ArrowUp: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        d: { x: 1, y: 0 },
        D: { x: 1, y: 0 }
      };
      if (map[e.key]) {
        changeDirection(map[e.key]);
      } else if (e.key === " ") {
        setRunning((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [changeDirection]);
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    boardTouchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e) => {
    if (!boardTouchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - boardTouchStart.current.x;
    const dy = t.clientY - boardTouchStart.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist >= 24) {
      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      } else {
        changeDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
      }
    }
    boardTouchStart.current = null;
  };
  useEffect(() => {
    if (!running) return;
    const baseSpeed = turbo ? 70 : Math.max(75, 140 - score * 0.8);
    const interval = setInterval(() => {
      const s = stateRef.current;
      const head = {
        x: s.snake[0].x + dirRef.current.x,
        y: s.snake[0].y + dirRef.current.y
      };
      const hitWall = head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE;
      const eating = head.x === s.food.x && head.y === s.food.y;
      const body = eating ? s.snake : s.snake.slice(0, -1);
      const hitSelf = body.some((p) => p.x === head.x && p.y === head.y);
      if (hitWall || hitSelf) {
        setRunning(false);
        setOver(true);
        arcadeSound.playError();
        const { newBest, unlockedAchievement } = recordScore("snake", s.score, Math.round(s.score / 2));
        if (newBest) setBest(s.score);
        if (unlockedAchievement && onNotifyAchievement) {
          onNotifyAchievement(unlockedAchievement);
        }
        return;
      }
      const nextSnake = [head, ...s.snake.slice(0, eating ? void 0 : -1)];
      setSnake(nextSnake);
      if (eating) {
        arcadeSound.playSnakeEat();
        spawnParticles(head.x, head.y);
        const newFood = getRandomFood(nextSnake);
        setFood(newFood);
        setScore((prev) => {
          const nextScore = prev + (turbo ? 15 : 10);
          setBest((b) => Math.max(b, nextScore));
          return nextScore;
        });
      }
    }, baseSpeed);
    return () => clearInterval(interval);
  }, [running, score, turbo, onNotifyAchievement]);
  useEffect(() => {
    if (particles.length === 0) return;
    const pTimer = setInterval(() => {
      setParticles(
        (prev) => prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.1
        })).filter((p) => p.life > 0)
      );
    }, 30);
    return () => clearInterval(pTimer);
  }, [particles]);
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      {
    /* Intro & Controls Column */
  }
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400">ARCADE CLASSIC / 01</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            Neon Snake<span className="text-emerald-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Eat luminous power cells to grow. Swipe directly on the grid or use the tactile D-pad below. Avoid boundary walls and your own tail.
          </p>
        </div>

        {
    /* Score & Personal Best HUD */
  }
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">CURRENT SCORE</span>
            <span className="text-3xl font-black font-mono text-emerald-400">
              {score.toString().padStart(3, "0")}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">PERSONAL BEST</span>
            <span className="text-3xl font-black font-mono text-white">
              {best.toString().padStart(3, "0")}
            </span>
          </div>
        </div>

        {
    /* Action Controls */
  }
        <div className="flex flex-wrap items-center gap-3">
          <button
    onClick={running ? () => setRunning(false) : over || snake.length === INITIAL_SNAKE.length && score === 0 ? startGame : () => setRunning(true)}
    className="flex-1 min-w-[140px] px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
  >
            {running ? <>
                <Pause className="w-4 h-4" /> Pause Game
              </> : over ? <>
                <RotateCcw className="w-4 h-4" /> Play Again
              </> : <>
                <Play className="w-4 h-4 fill-current" /> Start Game
              </>}
          </button>

          <button
    onClick={startGame}
    className="px-4 py-3 rounded-xl font-semibold text-xs border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-all flex items-center gap-2"
  >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>

          <button
    onClick={() => {
      setTurbo((t) => !t);
      arcadeSound.playClick();
    }}
    className={`px-3 py-3 rounded-xl font-mono text-xs border transition-all flex items-center gap-1.5 ${turbo ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`}
    title="Toggle Turbo Mode (Higher speed, +15 pts per food)"
  >
            <Zap className={`w-3.5 h-3.5 ${turbo ? "fill-current animate-pulse" : ""}`} />
            {turbo ? "TURBO ON" : "TURBO"}
          </button>
        </div>

        {
    /* Tactile Virtual D-Pad for Mobile & Touch */
  }
        <div className="pt-2">
          <div className="text-[10px] font-mono text-white/40 tracking-wider mb-2 text-center sm:text-left">
            GESTURE CONTROLS · SWIPE BOARD OR USE TOUCH PAD
          </div>
          <div className="flex flex-col items-center gap-2 max-w-[180px] mx-auto sm:mx-0">
            <button
    onClick={() => changeDirection({ x: 0, y: -1 })}
    className="w-12 h-11 rounded-xl bg-white/10 hover:bg-emerald-500/30 active:scale-90 border border-white/15 flex items-center justify-center text-white transition-all shadow-md"
    aria-label="Up"
  >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <button
    onClick={() => changeDirection({ x: -1, y: 0 })}
    className="w-12 h-11 rounded-xl bg-white/10 hover:bg-emerald-500/30 active:scale-90 border border-white/15 flex items-center justify-center text-white transition-all shadow-md"
    aria-label="Left"
  >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
    onClick={() => changeDirection({ x: 0, y: 1 })}
    className="w-12 h-11 rounded-xl bg-white/10 hover:bg-emerald-500/30 active:scale-90 border border-white/15 flex items-center justify-center text-white transition-all shadow-md"
    aria-label="Down"
  >
                <ChevronDown className="w-6 h-6" />
              </button>
              <button
    onClick={() => changeDirection({ x: 1, y: 0 })}
    className="w-12 h-11 rounded-xl bg-white/10 hover:bg-emerald-500/30 active:scale-90 border border-white/15 flex items-center justify-center text-white transition-all shadow-md"
    aria-label="Right"
  >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {
    /* Game Board Column */
  }
      <div className="lg:col-span-7">
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0c16] border border-white/15 shadow-2xl shadow-emerald-500/10 relative overflow-hidden">
          {
    /* Header Bar */
  }
          <div className="flex items-center justify-between pb-3 text-xs font-mono text-white/50 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span
    className={`w-2 h-2 rounded-full ${running ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : over ? "bg-rose-500" : "bg-amber-400"}`}
  />
              <span className="text-white/80 font-semibold">
                {over ? "RUN TERMINATED" : running ? "GRID ACTIVE" : "SYSTEM STANDBY"}
              </span>
            </div>
            <span>SIZE: 20x20</span>
          </div>

          {
    /* Interactive Snake Canvas Grid */
  }
          <div
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    className="relative aspect-square w-full my-3 rounded-2xl bg-[#070810] border border-white/10 overflow-hidden cursor-pointer select-none"
    style={{
      backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      backgroundSize: "5% 5%"
    }}
  >
            {
    /* Grid rendering */
  }
            <div
    className="grid w-full h-full"
    style={{
      gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
      gridTemplateRows: `repeat(${SIZE}, 1fr)`
    }}
  >
              {Array.from({ length: SIZE * SIZE }, (_, i) => {
    const x = i % SIZE;
    const y = Math.floor(i / SIZE);
    const isHead = snake[0].x === x && snake[0].y === y;
    const bodyIndex = snake.findIndex((p, idx) => idx > 0 && p.x === x && p.y === y);
    const isFood = food.x === x && food.y === y;
    return <div key={i} className="relative flex items-center justify-center p-[1px]">
                    {isHead && <div className="w-full h-full rounded-[4px] bg-emerald-400 shadow-[0_0_12px_#34d399] z-10 flex items-center justify-center text-[8px] text-slate-950 font-black">
                        ◆
                      </div>}
                    {bodyIndex > -1 && <div
      className="w-full h-full rounded-[3px] transition-all"
      style={{
        backgroundColor: `rgba(16, 185, 129, ${Math.max(0.35, 1 - bodyIndex / snake.length)})`,
        border: "1px solid rgba(52, 211, 153, 0.4)"
      }}
    />}
                    {isFood && <div className="w-full h-full rounded-full bg-rose-500 shadow-[0_0_15px_#f43f5e] animate-pulse flex items-center justify-center text-[10px] text-white">
                        ✦
                      </div>}
                  </div>;
  })}
            </div>

            {
    /* Sparkle particle burst layer */
  }
            {particles.map((p, idx) => <div
    key={idx}
    className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
    style={{
      left: `${p.x}%`,
      top: `${p.y}%`,
      backgroundColor: p.color,
      opacity: p.life,
      boxShadow: `0 0 6px ${p.color}`,
      transform: `scale(${p.life * 1.5})`
    }}
  />)}

            {
    /* Start / Game Over Overlay */
  }
            {!running && <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
                <span className="text-xs font-mono tracking-widest text-emerald-400">
                  {over ? "CRASH DETECTED" : "READY TO SLITHER"}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {over ? `Run Ended with ${score} Points!` : "Swipe or use keys to navigate"}
                </h3>
                <p className="text-xs text-white/60 max-w-xs mt-1 mb-4">
                  {over ? score >= best && score > 0 ? "New high score record set! Spectacular run." : "Watch out for corners and stay nimble." : "Collect glowing gems. Each one increases length and score."}
                </p>
                <button
    onClick={startGame}
    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-400 text-slate-950 hover:bg-emerald-300 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
  >
                  <Play className="w-4 h-4 fill-current" /> {over ? "Try Again" : "Launch Snake"}
                </button>
              </div>}
          </div>

          {
    /* Footer Info */
  }
          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1">
            <span>✦ 10 PTS / CELL</span>
            <span>SWIPE ANYWHERE TO TURN</span>
            <span>SPACE = PAUSE</span>
          </div>
        </div>
      </div>
    </div>;
}
