import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  RotateCcw,
  Play,
  ArrowUpDown
} from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore, getPlayerStats } from "../utils/playerStats";
export default function GravityFlip({ onNotifyAchievement }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const stateRef = useRef({
    playerY: 260,
    playerX: 80,
    playerRadius: 14,
    gravityDir: 1,
    // 1 = down, -1 = up
    vy: 0,
    speed: 5.5,
    obstacles: [],
    collectibles: [],
    particles: [],
    flipRipples: [],
    score: 0,
    distance: 0,
    multiplier: 1,
    lastObstacleX: 400,
    bgOffset: 0,
    lastFrameTime: performance.now()
  });
  const requestRef = useRef(null);
  const triggerFlip = useCallback(() => {
    if (!isPlaying || isPaused || isGameOver) return;
    const s = stateRef.current;
    s.gravityDir = s.gravityDir * -1;
    s.vy = s.gravityDir * 4;
    arcadeSound.playFlip();
    s.flipRipples.push({
      x: s.playerX,
      y: s.playerY,
      r: 10,
      alpha: 1
    });
    for (let i = 0; i < 10; i++) {
      s.particles.push({
        x: s.playerX,
        y: s.playerY,
        vx: (Math.random() - 0.5) * 6,
        vy: -s.gravityDir * (Math.random() * 4 + 2),
        life: 1,
        maxLife: 20 + Math.random() * 10,
        color: "#22d3ee"
      });
    }
  }, [isPlaying, isPaused, isGameOver]);
  const startGame = () => {
    stateRef.current = {
      playerY: 260,
      playerX: 80,
      playerRadius: 14,
      gravityDir: 1,
      vy: 0,
      speed: 5.5,
      obstacles: [],
      collectibles: [],
      particles: [],
      flipRipples: [],
      score: 0,
      distance: 0,
      multiplier: 1,
      lastObstacleX: 400,
      bgOffset: 0,
      lastFrameTime: performance.now()
    };
    setScore(0);
    setDistance(0);
    setMultiplier(1);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    arcadeSound.playLaser();
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        triggerFlip();
      } else if (e.key === "p" || e.key === "P") {
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerFlip]);
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let running = true;
    const loop = (timestamp) => {
      if (!running) return;
      const s = stateRef.current;
      const dt = Math.min(32, timestamp - s.lastFrameTime) / 16.66;
      s.lastFrameTime = timestamp;
      const floorY = canvas.height - 30;
      const ceilingY = 30;
      s.distance += s.speed * 0.1 * dt;
      s.speed = 5.5 + Math.min(6, s.distance * 5e-3);
      s.score += Math.floor(s.multiplier * dt);
      setScore(s.score);
      setDistance(Math.floor(s.distance));
      const gravityAcc = 0.85 * s.gravityDir * dt;
      s.vy += gravityAcc;
      s.playerY += s.vy * dt;
      if (s.playerY >= floorY - s.playerRadius) {
        s.playerY = floorY - s.playerRadius;
        s.vy = 0;
      } else if (s.playerY <= ceilingY + s.playerRadius) {
        s.playerY = ceilingY + s.playerRadius;
        s.vy = 0;
      }
      if (Math.random() > 0.3) {
        s.particles.push({
          x: s.playerX - 10,
          y: s.playerY + (Math.random() - 0.5) * 8,
          vx: -s.speed * 0.8,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          maxLife: 15,
          color: s.gravityDir === 1 ? "#38bdf8" : "#e879f9"
        });
      }
      if (canvas.width - s.lastObstacleX > 180 + Math.random() * 100) {
        const typeRoll = Math.random();
        const pos = typeRoll < 0.45 ? "floor" : typeRoll < 0.9 ? "ceiling" : "floating";
        const obsH = Math.floor(Math.random() * 55) + 40;
        const obsW = 26 + Math.floor(Math.random() * 20);
        s.obstacles.push({
          x: canvas.width + 20,
          width: obsW,
          height: obsH,
          position: pos,
          y: pos === "floating" ? Math.floor(Math.random() * (floorY - ceilingY - 100)) + ceilingY + 50 : void 0,
          color: pos === "floor" ? "#f43f5e" : pos === "ceiling" ? "#ec4899" : "#eab308"
        });
        if (Math.random() > 0.4) {
          s.collectibles.push({
            x: canvas.width + 100,
            y: pos === "floor" ? ceilingY + 35 : floorY - 35,
            radius: 8,
            collected: false
          });
        }
        s.lastObstacleX = canvas.width;
      }
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.x -= s.speed * dt;
        let obsY = 0;
        if (obs.position === "floor") obsY = floorY - obs.height;
        else if (obs.position === "ceiling") obsY = ceilingY;
        else if (obs.position === "floating" && obs.y !== void 0) obsY = obs.y;
        const closestX = Math.max(obs.x, Math.min(s.playerX, obs.x + obs.width));
        const closestY = Math.max(obsY, Math.min(s.playerY, obsY + obs.height));
        const distX = s.playerX - closestX;
        const distY = s.playerY - closestY;
        const distanceSquared = distX * distX + distY * distY;
        if (distanceSquared < (s.playerRadius - 2) * (s.playerRadius - 2)) {
          running = false;
          setIsGameOver(true);
          arcadeSound.playExplosion();
          const res = recordScore("gravity-flip", s.score);
          if (res.newAchievements && onNotifyAchievement) {
            res.newAchievements.forEach((a) => onNotifyAchievement(a));
          }
          return;
        }
        if (obs.x + obs.width < -50) {
          s.obstacles.splice(i, 1);
        }
      }
      for (let i = s.collectibles.length - 1; i >= 0; i--) {
        const orb = s.collectibles[i];
        orb.x -= s.speed * dt;
        const dx = s.playerX - orb.x;
        const dy = s.playerY - orb.y;
        if (Math.sqrt(dx * dx + dy * dy) < s.playerRadius + orb.radius) {
          s.collectibles.splice(i, 1);
          s.score += 250;
          s.multiplier = Math.min(5, s.multiplier + 0.5);
          setMultiplier(s.multiplier);
          arcadeSound.playPowerup();
          for (let p = 0; p < 8; p++) {
            s.particles.push({
              x: orb.x,
              y: orb.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 1,
              maxLife: 15,
              color: "#fbbf24"
            });
          }
        } else if (orb.x < -30) {
          s.collectibles.splice(i, 1);
        }
      }
      for (let i = s.flipRipples.length - 1; i >= 0; i--) {
        const rip = s.flipRipples[i];
        rip.r += 3.5 * dt;
        rip.alpha -= 0.05 * dt;
        if (rip.alpha <= 0) {
          s.flipRipples.splice(i, 1);
        }
      }
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life += dt;
        if (p.life >= p.maxLife) {
          s.particles.splice(i, 1);
        }
      }
      ctx.fillStyle = "#060515";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      s.bgOffset = (s.bgOffset + s.speed * 0.4 * dt) % 40;
      ctx.strokeStyle = "rgba(129, 140, 248, 0.08)";
      ctx.lineWidth = 1;
      for (let x = -s.bgOffset; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
      ctx.fillRect(0, 0, canvas.width, ceilingY);
      ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(0, ceilingY);
      ctx.lineTo(canvas.width, ceilingY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(canvas.width, floorY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      s.flipRipples.forEach((rip) => {
        ctx.save();
        ctx.strokeStyle = `rgba(34, 211, 238, ${rip.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      s.obstacles.forEach((obs) => {
        let obsY = 0;
        if (obs.position === "floor") obsY = floorY - obs.height;
        else if (obs.position === "ceiling") obsY = ceilingY;
        else if (obs.position === "floating" && obs.y !== void 0) obsY = obs.y;
        ctx.save();
        ctx.fillStyle = obs.color;
        ctx.shadowColor = obs.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        if (obs.position === "floor") {
          ctx.moveTo(obs.x, floorY);
          ctx.lineTo(obs.x + 4, obsY);
          ctx.lineTo(obs.x + obs.width - 4, obsY);
          ctx.lineTo(obs.x + obs.width, floorY);
        } else if (obs.position === "ceiling") {
          ctx.moveTo(obs.x, ceilingY);
          ctx.lineTo(obs.x + 4, obsY + obs.height);
          ctx.lineTo(obs.x + obs.width - 4, obsY + obs.height);
          ctx.lineTo(obs.x + obs.width, ceilingY);
        } else {
          ctx.roundRect(obs.x, obsY, obs.width, obs.height, 6);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 0;
        ctx.fillRect(obs.x + obs.width / 2 - 2, obsY + 6, 4, obs.height - 12);
        ctx.restore();
      });
      s.collectibles.forEach((orb) => {
        ctx.save();
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(orb.x - 2, orb.y - 2, orb.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      s.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      ctx.save();
      const pColor = s.gravityDir === 1 ? "#38bdf8" : "#e879f9";
      ctx.shadowColor = pColor;
      ctx.shadowBlur = 20;
      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.moveTo(s.playerX + s.playerRadius + 4, s.playerY);
      ctx.lineTo(s.playerX - s.playerRadius, s.playerY - s.playerRadius * 0.8);
      ctx.lineTo(s.playerX - s.playerRadius * 0.5, s.playerY);
      ctx.lineTo(s.playerX - s.playerRadius, s.playerY + s.playerRadius * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(s.playerX, s.playerY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isPaused, isGameOver, onNotifyAchievement]);
  const high = getPlayerStats().highScores["gravity-flip"] || 0;
  return <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-4">
      {
    /* Top HUD */
  }
      <div className="w-full flex items-center justify-between p-4 bg-slate-900/90 border border-sky-500/30 rounded-2xl backdrop-blur-md shadow-xl shadow-sky-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
            <ArrowUpDown className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Gravity Flip</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                VELOCITY RUNNER
              </span>
            </div>
            <p className="text-[11px] font-mono text-sky-400/80">Invert Gravitational Vector</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase">Score</span>
            <div className="text-lg font-black font-mono text-cyan-300 leading-none">{score}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase">Distance</span>
            <div className="text-lg font-black font-mono text-amber-300 leading-none">{distance}m</div>
          </div>
          {multiplier > 1 && <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-white/50 uppercase">Multi</span>
              <div className="text-lg font-black font-mono text-purple-300 leading-none">{multiplier}x</div>
            </div>}
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-white/50 uppercase">Best</span>
            <div className="text-lg font-black font-mono text-white/80 leading-none">{high}</div>
          </div>
        </div>
      </div>

      {
    /* Main Canvas Canvas Runner */
  }
      <div
    onClick={triggerFlip}
    className="relative w-full aspect-[16/9] max-w-[720px] bg-[#060515] rounded-2xl border-2 border-sky-500/40 overflow-hidden shadow-2xl shadow-sky-500/10 cursor-pointer select-none"
  >
        <canvas ref={canvasRef} width={720} height={400} className="w-full h-full block" />

        {!isPlaying && <div className="absolute inset-0 bg-[#060515]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 z-10">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-lg shadow-sky-500/20">
              <ArrowUpDown className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white font-display">Invert Gravitational Mass</h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans max-w-sm">
              Tap anywhere, press Space or W to toggle between floor and ceiling rails. Avoid plasma spikes and collect bonus data orbs.
            </p>
            <button
    onClick={(e) => {
      e.stopPropagation();
      startGame();
    }}
    className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-sky-500/25 flex items-center gap-2"
  >
              <Play className="w-4 h-4 fill-current" /> Launch Vector Run
            </button>
          </div>}

        {isGameOver && <div className="absolute inset-0 bg-[#060515]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 shadow-xl shadow-rose-500/20">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-rose-400">CRITICAL COLLISION</span>
              <h3 className="text-2xl font-black text-white">Chassis Obliterated</h3>
              <p className="text-sm font-mono text-sky-300 font-bold mt-1">
                Score: {score} PTS · Distance: {distance}m
              </p>
            </div>
            <button
    onClick={(e) => {
      e.stopPropagation();
      startGame();
    }}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-sky-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
  >
              <RotateCcw className="w-4 h-4" /> Deploy Next Craft
            </button>
          </div>}

        {isPaused && <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-20">
            <h3 className="text-2xl font-black text-white font-mono">VECTOR FLIGHT PAUSED</h3>
            <button
    onClick={(e) => {
      e.stopPropagation();
      setIsPaused(false);
    }}
    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-400 text-slate-950 hover:bg-sky-300"
  >
              Resume
            </button>
          </div>}
      </div>

      {
    /* Instructions */
  }
      <div className="flex items-center justify-between w-full max-w-lg text-[11px] font-mono text-white/50 px-2">
        <span>Click / Tap / Space to Flip Gravity</span>
        <span>Pause: P</span>
        <span>Collect Yellow Orbs for Multipliers</span>
      </div>
    </div>;
}
