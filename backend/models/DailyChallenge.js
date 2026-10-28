import mongoose, { Schema } from "mongoose";
const DailyChallengeSchema = new Schema(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    date: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    timezone: {
      type: String,
      default: "UTC"
    },
    gameId: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    targetScore: {
      type: Number,
      default: 300
    },
    stages: {
      type: [
        {
          stage: Number,
          type: { type: String },
          prompt: String,
          options: [String],
          correct: Number,
          answer: String
        }
      ],
      default: []
    },
    rewardXP: {
      type: Number,
      default: 250,
      min: 0
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "7d" }
      // TTL index
    }
  },
  {
    timestamps: true
  }
);
const DailyChallenge = mongoose.models.DailyChallenge || mongoose.model("DailyChallenge", DailyChallengeSchema);
export {
  DailyChallenge
};
