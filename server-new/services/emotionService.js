const axios = require("axios");

const HF_TOKEN = process.env.HF_TOKEN;

const mapModelLabelToMood = (label) => {
  const lowered = String(label || "").toLowerCase();
  if (lowered.includes("joy") || lowered.includes("love") || lowered.includes("happy") || lowered.includes("share")) return "happy";
  if (lowered.includes("sad") || lowered.includes("grief") || lowered.includes("depress")) return "sad";
  if (lowered.includes("ang") || lowered.includes("frust") || lowered.includes("mad") || lowered.includes("annoy")) return "angry";
  if (lowered.includes("fear") || lowered.includes("anx") || lowered.includes("stress") || lowered.includes("worry") || lowered.includes("panic")) return "stressed";
  if (lowered.includes("tired") || lowered.includes("exhaust") || lowered.includes("sleep") || lowered.includes("low energy") || lowered.includes("fatigue")) return "tired";
  return "neutral";
};

/**
 * Local keyword analysis fallback in case Hugging Face API is missing, slow, or offline.
 */
const localAnalyzeEmotion = (text) => {
  const lowered = String(text || "").toLowerCase();
  
  let scores = {
    happy: 0.05,
    sad: 0.05,
    angry: 0.05,
    stressed: 0.05,
    tired: 0.05,
    neutral: 0.50
  };

  // Keywords for sad
  if (
    lowered.includes("sad") || 
    lowered.includes("cry") || 
    lowered.includes("hurt") || 
    lowered.includes("alone") || 
    lowered.includes("depress") || 
    lowered.includes("lonel") || 
    lowered.includes("broken") || 
    lowered.includes("unhappy") || 
    lowered.includes("grief") ||
    lowered.includes("hopeless") ||
    lowered.includes("left") ||
    lowered.includes("abandon") ||
    lowered.includes("betray") ||
    lowered.includes("heartbreak") ||
    lowered.includes("lost") ||
    lowered.includes("pain") ||
    lowered.includes("tears")
  ) {
    scores.sad += 0.8;
    scores.neutral -= 0.3;
  }

  // Keywords for happy
  if (
    lowered.includes("happy") || 
    lowered.includes("joy") || 
    lowered.includes("great") || 
    lowered.includes("excite") || 
    lowered.includes("celebrate") || 
    lowered.includes("glad") || 
    lowered.includes("wonderful") || 
    lowered.includes("love") || 
    lowered.includes("awesome") ||
    lowered.includes("win") ||
    lowered.includes("success") ||
    lowered.includes("perfect") ||
    lowered.includes("amazing") ||
    lowered.includes("smile") ||
    lowered.includes("good") ||
    lowered.includes("proud")
  ) {
    scores.happy += 0.8;
    scores.neutral -= 0.3;
  }

  // Keywords for stressed
  if (
    lowered.includes("stress") || 
    lowered.includes("anxious") || 
    lowered.includes("worry") || 
    lowered.includes("panic") || 
    lowered.includes("scare") || 
    lowered.includes("tense") || 
    lowered.includes("overwhelm") || 
    lowered.includes("pressure") ||
    lowered.includes("afraid") ||
    lowered.includes("nervous") ||
    lowered.includes("exam") ||
    lowered.includes("test") ||
    lowered.includes("scared")
  ) {
    scores.stressed += 0.8;
    scores.neutral -= 0.3;
  }

  // Keywords for angry
  if (
    lowered.includes("angry") || 
    lowered.includes("mad") || 
    lowered.includes("annoy") || 
    lowered.includes("hate") || 
    lowered.includes("irritat") || 
    lowered.includes("furious") ||
    lowered.includes("frustrat") ||
    lowered.includes("stupid") ||
    lowered.includes("disgust") ||
    lowered.includes("fed up")
  ) {
    scores.angry += 0.8;
    scores.neutral -= 0.3;
  }

  // Keywords for tired
  if (
    lowered.includes("tired") ||
    lowered.includes("exhausted") ||
    lowered.includes("sleepy") ||
    lowered.includes("low energy") ||
    lowered.includes("fatigue") ||
    lowered.includes("sluggish") ||
    lowered.includes("sleep") ||
    lowered.includes("drain")
  ) {
    scores.tired += 0.8;
    scores.neutral -= 0.3;
  }

  return Object.keys(scores)
    .map(label => ({
      label: label,
      score: Math.max(0, Math.min(1, scores[label]))
    }))
    .sort((a, b) => b.score - a.score);
};

/**
 * Calls Hugging Face inference API or falls back to local analyzer.
 */
const detectEmotion = async (text) => {
  if (!text || !String(text).trim()) {
    return localAnalyzeEmotion("");
  }

  if (!HF_TOKEN || HF_TOKEN.includes("your_huggingface_token")) {
    console.log("ℹ️ [EmotionService] No Hugging Face token found. Using local fallback.");
    return localAnalyzeEmotion(text);
  }

  try {
    console.log("🤖 [EmotionService] Sending inference request to Hugging Face...");
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/tabularisai/multilingual-emotion-classification",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 6000
      }
    );

    let data = response.data;
    if (Array.isArray(data) && Array.isArray(data[0])) {
      data = data[0];
    }

    if (Array.isArray(data) && data.length > 0 && data[0].label) {
      // Map model labels to our 6 categories
      const moodScores = {
        happy: 0.0,
        sad: 0.0,
        angry: 0.0,
        stressed: 0.0,
        tired: 0.0,
        neutral: 0.0
      };

      data.forEach(item => {
        const mood = mapModelLabelToMood(item.label);
        moodScores[mood] += item.score;
      });

      // Sort mapped moods descending
      const mappedResult = Object.keys(moodScores)
        .map(mood => ({
          label: mood,
          score: moodScores[mood]
        }))
        .sort((a, b) => b.score - a.score);

      console.log(`✅ [EmotionService] HF classification successful: Top = ${mappedResult[0].label}`);
      return mappedResult;
    }

    console.warn("⚠️ [EmotionService] Unexpected HF response format. Falling back to local analyzer.");
    return localAnalyzeEmotion(text);
  } catch (error) {
    console.error(`❌ [EmotionService] Hugging Face API call failed: ${error.message || error}. Falling back to local analyzer.`);
    return localAnalyzeEmotion(text);
  }
};

/**
 * Returns the label of the emotion with the highest score
 */
const getTopEmotion = (emotions) => {
  if (!Array.isArray(emotions) || emotions.length === 0) {
    return "neutral";
  }
  
  let highest = emotions[0];
  for (let emotion of emotions) {
    if (emotion && emotion.score > highest.score) {
      highest = emotion;
    }
  }

  return highest.label || "neutral";
};

module.exports = {
  detectEmotion,
  getTopEmotion
};
