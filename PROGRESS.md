# PROGRESS.md — Lịch sử & Tiến độ Dự án Ambient AI Assistant

## 1. Giai đoạn Hiện tại
- **Giai đoạn:** Đã hoàn thành Phase 1 MVP & Phase 2 Nâng cao.
- **Trạng thái:** Toàn bộ tính năng đã được xây dựng, kiểm thử type-check, lint 0 warning và build xanh. Đã đẩy mã nguồn lên GitHub repository: `https://github.com/seeker19110/AI-X.git`.

## 2. Nhật ký Tiến độ (Changelog / Milestones)
- **2026-08-10 (Git Repository Deployment):**
  - Cập nhật remote origin sang `https://github.com/seeker19110/AI-X.git`.
  - Rebase & push toàn bộ mã nguồn Phase 1 & Phase 2 lên nhánh `main`.

- **2026-08-10 (Phase 2 Completed):**
  - Xây dựng tính năng **Tải File Audio có sẵn** (`.mp3`, `.wav`, `.m4a`, `.webm`, `.ogg`).
  - Xây dựng Utility **Xuất Báo cáo Cuộc họp dạng Markdown (`.md`)** qua [`lib/markdown-exporter.ts`](file:///c:/Users/liend/AI-Tutor/lib/markdown-exporter.ts).
  - Tích hợp **Thanh Tìm kiếm & Bộ lọc Chủ đề (Tag Filter)** cho Nhật ký Cuộc họp trong [`app/page.tsx`](file:///c:/Users/liend/AI-Tutor/app/page.tsx).
  - Tích hợp Modal **Cấu hình Gemini API Key Cá nhân** ([`components/api-key-modal.tsx`](file:///c:/Users/liend/AI-Tutor/components/api-key-modal.tsx)).
  - Đạt toàn bộ cổng kiểm thử: `type-check` 0 lỗi, `lint` 0 warning, `build` xanh.

- **2026-08-10 (Phase 1 MVP Completed):**
  - Khởi tạo kiến trúc dự án Ambient AI Assistant.
  - Thu âm micro trực tiếp + Live Speech-to-Text preview + Phân tích AI Gemini.
  - Trích xuất thông tin cấu trúc: Tóm tắt, Key Insights, Tasks/To-dos & Lịch hẹn (Calendar Events).
  - Quản lý bộ nhớ cá nhân Local-first + RAG Memory Chatbot Assistant.
  - Xuất lịch hẹn sang Google Calendar & File `.ics`.

## 3. Các bước tiếp theo
- Triển khai sản phẩm lên các nền tảng Hosting như Vercel / Netlify nếu cần.
