import mongoose, { Schema } from "mongoose";
const AchievementSchema = new Schema(
  {
    achievementId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["General", "Action", "Logic", "Memory", "Reflex", "Special"],
      default: "General"
    },
    icon: {
      type: String,
      default: "\u{1F3C6}"
    },
    rewardXP: {
      type: Number,
      default: 100,
      min: 0
    },
    criteria: {
      type: Schema.Types.Mixed,
      default: () => ({})
    },
    secret: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);
const Achievement = mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema);
export {
  Achievement
};
