import mongoose, { Schema } from "mongoose";
const UserAchievementSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    achievementId: {
      type: String,
      required: true,
      index: true
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    rewardClaimed: {
      type: Boolean,
      default: true
    },
    rewardXP: {
      type: Number,
      default: 100,
      min: 0
    },
    triggeringSessionId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);
UserAchievementSchema.index(
  { userId: 1, achievementId: 1 },
  { unique: true }
);
const UserAchievement = mongoose.models.UserAchievement || mongoose.model("UserAchievement", UserAchievementSchema);
export {
  UserAchievement
};
