# Changelog

Mọi thay đổi đáng kể của dự án được ghi ở đây.

Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/),
và dự án tuân theo [Semantic Versioning](https://semver.org/lang/vi/).

> Vì commit theo *conventional commits*, phần "Unreleased" có thể được sinh tự động sau
> (ví dụ `standard-version` / `changesets`). Trước mắt cập nhật tay khi có thay đổi đáng kể.

## 1.0.0 (2026-08-10)


### ⚠ BREAKING CHANGES

* /tu-van→/consult, /cong→/gate, /khoi-tao→/bootstrap, /tu-dong→/auto, /audit-toan-dien→/audit-full, /audit-toi-uu→/audit-optimize, /su-co→/incident; subagent tra-cuu→lookup, kiem-tra-phien-ban→version-check, thuc-thi→executor; tên file docs đổi theo bảng ánh xạ trong docs/framework/README.md.

### Features

* 3 nâng cấp template — AGENTS.md + MCP Context7 + cổng CI knip ([#33](https://github.com/seeker19110/AI-X/issues/33)) ([1a897da](https://github.com/seeker19110/AI-X/commit/1a897da547dfc86f354a150d0d2bb1df1476c9f6))
* add PWA native manifest & browser notification reminders (Phase 3) ([867adc6](https://github.com/seeker19110/AI-X/commit/867adc6e97a9d83cc2debeae6e8ddfe97dc47fcd))
* apply 3-tier orchestration architecture (planner/coordinator/routed workers) ([b46d393](https://github.com/seeker19110/AI-X/commit/b46d393cc89c5a26de179cbaa6b81481f76642bc))
* bổ sung 7 kỹ thuật chất lượng từ nghiên cứu mattpocock/skills ([#36](https://github.com/seeker19110/AI-X/issues/36)) ([50738bd](https://github.com/seeker19110/AI-X/commit/50738bdc1c715ff41b647eab8a79770d42598e28))
* cấu hình opusplan dùng chung cho mọi dự án (tối ưu token) ([#19](https://github.com/seeker19110/AI-X/issues/19)) ([30608e6](https://github.com/seeker19110/AI-X/commit/30608e63288cc92773f6a1cf467b279830a3cdde))
* chế độ chạy tự động + hướng dẫn chọn model Claude cho khung ([534ca84](https://github.com/seeker19110/AI-X/commit/534ca849b58a3efc6816a5a2fb4f9bace2c94c06))
* complete Ambient AI Assistant (Smart Meeting & Thought Companion) Phase 1 & 2 ([b721911](https://github.com/seeker19110/AI-X/commit/b721911b79d847950af1e09b2866551662723c69))
* copy-framework.ps1 (bản PowerShell cho Windows) + hướng dẫn "đã có repo khung này" ([#17](https://github.com/seeker19110/AI-X/issues/17)) ([fbff876](https://github.com/seeker19110/AI-X/commit/fbff8765e4782cb700f2c3fd5460d4c66e8bc65d))
* **framework:** copy-framework.sh — mang khung sang dự án khác ([d5d3ef6](https://github.com/seeker19110/AI-X/commit/d5d3ef6dce7174ceeaeba6deeab8a5713f13fbe9))
* **framework:** dấu bản khung FRAMEWORK-VERSION + tách templates hoàn thiện ([#35](https://github.com/seeker19110/AI-X/issues/35)) ([ce34157](https://github.com/seeker19110/AI-X/commit/ce341575f362683e53190a1bf5df817c5907e085))
* **framework:** hoàn thiện hàng rào tự động + vận hành + vệ sinh repo ([9cc38f9](https://github.com/seeker19110/AI-X/commit/9cc38f9e2222ce1a4dcced85f5b21a708795c3c4))
* **framework:** hoàn thiện hàng rào tự động, vận hành & vệ sinh repo ([bb0665c](https://github.com/seeker19110/AI-X/commit/bb0665cbecfae575d8e1b8328e6b72e563c5b6ba))
* **framework:** slash command /audit-toi-uu + trigger để AI tự chạy audit tối ưu ([ac458a4](https://github.com/seeker19110/AI-X/commit/ac458a4a0abd16be5b66891e4efc325b85dea317))
* **framework:** slash command /audit-toi-uu + trigger để AI tự chạy audit tối ưu ([0623f43](https://github.com/seeker19110/AI-X/commit/0623f4379cc154e2ca5c1112659b605f0b921227))
* **framework:** thêm copy-framework.sh để mang khung sang dự án khác ([754c51d](https://github.com/seeker19110/AI-X/commit/754c51d114aaa1fc06088296191dd947176bf9d9))
* **framework:** thêm Nhóm 2 (mobile/perf/test/UI-UX/logic), KHUNG-3 chọn công nghệ research-first, theme Dark blue + Light ([b00d1a4](https://github.com/seeker19110/AI-X/commit/b00d1a4130c312b68fc482333fe7eac04aebbf60))
* nhắc nâng Fable 5/xhigh trong các skill lý luận sâu ([#20](https://github.com/seeker19110/AI-X/issues/20)) ([e9d01c2](https://github.com/seeker19110/AI-X/commit/e9d01c2d3b35380f24044c2d15f1c17b0b60f11c))
* nudge /code-review before commit on large staged diffs ([#31](https://github.com/seeker19110/AI-X/issues/31)) ([240507e](https://github.com/seeker19110/AI-X/commit/240507e191bf8d191bbe9aa9068769b8e795c9c6))
* **skill:** thêm bộ skill chuyên gia cho khung (tư vấn, cổng, sự cố, ADR, khởi tạo, UI/UX) ([#13](https://github.com/seeker19110/AI-X/issues/13)) ([0a582aa](https://github.com/seeker19110/AI-X/commit/0a582aa79b2608c0c5b6a20127118de3a76f1afc))
* subagent Sonnet `thuc-thi` + gộp doc model/tự động ([#21](https://github.com/seeker19110/AI-X/issues/21)) ([41624eb](https://github.com/seeker19110/AI-X/commit/41624eb5ee347e78856ad5168ffd7e178efa9f21))
* tái cấu trúc tên file sang tiếng Anh + quy trình hoàn thiện dự án (/completion) ([#24](https://github.com/seeker19110/AI-X/issues/24)) ([6c392b0](https://github.com/seeker19110/AI-X/commit/6c392b0fc4a7dc4970e7fb74b35052d471122375))
* **template:** hiện đại hóa toolchain (ESLint flat config, Tailwind 4, bỏ next lint) + thêm năng lực đa dụng (i18n, PWA, SEO, trang lỗi) ([24ce62a](https://github.com/seeker19110/AI-X/commit/24ce62a8f8b913594b2c2def8802f1ac8f8e454b))
* thêm tính năng audit toàn diện (/audit-toan-dien) ([#23](https://github.com/seeker19110/AI-X/issues/23)) ([1bb5cf7](https://github.com/seeker19110/AI-X/commit/1bb5cf736a2bfb5d88ac3d2f198dde10dc94a94c))
* xác nhận/cảnh báo model opusplan khi mở phiên template ([2e7e1ba](https://github.com/seeker19110/AI-X/commit/2e7e1baaf072b8a5747457fe8dfcae0e117b3919))


### Bug Fixes

* **ci:** cấp quyền pull-requests:read cho gitleaks (sửa lỗi 403) ([366aeec](https://github.com/seeker19110/AI-X/commit/366aeecffe531c260680a03dd5db1982cfab1f87))
* **ci:** CodeQL theo guard package.json + sửa input languages ([8db7e46](https://github.com/seeker19110/AI-X/commit/8db7e46b289bd0fb2e577453cdaa2e5ed96a7578))
* lưu copy-framework.ps1 dạng UTF-8 có BOM để Windows PowerShell 5.1 parse đúng ([#18](https://github.com/seeker19110/AI-X/issues/18)) ([59a280f](https://github.com/seeker19110/AI-X/commit/59a280fbb238f20c1ed90ee9da7f1e9247fd751d))
* sửa lỗi copy-framework thiếu scripts/ + đồng bộ tài liệu sau tái cấu trúc ([#27](https://github.com/seeker19110/AI-X/issues/27)) ([6a4ac40](https://github.com/seeker19110/AI-X/commit/6a4ac405ef8247b17dd8f11b8dcbd65e5aee06e7))

## [Unreleased]

### Added (Thêm)

- **`scripts/verify-dropins.sh` + workflow `verify-dropins.yml`** — dựng một dự án Next.js sạch,
  copy khung vào, làm đúng Phần D của runbook rồi chạy lint/type-check/build/test THẬT.
  Trước đây các file dropins (`app/`, `components/`, `lib/`, config) chưa từng được biên dịch
  hay lint lần nào vì repo khung không có `package.json`. Chạy hằng đêm với
  `create-next-app@latest` nên cũng là cảm biến version drift từ thượng nguồn.
- **Cổng nhất quán lệnh:** `scripts/check-docs-consistency.sh` kiểm hai chiều giữa
  `.claude/commands/*.md` và `CLAUDE.md` — lệnh mới mà quên khai TRIGGER, hoặc `CLAUDE.md`
  trỏ tới lệnh không tồn tại, đều bị CI chặn thay vì phải rà tay.
- **Dependabot theo dõi `github-actions`** — các action trong `.github/workflows/` đang dùng
  tag trôi (`@v4`, `@v3`); đây là phụ thuộc thật của chính bộ khung, trước đây không ai canh.
- **Dấu bản khung ở dự án đích:** `copy-framework.sh`/`.ps1` sinh `docs/framework/FRAMEWORK-VERSION`
  (commit nguồn + ngày copy, luôn ghi đè theo lần copy gần nhất) — dự án đích biết mình đang dùng
  khung bản nào và so CHANGELOG này để quyết định khi nào copy lại.
- **`docs/framework/templates/`** — bản mẫu sạch cho 3 file làm việc của `/completion`:
  `FEATURE-MAP.template.md`, `CONVENTIONS.template.md`, `COMPLETION-PLAN.template.md`
  (tách từ khối inline trong `project-completion.md` — một nguồn sự thật, copy thẳng thay vì chép tay).

### Changed (Đổi)

- **Workflow siết quyền tối thiểu:** mọi workflow khai `permissions:` ở cấp workflow
  (`ci.yml`, `lighthouse-ci.yml`, `codeql.yml` trước đây nhận quyền mặc định của repo).
- **`concurrency` cho workflow:** push liên tiếp vào cùng một PR hủy lượt chạy cũ;
  trên `main` không hủy, và `release.yml` xếp hàng (không hủy) để tránh release dở dang.

### Fixed (Sửa)

- **`components/theme-toggle.tsx` fail lint chính config của khung** (`react-hooks/set-state-in-effect`
  của React Compiler, qua `eslint-config-next` bản mới). Viết lại theo `useSyncExternalStore` —
  đọc `data-theme` trên `<html>` (nguồn sự thật do script no-flash đặt) thay vì `useState` +
  `useEffect`; bỏ luôn một lượt render thừa sau hydrate.
- **`app/sw.ts` không type-check được** (`TS2552: Cannot find name 'ServiceWorkerGlobalScope'`)
  vì `lib` của Next chỉ có DOM. Thêm `/// <reference lib="webworker" />` theo từng-file.

### Removed (Bỏ)

-

<!--
Khi phát hành phiên bản, tạo mục mới phía trên, ví dụ:

## [0.1.0] - 2026-01-01
### Added
- Phiên bản đầu tiên.
-->
