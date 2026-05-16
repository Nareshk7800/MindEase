console.log("BOOTING SERVER");

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  // Keep the server running so the frontend can load; we'll return a clear
  // error when /api/chat is called.
  console.log("⚠️ GROQ_API_KEY missing in server-new/.env");
}

// Pick a reasonably fast default. You can override with GROQ_MODEL.
// Note: older ids like `llama3-8b-8192` may be decommissioned.
const modelName = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function extractGroqReply(data) {
  // OpenAI-compatible format: { choices: [ { message: { content } } ] }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  return null;
}

app.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage || !String(userMessage).trim()) {
            return res.status(400).json({ reply: "Message is empty." });
        }

        console.log("User:", userMessage);

        if (!groqApiKey) {
          return res.status(500).json({
            reply:
              "Server misconfigured: missing GROQ_API_KEY in server-new/.env",
          });
        }

        const controller = new AbortController();
        const timeoutMs = Number(process.env.GROQ_TIMEOUT_MS || 25000);
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          // Groq is OpenAI-compatible:
          // POST https://api.groq.com/openai/v1/chat/completions
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
                max_tokens: Number(process.env.GROQ_MAX_TOKENS || 512),
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a mental health support assistant. Be empathetic, concise, and encourage professional help when appropriate. Do not provide medical advice.",
                  },
                  { role: "user", content: String(userMessage) },
                ],
              }),
            }
          );

          const data = await response.json().catch(() => ({}));
          const reply = extractGroqReply(data);

          if (!response.ok) {
            const rawMessage = data?.error?.message || response.statusText;
            console.error("Groq chat error:", rawMessage);

            const lowered = String(rawMessage).toLowerCase();
            const isQuota =
              lowered.includes("429") ||
              lowered.includes("quota") ||
              lowered.includes("rate limit");

            return res.status(response.status).json({
              reply: isQuota
                ? "Groq rate limit/quota exceeded. Please try again shortly."
                : "Groq failed to respond.",
            });
          }

          if (!reply) {
            return res.status(500).json({
              reply: "Groq returned an empty response.",
            });
          }

          return res.json({ reply });
        } finally {
          clearTimeout(timeoutId);
        }

    } catch (error) {
        const rawMessage = error?.message || String(error);
        console.error("Groq chat error:", rawMessage);

        const lowered = rawMessage.toLowerCase();
        const isAbort = lowered.includes("aborted") || lowered.includes("abort");
        const isQuota =
          lowered.includes("429") ||
          lowered.includes("quota") ||
          lowered.includes("rate limit");

        const reply = isAbort
          ? "Request to Groq timed out. Please try again."
          : isQuota
            ? "Groq rate limit/quota exceeded. Please try again shortly."
            : "Groq failed to respond.";

        res.status(500).json({ reply });
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
