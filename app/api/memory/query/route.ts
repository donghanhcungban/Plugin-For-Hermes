import { NextRequest, NextResponse } from "next/server";
import { queryMemoryWithGemini } from "@/lib/gemini-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, meetingsContext, apiKey } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Câu hỏi tra cứu không được để trống." },
        { status: 400 }
      );
    }

    const result = await queryMemoryWithGemini(
      query,
      meetingsContext || "Chưa có dữ liệu cuộc họp nào.",
      apiKey
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/memory/query:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tra cứu dữ liệu trí nhớ." },
      { status: 500 }
    );
  }
}
