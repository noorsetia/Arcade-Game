import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  RotateCcw,
  Play,
  Skull,
  Zap
} from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore, getPlayerStats } from "../utils/playerStats";
export default function BossRush({ onNotifyAchievement }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [score, setScore] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [bossName, setBossName] = useState("Megadrone Aegis");
  const [bossStage, setBossStage] = useState(1);
  const [playerHp, setPlayerHp] = useState(100);
  const [bombs, setBombs] = useState(2);
  const stateRef = useRef({
    playerX: 360,
    playerY: 420,
    playerHp: 100,
    playerBombs: 2,
    playerInvuln: 0,
    bullets: [],
    particles: [],
    boss: null,
    score: 0,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false
    },
    shootCooldown: 0,
    lastFrameTime: performance.now()
  });
  const requestRef = useRef(null);
  const initBoss = (stage) => {
    if (stage === 1) {
      return {
        name: "Megadrone Aegis",
        stage: 1,
        hp: 300,
        maxHp: 300,
        x: 360,
        y: 110,
        vx: 2.2,
        phase: 1,
        attackTimer: 0,
        subTimer: 0,
        color: "#38bdf8"
      };
    } else if (stage === 2) {
      return {
        name: "Cyber Wyrm",
        stage: 2,
        hp: 450,
        maxHp: 450,
        x: 360,
        y: 120,
        vx: 3.5,
        phase: 1,
        attackTimer: 0,
        subTimer: 0,
        color: "#e879f9"
      };
    } else {
      return {
        name: "Quantum Overmind",
        stage: 3,
        hp: 650,
        maxHp: 650,
        x: 360,
        y: 110,
        vx: 4.2,
        phase: 1,
        attackTimer: 0,
        subTimer: 0,
        color: "#f43f5e"
      };
    }
  };
  const startGame = () => {
    const initialBoss = initBoss(1);
    stateRef.current = {
      playerX: 360,
      playerY: 420,
      playerHp: 100,
      playerBombs: 2,
      playerInvuln: 60,
      bullets: [],
      particles: [],
      boss: initialBoss,
      score: 0,
      keys: { left: false, right: false, up: false, down: false, shoot: false },
      shootCooldown: 0,
      lastFrameTime: performance.now()
    };
    setBossHp(initialBoss.hp);
    setBossMaxHp(initialBoss.maxHp);
    setBossName(initialBoss.name);
    setBossStage(1);
    setPlayerHp(100);
    setBombs(2);
    setScore(0);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
    setIsPlaying(true);
    arcadeSound.playLaser();
  };
  const deployBomb = useCallback(() => {
    const s = stateRef.current;
    if (s.playerBombs <= 0 || !isPlaying || isPaused || isGameOver || isVictory) return;
    s.playerBombs -= 1;
    setBombs(s.playerBombs);
    arcadeSound.playExplosion();
    s.bullets = s.bullets.filter((b) => !b.isEnemy);
    if (s.boss) {
      s.boss.hp -= 60;
      setBossHp(Math.max(0, s.boss.hp));
    }
    for (let i = 0; i < 40; i++) {
      s.particles.push({
        x: s.playerX,
        y: s.playerY,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 1,
        maxLife: 25,
        color: "#22d3ee",
        radius: 3 + Math.random() * 3
      });
    }
  }, [isPlaying, isPaused, isGameOver, isVictory]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = stateRef.current.keys;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") k.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") k.right = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") k.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") k.down = true;
      if (e.key === " " || e.key === "j" || e.key === "J") k.shoot = true;
      if (e.key === "b" || e.key === "B" || e.key === "k" || e.key === "K") deployBomb();
      if (e.key === "p" || e.key === "P") setIsPaused((p) => !p);
    };
    const handleKeyUp = (e) => {
      const k = stateRef.current.keys;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") k.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") k.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") k.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") k.down = false;
      if (e.key === " " || e.key === "j" || e.key === "J") k.shoot = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [deployBomb]);
  const handlePointerMove = (e) => {
    if (!isPlaying || isPaused || isGameOver || isVictory) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 720 / rect.width;
    const scaleY = 480 / rect.height;
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;
    stateRef.current.playerX = Math.max(25, Math.min(695, clientX));
    stateRef.current.playerY = Math.max(180, Math.min(460, clientY));
    stateRef.current.keys.shoot = true;
  };
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver || isVictory) return;
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
      const speed = 6 * dt;
      if (s.keys.left) s.playerX = Math.max(25, s.playerX - speed);
      if (s.keys.right) s.playerX = Math.min(canvas.width - 25, s.playerX + speed);
      if (s.keys.up) s.playerY = Math.max(180, s.playerY - speed);
      if (s.keys.down) s.playerY = Math.min(canvas.height - 25, s.playerY + speed);
      if (s.playerInvuln > 0) s.playerInvuln -= dt;
      s.shootCooldown -= dt;
      if ((s.keys.shoot || true) && s.shootCooldown <= 0) {
        s.shootCooldown = 6;
        s.bullets.push({
          x: s.playerX - 9,
          y: s.playerY - 14,
          vx: 0,
          vy: -11,
          isEnemy: false,
          color: "#38bdf8",
          radius: 3.5,
          damage: 5
        });
        s.bullets.push({
          x: s.playerX + 9,
          y: s.playerY - 14,
          vx: 0,
          vy: -11,
          isEnemy: false,
          color: "#38bdf8",
          radius: 3.5,
          damage: 5
        });
        arcadeSound.playLaser();
      }
      const boss = s.boss;
      if (boss) {
        boss.x += boss.vx * dt;
        if (boss.x < 120 || boss.x > canvas.width - 120) {
          boss.vx = -boss.vx;
        }
        boss.attackTimer += dt;
        boss.subTimer += dt;
        if (boss.stage === 1) {
          if (boss.attackTimer >= 40) {
            boss.attackTimer = 0;
            for (let angle = -0.5; angle <= 0.5; angle += 0.25) {
              s.bullets.push({
                x: boss.x,
                y: boss.y + 35,
                vx: Math.sin(angle) * 4.5,
                vy: Math.cos(angle) * 4.5,
                isEnemy: true,
                color: "#f43f5e",
                radius: 4,
                damage: 15
              });
            }
          }
        } else if (boss.stage === 2) {
          if (boss.attackTimer >= 22) {
            boss.attackTimer = 0;
            const targetAngle = Math.atan2(s.playerY - boss.y, s.playerX - boss.x);
            s.bullets.push({
              x: boss.x,
              y: boss.y + 30,
              vx: Math.cos(targetAngle) * 5.2,
              vy: Math.sin(targetAngle) * 5.2,
              isEnemy: true,
              color: "#e879f9",
              radius: 4.5,
              damage: 18
            });
          }
        } else if (boss.stage === 3) {
          if (boss.subTimer >= 6) {
            boss.subTimer = 0;
            const spin = timestamp * 6e-3 % (Math.PI * 2);
            s.bullets.push({
              x: boss.x,
              y: boss.y + 30,
              vx: Math.cos(spin) * 4.2,
              vy: Math.sin(spin) * 4.2,
              isEnemy: true,
              color: "#fbbf24",
              radius: 4,
              damage: 20
            });
            s.bullets.push({
              x: boss.x,
              y: boss.y + 30,
              vx: Math.cos(spin + Math.PI) * 4.2,
              vy: Math.sin(spin + Math.PI) * 4.2,
              isEnemy: true,
              color: "#fbbf24",
              radius: 4,
              damage: 20
            });
          }
        }
        if (boss.hp <= 0) {
          arcadeSound.playExplosion();
          for (let p = 0; p < 45; p++) {
            s.particles.push({
              x: boss.x,
              y: boss.y,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              life: 1,
              maxLife: 35,
              color: boss.color,
              radius: 4 + Math.random() * 4
            });
          }
          s.score += 2500 * boss.stage;
          setScore(s.score);
          if (boss.stage < 3) {
            const nextStage = boss.stage + 1;
            const nextBoss = initBoss(nextStage);
            s.boss = nextBoss;
            setBossStage(nextStage);
            setBossName(nextBoss.name);
            setBossHp(nextBoss.hp);
            setBossMaxHp(nextBoss.maxHp);
            s.playerHp = Math.min(100, s.playerHp + 40);
            s.playerBombs += 1;
            setPlayerHp(s.playerHp);
            setBombs(s.playerBombs);
          } else {
            running = false;
            setIsVictory(true);
            const res = recordScore("boss-rush", s.score);
            if (res.newAchievements && onNotifyAchievement) {
              res.newAchievements.forEach((a) => onNotifyAchievement(a));
            }
            return;
          }
        }
      }
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (!b.isEnemy && boss) {
          const dx = b.x - boss.x;
          const dy = b.y - boss.y;
          if (Math.abs(dx) < 45 && Math.abs(dy) < 35) {
            boss.hp -= b.damage;
            s.score += 25;
            setBossHp(Math.max(0, boss.hp));
            setScore(s.score);
            s.bullets.splice(i, 1);
            s.particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 1,
              maxLife: 10,
              color: "#38bdf8",
              radius: 2
            });
            continue;
          }
        }
        if (b.isEnemy && s.playerInvuln <= 0) {
          const dx = b.x - s.playerX;
          const dy = b.y - s.playerY;
          if (Math.sqrt(dx * dx + dy * dy) < 14) {
            s.playerHp -= b.damage;
            s.playerInvuln = 45;
            setPlayerHp(Math.max(0, s.playerHp));
            arcadeSound.playError();
            s.bullets.splice(i, 1);
            if (s.playerHp <= 0) {
              running = false;
              setIsGameOver(true);
              arcadeSound.playExplosion();
              const res = recordScore("boss-rush", s.score);
              if (res.newAchievements && onNotifyAchievement) {
                res.newAchievements.forEach((a) => onNotifyAchievement(a));
              }
              return;
            }
            continue;
          }
        }
        if (b.y < -20 || b.y > canvas.height + 20 || b.x < -20 || b.x > canvas.width + 20) {
          s.bullets.splice(i, 1);
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
      ctx.fillStyle = "#050411";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const bgY = timestamp * 0.1 % 40;
      ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
      ctx.lineWidth = 1;
      for (let y = bgY; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      if (boss) {
        ctx.save();
        ctx.fillStyle = boss.color;
        ctx.shadowColor = boss.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(boss.x, boss.y + 40);
        ctx.lineTo(boss.x + 55, boss.y - 15);
        ctx.lineTo(boss.x + 35, boss.y - 35);
        ctx.lineTo(boss.x - 35, boss.y - 35);
        ctx.lineTo(boss.x - 55, boss.y - 15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(boss.x, boss.y - 5, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      s.bullets.forEach((b) => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      s.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      if (s.playerInvuln % 10 < 5) {
        ctx.save();
        ctx.fillStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(s.playerX, s.playerY - 18);
        ctx.lineTo(s.playerX + 16, s.playerY + 12);
        ctx.lineTo(s.playerX + 7, s.playerY + 8);
        ctx.lineTo(s.playerX - 7, s.playerY + 8);
        ctx.lineTo(s.playerX - 16, s.playerY + 12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#22d3ee";
        ctx.beginPath();
        ctx.arc(s.playerX, s.playerY + 11, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isPaused, isGameOver, isVictory, onNotifyAchievement]);
  const high = getPlayerStats().highScores["boss-rush"] || 0;
  return <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto space-y-4">
      {
    /* Top HUD */
  }
      <div className="w-full flex items-center justify-between p-4 bg-slate-900/90 border border-rose-500/30 rounded-2xl backdrop-blur-md shadow-xl shadow-rose-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
            <Skull className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Boss Rush</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                BOSS {bossStage}/3
              </span>
            </div>
            <p className="text-[11px] font-mono text-rose-400/80">{bossName}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase">Score</span>
            <div className="text-lg font-black font-mono text-cyan-300 leading-none">{score}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase">Player Hull</span>
            <div className={`text-lg font-black font-mono leading-none ${playerHp < 30 ? "text-rose-400 animate-pulse" : "text-emerald-300"}`}>
              {playerHp}%
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-white/50 uppercase">EMP Bombs</span>
            <div className="text-lg font-black font-mono text-amber-300 leading-none">{bombs}</div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-white/50 uppercase">Best</span>
            <div className="text-lg font-black font-mono text-white/80 leading-none">{high}</div>
          </div>
        </div>
      </div>

      {
    /* Main Canvas */
  }
      <div className="relative w-full aspect-[3/2] max-w-[720px] bg-[#050411] rounded-2xl border-2 border-rose-500/40 overflow-hidden shadow-2xl shadow-rose-500/10 select-none">
        <canvas
    ref={canvasRef}
    width={720}
    height={480}
    onPointerMove={handlePointerMove}
    className="w-full h-full block cursor-crosshair touch-none"
  />

        {
    /* Boss HP Bar on Canvas */
  }
        {isPlaying && !isGameOver && !isVictory && <div className="absolute top-3 left-6 right-6 flex flex-col gap-1 z-10 pointer-events-none">
            <div className="flex items-center justify-between text-[11px] font-mono text-rose-300 font-bold">
              <span>{bossName}</span>
              <span>
                {bossHp} / {bossMaxHp} HP
              </span>
            </div>
            <div className="w-full h-3 bg-black/60 rounded-full border border-rose-500/40 overflow-hidden">
              <div
    className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-all duration-100 shadow-[0_0_10px_#f43f5e]"
    style={{ width: `${Math.max(0, bossHp / bossMaxHp * 100)}%` }}
  />
            </div>
          </div>}

        {
    /* Start Game Modal */
  }
        {!isPlaying && <div className="absolute inset-0 bg-[#050411]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-lg shadow-rose-500/20">
              <Skull className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white font-display">Neural Overlords Approaching</h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans max-w-sm">
              Survive 3 brutal boss waves. Evade dense bullet patterns, blast down weakpoints, and detonate EMP bombs to clear enemy fire.
            </p>
            <button
    onClick={startGame}
    className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-amber-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-rose-500/25 flex items-center gap-2"
  >
              <Play className="w-4 h-4 fill-current" /> Engage Boss Wave 1
            </button>
          </div>}

        {
    /* Victory Screen */
  }
        {isVictory && <div className="absolute inset-0 bg-[#050411]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-xl shadow-emerald-500/20">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400">ARCADE CONQUERED</span>
              <h3 className="text-2xl font-black text-white">All 3 Boss Overlords Terminated!</h3>
              <p className="text-sm font-mono text-cyan-300 font-bold mt-1">Final Score: {score} PTS</p>
            </div>
            <button
    onClick={startGame}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
  >
              <RotateCcw className="w-4 h-4" /> Challenge Again
            </button>
          </div>}

        {
    /* Game Over Screen */
  }
        {isGameOver && <div className="absolute inset-0 bg-[#050411]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 shadow-xl shadow-rose-500/20">
              <Skull className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-rose-400">VESSEL DESTROYED</span>
              <h3 className="text-2xl font-black text-white">Overwhelmed by {bossName}</h3>
              <p className="text-sm font-mono text-amber-300 font-bold mt-1">Score: {score} PTS</p>
            </div>
            <button
    onClick={startGame}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-rose-500 text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
  >
              <RotateCcw className="w-4 h-4" /> Retry Boss Rush
            </button>
          </div>}

        {
    /* Pause Screen */
  }
        {isPaused && <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-20">
            <h3 className="text-2xl font-black text-white font-mono">BATTLE SUSPENDED</h3>
            <button
    onClick={() => setIsPaused(false)}
    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-500 text-white hover:bg-rose-400"
  >
              Resume
            </button>
          </div>}
      </div>

      {
    /* Mobile Bomb & Fire Trigger */
  }
      <div className="flex items-center gap-4">
        <button
    onClick={deployBomb}
    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 transition-all shadow flex items-center gap-1.5"
  >
          <Zap className="w-4 h-4" /> Detonate EMP Bomb ({bombs})
        </button>
      </div>

      {
    /* Instructions */
  }
      <div className="flex items-center justify-between w-full max-w-lg text-[11px] font-mono text-white/50 px-2">
        <span>Drag mouse / WASD to fly</span>
        <span>Space / J: Fire · B: EMP Bomb</span>
        <span>Pause: P</span>
      </div>
    </div>;
}
