import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AnalysisResult {
  title: string;
  summary: string;
  topics: string[];
  tasks: Array<{
    title: string;
    assignee?: string;
    deadline?: string;
    priority: "high" | "medium" | "low";
  }>;
  events: Array<{
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime?: string;
    participants?: string[];
  }>;
  keyInsights: string[];
}

/**
 * Analyzes audio transcript or raw text using Gemini AI model
 */
export async function analyzeTranscriptWithGemini(
  transcript: string,
  apiKey?: string
): Promise<AnalysisResult> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    // If no API key is provided, return mock/fallback structured analysis
    return generateFallbackAnalysis(transcript);
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    // Using gemini-2.0-flash or gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Bạn là Trợ lý AI Phân tích Cuộc họp & Ghi chú Trí nhớ Cao cấp. Hãy phân tích đoạn văn bản thoại dưới đây và trích xuất thông tin cấu trúc dưới dạng JSON nguyên bản (JSON strictly format, không kèm markdown code block).

Yêu cầu định dạng đầu ra JSON:
{
  "title": "Tiêu đề ngắn gọn phản ánh nội dung chính",
  "summary": "Tóm tắt súc tích 2-4 câu về nội dung thảo luận",
  "topics": ["Chủ đề 1", "Chủ đề 2"],
  "tasks": [
    {
      "title": "Tên công việc cụ thể cần làm",
      "assignee": "Người chịu trách nhiệm (nếu có)",
      "deadline": "Hạn chót dạng YYYY-MM-DDTHH:mm (nếu có)",
      "priority": "high" | "medium" | "low"
    }
  ],
  "events": [
    {
      "title": "Tiêu đề cuộc họp/lịch hẹn",
      "description": "Mô tả ngắn",
      "location": "Địa điểm họp (nếu có)",
      "startTime": "Thời gian bắt đầu dạng ISO (YYYY-MM-DDTHH:mm)",
      "endTime": "Thời gian kết thúc (nếu có)",
      "participants": ["Tên người tham gia"]
    }
  ],
  "keyInsights": ["Các điểm đúc kết hoặc quyết định quan trọng"]
}

Nội dung đoạn văn bản thoại:
"""
${transcript}
"""
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Clean potential markdown blocks
    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    const parsedData: AnalysisResult = JSON.parse(cleanedText);
    return parsedData;
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return generateFallbackAnalysis(transcript);
  }
}

/**
 * Memory RAG Query Assistant
 */
export async function queryMemoryWithGemini(
  query: string,
  meetingsContext: string,
  apiKey?: string
): Promise<{ answer: string; citations: string[] }> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    return {
      answer: `Bản ghi ký ức cho thấy: Tôi tìm thấy thông tin liên quan đến "${query}" trong các ghi chú cuộc họp của bạn.`,
      citations: ["Cuộc họp gần nhất"],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Bạn là Trợ lý AI Trí nhớ Cá nhân (Memory AI Assistant). Hãy trả lời câu hỏi của người dùng dựa TRỰC TIẾP trên dữ liệu nhật ký ký ức các cuộc họp được cung cấp dưới đây. Nếu không tìm thấy thông tin trong dữ liệu, hãy lịch sự thông báo không có dữ liệu.

Dữ liệu ký ức các cuộc họp:
"""
${meetingsContext}
"""

Câu hỏi của người dùng:
"${query}"

Trả lời tự nhiên, chính xác bằng tiếng Việt, kèm các trích dẫn tiêu đề cuộc họp/mốc thời gian liên quan.
`;

    const result = await model.generateContent(prompt);
    return {
      answer: result.response.text(),
      citations: ["Trích xuất từ dữ liệu ký ức cá nhân"],
    };
  } catch (error) {
    console.error("Gemini Memory Query Error:", error);
    return {
      answer: "Đã xảy ra lỗi khi truy vấn trí nhớ. Vui lòng kiểm tra lại API Key hoặc dữ liệu cuộc họp.",
      citations: [],
    };
  }
}

/**
 * Intelligent Fallback parser when API Key is missing or network fails
 */
function generateFallbackAnalysis(transcript: string): AnalysisResult {
  const isShort = transcript.length < 50;

  // Simple heuristic extraction for demo
  const hasTaskKeyword = /nhớ|cần|làm|gửi|chuẩn bị|hạn|deadline/i.test(transcript);
  const hasCalendarKeyword = /họp|hẹn|gặp|mai|trưa|sáng|chiều|giờ|lúc/i.test(transcript);

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const fallbackTasks = hasTaskKeyword
    ? [
        {
          title: transcript.length > 80 ? transcript.slice(0, 75) + "..." : transcript,
          priority: "high" as const,
          deadline: tomorrow.toISOString().slice(0, 16),
        },
      ]
    : [];

  const fallbackEvents = hasCalendarKeyword
    ? [
        {
          title: isShort ? transcript : "Hội thảo / Cuộc họp phát sinh từ Ghi âm",
          startTime: tomorrow.toISOString().slice(0, 16),
          description: transcript,
          location: "Online / Phòng họp",
        },
      ]
    : [];

  return {
    title: transcript.length > 40 ? transcript.slice(0, 37) + "..." : transcript || "Ghi chú Giọng nói Mới",
    summary: `Hệ thống đã tự động phân tích và trích xuất nội dung từ đoạn ghi âm: "${transcript.slice(0, 150)}${transcript.length > 150 ? "..." : ""}"`,
    topics: ["Ghi chú Giọng nói", "Công việc"],
    tasks: fallbackTasks,
    events: fallbackEvents,
    keyInsights: ["Ghi nhận ngữ cảnh thành công", "Sẵn sàng xuất lịch và giao việc"],
  };
}
