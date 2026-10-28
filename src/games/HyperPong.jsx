import { useEffect, useRef, useState, useCallback } from "react";
import { Play } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
export default function HyperPong({ onNotifyAchievement }) {
  const canvasRef = useRef(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState(null);
  const gRef = useRef({
    pY: 0.5,
    pTargetY: 0.5,
    aiY: 0.5,
    ball: { x: 0.5, y: 0.5, vx: 75e-4, vy: 4e-3, r: 8, speed: 1 },
    particles: [],
    playerScore: 0,
    aiScore: 0,
    running: false,
    keys: { up: false, down: false }
  });
  const resetBall = (directionToPlayer) => {
    const g = gRef.current;
    g.ball = {
      x: 0.5,
      y: 0.5,
      vx: (directionToPlayer ? -1 : 1) * 75e-4,
      vy: (Math.random() - 0.5) * 8e-3,
      r: 8,
      speed: 1
    };
  };
  const startGame = useCallback(() => {
    const g = gRef.current;
    g.playerScore = 0;
    g.aiScore = 0;
    g.pY = 0.5;
    g.pTargetY = 0.5;
    g.aiY = 0.5;
    resetBall(false);
    g.running = true;
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    setRunning(true);
    arcadeSound.playSuccess();
  }, []);
  useEffect(() => {
    const onDown = (e) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) gRef.current.keys.up = true;
      if (["ArrowDown", "s", "S"].includes(e.key)) gRef.current.keys.down = true;
    };
    const onUp = (e) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) gRef.current.keys.up = false;
      if (["ArrowDown", "s", "S"].includes(e.key)) gRef.current.keys.down = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;
    gRef.current.pTargetY = Math.max(0.12, Math.min(0.88, relY));
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
      ctx.fillStyle = "#060814";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);
      if (g.running) {
        if (g.keys.up) g.pTargetY -= 0.02;
        if (g.keys.down) g.pTargetY += 0.02;
        g.pTargetY = Math.max(0.12, Math.min(0.88, g.pTargetY));
        g.pY += (g.pTargetY - g.pY) * 0.25;
        const aiSpeed = 0.012;
        if (g.aiY < g.ball.y - 0.04) g.aiY += aiSpeed;
        else if (g.aiY > g.ball.y + 0.04) g.aiY -= aiSpeed;
        g.aiY = Math.max(0.12, Math.min(0.88, g.aiY));
        g.ball.x += g.ball.vx * g.ball.speed;
        g.ball.y += g.ball.vy * g.ball.speed;
        if (g.ball.y - 0.02 < 0) {
          g.ball.y = 0.02;
          g.ball.vy = Math.abs(g.ball.vy);
          arcadeSound.playClick(400);
        } else if (g.ball.y + 0.02 > 1) {
          g.ball.y = 0.98;
          g.ball.vy = -Math.abs(g.ball.vy);
          arcadeSound.playClick(400);
        }
        const paddleH = 0.22;
        const playerX = 0.04;
        const aiX = 0.96;
        if (g.ball.x <= playerX + 0.02 && g.ball.x >= playerX - 0.02) {
          if (Math.abs(g.ball.y - g.pY) < paddleH / 2) {
            g.ball.vx = Math.abs(g.ball.vx);
            g.ball.vy = (g.ball.y - g.pY) * 0.035;
            g.ball.speed = Math.min(2.2, g.ball.speed + 0.06);
            arcadeSound.playLaser();
            for (let i = 0; i < 7; i++) {
              g.particles.push({
                x: g.ball.x * w,
                y: g.ball.y * h,
                vx: (Math.random() + 0.5) * 4,
                vy: (Math.random() - 0.5) * 6,
                color: "#38bdf8",
                life: 1
              });
            }
          }
        }
        if (g.ball.x >= aiX - 0.02 && g.ball.x <= aiX + 0.02) {
          if (Math.abs(g.ball.y - g.aiY) < paddleH / 2) {
            g.ball.vx = -Math.abs(g.ball.vx);
            g.ball.vy = (g.ball.y - g.aiY) * 0.035;
            g.ball.speed = Math.min(2.2, g.ball.speed + 0.06);
            arcadeSound.playLaser();
            for (let i = 0; i < 7; i++) {
              g.particles.push({
                x: g.ball.x * w,
                y: g.ball.y * h,
                vx: -(Math.random() + 0.5) * 4,
                vy: (Math.random() - 0.5) * 6,
                color: "#f43f5e",
                life: 1
              });
            }
          }
        }
        if (g.ball.x > 1.02) {
          arcadeSound.playSuccess();
          g.playerScore++;
          setPlayerScore(g.playerScore);
          resetBall(true);
          if (g.playerScore >= 7) {
            g.running = false;
            setRunning(false);
            setWinner("player");
            arcadeSound.playFanfare();
            const { unlockedAchievement } = recordScore("hyper-pong", g.playerScore, 150);
            if (unlockedAchievement && onNotifyAchievement) {
              onNotifyAchievement(unlockedAchievement);
            }
          }
        }
        if (g.ball.x < -0.02) {
          arcadeSound.playError();
          g.aiScore++;
          setAiScore(g.aiScore);
          resetBall(false);
          if (g.aiScore >= 7) {
            g.running = false;
            setRunning(false);
            setWinner("ai");
          }
        }
        if (Math.random() < 0.7) {
          g.particles.push({
            x: g.ball.x * w,
            y: g.ball.y * h,
            vx: -g.ball.vx * 30,
            vy: -g.ball.vy * 30,
            color: g.ball.speed > 1.4 ? "#f43f5e" : "#38bdf8",
            life: 0.6
          });
        }
        g.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
        });
        g.particles = g.particles.filter((p) => p.life > 0);
      }
      g.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      const paddleHpx = 0.22 * h;
      const paddleWpx = 12;
      ctx.save();
      ctx.fillStyle = "#38bdf8";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#38bdf8";
      ctx.fillRect(0.04 * w - paddleWpx / 2, g.pY * h - paddleHpx / 2, paddleWpx, paddleHpx);
      ctx.restore();
      ctx.save();
      ctx.fillStyle = "#f43f5e";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#f43f5e";
      ctx.fillRect(0.96 * w - paddleWpx / 2, g.aiY * h - paddleHpx / 2, paddleWpx, paddleHpx);
      ctx.restore();
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 18;
      ctx.shadowColor = g.ball.speed > 1.4 ? "#f43f5e" : "#38bdf8";
      ctx.beginPath();
      ctx.arc(g.ball.x * w, g.ball.y * h, g.ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [onNotifyAchievement]);
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400">ARCADE DUEL / 10</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            Hyper Pong<span className="text-cyan-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Fast-paced neon paddle duel against adaptive cyber-AI. Drag your finger or mouse to steer your paddle. First pilot to reach 7 points wins the trophy!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-cyan-500/30 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-cyan-300 block">YOU (CYAN)</span>
            <span className="text-4xl font-black font-mono text-cyan-400">{playerScore}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-rose-500/30 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-rose-300 block">CYBER AI (RED)</span>
            <span className="text-4xl font-black font-mono text-rose-400">{aiScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
    onClick={startGame}
    className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
  >
            <Play className="w-4 h-4 fill-current" /> {winner ? "Rematch Match" : running ? "Restart Match" : "Serve Neon Ball"}
          </button>
        </div>

        <div className="text-[11px] font-mono text-white/40">
          DRAG VERTICALLY ON CANVAS OR USE W/S / ARROWS · FIRST TO 7 WINS
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="p-4 sm:p-6 rounded-3xl bg-[#0b0c16] border border-white/15 shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 text-xs font-mono text-white/50 border-b border-white/10">
            <span className="text-white/80 font-semibold">NEON ARENA · 1V1 CLASH</span>
            <span>FIRST TO 7 PTS</span>
          </div>

          <div className="relative aspect-[720/460] w-full my-3 rounded-2xl bg-[#060814] border border-white/10 overflow-hidden select-none">
            <canvas
    ref={canvasRef}
    width={720}
    height={460}
    onPointerMove={handlePointerMove}
    onPointerDown={handlePointerMove}
    className="w-full h-full block cursor-ns-resize touch-none"
  />

            {!running && <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
                <span className="text-xs font-mono tracking-widest text-cyan-400">
                  {winner === "player" ? "VICTORY ACHIEVED" : winner === "ai" ? "DEFEAT BY CYBER AI" : "PADDLE READY"}
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {winner === "player" ? "You Won the Neon Championship!" : winner === "ai" ? "Cyber AI Reached 7 Points First" : "Ready to Serve?"}
                </h3>
                <p className="text-xs text-white/60 max-w-sm mt-1 mb-5">
                  Drag your paddle to block the ball and impart spin angle. Ball speed ramps with every volley!
                </p>
                <button
    onClick={startGame}
    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-95 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
  >
                  <Play className="w-4 h-4 fill-current" /> {winner ? "Play Rematch" : "Serve First Volley"}
                </button>
              </div>}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1">
            <span>LEFT: PLAYER</span>
            <span>DYNAMIC VOLLEY ACCELERATION</span>
            <span>RIGHT: ADAPTIVE AI</span>
          </div>
        </div>
      </div>
    </div>;
}
