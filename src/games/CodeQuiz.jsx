import { useState } from "react";
import { RotateCcw, CheckCircle2, XCircle, Sparkles, ChevronRight } from "lucide-react";
import { arcadeSound } from "../utils/audio";
import { recordScore } from "../utils/playerStats";
const QUESTIONS = [
  {
    q: "What is the evaluated output of typeof null in JavaScript?",
    code: "const result = typeof null;\nconsole.log(result);",
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    answer: 2,
    why: 'Due to a historical bug in the first JS implementation where values had 32-bit tags with 0 for objects, typeof null returns "object".'
  },
  {
    q: "In React 19, which hook provides the pending state of an async Transition without manually setting isPending?",
    code: "const [isPending, startTransition] = useTransition();\n// Or direct async form actions",
    options: ["useTransition", "useDeferredValue", "useEffect", "useActionState"],
    answer: 0,
    why: "useTransition lets you mark updates as transitions and inspect isPending while the asynchronous transition resolves."
  },
  {
    q: "What does [1, 2, 3] + [4, 5, 6] evaluate to in JavaScript?",
    code: "const joined = [1, 2, 3] + [4, 5, 6];",
    options: ["[1, 2, 3, 4, 5, 6]", '"1,2,34,5,6"', "NaN", "TypeError"],
    answer: 1,
    why: 'Both arrays are converted to strings ("1,2,3" and "4,5,6") and concatenated together to form "1,2,34,5,6".'
  },
  {
    q: "Which HTTP status code is returned for a successful request that results in resource creation?",
    code: "HTTP/1.1 ___ Created\nLocation: /api/users/42",
    options: ["200 OK", "201 Created", "204 No Content", "302 Found"],
    answer: 1,
    why: "HTTP 201 Created signifies that the request succeeded and resulted in one or more new resources being created."
  },
  {
    q: "What does CSS flex-grow: 1 do on a flex item?",
    code: ".item {\n  display: flex;\n  flex-grow: 1;\n}",
    options: [
      "Sets initial width before sizing",
      "Dictates how much free space the item absorbs relative to siblings",
      "Scales font size by 1.5x",
      "Prevents shrinking when space is constrained"
    ],
    answer: 1,
    why: "flex-grow specifies the flex grow factor, which determines how much of the remaining space in the flex container should be assigned to the item."
  },
  {
    q: "What is the value of 0.1 + 0.2 === 0.3 in IEEE-754 floating point arithmetic?",
    code: "console.log(0.1 + 0.2 === 0.3);",
    options: ["true", "false", "undefined", "NaN"],
    answer: 1,
    why: "0.1 and 0.2 have infinite repeating representations in binary floating point, summing to ~0.30000000000000004."
  },
  {
    q: "Which TypeScript utility type constructs a type with all properties of Type set to optional?",
    code: "type UserUpdate = ______<UserProfile>;",
    options: ["Omit<T, K>", "Partial<T>", "Pick<T, K>", "Required<T>"],
    answer: 1,
    why: "Partial<Type> returns a type with all properties of Type marked as optional (with ? modifiers)."
  },
  {
    q: "What does Promise.all() do when any one of the promises rejects?",
    code: "Promise.all([p1, p2, p3])\n  .catch((err) => ...);",
    options: [
      "Waits for all others then rejects",
      "Immediately rejects with that first rejection reason",
      "Ignores the error and returns successful results",
      "Retries the failed promise once"
    ],
    answer: 1,
    why: "Promise.all() exhibits fail-fast behavior: it immediately rejects upon the first promise rejection."
  }
];
export default function CodeQuiz({ onNotifyAchievement }) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  const currentQ = QUESTIONS[index];
  const handleSelectOption = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    const isCorrect = idx === currentQ.answer;
    if (isCorrect) {
      arcadeSound.playSuccess();
      const points = 100 + streak * 25;
      setScore((s) => s + points);
      setStreak((s) => s + 1);
    } else {
      arcadeSound.playError();
      setStreak(0);
    }
  };
  const handleNext = () => {
    if (index === QUESTIONS.length - 1) {
      setDone(true);
      arcadeSound.playFanfare();
      const { unlockedAchievement } = recordScore("code-quiz", score, Math.round(score / 4));
      if (unlockedAchievement && onNotifyAchievement) {
        onNotifyAchievement(unlockedAchievement);
      }
    } else {
      setIndex((i) => i + 1);
      setChosen(null);
      arcadeSound.playClick();
    }
  };
  const handleReset = () => {
    setIndex(0);
    setChosen(null);
    setScore(0);
    setStreak(0);
    setDone(false);
    arcadeSound.playClick();
  };
  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
      {
    /* Intro & Progress */
  }
      <div className="lg:col-span-5 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-indigo-400">DEV KNOWLEDGE / 03</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tracking-tight">
            Code Quiz<span className="text-indigo-400">.</span>
          </h1>
          <p className="text-white/70 text-sm mt-2 leading-relaxed">
            Test your core understanding of JavaScript, TypeScript, React 19, CSS, and web architectures. Maintain a streak for multiplier bonuses!
          </p>
        </div>

        {
    /* HUD */
  }
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">TOTAL SCORE</span>
            <span className="text-3xl font-black font-mono text-indigo-400">{score}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono tracking-wider text-white/50 block">QUESTION</span>
            <span className="text-3xl font-black font-mono text-white">
              {done ? QUESTIONS.length : `${index + 1}/${QUESTIONS.length}`}
            </span>
          </div>
        </div>

        {
    /* Streak banner */
  }
        {streak > 1 && <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300 font-mono animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{streak}x COMBO STREAK! (+{streak * 25} BONUS PTS/QUESTION)</span>
          </div>}

        {
    /* Progress bar */
  }
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-white/50">
            <span>PROGRESS</span>
            <span>{Math.round((done ? QUESTIONS.length : index) / QUESTIONS.length * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/5 p-0.5">
            <div
    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300"
    style={{
      width: `${(done ? QUESTIONS.length : index) / QUESTIONS.length * 100}%`
    }}
  />
          </div>
        </div>

        <div className="text-[11px] font-mono text-white/40">
          SELECT THE ACCURATE STATEMENT · EXPLORATORY DEV TRIVIA
        </div>
      </div>

      {
    /* Quiz Card */
  }
      <div className="lg:col-span-7">
        <div className="p-5 sm:p-7 rounded-3xl bg-[#0b0c16] border border-white/15 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
          {done ? <div className="text-center py-8 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl">
                {score >= 800 ? "\u{1F3C6}" : score >= 500 ? "\u2728" : "\u{1F9E0}"}
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-indigo-400">
                  CHALLENGE COMPLETE
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {score >= 800 ? "Exceptional Mastery!" : score >= 500 ? "Solid Developer Reflexes!" : "Great Practice Session!"}
                </h3>
                <p className="text-sm text-white/70 max-w-sm mx-auto mt-2">
                  You scored <strong className="text-indigo-400 font-mono">{score} points</strong> across {QUESTIONS.length} technical queries.
                </p>
              </div>

              <button
    onClick={handleReset}
    className="px-6 py-3 rounded-xl font-bold text-xs bg-indigo-500 text-white hover:bg-indigo-400 active:scale-95 transition-all shadow-lg shadow-indigo-500/30 inline-flex items-center gap-2"
  >
                <RotateCcw className="w-4 h-4" /> Retake Quiz
              </button>
            </div> : <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-white/50 border-b border-white/10 pb-3">
                <span className="text-indigo-400 font-semibold">QUESTION {index + 1} OF {QUESTIONS.length}</span>
                <span>+{100 + streak * 25} XP</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {currentQ.q}
              </h2>

              {
    /* Code snippet */
  }
              <div className="p-3.5 rounded-xl bg-[#060810] border border-white/10 font-mono text-xs text-indigo-300 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{currentQ.code}</pre>
              </div>

              {
    /* Options */
  }
              <div className="space-y-2 pt-1">
                {currentQ.options.map((opt, i) => {
    const isSelected = chosen === i;
    const isAnswer = i === currentQ.answer;
    let borderStyle = "border-white/10 bg-white/5 hover:border-indigo-400/50 hover:bg-white/10";
    if (chosen !== null) {
      if (isAnswer) {
        borderStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-300";
      } else if (isSelected) {
        borderStyle = "border-rose-500 bg-rose-950/40 text-rose-300";
      } else {
        borderStyle = "border-white/5 bg-white/[0.02] opacity-40";
      }
    }
    return <button
      key={opt}
      onClick={() => handleSelectOption(i)}
      disabled={chosen !== null}
      className={`w-full p-3 rounded-xl border flex items-center justify-between text-left text-xs sm:text-sm transition-all ${borderStyle}`}
    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono text-xs text-white/70">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-white">{opt}</span>
                      </div>
                      {chosen !== null && isAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {chosen !== null && isSelected && !isAnswer && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>;
  })}
              </div>

              {
    /* Explanation box */
  }
              {chosen !== null && <div
    className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${chosen === currentQ.answer ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" : "bg-rose-950/30 border-rose-500/30 text-rose-200"}`}
  >
                  <strong className="block font-mono text-[11px] mb-1">
                    {chosen === currentQ.answer ? "\u2713 CORRECT BREAKDOWN" : "\u2717 ARCHITECTURAL INSIGHT"}
                  </strong>
                  <p className="text-white/80">{currentQ.why}</p>
                </div>}

              {
    /* Next button */
  }
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-white/40">
                  {chosen === null ? "Select an answer to continue" : "Answer recorded"}
                </span>
                <button
    onClick={handleNext}
    disabled={chosen === null}
    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-400 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
  >
                  {index === QUESTIONS.length - 1 ? "See Results" : "Next Question"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}
