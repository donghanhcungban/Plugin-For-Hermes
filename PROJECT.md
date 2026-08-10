# PROJECT.md — Ambient AI Assistant (Smart Meeting & Thought Companion)

> Đặc tả dự án Ambient AI Assistant — Trợ lý AI Cuộc họp & Ghi chú Trí nhớ Thông minh.
> Nguồn sự thật về *cái gì cần xây*.

## 0. Loại dự án & Hồ sơ
- Loại dự án: Web App (Mobile-First Progressive Web App)
- Hồ sơ áp dụng: C1 (Web App / Next.js Fullstack)
- Cổng chất lượng: TypeScript strict, ESLint 0 warning, Next build xanh, Responsive mobile-first.

## 1. Vấn đề & Người dùng
- **Vấn đề:** Người dùng bận rộn mất nhiều thời gian ghi chép cuộc họp, dễ quên các cam kết công việc (Task) và lịch hẹn (Calendar Events) phát sinh từ các cuộc trò chuyện hàng ngày.
- **Người dùng mục tiêu:** Quản lý, Freelancer, Kỹ sư, Người làm việc tri thức bận rộn.
- **Điểm khác biệt:** AI nghe - tự động trích xuất thông tin cấu trúc (Task, Event, Summary, Key Insights) + Lưu trữ trí nhớ dài hạn (Memory RAG) để hỏi đáp lại quá khứ.

## 2. Phạm vi MVP (MoSCoW)
- **Must have:**
  - Thu âm trực tiếp từ trình duyệt (Microphone Audio Capture & Visualizer).
  - Chuyển thoại thành văn bản (STT) + Phân tích AI qua Gemini LLM.
  - Trích xuất tự động: Tóm tắt điểm chính (Summary), Danh sách Việc cần làm (Action Items / Tasks), Lịch hẹn (Calendar Events) và Thực thể trí nhớ (Entities).
  - Quản lý nhật ký trí nhớ (Memory Logs / Timeline) lưu trữ tại máy (IndexedDB / Local Storage).
  - Khung Chatbot Hỏi đáp Ký ức (Memory Q&A Assistant).
  - Tạo & xuất file lịch chuẩn `.ics` / Google Calendar Link.
- **Should have:**
  - Tải file audio có sẵn (MP3, WAV, M4A, WebM) để AI phân tích.
  - Xuất báo cáo tóm tắt dạng Markdown / PDF.
- **Could have:**
  - Đánh dấu người nói (Speaker Identification).
  - Tích hợp trực tiếp Google Calendar API OAuth.
- **Won't have (lúc này):**
  - Ghi âm chạy ngầm 24/7 (vướng rào cản OS & Pin mobile).

## 3. Yêu cầu phi chức năng
- Tốc độ mục tiêu: Thời gian xử lý phân tích AI < 5 giây cho mỗi đoạn audio ngắn.
- Bảo mật: Local-first storage cho dữ liệu ghi âm & transcript cá nhân.
- Mobile-first & Responsive trên mọi màn hình (iOS Safari, Android Chrome, Desktop).
- Theme: **Cyber Dark Blue mặc định** + hỗ trợ chế độ Light mode mượt mà.

## 4. Tech Stack
- **Framework:** Next.js 15.1.4 (App Router), React 19, TypeScript 5.7.
- **Styling:** Tailwind CSS 3.4, Lucide React Icons.
- **AI Core:** `@google/generative-ai` (Gemini 2.0 Flash / Gemini 1.5 Pro).
- **Audio:** Web MediaRecorder API, Web Speech API (fallback STT preview).
- **Storage:** LocalStorage / IndexedDB + Next.js Server API Routes.

## 5. Kiến trúc API & Luồng Dữ liệu
- `/api/audio/process`: POST -> Nhận audio/text transcript -> Gemini Structuring Agent -> Trả về JSON (Summary, Tasks, Events, Key Insights).
- `/api/memory/query`: POST -> Nhận câu hỏi -> Tra cứu trong Memory -> Gemini RAG Agent -> Trả về câu trả lời + Trích dẫn.

## 6. Definition of Done (DoD)
- Build xanh (`npm run build`), Type check 0 lỗi (`npm run type-check`), Lint 0 warning (`npm run lint`).
- Thu âm và phân tích chính xác các thông tin Task & Event mẫu.
- Xuất lịch hẹn tương thích tốt với Google Calendar / Apple Calendar.
