# CONVENTIONS.md — Sổ Quy ước Kỹ thuật Dự án Ambient AI Assistant

Sổ quy ước ghi nhận toàn bộ các tiêu chuẩn mã nguồn, kiến trúc và quy tắc vận hành dự án **Ambient AI Assistant**.

---

## 1. Kiến trúc & Công nghệ (Tech Stack & Architecture)
- **Framework:** Next.js 15.1.4 (App Router) + React 19 + TypeScript 5.7.
- **Styling:** Tailwind CSS 3.4 + Lucide React Icons.
- **AI Core Provider:** Google Gemini API via `@google/generative-ai` (`gemini-2.0-flash` / `gemini-1.5-flash`).
- **Storage Strategy:** Local-first storage (LocalStorage / State) cho dữ liệu riêng tư & đễ đàng sao lưu.

---

## 2. Quy tắc Đặt tên & Cấu trúc Thư mục (Naming & Directory Rules)
- `app/api/...`: Chứa Next.js Route Handlers (JSON API endpoints).
- `components/...`: Chứa React components (kebab-case file names, export named components).
- `lib/...`: Chứa các utility thuần TypeScript (`audio-recorder.ts`, `gemini-ai.ts`, `memory-store.ts`, `ics-exporter.ts`, `markdown-exporter.ts`, `notification-manager.ts`).
- `docs/...`: Chứa tài liệu quản lý dự án (`FEATURE-MAP.md`, `CONVENTIONS.md`, `COMPLETION-PLAN.md`).

---

## 3. Cổng Chất lượng & Kiểm thử (Quality Gates)
Mọi mã nguồn trước khi commit/merge đều phải thỏa mãn 3 tiêu chuẩn bất biến:
1. **Type Check:** `npm run type-check` (tsc --noEmit) không có lỗi.
2. **Linter:** `npm run lint` (ESLint flat config) không có lỗi hoặc warning.
3. **Build:** `npm run build` (Next.js production build) biên dịch thành công.

---

## 4. Thiết kế Giao diện (UI/UX Design Tokens)
- **Primary Background:** `#060c18` (Cyber Dark Blue).
- **Accent Color:** Cyan 400/500 (`#22d3ee` / `#06b6d4`).
- **Card Background:** `slate-900/80` với hiệu ứng `backdrop-blur-md` và border `slate-800`.
- **Text Color:** Slate 100 cho văn bản chính, Slate 400 cho văn bản phụ.
