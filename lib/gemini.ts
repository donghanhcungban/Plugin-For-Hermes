// Google Gemini AI Client Manager

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
}

const CYRA_SYSTEM_INSTRUCTION = `
Bạn là CYRA (Cybernetic Responsive Assistant) - một Trợ lý AI thế hệ 3D Sci-Fi thông minh, thân thiện và thanh lịch với vẻ ngoài Robot Nữ Cyber Android.
Nhiệm vụ của bạn là giải đáp câu hỏi của người dùng một cách rõ ràng, súc tích, truyền cảm hứng và mang phong cách tương lai công nghệ cao.
- Giữ câu trả lời ngắn gọn (từ 2 đến 4 câu) khi giao tiếp bằng giọng nói để trải nghiệm TTS tự nhiên nhất.
- Luôn sẵn sàng hỗ trợ bằng cả Tiếng Việt và Tiếng Anh.
- Xưng xưng là CYRA.
`;

export class GeminiManager {
  private apiKey: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('CYRA_GEMINI_API_KEY') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    }
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('CYRA_GEMINI_API_KEY', key);
    }
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public async generateResponse(prompt: string): Promise<string> {
    if (!this.apiKey) {
      // Fallback Demo Response when no API Key is provided
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return this.getFallbackDemoResponse(prompt);
    }

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: CYRA_SYSTEM_INSTRUCTION,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        return text.trim();
      }
      return 'CYRA đã nhận được thông tin, nhưng kết quả chưa sẵn sàng. Bạn hãy thử lại nhé!';
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      if (error?.status === 401 || error?.message?.includes('API key')) {
        return 'Khóa API Gemini không hợp lệ. Vui lòng kiểm tra lại thiết lập API Key trong bảng điều khiển CYRA.';
      }
      return `CYRA đang gặp sự cố kết nối: ${error.message || 'Lỗi không xác định'}. Vui lòng thử lại sau.`;
    }
  }

  private getFallbackDemoResponse(prompt: string): string {
    const p = prompt.toLowerCase();
    if (p.includes('chào') || p.includes('hello') || p.includes('hi')) {
      return 'Xin chào! Tôi là CYRA - Trợ lý AI Cybernetic 3D. Tôi có thể giúp gì cho bạn hôm nay?';
    }
    if (p.includes('bạn là ai') || p.includes('who are you') || p.includes('tên')) {
      return 'Tôi là CYRA, một trí tuệ nhân tạo được thiết kế theo phong cách 3D Cyber Android với khả năng lắng nghe và nói chuyện trực tiếp với bạn.';
    }
    if (p.includes('thời tiết') || p.includes('weather')) {
      return 'Hệ thống cảm biến CYRA ghi nhận thời tiết hôm nay rất tuyệt vời cho việc trải nghiệm công nghệ mới!';
    }
    if (p.includes('cảm ơn') || p.includes('thank')) {
      return 'Rất vui được hỗ trợ bạn! Hãy cứ gọi CYRA bất cứ khi nào bạn cần nhé.';
    }

    const defaultReplies = [
      `CYRA đã lắng nghe bạn: "${prompt}". Tôi đang chạy ở chế độ Demo 3D. Để kích hoạt toàn bộ trí tuệ Gemini AI, bạn hãy nhập API Key trong phần Cài đặt nhé!`,
      `Rất thú vị! Cảm ơn bạn đã trò chuyện cùng CYRA. Bạn có thể đặt thêm câu hỏi về công nghệ, lập trình hoặc khoa học tương lai.`,
      `Tôi hiểu rồi. CYRA luôn sẵn sàng phân tích và cùng bạn thảo luận về chủ đề này!`
    ];

    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
  }
}

export const geminiManager = new GeminiManager();
