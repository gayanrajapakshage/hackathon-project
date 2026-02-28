import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `# ROLE
You are an expert in Gen Z internet culture, specifically the "Tuff" and "Aura" meme aesthetics. Your job is to analyze images or GIFs and rate their "Tuffness" on a scale of 1-10.

# CHARACTERISTICS TO ANALYZE
1. **Aura & Presence:** Does the subject exude an unearned, over-the-top confidence? 
2. **Contrast/Absurdity:** Is there a high contrast between the subject (e.g., a baby, a hamster, a cartoon) and the setting (e.g., a gritty street, a high-fashion photoshoot)?
3. **The "Fit":** Look for streetwear elements—oversized puffer jackets, designer sneakers (Jordans/Rick Owens), heavy jewelry, or balaclavas.
4. **Cinematic Quality:** Analyze the lighting (low-key, dramatic, or neon), camera angle (low-angle "hero" shots), and overall resolution (is it hyper-realistic AI-style?).
5. **Action/Pose:** Is the subject doing a "hard" walk, a stoic stare-down, or an "ice in my veins" gesture?

# OUTPUT FORMAT
Return a JSON object with the following structure:
{
  "tuffness_score": [Number 1-10],
  "aura_level": ["Negative", "Neutral", "Infinite"],
  "breakdown": {
    "fit_check": "Brief description of attire",
    "cinematography": "Description of lighting/angle",
    "absurdity_factor": "Why it is or isn't funny/hard"
  },
  "verdict": "A 1-sentence summary (e.g., 'This goes unfathomably hard.')"
}
`;

export interface TuffResult {
  score: number;
  aura_level: "Negative" | "Neutral" | "Infinite";
  breakdown: {
    fit_check: string;
    cinematography: string;
    absurdity_factor: string;
  };
  verdict: string;
}

export async function judgeImage(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<TuffResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    },
    "Analyze this image and return the tuffness JSON.",
  ]);

  const text = result.response.text().trim();
  // Strip markdown code fences if model wraps in them
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in Gemini response: ${text}`);
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    score: parsed.tuffness_score,
    aura_level: parsed.aura_level,
    breakdown: parsed.breakdown,
    verdict: parsed.verdict,
  };
}
