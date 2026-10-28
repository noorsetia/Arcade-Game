import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Gamepad2,
  Trophy,
  Volume2,
  VolumeX,
  Search,
  Dices,
  Flame,
  Bot,
  Activity,
  Keyboard,
  Menu,
  X,
  Award,
  Play,
  Settings,
  ChevronRight,
  Star
} from "lucide-react";
import CyberGridBackground from "./components/CyberGridBackground";
import TiltCard from "./components/TiltCard";
import GameCardArt from "./components/GameCardArt";
import ArcadePortal from "./components/ArcadePortal";
import PlayerPassportModal from "./components/PlayerPassportModal";
import ArcadeBanner from "./components/ArcadeBanner";
import AiCoachModal from "./components/AiCoachModal";
import LeaderboardModal from "./components/LeaderboardModal";
import DailyArenaModal from "./components/DailyArenaModal";
import PerformanceAnalyticsModal from "./components/PerformanceAnalyticsModal";
import SettingsModal from "./components/SettingsModal";
import GameResultModal from "./components/GameResultModal";
import { arcadeSound } from "./utils/audio";
import { getPlayerStats, onGameSessionCompleted } from "./utils/playerStats";
import NeonMaze from "./games/NeonMaze";
import CyberHacker from "./games/CyberHacker";
import MemoryMatrix from "./games/MemoryMatrix";
import GravityFlip from "./games/GravityFlip";
import QuantumShift from "./games/QuantumShift";
import BossRush from "./games/BossRush";
import Snake from "./games/Snake";
import SpaceShooter from "./games/SpaceShooter";
import HyperPong from "./games/HyperPong";
import Game2048 from "./games/Game2048";
import ReactionTest from "./games/ReactionTest";
import NumberRecall from "./games/NumberRecall";
import MemoryMatch from "./games/MemoryMatch";
import CodeQuiz from "./games/CodeQuiz";
import BrainTeasers from "./games/BrainTeasers";
const GAMES = [
  {
    id: "neon-maze",
    num: "01",
    title: "Neon Maze",
    subtitle: "Procedural neural labyrinths.",
    description: "Solve increasingly complex, procedurally generated cyber mazes with fluid touch swipe and glowing particle trails.",
    icon: "\u{1F9ED}",
    color: "cyan",
    accentHex: "#06b6d4",
    controls: "WASD / Arrows or Swipe",
    difficulty: "Standard",
    estimatedTime: "2-4 min",
    type: "Puzzle"
  },
  {
    id: "cyber-hacker",
    num: "02",
    title: "Cyber Hacker",
    subtitle: "Mainframe breach protocol.",
    description: "Deduce the encrypted cipher using likeness telemetry and bracket tricks before terminal lockout initiates.",
    icon: "\u{1F4BB}",
    color: "emerald",
    accentHex: "#10b981",
    controls: "Terminal Mouse / Touch Select",
    difficulty: "Elite",
    estimatedTime: "3 min",
    type: "Logic"
  },
  {
    id: "memory-matrix",
    num: "03",
    title: "Memory Matrix",
    subtitle: "Pattern flash synchronization.",
    description: "Watch illuminated cyan patterns flash across the matrix grid, then reconstruct the exact configuration under pressure.",
    icon: "\u25A6",
    color: "purple",
    accentHex: "#c084fc",
    controls: "Click / Touch Recalled Tiles",
    difficulty: "Standard",
    estimatedTime: "2-3 min",
    type: "Memory"
  },
  {
    id: "gravity-flip",
    num: "04",
    title: "Gravity Flip",
    subtitle: "Invert gravitational vector.",
    description: "High-speed neon runner: click or press Space to invert gravity between floor and ceiling rails to dodge lethal plasma spikes.",
    icon: "\u21C5",
    color: "sky",
    accentHex: "#38bdf8",
    controls: "Click / Tap / Space to Invert",
    difficulty: "Elite",
    estimatedTime: "3-5 min",
    type: "Action"
  },
  {
    id: "quantum-shift",
    num: "05",
    title: "Quantum Shift",
    subtitle: "Multidimensional logic chambers.",
    description: "Solve mind-bending spatial puzzles by shifting between Cyan, Magenta, and Amber quantum phases to traverse matching barriers.",
    icon: "\u{1F300}",
    color: "fuchsia",
    accentHex: "#e879f9",
    controls: "WASD to Move \xB7 1, 2, 3 to Shift Phase",
    difficulty: "Elite",
    estimatedTime: "4-7 min",
    type: "Puzzle"
  },
  {
    id: "boss-rush",
    num: "06",
    title: "Boss Rush",
    subtitle: "Survive the 3 Neural Overlords.",
    description: "Epic multi-phase arcade bullet-hell battle against Megadrone Aegis, Cyber Wyrm, and Quantum Overmind with EMP bombs.",
    icon: "\u{1F480}",
    color: "rose",
    accentHex: "#f43f5e",
    controls: "Drag Mouse / WASD \xB7 Space / J Fire \xB7 B Bomb",
    difficulty: "Elite",
    estimatedTime: "4-6 min",
    type: "Action"
  },
  {
    id: "snake",
    num: "07",
    title: "Neon Snake",
    subtitle: "Eat. Grow. Don\u2019t collide.",
    description: "A classic grid-based survival game upgraded with swipe gestures, turbo boost, and luminous particle bursts.",
    icon: "\u{1F40D}",
    color: "emerald",
    accentHex: "#34d399",
    controls: "WASD / Arrow keys or Touch Swipe",
    difficulty: "Standard",
    estimatedTime: "3-5 min",
    type: "Action"
  },
  {
    id: "space-shooter",
    num: "08",
    title: "Space Shooter",
    subtitle: "Defend the neon galaxy.",
    description: "Pilot your ship with fluid touch/mouse follow. Obliterate asteroids and grab Triple-Cannons and Ion Shields.",
    icon: "\u{1F680}",
    color: "cyan",
    accentHex: "#38bdf8",
    controls: "Mouse/Finger Drag or \u2190 \u2192 \xB7 Space",
    difficulty: "Elite",
    estimatedTime: "3-6 min",
    type: "Action"
  },
  {
    id: "hyper-pong",
    num: "09",
    title: "Hyper Pong",
    subtitle: "Neon clash against adaptive AI.",
    description: "High-speed 1v1 paddle action with dynamic ball trails, spin angles, and volley acceleration.",
    icon: "\u{1F3D3}",
    color: "cyan",
    accentHex: "#06b6d4",
    controls: "Mouse/Finger Drag or W/S Keys",
    difficulty: "Standard",
    estimatedTime: "3 min",
    type: "Action"
  },
  {
    id: "2048",
    num: "10",
    title: "2048 Neon",
    subtitle: "Merge. Plan. Forge the 2048 tile.",
    description: "Deceptively addictive number strategy with 4-way swipe gestures, tactical undo, and radiant neon tiles.",
    icon: "\u25A6",
    color: "amber",
    accentHex: "#fbbf24",
    controls: "Swipe anywhere or WASD / Arrows",
    difficulty: "Elite",
    estimatedTime: "5-10 min",
    type: "Puzzle"
  },
  {
    id: "reaction-test",
    num: "11",
    title: "Reaction Test",
    subtitle: "Benchmark your synaptic latency.",
    description: "Measure neuromuscular response time down to the millisecond. Earn percentile ratings and analyze your history.",
    icon: "\u26A1",
    color: "teal",
    accentHex: "#2dd4bf",
    controls: "Mouse / Touch Click on Green",
    difficulty: "Elite",
    estimatedTime: "1 min",
    type: "Reflex"
  },
  {
    id: "number-recall",
    num: "12",
    title: "Number Recall",
    subtitle: "Train your working memory buffer.",
    description: "Memorize an increasingly long digit sequence before it vanishes, then reconstruct it using the cyber keypad.",
    icon: "\u25CE",
    color: "orange",
    accentHex: "#fb923c",
    controls: "Cyber Keypad / Physical Digits",
    difficulty: "Standard",
    estimatedTime: "2-4 min",
    type: "Memory"
  },
  {
    id: "memory",
    num: "13",
    title: "Memory Pairs",
    subtitle: "Find matching tech pairs.",
    description: "Train your recall with 3D flipping cards, combo streaks, and developer tools symbols.",
    icon: "\u25C8",
    color: "purple",
    accentHex: "#c084fc",
    controls: "Mouse / Touch Tap",
    difficulty: "Casual",
    estimatedTime: "2 min",
    type: "Memory"
  },
  {
    id: "code-quiz",
    num: "14",
    title: "Code Quiz",
    subtitle: "Think like a senior architect.",
    description: "Test your understanding of React 19, TypeScript, JS engine quirks, and web APIs with streak multipliers.",
    icon: "\u2318",
    color: "indigo",
    accentHex: "#818cf8",
    controls: "Mouse / Touch Tap",
    difficulty: "Elite",
    estimatedTime: "4 min",
    type: "Logic"
  },
  {
    id: "brain-teaser",
    num: "15",
    title: "Brain Teasers",
    subtitle: "Outsmart your first instinct.",
    description: "Five deceptive lateral thinking puzzles, sequence patterns, and mathematical deduction challenges.",
    icon: "\u{1F9E0}",
    color: "pink",
    accentHex: "#f472b6",
    controls: "Mouse / Touch Tap",
    difficulty: "Standard",
    estimatedTime: "3 min",
    type: "Logic"
  }
];
export default function App() {
  const [activeGameId, setActiveGameId] = useState(() => {
    return window.location.hash.replace("#", "") || "";
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [soundEnabled, setSoundEnabled] = useState(arcadeSound.enabled);
  const [crtMode, setCrtMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [theme, setTheme] = useState("cyber-neon");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [playerStats, setPlayerStats] = useState(getPlayerStats);
  const [showPassport, setShowPassport] = useState(false);
  const [showAiCoach, setShowAiCoach] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDailyArena, setShowDailyArena] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeResultSession, setActiveResultSession] = useState(null);
  const [activeBanner, setActiveBanner] = useState(null);
  useEffect(() => {
    const unsubscribe = onGameSessionCompleted((session) => {
      setActiveResultSession(session);
      setPlayerStats(getPlayerStats());
    });
    return unsubscribe;
  }, []);
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    const handleHash = () => {
      const id = window.location.hash.replace("#", "");
      setActiveGameId(id);
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (activeGameId) returnToArcade();
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeGameId]);
  useEffect(() => {
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/activity");
        const json = await res.json();
        if (json.success && json.activities) {
          setActivities(json.activities);
        }
      } catch {
      }
    };
    fetchActivities();
  }, [activeGameId]);
  const openGame = (id) => {
    arcadeSound.playClick();
    window.history.pushState(null, "", `#${id}`);
    setActiveGameId(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const returnToArcade = () => {
    arcadeSound.playClick();
    window.history.pushState(null, "", window.location.pathname + window.location.search);
    setActiveGameId("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleNotifyAchievement = (ach) => {
    setActiveBanner({
      type: "achievement",
      title: ach.title,
      message: ach.desc,
      icon: ach.icon
    });
    setPlayerStats(getPlayerStats());
  };
  const spinRandomGame = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;
    const maxSpins = 12;
    const interval = setInterval(() => {
      arcadeSound.playClick(400 + count * 40);
      count++;
      if (count >= maxSpins) {
        clearInterval(interval);
        const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
        setIsSpinning(false);
        openGame(randomGame.id);
      }
    }, 90);
  };
  const selectedGame = GAMES.find((g) => g.id === activeGameId);
  const featuredGame = GAMES.find((g) => g.id === "neon-maze") || GAMES[0];
  const filteredGames = GAMES.filter((g) => {
    const matchesFilter = filter === "All" || g.type === filter;
    const query = search.toLowerCase();
    const matchesSearch = g.title.toLowerCase().includes(query) || g.subtitle.toLowerCase().includes(query) || g.description.toLowerCase().includes(query) || g.type.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  const playerLevel = Math.floor(playerStats.totalXP / 200) + 1;
  const currentLevelXP = playerStats.totalXP % 200;
  const xpPercent = Math.min(100, Math.round(currentLevelXP / 200 * 100));
  return <div
    className={`min-h-screen bg-[#070612] text-[#e8edf7] relative flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white theme-${theme} ${crtMode ? "crt-mode" : ""} ${reducedMotion ? "reduced-motion" : ""}`}
  >
      {
    /* Interactive Cyber Grid Canvas */
  }
      <CyberGridBackground />

      {
    /* =========================================================================
        1. REFINED NAVBAR — CLEAN, MINIMAL, ELEGANT
        Left: Refined Arcade Logo + "DEVELOPER ARCADE" & "NEON EDITION"
        Center: Exactly 4 Primary Nav Links (Arcade, Leaderboard, Daily Challenge, Achievements)
        Right: Compact Audio Button, Player Level Indicator, Prominent Play Now Button
    ========================================================================= */
  }
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070612]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {
    /* Left — Brand */
  }
          <a
    href="/"
    onClick={(e) => {
      e.preventDefault();
      returnToArcade();
    }}
    className="flex items-center gap-2.5 text-left shrink-0 group select-none"
  >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 border border-cyan-300/40 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-4 h-4 text-white drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-black text-sm tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                DEVELOPER ARCADE
              </span>
              <span className="text-[9px] font-mono tracking-widest text-indigo-400 font-semibold mt-0.5">
                NEON EDITION
              </span>
            </div>
          </a>

          {
    /* Center — Primary Navigation (Exactly Four Items) */
  }
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold">
            {
    /* 1. Arcade */
  }
            <a
    href="#games"
    onClick={(e) => {
      e.preventDefault();
      if (activeGameId) returnToArcade();
      document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
    }}
    className="relative text-white/75 hover:text-white transition-colors py-1 flex items-center gap-1.5 group"
  >
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Arcade</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-400 group-hover:w-full transition-all duration-200" />
            </a>

            {
    /* 2. Leaderboard */
  }
            <button
    onClick={() => {
      arcadeSound.playClick();
      setShowLeaderboard(true);
    }}
    className="relative text-white/75 hover:text-amber-300 transition-colors py-1 flex items-center gap-1.5 group"
  >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-200" />
            </button>

            {
    /* 3. Daily Challenge */
  }
            <button
    onClick={() => {
      arcadeSound.playClick();
      setShowDailyArena(true);
    }}
    className="relative text-white/75 hover:text-rose-300 transition-colors py-1 flex items-center gap-1.5 group"
  >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Daily Challenge</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
            </button>

            {
    /* 4. Achievements */
  }
            <button
    onClick={() => {
      arcadeSound.playClick();
      setShowPassport(true);
    }}
    className="relative text-white/75 hover:text-purple-300 transition-colors py-1 flex items-center gap-1.5 group"
  >
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Achievements</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-200" />
            </button>
          </nav>

          {
    /* Right — Player Controls */
  }
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {
    /* Audio Button (Opens Audio & Visual Settings Panel) */
  }
            <button
    onClick={() => {
      arcadeSound.playClick();
      setShowSettings(true);
    }}
    className={`p-2 rounded-xl border transition-all flex items-center justify-center ${soundEnabled ? "bg-indigo-500/10 border-indigo-500/30 text-cyan-300 hover:bg-indigo-500/20" : "bg-white/5 border-white/10 text-white/40 hover:text-white"}`}
    title="Music & Sound Settings"
    aria-label="Sound Settings"
  >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {
    /* Player Level Indicator with Glowing Status Dot */
  }
            <button
    onClick={() => {
      arcadeSound.playClick();
      setShowPassport(true);
    }}
    className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all flex items-center gap-2 shrink-0 group"
    title="View Pilot Passport & Stats"
    aria-label="Player Profile"
  >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                LVL {playerLevel}
              </span>
            </button>

            {
    /* Prominent "Play Now" Button */
  }
            {activeGameId ? <button
    onClick={returnToArcade}
    className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 rounded-xl hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shrink-0 shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
  >
                <ArrowLeft className="w-3.5 h-3.5" /> All Games
              </button> : <button
    onClick={() => {
      arcadeSound.playPowerup();
      openGame(featuredGame.id);
    }}
    className="px-4 sm:px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 rounded-xl hover:brightness-110 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md"
  >
                <Play className="w-3 h-3 fill-current" />
                <span>Play Now</span>
              </button>}

            {
    /* Mobile Hamburger Drawer Toggle */
  }
            <button
    onClick={() => setMobileMenuOpen((o) => !o)}
    className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white"
    aria-label="Open Mobile Menu"
  >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {
    /* Responsive Mobile Drawer */
  }
        {mobileMenuOpen && <div className="md:hidden border-t border-white/10 bg-[#070612]/95 backdrop-blur-2xl p-4 space-y-3 animate-fadeIn">
            <nav className="flex flex-col space-y-1">
              <a
    href="#games"
    onClick={(e) => {
      e.preventDefault();
      setMobileMenuOpen(false);
      if (activeGameId) returnToArcade();
      document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
    }}
    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-between"
  >
                <span className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-cyan-400" />
                  <span>Arcade (15 Games)</span>
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </a>

              <button
    onClick={() => {
      setMobileMenuOpen(false);
      arcadeSound.playClick();
      setShowLeaderboard(true);
    }}
    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-amber-300 hover:bg-white/10 flex items-center justify-between text-left"
  >
                <span className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Leaderboard</span>
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>

              <button
    onClick={() => {
      setMobileMenuOpen(false);
      arcadeSound.playClick();
      setShowDailyArena(true);
    }}
    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-rose-300 hover:bg-white/10 flex items-center justify-between text-left"
  >
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Daily Challenge</span>
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>

              <button
    onClick={() => {
      setMobileMenuOpen(false);
      arcadeSound.playClick();
      setShowPassport(true);
    }}
    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-purple-300 hover:bg-white/10 flex items-center justify-between text-left"
  >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Achievements & Profile</span>
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>

              <button
    onClick={() => {
      setMobileMenuOpen(false);
      arcadeSound.playClick();
      setShowAiCoach(true);
    }}
    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-cyan-300 hover:bg-white/10 flex items-center justify-between text-left"
  >
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>AI Game Coach</span>
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>

              <button
    onClick={() => {
      setMobileMenuOpen(false);
      arcadeSound.playClick();
      setShowAnalytics(true);
    }}
    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-indigo-300 hover:bg-white/10 flex items-center justify-between text-left"
  >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Performance Analytics</span>
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>

              <button
    onClick={() => {
      setMobileMenuOpen(false);
      arcadeSound.playClick();
      setShowSettings(true);
    }}
    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-between text-left"
  >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-white/60" />
                  <span>Audio & Display Settings</span>
                </span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>
            </nav>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs font-mono text-white/60">
                <span>LVL {playerLevel}</span> · <span>{playerStats.totalXP} XP</span>
              </div>
              <button
    onClick={() => {
      setMobileMenuOpen(false);
      openGame(featuredGame.id);
    }}
    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950"
  >
                Launch {featuredGame.title}
              </button>
            </div>
          </div>}
      </header>

      {
    /* Main Content Area */
  }
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-10">
        {selectedGame ? (
    /* Active Game View Shell */
    <div className="space-y-6 animate-fadeIn">
            {
      /* Game Navigation & Controls Sub-bar */
    }
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <button
      onClick={returnToArcade}
      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2"
    >
                  <ArrowLeft className="w-4 h-4" /> Return to Arcade (Esc)
                </button>

                <div className="hidden md:flex items-center gap-2 text-xs font-mono text-white/50">
                  <span>·</span>
                  <span className="text-white font-bold">{selectedGame.title}</span>
                  <span>({selectedGame.type})</span>
                </div>
              </div>

              {
      /* Quick Game Switcher (All 15 Games) */
    }
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-white/40 hidden sm:inline">SWITCH GAME:</span>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto max-w-full">
                  {GAMES.map((g) => <button
      key={g.id}
      onClick={() => openGame(g.id)}
      className={`px-2 py-1 text-xs font-mono rounded-lg transition-all whitespace-nowrap ${g.id === activeGameId ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30" : "text-white/60 hover:text-white hover:bg-white/5"}`}
      title={g.title}
    >
                      {g.num}
                    </button>)}
                </div>
              </div>
            </div>

            {
      /* Mount the active mini game */
    }
            <div className="w-full">
              {activeGameId === "neon-maze" && <NeonMaze onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "cyber-hacker" && <CyberHacker onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "memory-matrix" && <MemoryMatrix onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "gravity-flip" && <GravityFlip onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "quantum-shift" && <QuantumShift onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "boss-rush" && <BossRush onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "snake" && <Snake onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "space-shooter" && <SpaceShooter onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "hyper-pong" && <HyperPong onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "2048" && <Game2048 onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "reaction-test" && <ReactionTest onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "number-recall" && <NumberRecall onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "memory" && <MemoryMatch onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "code-quiz" && <CodeQuiz onNotifyAchievement={handleNotifyAchievement} />}
              {activeGameId === "brain-teaser" && <BrainTeasers onNotifyAchievement={handleNotifyAchievement} />}
            </div>
          </div>
  ) : (
    /* Main Arcade Lobby */
    <>
            {
      /* =========================================================================
          2. HERO SECTION — CINEMATIC, MEMORABLE, BALANCED
          Left: Eyebrow, Heading ("ENTER THE \n ARCADE."), Supporting Text,
                2 Primary Actions ("Play Arcade", "Surprise Me"), Player Progress
          Right: Animated Arcade Portal Visual
      ========================================================================= */
    }
            <section className="relative text-left py-6 sm:py-12 md:py-16 overflow-hidden">
              {
      /* Subtle ambient lighting */
    }
              <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[460px] h-[460px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-14 items-center">
                {
      /* Left Column: Hero Copy & Actions (col-span-7) */
    }
                <div className="lg:col-span-7 space-y-6">
                  {
      /* Eyebrow Pill */
    }
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                    <span>NEON ARCADE · 15 PLAYABLE GAMES</span>
                  </div>

                  {
      /* Main Heading (Exact copy: "ENTER THE \n ARCADE.") */
    }
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05] font-display">
                    ENTER THE <br />
                    <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                      ARCADE.
                    </span>
                  </h1>

                  {
      /* Supporting Text (Exact copy) */
    }
                  <p className="text-base sm:text-lg text-white/70 max-w-lg leading-relaxed font-sans">
                    Challenge your reflexes. Outsmart the puzzles. Beat your personal best. Your next high score starts here.
                  </p>

                  {
      /* Primary Actions: Exactly Two Prominent Buttons */
    }
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {
      /* Primary Button: Play Arcade */
    }
                    <button
      onClick={() => {
        arcadeSound.playClick();
        document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 text-slate-950 hover:brightness-110 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] active:scale-95 transition-all shadow-md flex items-center gap-2"
    >
                      <span>Play Arcade</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    {
      /* Secondary Button: Surprise Me */
    }
                    <button
      onClick={spinRandomGame}
      disabled={isSpinning}
      className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 hover:border-white/25 active:scale-95 transition-all flex items-center gap-2"
    >
                      <Dices className={`w-4 h-4 text-cyan-300 ${isSpinning ? "animate-spin" : ""}`} />
                      <span>{isSpinning ? "Selecting..." : "Surprise Me"}</span>
                    </button>
                  </div>

                  {
      /* Compact Player Progress Indicator (Level & XP only) */
    }
                  <div className="pt-2 flex items-center gap-3 text-xs font-mono text-white/60">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                      <span className="font-bold text-white">LVL {playerLevel}</span>
                    </div>
                    <span>·</span>
                    <span className="text-cyan-300 font-semibold">{playerStats.totalXP} XP</span>
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden ml-1">
                      <div
      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-300"
      style={{ width: `${xpPercent}%` }}
    />
                    </div>
                  </div>
                </div>

                {
      /* Right Column: Animated Arcade Visual */
    }
                <div className="lg:col-span-5 flex items-center justify-center">
                  <ArcadePortal
      onLaunch={() => openGame(featuredGame.id)}
      featuredTitle={featuredGame.title}
      featuredCategory={featuredGame.type}
    />
                </div>
              </div>
            </section>

            {
      /* =========================================================================
          3. HERO-TO-GAMES TRANSITION
          - Featured Challenge Card (Daily Challenge highlight)
          - Live Activity Ticker (placed cleanly below hero)
      ========================================================================= */
    }
            <section className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-cyan-500/20">
                  {featuredGame.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300" /> FEATURED CHALLENGE
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/70 hidden sm:inline">
                      {featuredGame.estimatedTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {featuredGame.title}: <span className="font-normal text-white/70">{featuredGame.subtitle}</span>
                  </h3>
                  <p className="text-xs text-white/55 max-w-xl mt-0.5">
                    {featuredGame.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
      onClick={() => openGame(featuredGame.id)}
      className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
    >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Challenge</span>
                </button>
              </div>
            </section>

            {
      /* Live Activity Telemetry Ticker */
    }
            {activities.length > 0 && <div className="mb-10 p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 overflow-x-auto text-xs font-mono text-white/60">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold shrink-0">
                  LIVE TELEMETRY
                </span>
                <div className="flex items-center gap-6 whitespace-nowrap">
                  {activities.map((act) => <span key={act.id} className="flex items-center gap-1.5">
                      <span>{act.avatar}</span>
                      <strong className="text-white">{act.username}</strong>
                      <span>{act.action}:</span>
                      <span className="text-cyan-300">{act.details}</span>
                      <span className="text-white/30 text-[10px]">({act.timestamp})</span>
                    </span>)}
                </div>
              </div>}

            {
      /* Games Section */
    }
            <section id="games" className="py-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
                    CHOOSE YOUR DISCIPLINE
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                      The Arcade Grid<span className="text-cyan-400">.</span>
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
                      15 Games
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mt-1 max-w-lg">
                    Handcrafted interactive experiences across reflex, logic, memory, strategy, and fast-paced arcade action.
                  </p>
                </div>
              </div>

              {
      /* Compact Search & Category Filter Controls Toolbar */
    }
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search by game name, mechanics, or discipline..."
      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/60 transition-colors"
    />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto p-1 bg-black/30 rounded-xl border border-white/5">
                  {["All", "Action", "Logic", "Puzzle", "Memory", "Reflex"].map((cat) => <button
      key={cat}
      onClick={() => {
        arcadeSound.playClick();
        setFilter(cat);
      }}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${filter === cat ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold shadow-sm" : "text-white/60 hover:text-white"}`}
    >
                      {cat}
                    </button>)}
                </div>
              </div>

              {
      /* Game Cards Grid (All 15 Games) */
    }
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {filteredGames.map((g) => {
      return <TiltCard
        key={g.id}
        accentColor={g.accentHex}
        className="cursor-pointer flex flex-col justify-between"
        onClick={() => openGame(g.id)}
      >
                      <div>
                        {
        /* Top Bar of Card */
      }
                        <div className="flex items-center justify-between p-5 pb-3">
                          <span className="text-[11px] font-mono tracking-widest text-white/50">
                            {g.num} / ARCADE
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {Boolean(playerStats.highScores[g.id]) && <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 flex items-center gap-1">
                                <Trophy className="w-2.5 h-2.5 text-amber-400" />
                                <span>PB: {playerStats.highScores[g.id]}{g.id === "reaction-test" ? "ms" : g.id === "memory" ? " m" : ""}</span>
                              </span>}
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 border border-white/10 text-cyan-300">
                              {g.estimatedTime}
                            </span>
                            <span
        className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${g.difficulty === "Elite" ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : g.difficulty === "Standard" ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"}`}
      >
                              {g.difficulty}
                            </span>
                          </div>
                        </div>

                        {
        /* Interactive Art Preview Box */
      }
                        <div className="mx-5 h-44 rounded-xl border border-white/10 overflow-hidden relative shadow-inner">
                          <GameCardArt id={g.id} />
                        </div>

                        {
        /* Card Content */
      }
                        <div className="p-5 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                              {g.title}
                            </h3>
                            <span className="text-2xl">{g.icon}</span>
                          </div>
                          <p className="text-xs font-medium text-indigo-400">
                            {g.subtitle}
                          </p>
                          <p className="text-xs text-white/65 line-clamp-2 leading-relaxed">
                            {g.description}
                          </p>
                        </div>
                      </div>

                      {
        /* Card Footer */
      }
                      <div className="p-5 pt-0">
                        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                            <Keyboard className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{g.controls}</span>
                          </div>

                          <button
        onClick={(e) => {
          e.stopPropagation();
          openGame(g.id);
        }}
        className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white text-slate-950 hover:bg-cyan-300 active:scale-95 transition-all shadow-md flex items-center gap-1"
      >
                            <span>Launch</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </TiltCard>;
    })}
              </div>

              {filteredGames.length === 0 && <div className="text-center py-16 p-8 rounded-3xl bg-white/5 border border-dashed border-white/15 space-y-3">
                  <Gamepad2 className="w-10 h-10 text-white/30 mx-auto" />
                  <h4 className="text-lg font-bold text-white">No mini-games match your search</h4>
                  <p className="text-xs text-white/50 max-w-sm mx-auto">
                    Try clearing the keyword search or selecting a different category filter.
                  </p>
                  <button
      onClick={() => {
        setSearch("");
        setFilter("All");
      }}
      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors"
    >
                    Reset Filters
                  </button>
                </div>}
            </section>

            {
      /* Compact Three-Item Summary Strip */
    }
            <section className="my-10 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
                <div className="flex items-center gap-4 justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center text-cyan-300">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-black font-display text-white">15 Mini-Games</div>
                    <div className="text-xs font-mono text-white/50">Full-Spectrum Gaming Runtimes</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/25 flex items-center justify-center text-indigo-300">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-black font-display text-white">100% Procedural Audio</div>
                    <div className="text-xs font-mono text-white/50">Synthesizer & Ambient Channels</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/25 flex items-center justify-center text-purple-300">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-black font-display text-white">16 Trophy Badges</div>
                    <div className="text-xs font-mono text-white/50">Progression & Daily Challenges</div>
                  </div>
                </div>
              </div>
            </section>
          </>
  )}
      </main>

      {
    /* Standalone Gaming Platform Footer */
  }
      <footer className="relative z-10 w-full border-t border-white/10 py-8 bg-[#05040e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">DEVELOPER ARCADE</span>
            <span>·</span>
            <span>NEON EDITION</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>15 MINI-GAMES</span>
            <span>·</span>
            <span className="text-cyan-300">60 FPS KINETIC ENGINE</span>
          </div>

          <div className="flex items-center gap-4">
            <button
    onClick={() => setShowLeaderboard(true)}
    className="hover:text-white transition-colors"
  >
              Leaderboard
            </button>
            <button
    onClick={() => setShowDailyArena(true)}
    className="hover:text-white transition-colors"
  >
              Daily Challenge
            </button>
            <button
    onClick={() => setShowPassport(true)}
    className="hover:text-white transition-colors"
  >
              Achievements
            </button>
            <button
    onClick={() => setShowSettings(true)}
    className="hover:text-white transition-colors"
  >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {
    /* Player Passport Modal */
  }
      {showPassport && <PlayerPassportModal
    stats={playerStats}
    onUpdateStats={(newStats) => setPlayerStats(newStats)}
    onClose={() => setShowPassport(false)}
    onSelectGame={(id) => openGame(id)}
  />}

      {
    /* AI Coach Modal */
  }
      {showAiCoach && <AiCoachModal
    stats={playerStats}
    onClose={() => setShowAiCoach(false)}
    onLaunchDrill={(id) => openGame(id)}
  />}

      {
    /* Leaderboard Modal */
  }
      {showLeaderboard && <LeaderboardModal
    onClose={() => setShowLeaderboard(false)}
    onLaunchGame={(id) => openGame(id)}
  />}

      {
    /* Daily Brain Arena Modal */
  }
      {showDailyArena && <DailyArenaModal
    onClose={() => setShowDailyArena(false)}
    onCompletedBonus={(bonusXP) => {
      setPlayerStats((prev) => ({
        ...prev,
        totalXP: prev.totalXP + bonusXP
      }));
      setActiveBanner({
        type: "achievement",
        title: "Daily Arena Conquered!",
        message: `Awarded +${bonusXP} XP bounty to your pilot profile.`,
        icon: "\u{1F525}"
      });
    }}
  />}

      {
    /* Performance Analytics Modal */
  }
      {showAnalytics && <PerformanceAnalyticsModal onClose={() => setShowAnalytics(false)} />}

      {
    /* Settings Modal */
  }
      {showSettings && <SettingsModal
    crtMode={crtMode}
    onToggleCrt={() => setCrtMode((c) => !c)}
    reducedMotion={reducedMotion}
    onToggleReducedMotion={() => setReducedMotion((r) => !r)}
    theme={theme}
    onChangeTheme={(t) => setTheme(t)}
    onClose={() => setShowSettings(false)}
  />}

      {
    /* Game Result Telemetry Modal */
  }
      {activeResultSession && <GameResultModal
    session={activeResultSession}
    onPlayAgain={() => {
      setActiveResultSession(null);
      if (!activeGameId && activeResultSession.gameId) {
        openGame(activeResultSession.gameId);
      }
    }}
    onClose={() => {
      setActiveResultSession(null);
    }}
  />}

      {
    /* Celebratory Banner */
  }
      {activeBanner && <ArcadeBanner
    type={activeBanner.type}
    title={activeBanner.title}
    message={activeBanner.message}
    icon={activeBanner.icon}
    onClose={() => setActiveBanner(null)}
  />}
    </div>;
}
