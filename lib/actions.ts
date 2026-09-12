"use server";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import { GoogleGenAI, Type } from "@google/genai";
import { matchFaults, FaultEntry } from "@/lib/knowledgeBase";
import { calculateSizing, getPanelOrientation } from "@/lib/solarMath";
import { Appliance, SizingResult, OrientationResult } from "@/lib/types";

type DiagnosisResult = {
  title: string;
  causeTag: string;
  confidence: "High match" | "Medium match" | "Low match";
  summary: string;
  positiveNote: string;
  steps: { title: string; detail: string }[];
  explanation: string;
};

type DesignAdvisor = {
  recommendation: string;
  risks: string[];
};

const MODEL = "gemini-3.6-flash";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Safely parse a model response that may be truncated (hit maxOutputTokens),
 * wrapped in markdown fences, or otherwise malformed. Returns null instead
 * of throwing, so callers can fall back cleanly.
 */
function safeParseJson(text: string): unknown | null {
  const cleaned = text.trim().replace(/^```json\s*|```$/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse failed. Raw text was:", cleaned);
    return null;
  }
}

const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Short title describing the diagnosed issue." },
    causeTag: { type: Type.STRING, description: "Short identifier describing the likely cause." },
    confidence: {
      type: Type.STRING,
      enum: ["High match", "Medium match", "Low match"],
      description: "How closely the user's description matches the supplied knowledge base.",
    },
    summary: { type: Type.STRING, description: "Short plain-language explanation of the issue." },
    positiveNote: {
      type: Type.STRING,
      description: "A helpful reassuring note that does not introduce facts outside the knowledge base.",
    },
    steps: {
      type: Type.ARRAY,
      description: "Troubleshooting steps based only on the supplied knowledge base.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short title for the troubleshooting step." },
          detail: { type: Type.STRING, description: "Detailed explanation of what the user should do." },
        },
        required: ["title", "detail"],
      },
    },
    explanation: {
      type: Type.STRING,
      description: "Explanation of why the supplied knowledge-base entry matches the user's description.",
    },
  },
  required: ["title", "causeTag", "confidence", "summary", "positiveNote", "steps", "explanation"],
};

const designAdvisorSchema = {
  type: Type.OBJECT,
  properties: {
    recommendation: {
      type: Type.STRING,
      description: "Plain-language recommendation based strictly on the calculated results.",
    },
    risks: {
      type: Type.ARRAY,
      description: "Potential design risks visible from the calculated results.",
      items: { type: Type.STRING },
    },
  },
  required: ["recommendation", "risks"],
};

function isValidDiagnosis(obj: unknown): obj is DiagnosisResult {
  if (!obj || typeof obj !== "object") return false;
  const value = obj as Record<string, unknown>;

  if (
    typeof value.title !== "string" ||
    typeof value.causeTag !== "string" ||
    typeof value.summary !== "string" ||
    typeof value.positiveNote !== "string" ||
    typeof value.explanation !== "string"
  ) {
    return false;
  }

  if (
    value.confidence !== "High match" &&
    value.confidence !== "Medium match" &&
    value.confidence !== "Low match"
  ) {
    return false;
  }

  if (!Array.isArray(value.steps) || value.steps.length === 0) return false;

  return value.steps.every((step) => {
    if (!step || typeof step !== "object") return false;
    const item = step as Record<string, unknown>;
    return typeof item.title === "string" && typeof item.detail === "string";
  });
}

function isValidAdvisor(obj: unknown): obj is DesignAdvisor {
  if (!obj || typeof obj !== "object") return false;
  const value = obj as Record<string, unknown>;
  return (
    typeof value.recommendation === "string" &&
    Array.isArray(value.risks) &&
    value.risks.every((risk) => typeof risk === "string")
  );
}

export async function diagnoseIssue(description: string): Promise<DiagnosisResult> {
  if (!description?.trim()) {
    throw new Error("Description is required.");
  }

  const matches: FaultEntry[] = matchFaults(description).slice(0, 3);

  if (matches.length === 0) {
    return {
      title: "No close match found",
      causeTag: "UNKNOWN",
      confidence: "Low match",
      summary: "This description doesn't closely match a known fault pattern in our knowledge base.",
      positiveNote:
        "Most inverter and solar issues fall into a handful of common categories — a bit more detail can help narrow it down.",
      steps: [
        {
          title: "Add more detail",
          detail: "Mention what appliances were running, any error codes or beep patterns, and when the issue occurs.",
        },
      ],
      explanation:
        "The diagnostic tool matches your description against a fixed set of known fault entries and did not find a sufficiently close one.",
    };
  }

  const prompt = `
You are an expert assistant for residential solar and inverter troubleshooting.

Use ONLY the knowledge-base entries provided below.

IMPORTANT RULES:

1. Do not invent facts.
2. Do not invent fault causes.
3. Do not invent troubleshooting procedures.
4. Do not introduce components, measurements, error codes, or symptoms that are not supported by the knowledge base.
5. Select the knowledge-base entry that best matches the user's description.
6. If the match is uncertain, use "Medium match" or "Low match".
7. Explain the result in clear language suitable for a non-technical homeowner.
8. All troubleshooting steps must be supported by the supplied knowledge base.
9. Keep the summary, positiveNote, and explanation each to 2-3 sentences, and keep each step's detail to 1-2 sentences. Be concise — you have a limited output budget.

KNOWLEDGE BASE ENTRIES:

${JSON.stringify(matches, null, 2)}

USER'S PROBLEM DESCRIPTION:

${description}

Generate the diagnosis using only the supplied knowledge base.
`;

  try {
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 3000,
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema,
      },
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Gemini returned an empty diagnosis response.");
    }

    const parsed = safeParseJson(text);

    if (!isValidDiagnosis(parsed)) {
      console.error("Gemini returned an invalid or truncated diagnosis:", parsed ?? text);
      return matches[0] as DiagnosisResult;
    }

    return parsed;
  } catch (error) {
    console.error("Gemini troubleshoot error:", error);
    return matches[0] as DiagnosisResult;
  }
}

export async function designSystem(
  appliances: Appliance[],
  backupHours: number,
  lat?: number,
  lon?: number
): Promise<{
  sizing: SizingResult;
  orientation: OrientationResult | null;
  ai: DesignAdvisor | null;
}> {
  if (!appliances || appliances.length === 0) {
    throw new Error("At least one appliance is required.");
  }

  const sizing = calculateSizing(appliances, backupHours);
  const orientation = lat != null && lon != null ? getPanelOrientation(lat, lon) : null;

  const prompt = `
You are a solar system design advisor.

The solar system calculations have already been performed by a deterministic calculation engine.

Your job is ONLY to explain the supplied results.

IMPORTANT RULES:

1. Do not change any calculated numbers.
2. Do not recalculate the system.
3. Do not invent specifications.
4. Do not invent additional appliances or loads.
5. Do not replace the calculated system sizes.
6. Explain the results in simple language.
7. Identify meaningful risks visible in the calculated results.
8. Mention potential undersizing or thin safety margins if the supplied results indicate them.
9. Base everything strictly on the supplied calculated results.
10. Keep the recommendation to 2-3 sentences and each risk to one sentence. Be concise.

CALCULATED SIZING:

${JSON.stringify(sizing, null, 2)}

CALCULATED PANEL ORIENTATION:

${JSON.stringify(orientation, null, 2)}

Generate a concise recommendation and list any relevant design risks.
`;

  try {
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
        responseSchema: designAdvisorSchema,
      },
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Gemini returned an empty design-advisor response.");
    }

    const parsed = safeParseJson(text);

    if (!isValidAdvisor(parsed)) {
      console.error("Gemini returned an invalid or truncated design advisor response:", parsed ?? text);
      return { sizing, orientation, ai: null };
    }

    return { sizing, orientation, ai: parsed };
  } catch (error) {
    console.error("Gemini design error:", error);
    return { sizing, orientation, ai: null };
  }
}
