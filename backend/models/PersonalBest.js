import mongoose, { Schema } from "mongoose";
const PersonalBestSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    gameId: {
      type: String,
      required: true,
      index: true
    },
    mode: {
      type: String,
      default: "Single Player"
    },
    difficulty: {
      type: String,
      enum: ["Casual", "Standard", "Elite"],
      default: "Standard"
    },
    bestScore: {
      type: Number,
      required: true
    },
    metricDirection: {
      type: String,
      enum: ["higher", "lower"],
      required: true,
      default: "higher"
    },
    sessionId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);
PersonalBestSchema.index(
  { userId: 1, gameId: 1, mode: 1, difficulty: 1 },
  { unique: true }
);
PersonalBestSchema.index({ gameId: 1, bestScore: -1, updatedAt: 1 });
PersonalBestSchema.index({ gameId: 1, bestScore: 1, updatedAt: 1 });
const PersonalBest = mongoose.models.PersonalBest || mongoose.model("PersonalBest", PersonalBestSchema);
export {
  PersonalBest
};
