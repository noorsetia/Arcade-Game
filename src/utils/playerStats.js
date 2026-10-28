import { arcadeApi } from "../services/apiClient.js";
export const GAME_TITLES = {
  "neon-maze": "Neon Maze",
  "cyber-hacker": "Cyber Hacker",
  "memory-matrix": "Memory Matrix",
  "gravity-flip": "Gravity Flip",
  "quantum-shift": "Quantum Shift",
  "boss-rush": "Boss Rush",
  snake: "Neon Snake",
  "space-shooter": "Space Shooter",
  "hyper-pong": "Hyper Pong",
  "2048": "2048 Neon",
  "reaction-test": "Reaction Test",
  "number-recall": "Number Recall",
  memory: "Memory Pairs",
  "code-quiz": "Code Quiz",
  "brain-teaser": "Brain Teasers"
};
export const DEFAULT_ACHIEVEMENTS = [
  { id: "first_play", title: "First Quarter", desc: "Launch any mini-game in the arcade", icon: "\u{1F3AE}", game: "General", unlocked: false },
  { id: "snake_bite", title: "Ouroboros", desc: "Score 100+ points in Snake", icon: "\u{1F40D}", game: "Snake", unlocked: false },
  { id: "ace_pilot", title: "Cosmic Ace", desc: "Score 150+ in Space Shooter", icon: "\u{1F680}", game: "Space Shooter", unlocked: false },
  { id: "syntax_guru", title: "Syntax Sage", desc: "Get a perfect score in Code Quiz", icon: "\u2318", game: "Code Quiz", unlocked: false },
  { id: "eidetic", title: "Photographic Mind", desc: "Finish Memory Match in under 12 moves", icon: "\u25C8", game: "Memory Match", unlocked: false },
  { id: "logic_master", title: "Lateral Genius", desc: "Solve all Brain Teaser riddles correctly", icon: "\u{1F9E0}", game: "Brain Teasers", unlocked: false },
  { id: "tile_fusion", title: "Grid Overlord", desc: "Reach the 256 tile or higher in 2048", icon: "\u25A6", game: "2048", unlocked: false },
  { id: "warp_reflex", title: "Sub-200ms Synapse", desc: "React in under 220ms in Reaction Test", icon: "\u26A1", game: "Reaction Test", unlocked: false },
  { id: "memory_vault", title: "Cyber Memory", desc: "Recall a sequence of 6+ digits in Number Recall", icon: "\u25CE", game: "Number Recall", unlocked: false },
  { id: "terminal_infiltrator", title: "Mainframe Ghost", desc: "Crack the cipher in Cyber Hacker", icon: "\u{1F4BB}", game: "Cyber Hacker", unlocked: false },
  { id: "pong_master", title: "Neon Champion", desc: "Defeat the Cyber AI in Hyper Pong", icon: "\u{1F3D3}", game: "Hyper Pong", unlocked: false },
  { id: "maze_runner", title: "Neural Pathfinder", desc: "Score 800+ in Neon Maze", icon: "\u{1F9ED}", game: "Neon Maze", unlocked: false },
  { id: "matrix_recall", title: "Synapse Master", desc: "Score 400+ points in Memory Matrix", icon: "\u25A6", game: "Memory Matrix", unlocked: false },
  { id: "gravity_survivor", title: "Vector Ace", desc: "Flip and survive over 500m in Gravity Flip", icon: "\u21C5", game: "Gravity Flip", unlocked: false },
  { id: "quantum_architect", title: "Dimensional Sage", desc: "Solve chambers in Quantum Shift", icon: "\u{1F300}", game: "Quantum Shift", unlocked: false },
  { id: "boss_slayer", title: "Overmind Slayer", desc: "Score 3,000+ points in Boss Rush", icon: "\u{1F480}", game: "Boss Rush", unlocked: false }
];
const STATS_KEY = "noor_arcade_stats_v2";
const SESSIONS_KEY = "noor_arcade_sessions_v2";
const AUTH_TOKEN_KEY = "noor_arcade_token_v2";
const sessionListeners = [];
export function onGameSessionCompleted(cb) {
  sessionListeners.push(cb);
  return () => {
    const idx = sessionListeners.indexOf(cb);
    if (idx >= 0) sessionListeners.splice(idx, 1);
  };
}
export function isBetterScore(gameId, newScore, oldScore) {
  if (newScore <= 0) return false;
  if (!oldScore || oldScore <= 0) return true;
  if (gameId === "reaction-test" || gameId === "memory") {
    return newScore < oldScore;
  }
  return newScore > oldScore;
}
export function getPlayerStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const rawSessions = localStorage.getItem(SESSIONS_KEY);
      const sessions = rawSessions ? JSON.parse(rawSessions) : parsed.sessions || [];
      return {
        ...parsed,
        playerAccount: parsed.playerAccount || {
          id: "guest_" + Math.random().toString(36).slice(2, 9),
          username: parsed.playerName || "Cyber Pilot",
          avatar: "\u26A1",
          ringColor: "cyan",
          title: "Neural Pathfinder",
          isGuest: true,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        playerName: parsed.playerName || parsed.playerAccount?.username || "Cyber Pilot",
        dailyStreak: parsed.dailyStreak || 1,
        lastPlayedDate: parsed.lastPlayedDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        sessions,
        unlockedThemes: parsed.unlockedThemes || ["cyber-neon"],
        highScores: {
          snake: 0,
          "space-shooter": 0,
          "code-quiz": 0,
          memory: 0,
          "brain-teaser": 0,
          "2048": 0,
          "reaction-test": 0,
          "number-recall": 0,
          "cyber-hacker": 0,
          "hyper-pong": 0,
          "neon-maze": 0,
          "memory-matrix": 0,
          "gravity-flip": 0,
          "quantum-shift": 0,
          "boss-rush": 0,
          ...parsed.highScores || {}
        },
        achievements: DEFAULT_ACHIEVEMENTS.map((def) => {
          const found = parsed.achievements?.find((a) => a.id === def.id);
          return found ? { ...def, unlocked: found.unlocked, unlockedAt: found.unlockedAt } : def;
        })
      };
    }
  } catch {
  }
  const guestAccount = {
    id: "guest_" + Math.random().toString(36).slice(2, 9),
    username: "Cyber Pilot",
    avatar: "\u26A1",
    ringColor: "cyan",
    title: "Neural Pathfinder",
    isGuest: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return {
    playerAccount: guestAccount,
    playerName: "Cyber Pilot",
    totalXP: 150,
    gamesPlayed: 0,
    dailyStreak: 1,
    lastPlayedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    highScores: {
      snake: 0,
      "space-shooter": 0,
      "code-quiz": 0,
      memory: 0,
      "brain-teaser": 0,
      "2048": 0,
      "reaction-test": 0,
      "number-recall": 0,
      "cyber-hacker": 0,
      "hyper-pong": 0,
      "neon-maze": 0,
      "memory-matrix": 0,
      "gravity-flip": 0,
      "quantum-shift": 0,
      "boss-rush": 0
    },
    achievements: DEFAULT_ACHIEVEMENTS,
    sessions: [],
    unlockedThemes: ["cyber-neon"]
  };
}
export function savePlayerStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    if (stats.sessions) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(stats.sessions.slice(0, 50)));
    }
  } catch {
  }
}
export function recordScore(gameId, score, earnedXP = 50, options) {
  const stats = getPlayerStats();
  const oldBest = stats.highScores[gameId] || 0;
  const newBest = isBetterScore(gameId, score, oldBest);
  const newAchievements = [];
  if (newBest) {
    stats.highScores[gameId] = score;
  }
  stats.gamesPlayed += 1;
  stats.totalXP += earnedXP;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (stats.lastPlayedDate !== today) {
    const lastDate = new Date(stats.lastPlayedDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1e3 * 60 * 60 * 24));
    if (diffDays === 1) {
      stats.dailyStreak += 1;
    } else if (diffDays > 1) {
      stats.dailyStreak = 1;
    }
    stats.lastPlayedDate = today;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const unlock = (id) => {
    const ach = stats.achievements.find((a) => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      ach.unlockedAt = now;
      newAchievements.push(ach);
      stats.totalXP += 100;
    }
  };
  unlock("first_play");
  if (gameId === "snake" && score >= 100) unlock("snake_bite");
  if (gameId === "space-shooter" && score >= 150) unlock("ace_pilot");
  if (gameId === "code-quiz" && score >= 800) unlock("syntax_guru");
  if (gameId === "memory" && score > 0 && score <= 12) unlock("eidetic");
  if (gameId === "brain-teaser" && score >= 500) unlock("logic_master");
  if (gameId === "2048" && score >= 256) unlock("tile_fusion");
  if (gameId === "reaction-test" && score > 0 && score <= 220) unlock("warp_reflex");
  if (gameId === "number-recall" && score >= 6) unlock("memory_vault");
  if (gameId === "cyber-hacker" && score >= 200) unlock("terminal_infiltrator");
  if (gameId === "hyper-pong" && score >= 7) unlock("pong_master");
  if (gameId === "neon-maze" && score >= 800) unlock("maze_runner");
  if (gameId === "memory-matrix" && score >= 400) unlock("matrix_recall");
  if (gameId === "gravity-flip" && score >= 500) unlock("gravity_survivor");
  if (gameId === "quantum-shift" && score >= 600) unlock("quantum_architect");
  if (gameId === "boss-rush" && score >= 3e3) unlock("boss_slayer");
  const currentLvl = Math.floor(stats.totalXP / 200) + 1;
  if (currentLvl >= 3 && !stats.unlockedThemes.includes("tokyo-sunset")) {
    stats.unlockedThemes.push("tokyo-sunset");
  }
  if (currentLvl >= 5 && !stats.unlockedThemes.includes("radioactive")) {
    stats.unlockedThemes.push("radioactive");
  }
  if (currentLvl >= 8 && !stats.unlockedThemes.includes("deep-void")) {
    stats.unlockedThemes.push("deep-void");
  }
  const idempotencyKey = "idem_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const session = {
    id: "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    idempotencyKey,
    gameId,
    gameName: GAME_TITLES[gameId] || gameId,
    score,
    previousBest: oldBest,
    isNewBest: newBest,
    startedAt: new Date(Date.now() - (options?.durationSeconds || 60) * 1e3).toISOString(),
    completedAt: now,
    durationSeconds: options?.durationSeconds || 60,
    difficulty: options?.difficulty || "Standard",
    mode: options?.mode || "Single Player",
    metrics: options?.metrics || {},
    xpAwarded: earnedXP + newAchievements.length * 100,
    achievementsUnlocked: newAchievements,
    isCompetitive: options?.isCompetitive !== false,
    isServerConfirmed: false
    // Updated to true once confirmed by server
  };
  stats.sessions = [session, ...stats.sessions || []].slice(0, 50);
  savePlayerStats(stats);
  sessionListeners.forEach((listener) => {
    try {
      listener(session);
    } catch (e) {
      console.error("Session listener error:", e);
    }
  });
  arcadeApi.submitSession({
    idempotencyKey,
    gameId,
    score,
    durationSeconds: session.durationSeconds,
    difficulty: session.difficulty,
    mode: session.mode,
    metrics: session.metrics
  }).then((result) => {
    if (result.success && result.isServerConfirmed) {
      session.isServerConfirmed = true;
      const currentStats = getPlayerStats();
      const found = currentStats.sessions?.find((s) => s.idempotencyKey === idempotencyKey);
      if (found) {
        found.isServerConfirmed = true;
        savePlayerStats(currentStats);
      }
    }
  }).catch(() => {
  });
  return {
    newBest,
    unlockedAchievement: newAchievements[0],
    newAchievements,
    session,
    oldBest
  };
}
export function updatePlayerProfile(profile) {
  const stats = getPlayerStats();
  stats.playerAccount = {
    ...stats.playerAccount,
    ...profile
  };
  if (profile.username) {
    stats.playerName = profile.username;
  }
  savePlayerStats(stats);
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...token ? { Authorization: `Bearer ${token}` } : {}
      },
      body: JSON.stringify(profile)
    }).catch(() => {
    });
  } catch {
  }
  return stats;
}
export async function registerAccount(username, password) {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!json.success) {
      return { success: false, error: json.error || "Registration failed" };
    }
    if (json.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, json.token);
    }
    const currentStats = getPlayerStats();
    currentStats.playerAccount = {
      id: json.account.id,
      username: json.account.username,
      avatar: json.account.avatar || "\u26A1",
      ringColor: json.account.ringColor || "cyan",
      title: json.account.title || "Verified Architect",
      isGuest: false,
      token: json.token,
      createdAt: json.account.createdAt
    };
    currentStats.playerName = json.account.username;
    savePlayerStats(currentStats);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Network error" };
  }
}
export async function loginAccount(username, password) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!json.success) {
      return { success: false, error: json.error || "Invalid credentials" };
    }
    if (json.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, json.token);
    }
    const currentStats = getPlayerStats();
    currentStats.playerAccount = {
      id: json.account.id,
      username: json.account.username,
      avatar: json.account.avatar || "\u26A1",
      ringColor: json.account.ringColor || "cyan",
      title: json.account.title || "Verified Architect",
      isGuest: false,
      token: json.token,
      createdAt: json.account.createdAt
    };
    currentStats.playerName = json.account.username;
    if (json.stats) {
      currentStats.totalXP = Math.max(currentStats.totalXP, json.stats.totalXP || 0);
      currentStats.dailyStreak = Math.max(currentStats.dailyStreak, json.stats.dailyStreak || 1);
      if (json.stats.highScores) {
        Object.keys(json.stats.highScores).forEach((k) => {
          const key = k;
          if (isBetterScore(key, json.stats.highScores[key], currentStats.highScores[key])) {
            currentStats.highScores[key] = json.stats.highScores[key];
          }
        });
      }
    }
    savePlayerStats(currentStats);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Network error" };
  }
}
export function logoutAccount() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
  }
  const stats = getPlayerStats();
  stats.playerAccount = {
    id: "guest_" + Math.random().toString(36).slice(2, 9),
    username: "Cyber Pilot",
    avatar: "\u26A1",
    ringColor: "cyan",
    title: "Neural Pathfinder",
    isGuest: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  stats.playerName = "Cyber Pilot";
  savePlayerStats(stats);
  return stats;
}
