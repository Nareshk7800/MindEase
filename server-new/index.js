console.log("BOOTING SERVER");

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { detectEmotion, getTopEmotion } = require("./services/emotionService");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const geminiApiKey = process.env.GEMINI_API_KEY;

// Load activity bank structured data
const activityBank = require("./services/activityBank.json");

const app = express();
app.use(cors());
app.use(express.json());

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.log("⚠️ GROQ_API_KEY missing in server-new/.env");
}

const modelName = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function extractGroqReply(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  return null;
}

// Prepopulated real-time community chat rooms messages
const communityMessagesStore = {
  "Workplace Stress": [
    { id: "c1", role: "bot", text: "Meera: Hey everyone, feeling so overwhelmed by the end-of-quarter deadlines today...", timestamp: "10:15 AM" },
    { id: "c2", role: "bot", text: "Karthik: Take a slow breath Meera, you've got this. Have you tried the 4-7-8 breathing here?", timestamp: "10:17 AM" },
    { id: "c3", role: "bot", text: "Sneha: Yes, the breathing exercises really help during deadlines! Let's do it together.", timestamp: "10:18 AM" }
  ],
  "Zen Breathing Practice": [
    { id: "c4", role: "bot", text: "Rohit: Just completed my morning 5-minute breathing session. Feeling extremely clear-headed.", timestamp: "08:30 AM" },
    { id: "c5", role: "bot", text: "Meera: Same here Rohit! It keeps me centered for the day ahead.", timestamp: "08:35 AM" }
  ],
  "Grief Support Sanctuary": [
    { id: "c6", role: "bot", text: "Aravind: Some days are harder than others. Just taking it one breath at a time.", timestamp: "11:22 AM" },
    { id: "c7", role: "bot", text: "Pooja: We are all here with you, Aravind. It's okay to not be okay.", timestamp: "11:25 AM" }
  ],
  "Gratitude Journal Swap": [
    { id: "c8", role: "bot", text: "Deepa: So grateful for the warm cup of coffee and the quiet morning sunshine today.", timestamp: "09:02 AM" },
    { id: "c9", role: "bot", text: "Sanjay: That sounds lovely, Deepa! I'm grateful for my supportive team at work.", timestamp: "09:05 AM" }
  ]
};

// Local fallback helper in case LLM APIs are offline
const localFallbackResponses = {
  sad: {
    reply: "I hear how much pain you're in, and I want you to know it's completely okay to feel this way. Let's do a short activity to bring some gentle focus to your heart.",
    activity_id: "sad_journal"
  },
  angry: {
    reply: "It is completely valid to feel frustrated right now. Let's channel that heavy energy into a calming exercise to reset.",
    activity_id: "angry_breath"
  },
  stressed: {
    reply: "Take a slow, deep breath. It sounds like there is a lot on your plate. Let's break this down together with a quick grounding technique.",
    activity_id: "stressed_grounding"
  },
  happy: {
    reply: "I'm so incredibly happy to hear this! Your joy is a beautiful thing. Let's save this wonderful moment for later.",
    activity_id: "happy_reinforce"
  },
  tired: {
    reply: "It sounds like your body is asking for a pause. Let's take a quick hydration check and rest.",
    activity_id: "tired_hydrate"
  },
  neutral: {
    reply: "Thank you for checking in. I'm here to listen and support you. If you feel like doing a quiet pause, we can try this.",
    activity_id: "neutral_reflect"
  }
};

// Tamil specific local fallbacks
const localTamilFallbackResponses = {
  sad: {
    reply: "நீங்கள் மிகவும் வேதனையடைகிறீர்கள் என்று எனக்குப் புரிகிறது. உங்கள் மனதை அமைதிப்படுத்த ஒரு எளிய பயிற்சியை மேற்கொள்ளலாமா?",
    activity_id: "sad_journal"
  },
  angry: {
    reply: "இப்போது உங்கள் கோபம் முற்றிலும் நியாயமானது. அந்த கனமான உணர்வை ஒரு எளிய சுவாசப் பயிற்சி மூலம் அமைதிப்படுத்துவோம்.",
    activity_id: "angry_breath"
  },
  stressed: {
    reply: "மெதுவாக, ஆழமாக மூச்சை இழுக்கவும். உங்கள் மனம் அமைதியடைய இந்த எளிய 5-4-3-2-1 பயிற்சியைச் செய்து பார்ப்போம்.",
    activity_id: "stressed_grounding"
  },
  happy: {
    reply: "இதைக் கேட்பதில் எனக்கு மிக்க மகிழ்ச்சி! உங்கள் மகிழ்ச்சி மிகவும் அழகானது. இந்த அழகான தருணத்தை உங்கள் மனதில் சேமித்துக்கொள்ளுங்கள்.",
    activity_id: "happy_reinforce"
  },
  tired: {
    reply: "உங்கள் உடலுக்கு ஓய்வு தேவைப்படுகிறது என்று நினைக்கிறேன். கொஞ்சம் தண்ணீர் குடித்துவிட்டு சிறிது நேரம் ஓய்வெடுங்கள்.",
    activity_id: "tired_hydrate"
  },
  neutral: {
    reply: "என்னைத் தொடர்புகொண்டதற்கு நன்றி. நான் உங்களுக்கு உதவ எப்போதும் தயாராக இருக்கிறேன். ஏதேனும் பகிர விரும்புகிறீர்களா?",
    activity_id: "neutral_reflect"
  }
};

async function callGeminiAPI(userMessage, systemPrompt) {
  if (!geminiApiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: geminiModel });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: Number(process.env.GEMINI_MAX_TOKENS || 512),
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });
    
    const response = await result.response;
    return response.text()?.trim() || null;
  } catch (error) {
    console.error("Gemini API error:", error.message || error);
    return null;
  }
}

// Check for sustained severe distress signals to trigger safety net
function isSafetyEscalationTriggered(userMessage, history) {
  const severeKeywords = [
    "suicide", "self-harm", "kill myself", "end my life", "want to die", 
    "harm myself", "cutting", "overdose", "slit my wrist", "hanging myself",
    "wanna die", "end it all"
  ];
  
  const text = String(userMessage || "").toLowerCase();
  if (severeKeywords.some(kw => text.includes(kw))) {
    console.warn("🚨 [SafetyNet] High-intensity distress keyword detected immediately!");
    return true;
  }

  if (Array.isArray(history) && history.length >= 4) {
    const userHistory = history.filter(h => h.role === "user");
    if (userHistory.length >= 2) {
      const recentMessages = [userMessage, ...userHistory.slice(-2).map(h => h.text)].map(t => String(t || "").toLowerCase());
      
      const negativeIndicators = [
        "sad", "depressed", "anxious", "stress", "angry", "kill", "die", "hurt",
        "hate", "scared", "fear", "panic", "overwhelm", "exhausted", "miserable"
      ];

      const allAreDistressed = recentMessages.every(msgText => 
        negativeIndicators.some(ind => msgText.includes(ind))
      );

      if (allAreDistressed) {
        console.warn("🚨 [SafetyNet] Sustained negative sentiment pattern detected over history!");
        return true;
      }
    }
  }

  return false;
}

// REST Community endpoints to support real user multi-session chat
app.get("/api/community/messages", (req, res) => {
  const { room } = req.query;
  if (!room) return res.status(400).json({ error: "Room parameter is required" });
  const msgs = communityMessagesStore[room] || [];
  return res.json(msgs);
});

app.post("/api/community/messages", (req, res) => {
  const { room, text, username, timestamp } = req.body;
  if (!room || !text || !username) {
    return res.status(400).json({ error: "Missing community post parameters." });
  }

  // Safety filter for offensive keywords to generate automated reports
  const badWords = ["fuck", "shit", "asshole", "bitch", "bastard", "cyberbully", "abuse", "harass", "kill you"];
  const textLower = String(text).toLowerCase();
  const containsBadThing = badWords.some(w => textLower.includes(w));

  if (containsBadThing) {
    const reportPath = path.join(__dirname, "reports.json");
    let reports = [];
    if (fs.existsSync(reportPath)) {
      try { reports = JSON.parse(fs.readFileSync(reportPath, "utf-8")); } catch(e) {}
    }
    reports.push({
      timestamp: new Date().toISOString(),
      username,
      room,
      text,
      violation: "Hate speech / Abuse in community channel"
    });
    fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
    console.warn(`🚨 [SafetyReport] User ${username} flagged in room ${room}: "${text}"`);
  }

  if (!communityMessagesStore[room]) {
    communityMessagesStore[room] = [];
  }

  const newMsg = {
    id: `comm-${Date.now()}`,
    role: "bot",
    text: `${username}: ${text}`,
    timestamp: timestamp || new Date().toLocaleTimeString(),
    flagged: containsBadThing
  };

  communityMessagesStore[room].push(newMsg);
  return res.json({ ok: true, message: newMsg });
});

// Primary Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message: userMessage, history, lang } = req.body;

    if (!userMessage || !String(userMessage).trim()) {
      return res.status(400).json({ reply: "Message is empty." });
    }

    // Safety filter check in private chat
    const badWords = ["fuck", "shit", "asshole", "bitch", "bastard", "abuse", "harass", "kill you", "hate you"];
    const containsBadThing = badWords.some(w => String(userMessage).toLowerCase().includes(w));
    if (containsBadThing) {
      const reportPath = path.join(__dirname, "reports.json");
      let reports = [];
      if (fs.existsSync(reportPath)) {
        try { reports = JSON.parse(fs.readFileSync(reportPath, "utf-8")); } catch(e) {}
      }
      reports.push({
        timestamp: new Date().toISOString(),
        username: "Private Chat User",
        text: userMessage,
        violation: "Inappropriate language in private AI session"
      });
      fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
      console.warn(`🚨 [SafetyReport] User reported in private session: "${userMessage}"`);
    }

    // 1. Safety net check
    if (isSafetyEscalationTriggered(userMessage, history)) {
      let safetyReply = "I hear how much pain you are in right now, and I want to make sure you are safe. While I am here to companion you, I am an AI and cannot replace professional clinical support. If you are in crisis, please connect with someone who can help you: Call or text 988 (USA/Canada), 111 (UK), or 9152987821 (AASRA India) for free, immediate, and confidential support. You do not have to carry this alone.";
      
      if (lang === 'ta') {
        safetyReply = "உங்களுக்கு இருக்கும் வலியை என்னால் உணர முடிகிறது. உங்கள் பாதுகாப்பை உறுதி செய்வது அவசியம். நான் உங்களுக்கு உதவத் தயாராக இருந்தாலும், நான் ஒரு செயற்கை நுண்ணறிவு (AI) மட்டுமே. நீங்கள் ஆபத்தான கட்டத்தில் இருந்தால், உடனடியாக உதவி பெறவும்: இந்தியாவில் உள்ள AASRA உதவி எண்ணான 9152987821 ஐ அழைக்கவும்.";
      }

      return res.json({
        reply: safetyReply,
        emotion: [{ label: "sad", score: 0.95 }],
        topEmotion: "sad",
        selected_activity: {
          id: "safety_escalation",
          mood_tag: "sad",
          activity_text: "Access support hotlines immediately.",
          duration_minutes: 0,
          energy_level_required: 1,
          category: "social"
        },
        safetyTriggered: true,
        flagged: containsBadThing,
        provider: "safety-net"
      });
    }

    // 2. Emotion classification stage
    const emotions = await detectEmotion(userMessage);
    const topEmotion = getTopEmotion(emotions);
    console.log(`[ChatRoute] Detected Emotion: ${topEmotion}`);

    // 3. Lookup activity bank candidates matching the mood
    const candidates = activityBank.filter(act => act.mood_tag === topEmotion);
    const candidateList = candidates.length > 0 ? candidates : activityBank.filter(act => act.mood_tag === "neutral");
    
    const shuffled = [...candidateList].sort(() => 0.5 - Math.random());
    const selectedCandidates = shuffled.slice(0, 2);
    
    const candidateActivitiesStr = selectedCandidates.map(act => 
      `- [ID: ${act.id}] ${act.activity_text} (${act.duration_minutes} min, Category: ${act.category})`
    ).join("\n");

    // Format conversation history to simulate LangChain window memory
    let conversationHistoryStr = "";
    if (Array.isArray(history) && history.length > 0) {
      conversationHistoryStr = history
        .slice(-8)
        .map(h => `${h.role === 'user' ? 'Human' : 'AI'}: ${h.text}`)
        .join("\n");
    }

    // 4. Build personalization prompt template with memory context
    let systemPrompt = `You are MindEase, an emotionally supportive, warm, and comforting AI companion.
          
The user's current detected emotion is: "${topEmotion.toUpperCase()}".
Emotions Breakdown: ${JSON.stringify(emotions)}

You MUST choose EXACTLY ONE activity from these candidates that best fits the user's situation:
${candidateActivitiesStr}

Guidelines:
- Phrase the suggestion naturally in 1-2 warm, empathetic sentences. Do NOT sound clinical or robotic.
- You must return your output in JSON format with EXACTLY these two keys:
{
  "reply": "Your warm conversational response suggesting the selected activity.",
  "selected_activity_id": "the exact ID of the activity you chose"
}
- Do not output anything else besides this raw JSON structure.`;

    if (conversationHistoryStr) {
      systemPrompt += `\n\nLangChain Memory Context (Remember what the user said previously and maintain conversation flow context):
${conversationHistoryStr}`;
    }

    if (lang === 'ta') {
      systemPrompt += `\n\nCRITICAL TAMIL REQUIREMENT:
- You must write your response entirely in the Tamil language (தமிழ் script).
- Translate your warm thoughts and empathetic response into natural, fluent, and comforting Tamil text inside the "reply" key. Do not output English sentences.
- Ensure the JSON format keys "reply" and "selected_activity_id" remain exactly in English, but the content inside the "reply" value is in Tamil.`;
    }

    let replyText = null;
    let selectedActivityId = null;
    let usedProvider = "none";

    // Try Groq First
    if (groqApiKey) {
      const controller = new AbortController();
      const timeoutMs = Number(process.env.GROQ_TIMEOUT_MS || 25000);
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        console.log("Attempting Groq chat API request in JSON mode...");
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqApiKey}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: modelName,
              temperature: 0.7,
              response_format: { type: "json_object" },
              max_tokens: Number(process.env.GROQ_MAX_TOKENS || 512),
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: String(userMessage) },
              ],
            }),
          }
        );

        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          const rawReply = extractGroqReply(data);
          if (rawReply) {
            try {
              const parsed = JSON.parse(rawReply);
              replyText = parsed.reply;
              selectedActivityId = parsed.selected_activity_id;
              usedProvider = "groq";
            } catch (jsonErr) {
              console.warn("Groq returned text that wasn't parseable JSON, trying to parse manually:", rawReply);
              replyText = rawReply;
            }
          }
        } else {
          console.error("Groq chat API responded with error:", data?.error?.message || response.statusText);
        }
      } catch (error) {
        console.error("Groq call failed/timed out:", error.message || error);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // Try Gemini Second
    if (!replyText && geminiApiKey) {
      console.log("Groq failed or key missing. Attempting Gemini API request...");
      const rawGemini = await callGeminiAPI(userMessage, systemPrompt);
      if (rawGemini) {
        try {
          const parsed = JSON.parse(rawGemini);
          replyText = parsed.reply;
          selectedActivityId = parsed.selected_activity_id;
          usedProvider = "gemini";
        } catch (jsonErr) {
          console.warn("Gemini JSON parsing failed. Using raw reply.");
          replyText = rawGemini;
        }
      }
    }

    // Local Fallback Third
    if (!replyText) {
      console.warn("Both LLM providers failed or are unconfigured. Falling back to local companion generator.");
      const fallbacks = lang === 'ta' ? localTamilFallbackResponses : localFallbackResponses;
      const fallback = fallbacks[topEmotion] || fallbacks.neutral;
      replyText = fallback.reply;
      selectedActivityId = fallback.activity_id;
      usedProvider = "local-fallback";
    }

    // Lookup full activity object
    let selectedActivity = activityBank.find(act => act.id === selectedActivityId);
    if (!selectedActivity) {
      selectedActivity = selectedCandidates[0] || activityBank[0];
    }

    console.log(`[ChatRoute] Responded successfully using provider: ${usedProvider}, Activity ID: ${selectedActivity.id}`);

    return res.json({ 
      reply: replyText,
      emotion: emotions,
      topEmotion,
      selected_activity: selectedActivity,
      safetyTriggered: false,
      flagged: containsBadThing,
      provider: usedProvider
    });

  } catch (error) {
    console.error("Chat route unexpected error:", error);
    res.status(500).json({ reply: "An unexpected error occurred." });
  }
});

// --- Feedback Loop Endpoint ---
app.post("/api/chat/feedback", (req, res) => {
  try {
    const { mood, activity_id, feedback } = req.body;
    if (!mood || !activity_id || feedback === undefined) {
      return res.status(400).json({ ok: false, error: "Missing required feedback fields." });
    }

    const feedbackPath = path.join(__dirname, "feedback.json");
    let logs = [];
    if (fs.existsSync(feedbackPath)) {
      try {
        logs = JSON.parse(fs.readFileSync(feedbackPath, "utf-8"));
      } catch (e) {
        console.error("Failed to parse existing feedback.json", e);
      }
    }

    logs.push({
      timestamp: new Date().toISOString(),
      mood,
      activity_id,
      feedback: feedback ? "thumbs_up" : "thumbs_down"
    });

    fs.writeFileSync(feedbackPath, JSON.stringify(logs, null, 2));
    console.log(`[Feedback] Logged ratings for activity ${activity_id} (mood: ${mood}): ${feedback ? 'Up' : 'Down'}`);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Error logging feedback:", err);
    return res.status(500).json({ ok: false, error: "Failed to write feedback." });
  }
});

// --- Phone OTP (demo: SMS not wired; OTP is logged server-side) ---
const otpStore = new Map();

function normalizePhoneDigits(input) {
  const digits = String(input ?? "").replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

app.post("/api/phone/send-otp", (req, res) => {
  const phone = normalizePhoneDigits(req.body?.phone);
  if (!phone) {
    return res.status(400).json({
      ok: false,
      error: "Enter a valid phone number (at least 10 digits).",
    });
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = Date.now() + 10 * 60 * 1000;
  otpStore.set(phone, { code, expires });
  console.log(`[OTP] ${phone} → ${code} (expires in 10 min)`);
  const payload = { ok: true, message: "OTP sent. Check the server console in development." };
  if (process.env.OTP_DEV_MODE === "1") {
    payload.devOtp = code;
  }
  return res.json(payload);
});

app.post("/api/phone/verify-otp", (req, res) => {
  const phone = normalizePhoneDigits(req.body?.phone);
  const otp = String(req.body?.otp ?? "").replace(/\D/g, "");
  if (!phone || otp.length !== 6) {
    return res.status(400).json({
      ok: false,
      error: "Invalid phone or OTP format.",
    });
  }
  const rec = otpStore.get(phone);
  if (!rec || rec.expires < Date.now()) {
    return res.status(400).json({
      ok: false,
      error: "Code expired or not found. Request a new code.",
    });
  }
  if (rec.code !== otp) {
    return res.status(400).json({ ok: false, error: "Invalid code." });
  }
  otpStore.delete(phone);
  return res.json({ ok: true });
});

app.listen(5000, () => {
  console.log("SERVER LISTENING ON 5000");
});
