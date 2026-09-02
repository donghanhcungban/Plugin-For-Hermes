# Cấu hình vận hành hiện tại: proxy, xoay tài khoản và skill

Tài liệu này ghi lại phần cấu hình có thể chia sẻ an toàn của môi trường Hermes đã kiểm chứng. Các token OAuth, API key, email tài khoản và cookie không nằm trong repository.

## Kiến trúc

```text
Hermes
  -> antigravity @ 127.0.0.1:8100/v1
       -> model fallback trong cùng tài khoản
       -> xoay qua pool Google OAuth còn khả dụng
  -> fallback_providers của Hermes
       -> OpenAI Codex
       -> các mức Gemini Antigravity
       -> Anthropic
       -> OpenAI Codex model khác
       -> OpenCode Free
```

- Pool OAuth được lưu cục bộ tại `$HERMES_HOME/auth/antigravity_tokens.json`.
- Môi trường đã kiểm chứng có **3 tài khoản**, nhưng repository chỉ ghi số lượng, không ghi email hay token.
- Khi toàn bộ pool nhận 429, Hermes tiếp tục theo `fallback_providers`.
- `compression.threshold: 0.7` nén context trước khi fallback sang model có cửa sổ context nhỏ hơn.

## Áp dụng cấu hình

File [`config/hermes-rotation.example.yaml`](../config/hermes-rotation.example.yaml) là mẫu tối giản đã loại bí mật. Không ghi đè toàn bộ `config.yaml` của người dùng. Nên dùng `hermes config set`, `hermes model` và picker `hermes fallback add/remove` để cập nhật có kiểm soát.

Cài plugin và các skill đi kèm:

```bash
python install.py
python "$HERMES_HOME/bridge/antigravity/manage.py" login
python "$HERMES_HOME/bridge/antigravity/manage.py" login  # lặp lại cho từng tài khoản bổ sung
python "$HERMES_HOME/bridge/antigravity/manage.py" status
```

## Skill được đóng gói

| Skill | Mục đích |
|---|---|
| `antigravity-oauth-bridge` | Cài đặt, đăng nhập, chạy bridge và chẩn đoán xoay tài khoản |
| `hermes-provider-management` | Quản lý provider, fallback picker, credential pool và context compression |
| `project-harness-engineering` | Thiết kế/audit harness cho dự án dùng coding agent |

`install.py` đồng bộ các skill trên vào `$HERMES_HOME/skills/<tên-skill>/`, thay thế đúng skill cùng tên và giữ nguyên skill khác của người dùng.

## Kiểm tra

```bash
curl http://127.0.0.1:8100/health
curl http://127.0.0.1:8100/v1/models
hermes fallback list
python -m unittest discover -s tests -p "test_*.py" -v
```

## Dữ liệu tuyệt đối không đồng bộ

- `$HERMES_HOME/auth/antigravity_tokens.json`
- `$HERMES_HOME/.env`
- access token, refresh token, cookie, API key thật
- log bridge có thể chứa email hoặc metadata tài khoản
