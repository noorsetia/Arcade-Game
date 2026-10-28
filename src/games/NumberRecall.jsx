import { useState, useEffect } from "react";
import { RotateCcw, Zap, Delete, ArrowRight } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
export default function NumberRecall({ onNotifyAchievement }) {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [inputDigits, setInputDigits] = useState("");
  const [showingSequence, setShowingSequence] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem("arcade-recall-best") || 0);
    } catch {
      return 0;
    }
  });
  const digitLength = level + 2;
  const startLevel = (nextLvl = level) => {
    const nums = Array.from(
      { length: nextLvl + 2 },
      () => Math.floor(Math.random() * 9) + 1
    );
    setSequence(nums);
    setInputDigits("");
    setFeedback("");
    setShowingSequence(true);
    arcadeSound.playClick(600);
    const displayDuration = Math.max(1400, nums.length * 600);
    setCountdown(Math.ceil(displayDuration / 1e3));
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1e3);
    setTimeout(() => {
      setShowingSequence(false);
      arcadeSound.playPowerup();
    }, displayDuration);
  };
  const handleDigitPress = (digit) => {
    if (showingSequence || inputDigits.length >= sequence.length) return;
    arcadeSound.playClick(400 + Number(digit) * 40);
    setInputDigits((prev) => prev + digit);
  };
  const handleBackspace = () => {
    if (showingSequence) return;
    arcadeSound.playClick(300);
    setInputDigits((prev) => prev.slice(0, -1));
  };
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (showingSequence || inputDigits.length === 0) return;
    const targetStr = sequence.join("");
    if (inputDigits === targetStr) {
      arcadeSound.playSuccess();
      setFeedback("PERFECT RECALL! Advancing to next sequence.");
      const newLevel = level + 1;
      const sequenceLen = sequence.length;
      const { newBest, unlockedAchievement } = recordScore("number-recall", sequenceLen, sequenceLen * 30);
      if (newBest) setBest(sequenceLen);
      if (unlockedAchievement && onNotifyAchievement) {
        onNotifyAchievement(unlockedAchievement);
      }
      setLevel(newLevel);
      setTimeout(() => {
        startLevel(newLevel);
      }, 1e3);
    } else {
      arcadeSound.playError();
      setFeedback(`MISMATCH! Correct sequence was: ${targetStr}`);
    }
  };
  useEffect(() => {
    const handleKey = (e) => {
      if (showingSequence) return;
      if (e.key >= "0" && e.key <= "9") {
        handleDigitPress(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Enter") {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showingSequence, inputDigits, sequence]);
  const handleReset = () => {
    setLevel(1);
    setSequence([]);
    setInputDigits("");
    setFeedback("");
    setShowingSequence(false);
    arcadeSound.playClick();
  };
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      {
    /* Intro */
  }
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-orange-400">WORKING MEMORY / 08</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            Number Recall<span className="text-orange-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Train working memory buffer. A sequence of random digits flashes briefly on screen. Commit them to memory and reconstruct them in exact order.
          </p>
        </div>

        {
    /* HUD */
  }
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">CURRENT LEVEL</span>
            <span className="text-3xl font-black font-mono text-orange-400">
              Lvl {level} ({digitLength} Digits)
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">LONGEST SEQUENCE</span>
            <span className="text-3xl font-black font-mono text-white">
              {best ? `${best} digits` : "\u2014"}
            </span>
          </div>
        </div>

        {
    /* Actions */
  }
        <div>
          <button
    onClick={handleReset}
    className="w-full px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
  >
            <RotateCcw className="w-4 h-4" /> Restart Level 1
          </button>
        </div>

        <div className="text-[11px] font-mono text-white/40">
          EACH ADVANCEMENT ADDS +1 DIGIT · USE ON-SCREEN OR PHYSICAL KEYPAD
        </div>
      </div>

      {
    /* Recall Matrix Viewport */
  }
      <div className="lg:col-span-7">
        <div className="p-5 sm:p-7 rounded-3xl bg-[#0b0c16] border border-white/15 shadow-2xl shadow-orange-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 text-xs font-mono text-white/50 border-b border-white/10">
            <span className="text-white/80 font-semibold">COGNITIVE DIGIT BUFFER</span>
            <span>LEVEL {level}</span>
          </div>

          {sequence.length === 0 ? <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 mx-auto flex items-center justify-center text-3xl">
                ⚡
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Ready to Train Your Recall?</h3>
                <p className="text-xs text-white/60 max-w-sm mx-auto mt-1">
                  Digits will appear on screen for a few seconds. Memorize them in order.
                </p>
              </div>
              <button
    onClick={() => startLevel(1)}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-orange-400 text-slate-950 hover:bg-orange-300 active:scale-95 transition-all shadow-lg shadow-orange-500/30 inline-flex items-center gap-2"
  >
                <Zap className="w-4 h-4 fill-current" /> Begin Level 1
              </button>
            </div> : showingSequence ? <div className="py-12 text-center space-y-4 animate-fadeIn">
              <span className="text-xs font-mono tracking-widest text-orange-400">
                MEMORIZE THIS SEQUENCE ({countdown}s)
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3 py-4">
                {sequence.map((num, i) => <div
    key={i}
    className="w-14 h-16 rounded-2xl bg-gradient-to-b from-orange-500/20 to-amber-950/40 border border-orange-400/60 shadow-[0_0_20px_rgba(251,146,60,0.3)] flex items-center justify-center text-3xl font-black font-mono text-white animate-scaleUp"
  >
                    {num}
                  </div>)}
              </div>
              <p className="text-xs text-white/50">Store the cadence in your short-term buffer...</p>
            </div> : <div className="py-4 space-y-5 animate-fadeIn">
              {
    /* Input Display Area */
  }
              <div className="space-y-2">
                <span className="text-xs font-mono tracking-wider text-white/50">
                  RECONSTRUCT SEQUENCE ({inputDigits.length}/{sequence.length}):
                </span>
                <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#060810] border border-white/10 min-h-[64px]">
                  {Array.from({ length: sequence.length }).map((_, idx) => <div
    key={idx}
    className={`w-10 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xl border transition-all ${inputDigits[idx] ? "bg-orange-500/20 border-orange-400 text-white shadow-[0_0_10px_rgba(251,146,60,0.2)]" : "bg-white/5 border-white/10 text-white/20"}`}
  >
                      {inputDigits[idx] || "\xB7"}
                    </div>)}
                </div>
              </div>

              {feedback && <div
    className={`p-3 rounded-xl border text-xs font-mono text-center ${feedback.includes("PERFECT") ? "bg-emerald-950/40 border-emerald-500 text-emerald-300" : "bg-rose-950/40 border-rose-500 text-rose-300"}`}
  >
                  {feedback}
                </div>}

              {
    /* On-screen Cyber Numeric Keypad */
  }
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => <button
    key={digit}
    onClick={() => handleDigitPress(digit)}
    className="p-3.5 rounded-xl bg-white/5 hover:bg-orange-500/20 active:scale-95 border border-white/10 hover:border-orange-400/50 font-mono font-bold text-lg text-white transition-all shadow-sm"
  >
                    {digit}
                  </button>)}
                <button
    onClick={handleBackspace}
    className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all"
    aria-label="Backspace"
  >
                  <Delete className="w-5 h-5" />
                </button>
                <button
    onClick={() => handleDigitPress("0")}
    className="p-3.5 rounded-xl bg-white/5 hover:bg-orange-500/20 active:scale-95 border border-white/10 hover:border-orange-400/50 font-mono font-bold text-lg text-white transition-all shadow-sm"
  >
                  0
                </button>
                <button
    onClick={() => handleSubmit()}
    disabled={inputDigits.length !== sequence.length}
    className="p-3.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 text-slate-950 font-bold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center transition-all shadow-md shadow-orange-500/20"
    aria-label="Submit Answer"
  >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>}

          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1">
            <span>MEMORIZATION PHASE</span>
            <span>WORKING MEMORY BUFFER</span>
            <span>ENTER TO CHECK</span>
          </div>
        </div>
      </div>
    </div>;
}
