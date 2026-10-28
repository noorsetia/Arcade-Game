import { useState } from "react";
import { RotateCcw, Brain, Trophy, Lightbulb, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
const RIDDLES = [
  {
    q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    options: ["An Echo", "A Shadow", "A Cloud", "A Thought"],
    correct: 0,
    hint: "Think of sound bouncing off canyon walls.",
    why: "An echo repeats sound without having a physical vocal tract or body of its own."
  },
  {
    q: "What comes next in the sequence? 2, 6, 12, 20, 30, __",
    options: ["36", "40", "42", "44"],
    correct: 2,
    hint: "Examine the differences between consecutive terms: +4, +6, +8, +10...",
    why: "The gaps increase by +2 each step (+4, +6, +8, +10), so the next step is +12, making 30 + 12 = 42. (Also n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42)."
  },
  {
    q: "A mechanical keyboard and mouse set costs $110 total. The keyboard costs $100 more than the mouse. How much does the mouse cost?",
    options: ["$10", "$5", "$15", "$1"],
    correct: 1,
    hint: "If the mouse were $10 and the keyboard $100 more ($110), the total would be $120. Set up x + (x + 100) = 110.",
    why: "2x + 100 = 110 => 2x = 10 => x = $5 for the mouse, and $105 for the keyboard, which equals $110."
  },
  {
    q: "Which number is the mathematical odd one out?",
    options: ["16", "25", "36", "48"],
    correct: 3,
    hint: "Check if the numbers can be expressed as an integer squared.",
    why: "16 (4\xB2), 25 (5\xB2), and 36 (6\xB2) are all perfect squares. 48 is not."
  },
  {
    q: "You are running in a marathon and you overtake the person in second place. What position are you currently in?",
    options: ["First Place", "Second Place", "Third Place", "Last Place"],
    correct: 1,
    hint: "You took the place of the person you passed.",
    why: "Passing the person in second place puts you directly into second place; first place is still ahead of you."
  }
];
export default function BrainTeasers({ onNotifyAchievement }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const current = RIDDLES[index];
  const handleSelect = (idx) => {
    if (answer !== null) return;
    setAnswer(idx);
    if (idx === current.correct) {
      arcadeSound.playSuccess();
      setScore((s) => s + (showHint ? 75 : 100));
    } else {
      arcadeSound.playError();
    }
  };
  const handleNext = () => {
    if (index === RIDDLES.length - 1) {
      setDone(true);
      arcadeSound.playFanfare();
      const { unlockedAchievement } = recordScore("brain-teaser", score, Math.round(score / 3));
      if (unlockedAchievement && onNotifyAchievement) {
        onNotifyAchievement(unlockedAchievement);
      }
    } else {
      setIndex((i) => i + 1);
      setAnswer(null);
      setShowHint(false);
      arcadeSound.playClick();
    }
  };
  const handleReset = () => {
    setIndex(0);
    setAnswer(null);
    setScore(0);
    setShowHint(false);
    setDone(false);
    arcadeSound.playClick();
  };
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      {
    /* Intro */
  }
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-pink-400">LOGIC & LATERAL THINKING / 05</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            Brain Teasers<span className="text-pink-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Five deceptive logic challenges. Question your first assumption, look for patterns, and unlock the underlying mathematical deduction.
          </p>
        </div>

        {
    /* HUD */
  }
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">POINTS EARNED</span>
            <span className="text-3xl font-black font-mono text-pink-400">{score}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">PUZZLE</span>
            <span className="text-3xl font-black font-mono text-white">
              {done ? RIDDLES.length : `${index + 1}/${RIDDLES.length}`}
            </span>
          </div>
        </div>

        {
    /* Hint toggle */
  }
        {!done && <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70 flex items-center gap-1.5 font-mono">
                <Lightbulb className="w-4 h-4 text-amber-400" /> NEED A CLUE?
              </span>
              <button
    onClick={() => {
      setShowHint((h) => !h);
      arcadeSound.playClick();
    }}
    className="text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
  >
                {showHint ? "Hide Hint" : "Reveal Hint (-25 pts)"}
              </button>
            </div>
            {showHint && <p className="text-xs text-amber-200/90 mt-2 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed animate-fadeIn">
                {current.hint}
              </p>}
          </div>}

        <div className="text-[11px] font-mono text-white/40">
          CHALLENGE INTUITION · SYSTEM 2 COGNITIVE WORKOUT
        </div>
      </div>

      {
    /* Puzzle Card */
  }
      <div className="lg:col-span-7">
        <div className="p-5 sm:p-7 rounded-3xl bg-[#0b0c16] border border-white/15 shadow-2xl shadow-pink-500/10 relative overflow-hidden">
          {done ? <div className="text-center py-8 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-500/30 mx-auto flex items-center justify-center text-3xl">
                <Trophy className="w-8 h-8 text-pink-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-pink-400">
                  ALL RIDDLES CONCLUDED
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {score >= 400 ? "Exceptional Lateral Logic!" : "Sharp Effort!"}
                </h3>
                <p className="text-sm text-white/70 max-w-sm mx-auto mt-2">
                  You scored <strong className="text-pink-400 font-mono">{score} points</strong> out of 500.
                </p>
              </div>

              <button
    onClick={handleReset}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-pink-500 text-white hover:bg-pink-400 active:scale-95 transition-all shadow-lg shadow-pink-500/30 inline-flex items-center gap-2"
  >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div> : <div className="space-y-5">
              <div className="flex items-center justify-between text-xs font-mono text-white/50 border-b border-white/10 pb-3">
                <span className="text-pink-400 font-semibold flex items-center gap-1.5">
                  <Brain className="w-4 h-4" /> PUZZLE {index + 1} OF {RIDDLES.length}
                </span>
                <span>+{showHint ? 75 : 100} XP</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {current.q}
              </h2>

              {
    /* Options */
  }
              <div className="space-y-2 pt-1">
                {current.options.map((opt, i) => {
    const isSelected = answer === i;
    const isCorrect = i === current.correct;
    let borderStyle = "border-white/10 bg-white/5 hover:border-pink-400/50 hover:bg-white/10";
    if (answer !== null) {
      if (isCorrect) {
        borderStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-300";
      } else if (isSelected) {
        borderStyle = "border-rose-500 bg-rose-950/40 text-rose-300";
      } else {
        borderStyle = "border-white/5 bg-white/[0.02] opacity-40";
      }
    }
    return <button
      key={opt}
      onClick={() => handleSelect(i)}
      disabled={answer !== null}
      className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left text-xs sm:text-sm transition-all ${borderStyle}`}
    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono text-xs text-white/70">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-white">{opt}</span>
                      </div>
                      {answer !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {answer !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>;
  })}
              </div>

              {
    /* Logic Breakdown */
  }
              {answer !== null && <div
    className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${answer === current.correct ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" : "bg-pink-950/30 border-pink-500/30 text-pink-200"}`}
  >
                  <strong className="block font-mono text-[11px] mb-1">
                    {answer === current.correct ? "\u2713 EXACTLY DEDUCED" : "\u{1F4A1} THE LATERAL LOGIC"}
                  </strong>
                  <p className="text-white/80">{current.why}</p>
                </div>}

              {
    /* Next button */
  }
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-white/40">
                  {answer === null ? "Evaluate the clues carefully" : "Deduction locked in"}
                </span>
                <button
    onClick={handleNext}
    disabled={answer === null}
    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-pink-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-400 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
  >
                  {index === RIDDLES.length - 1 ? "See Score" : "Next Puzzle"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}
