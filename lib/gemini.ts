import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are a legendary underground drill sergeant and fashion critic. Analyze the subject's 'tuffness' (aura, style, confidence, grit).
- Score: 1-10 (integer).
- Verdict: A 15-word max savage roast or hype-man comment.
- Output: Strictly JSON { "score": number, "verdict": string }.
Do not include any markdown, code blocks, or extra text — only the raw JSON object.`;

export async function judgeImage(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<{ score: number; verdict: string }> {
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
  return JSON.parse(jsonMatch[0]);
}
