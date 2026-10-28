import mongoose, { Schema } from "mongoose";
const UserPreferencesSchema = new Schema(
  {
    soundEnabled: { type: Boolean, default: true },
    crtMode: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
    theme: { type: String, default: "cyber-neon" }
  },
  { _id: false }
);
const GameAggregatedStatSchema = new Schema(
  {
    gamesPlayed: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    lastPlayedAt: { type: Date }
  },
  { _id: false }
);
const UserSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 32,
      default: "Cyber Pilot"
    },
    avatar: {
      type: String,
      default: "\u26A1",
      maxlength: 8
    },
    ringColor: {
      type: String,
      enum: ["cyan", "magenta", "emerald", "gold", "indigo"],
      default: "cyan"
    },
    title: {
      type: String,
      default: "Neural Pathfinder",
      maxlength: 32
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      index: true
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
      index: true
      // Key index for global leaderboards
    },
    dailyStreak: {
      type: Number,
      default: 1,
      min: 0
    },
    lastPlayedDate: {
      type: String,
      default: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    },
    totalPlayTimeSeconds: {
      type: Number,
      default: 0,
      min: 0
    },
    sessionsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({})
    },
    gameStats: {
      type: Map,
      of: GameAggregatedStatSchema,
      default: () => /* @__PURE__ */ new Map()
    }
  },
  {
    timestamps: true
  }
);
UserSchema.index({ xp: -1, level: -1 });
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export {
  User
};
