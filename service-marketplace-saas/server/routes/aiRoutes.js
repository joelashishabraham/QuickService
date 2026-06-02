const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");

const Service = require("../models/Service");

/* ================= MULTER ================= */
const upload = multer({ storage: multer.memoryStorage() });

/* ================= HELPERS ================= */

const cleanJSON = (text) => {
  if (!text) return "";
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

const safeParse = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    console.log("❌ JSON PARSE ERROR:", raw);
    return fallback;
  }
};

/* ================= SMART DETECTION ================= */

const synonyms = {
  cleaning: ["clean", "maid", "house cleaning", "dust"],
  plumbing: ["pipe", "leak", "water", "tap"],
  electrical: ["current", "switch", "power", "wiring"],
  "ac repair": ["ac", "cooling", "air conditioner", "not cooling"]
};

const detectFromDB = (msg, categories) => {
  const text = msg.toLowerCase();

  let detected = [];

  categories.forEach(cat => {
    const catLower = cat.toLowerCase();

    if (text.includes(catLower)) {
      detected.push(catLower);
      return;
    }

    if (synonyms[catLower]) {
      const match = synonyms[catLower].some(word =>
        text.includes(word.toLowerCase())
      );

      if (match) detected.push(catLower);
    }
  });

  return [...new Set(detected)];
};

/* ================= INTENT ================= */

const detectIntent = (msg) => {
  const text = msg.toLowerCase();

  if (text.includes("urgent") || text.includes("emergency")) {
    return { urgency: "high", intent: "emergency" };
  }

  if (text.includes("not working") || text.includes("repair")) {
    return { urgency: "medium", intent: "problem" };
  }

  return { urgency: "low", intent: "general" };
};

/* ================= AI ================= */

const generateAI = async ({ systemPrompt, message, history = [] }) => {
  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map(h => ({ role: h.role, content: h.content })),
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data.choices[0].message.content;

  } catch (err) {
    console.log("❌ OPENROUTER ERROR:", err.response?.data || err.message);
    return null;
  }
};

/* ================= CHAT ================= */

router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.json({
        success: true,
        reply: "Please type something 😊",
        services: [],
        bookingPrompt: false,
        urgency: "low",
        intent: "general",
        confidence: 0
      });
    }

    /* ================= LOAD SERVICES ================= */

    const servicesData = await Service.find()
      .select("name category price rating")
      .limit(50);

    const categories = [
      ...new Set(
        servicesData.map(s => s.category?.toLowerCase()).filter(Boolean)
      )
    ];

    /* ================= AI PROMPT ================= */

    const systemPrompt = `
You are an AI assistant.

AVAILABLE SERVICES:
${categories.join(", ")}

Return ONLY JSON:

{
  "reply": "short helpful answer",
  "services": ["category"],
  "bookingPrompt": true,
  "urgency": "low",
  "intent": "problem",
  "confidence": 0.9
}
`;

    /* ================= AI CALL ================= */

    const aiText = await generateAI({
      systemPrompt,
      message,
      history
    });

    let parsed;

    if (aiText) {
      let raw = cleanJSON(aiText);

      parsed = safeParse(raw, {
        reply: "",
        services: [],
        bookingPrompt: false,
        urgency: "low",
        intent: "general",
        confidence: 0.5
      });
    } else {
      parsed = {
        reply: "",
        services: [],
        bookingPrompt: false,
        urgency: "low",
        intent: "fallback",
        confidence: 0.3
      };
    }

    /* ================= DETECTION ================= */

    const detected = detectFromDB(message, categories);

    if (detected.length > 0) {
      parsed.services = detected;
    }

    /* ================= RESPONSE FIX ================= */

    if (parsed.services.length > 0) {
      parsed.reply = `Great! I found ${parsed.services.join(", ")} services for you 😊`;
      parsed.bookingPrompt = true;
    }

    /* ================= INTENT ================= */

    const intentData = detectIntent(message);
    parsed.urgency = parsed.urgency || intentData.urgency;
    parsed.intent = parsed.intent || intentData.intent;

    /* ================= TOP SERVICES ================= */

    let matchedServices = [];

    if (parsed.services.length > 0) {
      matchedServices = servicesData
        .filter(s =>
          parsed.services.includes(s.category?.toLowerCase())
        )
        .slice(0, 3);
    }

    if (matchedServices.length > 0) {
      parsed.bookingPrompt = true;
    }

    /* ================= RESPONSE ================= */

    res.json({
      success: true,
      reply: parsed.reply || "I found services for you 😊",
      services: parsed.services,
      bookingPrompt: parsed.bookingPrompt,
      urgency: parsed.urgency,
      intent: parsed.intent,
      confidence: parsed.confidence || 0.6,
      topServices: matchedServices
    });

  } catch (err) {
    console.log("❌ AI ERROR:", err);

    res.json({
      success: true,
      reply: "I can help you with that 😊",
      services: [],
      bookingPrompt: false,
      urgency: "low",
      intent: "fallback",
      confidence: 0.3
    });
  }
});

/* ================= IMAGE ================= */

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        success: false,
        message: "No image uploaded"
      });
    }

    res.json({
      success: true,
      problem: "Image analysis coming soon",
      services: [],
      advice: "Describe the issue for better help",
      urgency: "low"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Image AI failed"
    });
  }
});

module.exports = router;