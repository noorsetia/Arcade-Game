const GAME_RULES = {
  "neon-maze": {
    id: "neon-maze",
    title: "Neon Maze",
    category: "Puzzle",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 25e3,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player", "Daily Challenge"],
    allowedMetrics: ["Maze Dimension", "Nodes Traversed", "Path Efficiency"],
    baseXP: 40,
    minDurationSeconds: 4,
    calculateTrustedXP: (score) => Math.min(250, 40 + Math.floor(score / 50))
  },
  "cyber-hacker": {
    id: "cyber-hacker",
    title: "Cyber Hacker",
    category: "Logic",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 1e4,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player", "Daily Challenge"],
    allowedMetrics: ["Attempts Left", "Likeness Guesses", "Brackets Found"],
    baseXP: 50,
    minDurationSeconds: 4,
    calculateTrustedXP: (score) => Math.min(300, 50 + Math.floor(score / 20))
  },
  "memory-matrix": {
    id: "memory-matrix",
    title: "Memory Matrix",
    category: "Memory",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 15e3,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Highest Level", "Tile Accuracy", "Grid Size"],
    baseXP: 35,
    minDurationSeconds: 5,
    calculateTrustedXP: (score) => Math.min(250, 35 + Math.floor(score / 30))
  },
  "gravity-flip": {
    id: "gravity-flip",
    title: "Gravity Flip",
    category: "Action",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 5e4,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Flips Executed", "Distance Survived (m)", "Speed Mult"],
    baseXP: 30,
    minDurationSeconds: 3,
    calculateTrustedXP: (score) => Math.min(300, 30 + Math.floor(score / 50))
  },
  "quantum-shift": {
    id: "quantum-shift",
    title: "Quantum Shift",
    category: "Puzzle",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 15e3,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Phases Shifted", "Chambers Cleared", "Moves Made"],
    baseXP: 45,
    minDurationSeconds: 5,
    calculateTrustedXP: (score) => Math.min(280, 45 + Math.floor(score / 35))
  },
  "boss-rush": {
    id: "boss-rush",
    title: "Boss Rush",
    category: "Action",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 2e5,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Bosses Defeated", "Bombs Used", "Hit Accuracy %"],
    baseXP: 60,
    minDurationSeconds: 8,
    calculateTrustedXP: (score) => Math.min(400, 60 + Math.floor(score / 150))
  },
  "snake": {
    id: "snake",
    title: "Neon Snake",
    category: "Action",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 1e4,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Snake Length", "Food Consumed", "Turbo Time (s)"],
    baseXP: 30,
    minDurationSeconds: 3,
    calculateTrustedXP: (score) => Math.min(250, 30 + Math.floor(score * 1.5))
  },
  "space-shooter": {
    id: "space-shooter",
    title: "Space Shooter",
    category: "Action",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 1e5,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Asteroids Obliterated", "Enemies Defeated", "Accuracy %"],
    baseXP: 40,
    minDurationSeconds: 5,
    calculateTrustedXP: (score) => Math.min(350, 40 + Math.floor(score / 4))
  },
  "hyper-pong": {
    id: "hyper-pong",
    title: "Hyper Pong",
    category: "Action",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 50,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Player Score", "Opponent Score", "Max Volley Rally"],
    baseXP: 30,
    minDurationSeconds: 6,
    calculateTrustedXP: (score) => Math.min(200, 30 + score * 15)
  },
  "2048": {
    id: "2048",
    title: "2048 Neon",
    category: "Puzzle",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 5e5,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Highest Tile", "Moves Executed", "Undo Used"],
    baseXP: 35,
    minDurationSeconds: 5,
    calculateTrustedXP: (score) => Math.min(350, 35 + Math.floor(score / 100))
  },
  "reaction-test": {
    id: "reaction-test",
    title: "Reaction Test",
    category: "Reflex",
    metricDirection: "lower",
    // Lower is faster / better
    minScore: 80,
    // Sub-80ms is physiologically implausible for humans
    maxScore: 1e4,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Trials Count", "Best Attempt (ms)", "Average Response (ms)"],
    baseXP: 40,
    minDurationSeconds: 1,
    calculateTrustedXP: (score) => {
      if (score <= 180) return 180;
      if (score <= 220) return 140;
      if (score <= 280) return 100;
      if (score <= 350) return 60;
      return 40;
    }
  },
  "number-recall": {
    id: "number-recall",
    title: "Number Recall",
    category: "Memory",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 40,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Digits Recalled", "Sequence Speed (ms)", "Total Stages"],
    baseXP: 30,
    minDurationSeconds: 3,
    calculateTrustedXP: (score) => Math.min(260, 30 + score * 20)
  },
  "memory": {
    id: "memory",
    title: "Memory Pairs",
    category: "Memory",
    metricDirection: "lower",
    // Lower moves is better
    minScore: 6,
    // 6 pairs minimum 6 moves
    maxScore: 500,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player"],
    allowedMetrics: ["Moves Count", "Total Pairs", "Match Accuracy %"],
    baseXP: 50,
    minDurationSeconds: 4,
    calculateTrustedXP: (score) => {
      if (score <= 10) return 180;
      if (score <= 16) return 130;
      if (score <= 24) return 80;
      return 50;
    }
  },
  "code-quiz": {
    id: "code-quiz",
    title: "Code Quiz",
    category: "Logic",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 1500,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player", "Daily Challenge"],
    allowedMetrics: ["Correct Answers", "Streak Multiplier", "Time Bonus"],
    baseXP: 40,
    minDurationSeconds: 4,
    calculateTrustedXP: (score) => Math.min(250, 40 + Math.floor(score / 5))
  },
  "brain-teaser": {
    id: "brain-teaser",
    title: "Brain Teasers",
    category: "Logic",
    metricDirection: "higher",
    minScore: 0,
    maxScore: 1e3,
    supportedDifficulties: ["Casual", "Standard", "Elite"],
    supportedModes: ["Single Player", "Daily Challenge"],
    allowedMetrics: ["Riddles Solved", "Hints Used", "Time Bonus"],
    baseXP: 45,
    minDurationSeconds: 4,
    calculateTrustedXP: (score) => Math.min(250, 45 + Math.floor(score / 4))
  }
};
function isScoreBetter(gameId, candidate, incumbent) {
  if (candidate <= 0) return false;
  if (!incumbent || incumbent <= 0) return true;
  const rule = GAME_RULES[gameId];
  if (!rule) return candidate > incumbent;
  if (rule.metricDirection === "lower") {
    return candidate < incumbent;
  }
  return candidate > incumbent;
}
export {
  GAME_RULES,
  isScoreBetter
};
