# `hermes fallback add` — flow tham khảo

> Danh sách và số thứ tự provider có thể thay đổi theo phiên bản Hermes. Nếu số không khớp, đọc nhãn trong picker thay vì đoán.

## Provider quan trọng trong bản Hermes đã kiểm chứng ngày 2026-09-01

| Mục | Provider |
|---:|---|
| 8 | OpenAI (ChatGPT/Codex subscription hoặc API) |
| 27 | OpenCode (Zen, Go, Free) |
| 40 | Google Antigravity OAuth local bridge |
| 41 | Local Claude Code CLI bridge |

## Các nhánh thường dùng

### OpenAI

```text
OpenAI -> ChatGPT or Codex Subscription -> giữ credential -> chọn model
```

### OpenCode Free

```text
OpenCode -> Free -> https://opencode.ai/zen/v1 -> deepseek-v4-flash-free
```

### Antigravity

```text
Google Antigravity -> giữ API key placeholder -> http://127.0.0.1:8100/v1 -> chọn model
```

### Claude Code CLI

```text
Claude Code CLI -> giữ API key placeholder -> http://127.0.0.1:8100/v1/claude-code -> fable|opus|sonnet|haiku
```

Một provider không thể làm fallback cho chính nó nếu trùng endpoint primary. Entry trùng `(provider, model)` sẽ bị bỏ qua.
