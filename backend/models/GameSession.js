import mongoose, { Schema } from "mongoose";
const GameSessionSchema = new Schema(
  {
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    userId: {
      type: String,
      index: true,
      default: null
    },
    guestId: {
      type: String,
      index: true,
      default: null
    },
    gameId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    gameName: {
      type: String,
      required: true,
      trim: true
    },
    mode: {
      type: String,
      default: "Single Player",
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["Casual", "Standard", "Elite"],
      default: "Standard"
    },
    score: {
      type: Number,
      required: true
    },
    durationSeconds: {
      type: Number,
      required: true,
      min: 0
    },
    metrics: {
      type: Schema.Types.Mixed,
      default: () => ({})
    },
    completionStatus: {
      type: String,
      enum: ["completed", "failed", "abandoned"],
      default: "completed"
    },
    validationStatus: {
      type: String,
      enum: ["verified", "unverified", "rejected"],
      default: "verified"
    },
    rejectionReason: {
      type: String,
      default: null
    },
    xpAwarded: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    isNewPersonalBest: {
      type: Boolean,
      default: false
    },
    isCompetitive: {
      type: Boolean,
      default: true
    },
    clientSubmittedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);
GameSessionSchema.index({ userId: 1, createdAt: -1 });
GameSessionSchema.index({ gameId: 1, score: -1, createdAt: -1 });
GameSessionSchema.index({ gameId: 1, score: 1, createdAt: -1 });
const GameSession = mongoose.models.GameSession || mongoose.model("GameSession", GameSessionSchema);
export {
  GameSession
};
