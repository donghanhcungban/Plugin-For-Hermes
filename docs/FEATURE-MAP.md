# FEATURE-MAP.md — Bản đồ Tính năng Dự án Ambient AI Assistant

Bản đồ hệ thống hóa toàn bộ các tính năng đã hoàn thiện của ứng dụng **Ambient AI Assistant (Smart Meeting & Thought Companion)**.

---

## 1. Tầng Thu âm & Tiếp nhận Dữ liệu (Audio Capture & Ingestion)
- **F-001: Thu âm Trực tiếp qua Microphone (Live Audio Recording)**
  - *Mô tả:* Thu âm cuộc họp/tư duy trực tiếp từ micro trình duyệt với hiệu ứng sóng âm (Waveform Visualizer) và bộ đếm thời lượng.
  - *File chính:* [`lib/audio-recorder.ts`](file:///c:/Users/liend/AI-Tutor/lib/audio-recorder.ts), [`components/audio-recorder-hub.tsx`](file:///c:/Users/liend/AI-Tutor/components/audio-recorder-hub.tsx).
- **F-002: Chuyển thoại Live Preview (Web Speech STT)**
  - *Mô tả:* Hiển thị văn bản nhận diện trực tiếp theo thời gian thực bằng tiếng Việt.
- **F-003: Tải File Audio có sẵn (Audio File Upload)**
  - *Mô tả:* Cho phép chọn/kéo-thả file âm thanh `.mp3`, `.wav`, `.m4a`, `.webm`, `.ogg` có sẵn từ thiết bị.
- **F-004: Nhập liệu Văn bản Thủ công (Manual Text Input)**
  - *Mô tả:* Dán hoặc nhập ghi chú văn bản cuộc họp khi không dùng audio.

---

## 2. Tầng Trí tuệ AI & Trích xuất Cấu trúc (AI Structuring Agent)
- **F-005: Gemini AI Structuring Agent**
  - *Mô tả:* Sử dụng `@google/generative-ai` phân tích transcript thành JSON chứa Tóm tắt, Chủ đề, Key Insights, Tasks và Events.
  - *File chính:* [`lib/gemini-ai.ts`](file:///c:/Users/liend/AI-Tutor/lib/gemini-ai.ts), [`app/api/audio/process/route.ts`](file:///c:/Users/liend/AI-Tutor/app/api/audio/process/route.ts).
- **F-006: Thẻ Tóm tắt Cuộc họp (Executive Summary & Key Insights)**
  - *Mô tả:* Hiển thị tóm tắt điểm chính, thẻ chủ đề (Topic Tags) và đúc kết quan trọng.
  - *File chính:* [`components/meeting-summary-card.tsx`](file:///c:/Users/liend/AI-Tutor/components/meeting-summary-card.tsx).

---

## 3. Tầng Quản lý Công việc & Lịch trình (Action Items & Calendar)
- **F-007: Trích xuất & Quản lý Task (Action Items)**
  - *Mô tả:* Tự động gắn mức ưu tiên (High/Medium/Low), deadline, người phụ trách và checkbox hoàn thành.
  - *File chính:* [`components/action-items-list.tsx`](file:///c:/Users/liend/AI-Tutor/components/action-items-list.tsx).
- **F-008: Xuất Lịch hẹn 1-Click (Google Calendar & File .ICS)**
  - *Mô tả:* Tự động trích xuất lịch hẹn, cung cấp nút tạo nhanh Google Calendar hoặc tải file `.ics`.
  - *File chính:* [`lib/ics-exporter.ts`](file:///c:/Users/liend/AI-Tutor/lib/ics-exporter.ts), [`components/calendar-events-list.tsx`](file:///c:/Users/liend/AI-Tutor/components/calendar-events-list.tsx).

---

## 4. Tầng Trí nhớ Cá nhân & Tra cứu (Memory Engine & RAG Chatbot)
- **F-009: Bộ nhớ Local-First (Local Memory Store)**
  - *Mô tả:* Lưu trữ nhật ký cuộc họp, tasks, events tại LocalStorage của trình duyệt đảm bảo độ trễ thấp & bảo mật.
  - *File chính:* [`lib/memory-store.ts`](file:///c:/Users/liend/AI-Tutor/lib/memory-store.ts).
- **F-010: Khung Chatbot Tra cứu Ký ức (Memory RAG Assistant)**
  - *Mô tả:* Cho phép hỏi đáp tự nhiên về toàn bộ dữ liệu cuộc họp trong quá khứ kèm trích dẫn.
  - *File chính:* [`components/memory-chat-assistant.tsx`](file:///c:/Users/liend/AI-Tutor/components/memory-chat-assistant.tsx), [`app/api/memory/query/route.ts`](file:///c:/Users/liend/AI-Tutor/app/api/memory/query/route.ts).
- **F-011: Tìm kiếm & Lọc Nhật ký (Search & Topic Filter)**
  - *Mô tả:* Tìm nhanh bản ghi cuộc họp theo từ khóa và bộ lọc nhãn chủ đề.

---

## 5. Tầng Xuất Báo cáo & Trải nghiệm Nâng cao (Export, PWA & Reminders)
- **F-012: Xuất Báo cáo Markdown (.md)**
  - *Mô tả:* Xuất tài liệu tóm tắt cuộc họp chuẩn Markdown với 1-click.
  - *File chính:* [`lib/markdown-exporter.ts`](file:///c:/Users/liend/AI-Tutor/lib/markdown-exporter.ts).
- **F-013: Cấu hình PWA Native (Progressive Web App)**
  - *Mô tả:* Hỗ trợ Add to Home Screen cài đặt ứng dụng như app native trên iOS/Android.
  - *File chính:* [`app/manifest.ts`](file:///c:/Users/liend/AI-Tutor/app/manifest.ts), [`app/layout.tsx`](file:///c:/Users/liend/AI-Tutor/app/layout.tsx).
- **F-014: Thông báo Nhắc nhở Trình duyệt (Browser Notifications)**
  - *Mô tả:* Phát thông báo nhắc nhở khi công việc đến hạn.
  - *File chính:* [`lib/notification-manager.ts`](file:///c:/Users/liend/AI-Tutor/lib/notification-manager.ts).
- **F-015: Cấu hình Gemini API Key Cá nhân**
  - *Mô tả:* Modal cài đặt tùy chỉnh API Key Gemini cá nhân.
  - *File chính:* [`components/api-key-modal.tsx`](file:///c:/Users/liend/AI-Tutor/components/api-key-modal.tsx).
