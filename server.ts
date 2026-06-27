import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// 1. Journal Entry Semantic Analyzer
app.post("/api/analyze-journal", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Journal text is required." });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server. Please add it in Settings > Secrets.",
      });
    }

    // System instructions for deep analysis and schema output
    const prompt = `Analyze this student journal log. Mask PII, extract feelings, sentiment, stress triggers (e.g., exams, tests, syllabus, sleep), and detect any high-risk severe distress or hopelessness.
    
    If the journal mentions study stress, mock test performance, syllabus coverage, or academic pressure, generate a specialized copingPlan withhasAcademicAnxiety=true and a structured list of bite-sized, manageable topics/tasks to tackle.
    
    Student Journal Entry:
    "${text}"`;

    const journalSchema = {
      type: Type.OBJECT,
      properties: {
        sentimentScore: {
          type: Type.NUMBER,
          description: "Sentiment score ranging from -1.0 (highly distressed/negative) to 1.0 (highly joyful/positive).",
        },
        emotionTags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Labels representing emotional states found (e.g., 'Test Anxiety', 'High Frustration', 'Imposter Syndrome', 'Burnout', 'Self-Doubt', 'Overwhelm', 'Calm').",
        },
        primaryTrigger: {
          type: Type.STRING,
          description: "Underlying correlation or trigger, e.g., 'mock test performance relative to syllabus completion', 'fear of JEE syllabus deadline', 'sleep deprivation'.",
        },
        stressIntensity: {
          type: Type.STRING,
          description: "Severity of stress/burnout: 'Low', 'Medium', or 'High'.",
        },
        isDistressCrisis: {
          type: Type.BOOLEAN,
          description: "Set to true ONLY if severe self-harm, suicidal ideation, or total severe hopelessness is explicitly or implicitly indicated.",
        },
        piiMaskedText: {
          type: Type.STRING,
          description: "The original text but with all personal names, emails, school names, or contact details masked securely with placeholder tags like [NAME], [EMAIL], [SCHOOL].",
        },
        copingPlan: {
          type: Type.OBJECT,
          properties: {
            hasAcademicAnxiety: {
              type: Type.BOOLEAN,
              description: "True if the student is feeling exam, test, or study workload stress.",
            },
            encouragingMessage: {
              type: Type.STRING,
              description: "An empathetic, highly encouraging feedback tailored to their specific struggle.",
            },
            biteSizedSyllabusTracker: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING, description: "Bite-sized study task, e.g., 'Review Mechanics formula sheet', 'Solve 3 previous year calculus questions', 'Re-attempt 5 wrong mock test questions'." },
                  difficulty: { type: Type.STRING, description: "Task level: 'Easy', 'Medium', 'Deep'." },
                  durationMinutes: { type: Type.INTEGER, description: "Estimated completion time (e.g., 20, 30, 45)." }
                },
                required: ["topic", "difficulty", "durationMinutes"]
              },
              description: "A customized study plan breaking remaining topics or revision targets into manageable chunks to eliminate cognitive overwhelm.",
            },
            mindfulnessExercise: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Recommended breathing or mindfulness exercise." },
                description: { type: Type.STRING, description: "Short step-by-step guidance for completing this exercise." }
              },
              required: ["title", "description"]
            }
          },
          required: ["hasAcademicAnxiety", "encouragingMessage", "mindfulnessExercise"]
        }
      },
      required: [
        "sentimentScore",
        "emotionTags",
        "primaryTrigger",
        "stressIntensity",
        "isDistressCrisis",
        "piiMaskedText",
        "copingPlan"
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: journalSchema,
        temperature: 0.2,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini.");
    }

    const parsedData = JSON.parse(resultText.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Error analyzing journal:", error);
    return res.status(500).json({
      error: "Failed to analyze journal entry. Please try again.",
      details: error.message || error,
    });
  }
});

// 2. Chat Companion with Multi-Model Capabilities
app.post("/api/companion-chat", async (req, res) => {
  try {
    const { messages, parsedContext, modelMode } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server.",
      });
    }

    // Format chat messages to match Gemini SDK API expected structure
    const contents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // Construct a context-aware system instruction for the student's companion
    let contextExplanation = "";
    if (parsedContext) {
      contextExplanation = `The user's current parsed mental state is:
      - Primary Trigger: "${parsedContext.primaryTrigger || 'None identified'}"
      - Stress Level: "${parsedContext.stressIntensity || 'Normal'}"
      - Emotion Tags: ${parsedContext.emotionTags ? parsedContext.emotionTags.join(", ") : "None"}.
      Please always incorporate this emotional state and offer tailored, compassionate assistance without explicitly quoting these variables unless requested.`;
    }

    const systemInstruction = `You are an exceptionally empathetic, comforting, and wise digital Mental Wellness Companion for students under academic pressure (such as JEE, NEET, or general high-school/college exams).
    
    CRITICAL Clinical boundaries:
    - You are a self-awareness and stress-relief assistant, not a doctor or clinical therapist.
    - If the student shows signs of crisis, hopelessness, or self-harm, immediately pause normal coping advice, respond with deepest compassion, and provide crisis resources (e.g., 'Vandrevala Foundation: +91 9999 666 555', 'AASRA: +91 9820466726', or international lines). Keep it visible and front-and-center.
    
    Your style should adapt to the student's needs:
    - Validate their feelings first. Never tell them to 'just study harder' or dismiss mock test failure.
    - If they feel syllabus overwhelm, encourage bite-sized micro-goals instead of massive backlogs.
    - Offer actionable, small mindfulness tips (breathwork, 5-4-3-2-1 technique).
    
    ${contextExplanation}`;

    let selectedModel = "gemini-3.5-flash"; // Default
    let config: any = {
      systemInstruction,
      temperature: 0.7,
    };

    if (modelMode === "low-latency") {
      // gemini-3.1-flash-lite as per instruction: "Add low-latency responses"
      selectedModel = "gemini-3.1-flash-lite";
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
    } else if (modelMode === "high-thinking") {
      // gemini-3.1-pro-preview as per instruction: "Enable high thinking"
      selectedModel = "gemini-3.1-pro-preview";
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    } else if (modelMode === "search-grounding") {
      // gemini-3.5-flash with search tool as per instruction: "Use Google Search data"
      selectedModel = "gemini-3.5-flash";
      config.tools = [{ googleSearch: {} }];
    }

    // Call Gemini API with fallback
    let response;
    try {
      response = await ai.models.generateContent({
        model: selectedModel,
        contents: contents,
        config: config,
      });
    } catch (apiErr: any) {
      console.warn(`Model ${selectedModel} failed. Falling back to gemini-3.5-flash. Error:`, apiErr.message);
      
      // Fallback configuration
      const fallbackConfig: any = {
        systemInstruction,
        temperature: 0.7,
      };
      if (modelMode === "search-grounding") {
        fallbackConfig.tools = [{ googleSearch: {} }];
      }
      
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: fallbackConfig,
      });
      
      // Add a small flag to the response indicating fallback occurred
      return res.json({
        text: response.text,
        fallbackActive: true,
        fallbackMessage: `Empathetic Response (fallback active due to ${selectedModel} limits)`,
        groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || null
      });
    }

    const textResponse = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || null;

    return res.json({
      text: textResponse,
      groundingSources: groundingChunks,
    });

  } catch (error: any) {
    console.error("Error in companion chat:", error);
    return res.status(500).json({
      error: "Could not generate a response. Please try again.",
      details: error.message || error,
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
