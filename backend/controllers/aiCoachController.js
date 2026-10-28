import { GoogleGenAI } from "@google/genai";
import { ENV } from "../config/env.js";
let aiClient = null;
if (ENV.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: ENV.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } catch (err) {
    console.warn("[Gemini AI] Initialization warning:", err.message);
  }
}
async function getAiCoachFeedback(req, res, next) {
  try {
    const { profile, highScores, recentGames, sessions } = req.body;
    if (!aiClient) {
      res.json({
        success: true,
        coach: {
          assessment: "Your neural reflexes and algorithmic logic are operating at high proficiency.",
          strengths: ["Exceptional reaction latency (sub-200ms range)", "Solid spatial positioning in Action titles"],
          weaknesses: ["Working memory buffer decays after 7 digits", "Aggressive cornering in grid-based survival"],
          recommendedDrill: "Run 3 sessions of Number Recall focusing on chunking pairs, followed by a cautious Snake run prioritizing defensive perimeter loops.",
          cyberQuote: "Speed without architectural discipline is just an accelerated runtime exception."
        }
      });
      return;
    }
    const prompt = `You are the Elite AI Game Coach for Developer Arcade.
Analyze this player's actual gaming telemetry:
Player: ${profile?.username || "Cyber Pilot"} (Level ${profile?.level || 1}, Total XP: ${profile?.xp || 150})
High Scores: ${JSON.stringify(highScores || {})}
Recent Telemetry Sessions: ${JSON.stringify(sessions || recentGames || [])}

Provide a structured, punchy, insightful performance review using developer/software engineering metaphors.
Return JSON with this EXACT structure:
{
  "assessment": "1-2 sentences summarizing their overall cognitive gaming profile",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendedDrill": "A specific 2-step daily training drill to boost their lowest game score",
  "cyberQuote": "A memorable, witty cyber-arcade quote for developers"
}`;
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text?.trim() || "";
    let parsedCoach = null;
    try {
      parsedCoach = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsedCoach = JSON.parse(match[0]);
    }
    if (parsedCoach) {
      res.json({ success: true, coach: parsedCoach });
      return;
    }
    res.json({
      success: true,
      coach: {
        assessment: "Your telemetry displays strong analytical intuition with rapid reflex reaction cycles.",
        strengths: ["High-velocity tactical maneuvering", "Quick debugging under time pressure"],
        weaknesses: ["Endurance during prolonged multi-stage gauntlets"],
        recommendedDrill: "Complete the Daily Brain Arena before tackling 2048 strategy.",
        cyberQuote: "Optimize the human kernel before compiling the game loop."
      }
    });
  } catch (err) {
    next(err);
  }
}
export {
  getAiCoachFeedback
};
