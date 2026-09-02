---
name: hermes-provider-management
description: "Dùng khi cấu hình provider, proxy xoay tài khoản hoặc fallback cho Hermes."
version: 1.0.0
author: curator
license: MIT
platforms: [linux, macos, windows]
---

# Quản lý Provider Hermes

Skill này tổng hợp cách vận hành provider chính, chuỗi fallback, pool tài khoản Antigravity và nén ngữ cảnh trong Hermes Agent.

## `hermes fallback add` dùng picker tương tác

`hermes fallback add` không nhận tên provider qua đối số. Chạy bằng PTY:

```python
terminal(command="hermes fallback add", background=True, pty=True)
# poll -> submit số lựa chọn -> poll cho đến khi tiến trình kết thúc
```

Không dùng `hermes fallback add gemini` vì lệnh sẽ báo `unrecognized arguments`.

Trên Windows PTY, dùng `process(submit)` để gửi lựa chọn kèm Enter. Xem flow chi tiết tại `references/picker-flow.md`.

## Hai tầng xoay tài khoản và fallback

### Tầng 1: pool tài khoản Antigravity

Plugin tự quản lý rotation tại:

```text
$HERMES_HOME/auth/antigravity_tokens.json
```

File này chứa token OAuth và email thật, **không bao giờ commit hoặc sao chép vào repository**. Chỉ kiểm tra số lượng tài khoản theo cách không in token:

```bash
python -c "import json,os,pathlib; p=pathlib.Path(os.environ['HERMES_HOME'])/'auth'/'antigravity_tokens.json'; d=json.loads(p.read_text()); print(len(d.get('accounts',{})))"
```

`hermes auth list` có thể chỉ hiển thị một credential trong khi plugin vẫn xoay nhiều tài khoản, vì pool nằm ở lớp plugin. Khi mọi tài khoản cùng bị 429, bridge đã thử hết pool; chờ cooldown hoặc để Hermes chuyển sang provider dự phòng.

### Tầng 2: fallback giữa các provider

Cấu hình đã kiểm chứng hiện tại được lưu ở `config/hermes-rotation.example.yaml`:

1. Antigravity làm primary và tự xoay pool OAuth.
2. OpenAI Codex subscription làm fallback đầu tiên.
3. Các mức Gemini Antigravity khác là lựa chọn model bổ sung khi quota theo model còn khả dụng.
4. Anthropic/OpenAI Codex khác làm fallback tiếp theo.
5. OpenCode Free keyless đứng cuối làm lưới an toàn.

Không commit API key, access token, refresh token, cookie hoặc file `antigravity_tokens.json`.

## Context compression

`compression.threshold` là tỉ lệ từ `0.0` đến `1.0`, không phải số token tuyệt đối:

```bash
hermes config set compression.threshold 0.7
```

Mức 70% giúp giảm nguy cơ context của Gemini lớn bị cắt khi fallback sang model có cửa sổ nhỏ hơn.

## Kiểm tra vận hành

```bash
hermes fallback list
python "$HERMES_HOME/bridge/antigravity/manage.py" status
curl http://127.0.0.1:8100/health
```

Khi cooldown đã hết nhưng trạng thái rate-limit cũ vẫn còn, có thể chạy:

```bash
hermes auth reset antigravity
```

## OpenCode Free tier

Provider `opencode-free` không cần tài khoản. Model mặc định khuyên dùng là `deepseek-v4-flash-free`; base URL là `https://opencode.ai/zen/v1` với `api_mode: chat_completions`.
