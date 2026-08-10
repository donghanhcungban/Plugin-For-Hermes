import { NextRequest, NextResponse } from "next/server";
import { analyzeTranscriptWithGemini } from "@/lib/gemini-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, apiKey } = body;

    if (!transcript || typeof transcript !== "string" || transcript.trim() === "") {
      return NextResponse.json(
        { error: "Văn bản thoại (transcript) không được để trống." },
        { status: 400 }
      );
    }

    const analysis = await analyzeTranscriptWithGemini(transcript, apiKey);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error in /api/audio/process:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi trong quá trình phân tích văn bản thoại." },
      { status: 500 }
    );
  }
}
