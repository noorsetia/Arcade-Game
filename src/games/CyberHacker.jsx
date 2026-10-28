import { useState, useEffect } from "react";
import { RotateCcw, Terminal } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
const WORD_LIST = [
  "KERNEL",
  "VECTOR",
  "PACKET",
  "SYNTAX",
  "CIPHER",
  "MATRIX",
  "BUFFER",
  "ROUTER",
  "SYSTEM",
  "SERVER",
  "SCHEMA",
  "CLIENT",
  "BINARY",
  "THREAD"
];
export default function CyberHacker({ onNotifyAchievement }) {
  const [attempts, setAttempts] = useState(4);
  const [password, setPassword] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [memoryLines, setMemoryLines] = useState([]);
  const [terminalLog, setTerminalLog] = useState([
    "NEO-DEV TERMINAL v4.2 [SECURITY SUB-SYSTEM]",
    "INITIALIZING PROTOCOL: BREACH_MEM_DUMP",
    "PASSWORD LENGTH: 6 CHARACTERS",
    "ENTER SECRET PASSWORD TO BYPASS FIREWALL."
  ]);
  const [status, setStatus] = useState("hacking");
  const [score, setScore] = useState(0);
  const initGame = () => {
    const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5).slice(0, 8);
    const target = shuffled[Math.floor(Math.random() * shuffled.length)];
    setPassword(target);
    const candObjects = shuffled.map((w) => ({
      word: w,
      isPassword: w === target,
      dud: false
    }));
    setCandidates(candObjects);
    const junkChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/";
    const lines = [];
    let baseAddr = 62496;
    for (let i = 0; i < 12; i++) {
      const hex = "0x" + (baseAddr + i * 16).toString(16).toUpperCase();
      let lineStr = "";
      for (let j = 0; j < 14; j++) {
        lineStr += junkChars[Math.floor(Math.random() * junkChars.length)];
      }
      lines.push({ addr: hex, content: lineStr });
    }
    setMemoryLines(lines);
    setAttempts(4);
    setStatus("hacking");
    setTerminalLog([
      "NEO-DEV TERMINAL v4.2 [SECURITY SUB-SYSTEM]",
      "INITIALIZING PROTOCOL: BREACH_MEM_DUMP",
      "PASSWORD LENGTH: 6 CHARACTERS",
      "ENTER SECRET PASSWORD TO BYPASS FIREWALL."
    ]);
    arcadeSound.playClick(800);
  };
  useEffect(() => {
    initGame();
  }, []);
  const calculateLikeness = (guess, target) => {
    let match = 0;
    for (let i = 0; i < Math.min(guess.length, target.length); i++) {
      if (guess[i] === target[i]) match++;
    }
    return match;
  };
  const handleSelectWord = (word) => {
    if (status !== "hacking") return;
    arcadeSound.playTyping();
    if (word === password) {
      arcadeSound.playFanfare();
      setStatus("won");
      const pts = attempts * 120 + 200;
      setScore((s) => s + pts);
      setTerminalLog((prev) => [
        ...prev,
        `> ${word}`,
        "ACCESS GRANTED. FIREWALL SUBSYSTEM COLLAPSED.",
        `REWARD: +${pts} XP EARNED.`
      ]);
      const { unlockedAchievement } = recordScore("cyber-hacker", pts, 120);
      if (unlockedAchievement && onNotifyAchievement) {
        onNotifyAchievement(unlockedAchievement);
      }
    } else {
      arcadeSound.playError();
      const likeness = calculateLikeness(word, password);
      const nextAttempts = attempts - 1;
      setAttempts(nextAttempts);
      if (nextAttempts <= 0) {
        setStatus("locked");
        setTerminalLog((prev) => [
          ...prev,
          `> ${word}`,
          `ENTRY DENIED. LIKENESS=${likeness}/6`,
          "SECURITY LOCKDOWN INITIATED. TERMINAL ISOLATED.",
          `TRUE KEY WAS: ${password}`
        ]);
      } else {
        setTerminalLog((prev) => [
          ...prev,
          `> ${word}`,
          `ENTRY DENIED. LIKENESS=${likeness}/6. ATTEMPTS LEFT: ${nextAttempts}`
        ]);
      }
    }
  };
  const handleRemoveDud = () => {
    if (status !== "hacking") return;
    arcadeSound.playLaser();
    const activeDuds = candidates.filter((c) => !c.isPassword && !c.dud);
    if (activeDuds.length > 0) {
      const chosenDud = activeDuds[0];
      setCandidates(
        (prev) => prev.map((c) => c.word === chosenDud.word ? { ...c, dud: true } : c)
      );
      setTerminalLog((prev) => [...prev, `> [BRACKET BYPASS] DUD REMOVED: ${chosenDud.word}`]);
    } else {
      setAttempts((a) => Math.min(4, a + 1));
      setTerminalLog((prev) => [...prev, "> [BRACKET BYPASS] ATTEMPTS REPLENISHED!"]);
    }
  };
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      {
    /* Intro & Terminal Status */
  }
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400">CYBER SECURITY / 09</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            Cyber Hacker<span className="text-emerald-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Infiltrate an encrypted mainframe memory dump. Cross-reference likeness scores to deduce the cipher before your 4 access attempts expire.
          </p>
        </div>

        {
    /* HUD */
  }
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">ATTEMPTS LEFT</span>
            <div className="flex items-center gap-1.5 mt-1">
              {Array.from({ length: 4 }).map((_, i) => <div
    key={i}
    className={`w-6 h-3 rounded-[3px] transition-all ${i < attempts ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-white/10 border border-white/5"}`}
  />)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">STATUS</span>
            <span
    className={`text-lg font-bold font-mono ${status === "won" ? "text-emerald-400" : status === "locked" ? "text-rose-400" : "text-amber-300"}`}
  >
              {status === "won" ? "UNLOCKED" : status === "locked" ? "TERMINAL LOCK" : "INFILTRATING"}
            </span>
          </div>
        </div>

        {
    /* Actions */
  }
        <div className="flex items-center gap-3">
          <button
    onClick={initGame}
    className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
  >
            <RotateCcw className="w-4 h-4" /> Reset Mainframe
          </button>

          <button
    onClick={handleRemoveDud}
    disabled={status !== "hacking"}
    className="px-4 py-3 rounded-xl font-mono text-xs border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
    title="Bypass 1 dud password or restore attempts"
  >
            [BRACKET BYPASS]
          </button>
        </div>

        <div className="text-[11px] font-mono text-white/40">
          LIKENESS = NUMBER OF CORRECT LETTERS IN EXACT POSITION
        </div>
      </div>

      {
    /* Terminal Viewport */
  }
      <div className="lg:col-span-7">
        <div className="p-5 sm:p-7 rounded-3xl bg-[#050907] border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 relative overflow-hidden font-mono">
          {
    /* Header */
  }
          <div className="flex items-center justify-between pb-3 text-xs text-emerald-400/70 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-emerald-300">ROOT@DEF-NET:~#</span>
            </div>
            <span>PORT 22 / MEM_TRACE</span>
          </div>

          {
    /* Hex Memory Dump & Candidates Matrix */
  }
          <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-black/60 border border-emerald-500/20">
            {
    /* Hex trace stream */
  }
            <div className="space-y-1 text-xs text-emerald-500/50 select-none">
              {memoryLines.slice(0, 6).map((line, idx) => <div key={idx} className="flex gap-2">
                  <span className="text-emerald-400/80">{line.addr}</span>
                  <span>{line.content}</span>
                </div>)}
            </div>

            {
    /* Selectable Words */
  }
            <div className="space-y-1.5">
              <span className="text-[10px] text-emerald-400/70 block pb-1 border-b border-emerald-500/20">
                POTENTIAL CIPHER KEYS:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {candidates.map((c) => <button
    key={c.word}
    onClick={() => handleSelectWord(c.word)}
    disabled={status !== "hacking" || c.dud}
    className={`px-2 py-1.5 rounded text-xs font-bold transition-all text-left ${c.dud ? "line-through text-emerald-900/40 cursor-not-allowed" : "text-emerald-300 hover:text-black hover:bg-emerald-400 border border-emerald-500/30"}`}
  >
                    {c.dud ? "......" : c.word}
                  </button>)}
              </div>
            </div>
          </div>

          {
    /* Console Log Stream */
  }
          <div className="p-3 rounded-xl bg-black/80 border border-emerald-500/20 h-36 overflow-y-auto space-y-1 text-xs text-emerald-400 scrollbar-thin">
            {terminalLog.map((line, idx) => <div key={idx} className="leading-relaxed">
                {line}
              </div>)}
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-400/50 pt-3">
            <span>DEDUCE COMMON LETTERS</span>
            <span>4 ATTEMPTS LIMIT</span>
            <span>ACCESS PROTOCOL</span>
          </div>
        </div>
      </div>
    </div>;
}
