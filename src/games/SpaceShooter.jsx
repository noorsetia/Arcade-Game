import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Shield, Zap, Sparkles, Heart } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
export default function SpaceShooter({ onNotifyAchievement }) {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem("arcade-space-best") || 0);
    } catch {
      return 0;
    }
  });
  const [lives, setLives] = useState(3);
  const [hasShield, setHasShield] = useState(false);
  const [weaponType, setWeaponType] = useState("standard");
  const [bombCount, setBombCount] = useState(1);
  const gRef = useRef({
    shipX: 0.5,
    targetShipX: 0.5,
    bullets: [],
    rocks: [],
    powerups: [],
    debris: [],
    keys: {},
    tick: 0,
    shake: 0,
    lives: 3,
    score: 0,
    hasShield: false,
    weaponType: "standard",
    tripleTimer: 0,
    autoFire: true
  });
  const resetGame = useCallback(() => {
    gRef.current = {
      shipX: 0.5,
      targetShipX: 0.5,
      bullets: [],
      rocks: [],
      powerups: [],
      debris: [],
      keys: {},
      tick: 0,
      shake: 0,
      lives: 3,
      score: 0,
      hasShield: true,
      weaponType: "standard",
      tripleTimer: 0,
      autoFire: true
    };
    setScore(0);
    setLives(3);
    setHasShield(true);
    setWeaponType("standard");
    setBombCount(1);
    setOver(false);
    setRunning(true);
    arcadeSound.playSuccess();
  }, []);
  const triggerBomb = () => {
    if (bombCount <= 0 || !running) return;
    setBombCount((b) => b - 1);
    arcadeSound.playExplosion();
    const g = gRef.current;
    g.shake = 15;
    g.rocks.forEach((r) => {
      for (let i = 0; i < 12; i++) {
        g.debris.push({
          x: r.x,
          y: r.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: "#f43f5e",
          life: 1,
          size: Math.random() * 3 + 2
        });
      }
    });
    const pts = g.rocks.length * 15;
    g.score += pts;
    g.rocks = [];
    setScore(g.score);
  };
  useEffect(() => {
    const onDown = (e) => {
      if (["ArrowLeft", "ArrowRight", " ", "a", "d", "A", "D", "b", "B"].includes(e.key)) {
        e.preventDefault();
      }
      gRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === "b") {
        triggerBomb();
      }
    };
    const onUp = (e) => {
      gRef.current.keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [triggerBomb]);
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relX = clientX / rect.width;
    gRef.current.targetShipX = Math.max(0.06, Math.min(0.94, relX));
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const g = gRef.current;
      let sx = 0;
      let sy = 0;
      if (g.shake > 0) {
        sx = (Math.random() - 0.5) * g.shake;
        sy = (Math.random() - 0.5) * g.shake;
        g.shake *= 0.88;
        if (g.shake < 0.2) g.shake = 0;
      }
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = "#060914";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 65; i++) {
        const starX = i * 97 % w;
        const starSpeed = i % 3 + 1;
        const starY = (i * 53 + g.tick * starSpeed * 0.8) % h;
        ctx.fillStyle = i % 4 === 0 ? "#38bdf8" : i % 5 === 0 ? "#c084fc" : "#475569";
        ctx.fillRect(starX, starY, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
      }
      if (running && !over) {
        g.tick++;
        if (g.keys.arrowleft || g.keys.a) g.targetShipX -= 0.016;
        if (g.keys.arrowright || g.keys.d) g.targetShipX += 0.016;
        g.targetShipX = Math.max(0.06, Math.min(0.94, g.targetShipX));
        g.shipX += (g.targetShipX - g.shipX) * 0.25;
        if (g.tripleTimer > 0) {
          g.tripleTimer--;
          if (g.tripleTimer === 0) {
            g.weaponType = "standard";
            setWeaponType("standard");
          }
        }
        const canFire = g.tick % 8 === 0;
        if (canFire && (g.autoFire || g.keys[" "])) {
          const shipPx3 = g.shipX * w;
          arcadeSound.playLaser();
          if (g.weaponType === "triple") {
            g.bullets.push({ x: shipPx3, y: h - 55, vx: 0, vy: -10 });
            g.bullets.push({ x: shipPx3 - 10, y: h - 50, vx: -2, vy: -9.5 });
            g.bullets.push({ x: shipPx3 + 10, y: h - 50, vx: 2, vy: -9.5 });
          } else {
            g.bullets.push({ x: shipPx3, y: h - 55, vx: 0, vy: -10 });
          }
        }
        const spawnInterval = Math.max(26, 48 - Math.floor(g.score / 60));
        if (g.tick % spawnInterval === 0) {
          const isLarge = Math.random() < 0.35;
          g.rocks.push({
            x: Math.random() * (w - 60) + 30,
            y: -25,
            r: isLarge ? 22 + Math.random() * 8 : 12 + Math.random() * 6,
            s: 1.8 + Math.random() * 1.6,
            hp: isLarge ? 2 : 1,
            maxHp: isLarge ? 2 : 1,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.04
          });
        }
        g.bullets.forEach((b) => {
          b.x += b.vx;
          b.y += b.vy;
        });
        g.bullets = g.bullets.filter((b) => b.y > -15 && b.x > 0 && b.x < w);
        g.powerups.forEach((p) => {
          p.y += p.vy;
        });
        const shipPx2 = g.shipX * w;
        const shipPy2 = h - 42;
        g.powerups = g.powerups.filter((p) => {
          if (Math.hypot(p.x - shipPx2, p.y - shipPy2) < 32) {
            arcadeSound.playPowerup();
            if (p.type === "triple") {
              g.weaponType = "triple";
              g.tripleTimer = 450;
              setWeaponType("triple");
            } else if (p.type === "shield") {
              g.hasShield = true;
              setHasShield(true);
            } else if (p.type === "bomb") {
              setBombCount((b) => b + 1);
            }
            return false;
          }
          return p.y < h + 20;
        });
        g.rocks.forEach((r) => {
          r.y += r.s;
          r.angle += r.spin;
        });
        g.rocks = g.rocks.filter((r) => {
          const hitIdx = g.bullets.findIndex((b) => Math.hypot(b.x - r.x, b.y - r.y) < r.r + 6);
          if (hitIdx >= 0) {
            g.bullets.splice(hitIdx, 1);
            r.hp--;
            if (r.hp <= 0) {
              arcadeSound.playExplosion();
              g.score += 15;
              setScore(g.score);
              for (let i = 0; i < 9; i++) {
                g.debris.push({
                  x: r.x,
                  y: r.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: ["#a855f7", "#c084fc", "#38bdf8"][Math.floor(Math.random() * 3)],
                  life: 1,
                  size: Math.random() * 3 + 1
                });
              }
              if (Math.random() < 0.16) {
                const types = ["triple", "shield", "bomb"];
                g.powerups.push({
                  x: r.x,
                  y: r.y,
                  type: types[Math.floor(Math.random() * types.length)],
                  vy: 2.2
                });
              }
              return false;
            }
          }
          if (Math.hypot(shipPx2 - r.x, shipPy2 - r.y) < r.r + 16) {
            g.shake = 12;
            if (g.hasShield) {
              g.hasShield = false;
              setHasShield(false);
              arcadeSound.playExplosion();
              return false;
            } else {
              g.lives--;
              setLives(g.lives);
              arcadeSound.playExplosion();
              if (g.lives <= 0) {
                setOver(true);
                setRunning(false);
                arcadeSound.playError();
                const { newBest, unlockedAchievement } = recordScore(
                  "space-shooter",
                  g.score,
                  Math.round(g.score / 2)
                );
                if (newBest) setBest(g.score);
                if (unlockedAchievement && onNotifyAchievement) {
                  onNotifyAchievement(unlockedAchievement);
                }
              }
              return false;
            }
          }
          return r.y < h + 30;
        });
        g.debris.forEach((d) => {
          d.x += d.vx;
          d.y += d.vy;
          d.life -= 0.04;
        });
        g.debris = g.debris.filter((d) => d.life > 0);
      }
      g.debris.forEach((d) => {
        ctx.fillStyle = d.color;
        ctx.globalAlpha = d.life;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * d.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      g.powerups.forEach((p) => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.type === "triple" ? "#38bdf8" : p.type === "shield" ? "#34d399" : "#f59e0b";
        ctx.fillStyle = p.type === "triple" ? "#38bdf8" : p.type === "shield" ? "#34d399" : "#f59e0b";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#060914";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.type === "triple" ? "3X" : p.type === "shield" ? "\u{1F6E1}" : "\u{1F4A3}", p.x, p.y);
        ctx.restore();
      });
      g.bullets.forEach((b) => {
        ctx.fillStyle = "#38bdf8";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#38bdf8";
        ctx.fillRect(b.x - 2, b.y - 10, 4, 14);
        ctx.shadowBlur = 0;
      });
      g.rocks.forEach((r) => {
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.angle);
        ctx.fillStyle = "#1e1b4b";
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#312e81";
        ctx.beginPath();
        ctx.arc(r.r * 0.3, -r.r * 0.2, r.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      const shipPx = g.shipX * w;
      const shipPy = h - 42;
      ctx.save();
      if (g.hasShield) {
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#34d399";
        ctx.beginPath();
        ctx.arc(shipPx, shipPy - 2, 26, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (running) {
        ctx.fillStyle = Math.random() < 0.5 ? "#f97316" : "#facc15";
        ctx.beginPath();
        ctx.moveTo(shipPx - 6, shipPy + 10);
        ctx.lineTo(shipPx + 6, shipPy + 10);
        ctx.lineTo(shipPx, shipPy + 18 + Math.random() * 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#38bdf8";
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.moveTo(shipPx, shipPy - 22);
      ctx.lineTo(shipPx - 16, shipPy + 10);
      ctx.lineTo(shipPx, shipPy + 4);
      ctx.lineTo(shipPx + 16, shipPy + 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(shipPx, shipPy - 6, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [running, over, onNotifyAchievement]);
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      {
    /* Intro & Controls */
  }
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400">ARCADE ACTION / 02</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            Space Shooter<span className="text-cyan-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Glide your ship with finger drag or mouse. Blast asteroids, scoop powerups (Triple Laser, Ion Shield, Nova Bombs), and defend the sector.
          </p>
        </div>

        {
    /* Score & HUD */
  }
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">SCORE</span>
            <span className="text-2xl font-black font-mono text-cyan-400">{score}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">BEST</span>
            <span className="text-2xl font-black font-mono text-white">{best}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">SHIPS</span>
            <div className="flex items-center gap-1 mt-1 text-rose-500">
              {Array.from({ length: 3 }).map((_, i) => <Heart
    key={i}
    className={`w-4 h-4 ${i < lives ? "fill-current" : "opacity-20"}`}
  />)}
            </div>
          </div>
        </div>

        {
    /* Weapon & Buff Indicators */
  }
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
          <div className="flex items-center gap-1.5 flex-1">
            <Zap className={`w-4 h-4 ${weaponType === "triple" ? "text-amber-400" : "text-cyan-400"}`} />
            <span className="font-mono text-white/80">
              {weaponType === "triple" ? "TRI-CANNON ACTIVE" : "STANDARD LASER"}
            </span>
          </div>
          {hasShield && <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> SHIELD ON
            </span>}
        </div>

        {
    /* Actions */
  }
        <div className="flex flex-wrap items-center gap-3">
          <button
    onClick={resetGame}
    className="flex-1 min-w-[140px] px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
  >
            <Play className="w-4 h-4 fill-current" /> {over ? "Relaunch Mission" : running ? "Restart Mission" : "Launch Ship"}
          </button>

          <button
    onClick={triggerBomb}
    disabled={bombCount <= 0 || !running}
    className="px-4 py-3 rounded-xl font-mono text-xs border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10"
    title="Detonate Nova Bomb (Key: B)"
  >
            <Sparkles className="w-3.5 h-3.5" /> NOVA BOMB ({bombCount})
          </button>
        </div>

        <div className="text-[11px] font-mono text-white/40">
          TOUCH / MOUSE: DRAG HORIZONTALLY TO GLIDE · KEYBOARD: ← → OR A/D
        </div>
      </div>

      {
    /* Canvas Viewport */
  }
      <div className="lg:col-span-7">
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0c16] border border-white/15 shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 text-xs font-mono text-white/50 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span
    className={`w-2 h-2 rounded-full ${running ? "bg-cyan-400 shadow-[0_0_8px_#38bdf8]" : over ? "bg-rose-500" : "bg-amber-400"}`}
  />
              <span className="text-white/80 font-semibold">
                {over ? "HULL DESTROYED" : running ? "RADAR ACTIVE" : "HANGAR STANDBY"}
              </span>
            </div>
            <span>SECTOR 09</span>
          </div>

          <div className="relative aspect-[720/520] w-full my-3 rounded-2xl bg-[#060914] border border-white/10 overflow-hidden select-none">
            <canvas
    ref={canvasRef}
    width={720}
    height={520}
    onPointerMove={handlePointerMove}
    onPointerDown={handlePointerMove}
    className="w-full h-full block cursor-crosshair touch-none"
  />

            {
    /* Ready / Game Over Screen Overlay */
  }
            {!running && <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                <span className="text-xs font-mono tracking-widest text-cyan-400">
                  {over ? "MISSION CONCLUDED" : "SHIP PREPARED"}
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {over ? `Sector Cleared with ${score} Pts!` : "Drag to steer & destroy asteroids"}
                </h3>
                <p className="text-xs text-white/60 max-w-sm mt-1 mb-5">
                  Laser cannons are armed with auto-fire. Pick up dropped power-up spheres to amplify your ship.
                </p>
                <button
    onClick={resetGame}
    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-95 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
  >
                  <Play className="w-4 h-4 fill-current" /> {over ? "Fly Again" : "Engage Engines"}
                </button>
              </div>}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1">
            <span>✦ +15 PTS / ASTEROID</span>
            <span>SHIELD + TRIPLE POWERUPS</span>
            <span>DRAG ANYWHERE TO PILOT</span>
          </div>
        </div>
      </div>
    </div>;
}
