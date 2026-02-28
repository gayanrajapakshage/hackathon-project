import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { judgeImage } from "@/lib/gemini";

const RequestSchema = z.object({
  image: z.string().min(1, "Image base64 is required"),
  mimeType: z.string().optional().default("image/jpeg"),
});

const ResponseSchema = z.object({
  score: z.number().int().min(1).max(10),
  verdict: z.string().max(300),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mimeType } = RequestSchema.parse(body);

    const raw = await judgeImage(image, mimeType);
    const validated = ResponseSchema.parse(raw);

    return NextResponse.json(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[/api/judge]", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
