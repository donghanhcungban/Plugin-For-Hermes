---
name: antigravity-oauth-bridge
description: "Antigravity OAuth plugin: multi-account Gemini/Claude."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [antigravity, oauth, model-provider, plugin, gemini, claude, failover, multi-account]
    related_skills: [hermes-agent, native-mcp]
---

# Antigravity OAuth Bridge Plugin

## When to Use

Use when the user wants to install, configure, or debug the Antigravity OAuth
model-provider plugin for Hermes Agent, or wants to add/rotate multiple Google
accounts for it.

Community model-provider plugin that lets Hermes Agent call Gemini 3.7/3.6/3.5/3.1,
Claude Sonnet/Opus 4.6, and GPT-OSS 120B through a **Google Antigravity IDE OAuth**
login — no API key purchase, uses the free/subscription Antigravity quota. It works
by running a small local HTTP bridge (`127.0.0.1:8100`) that speaks the OpenAI Chat
Completions API and translates requests to Google's internal Code Assist endpoint,
simulating the real Antigravity IDE client fingerprint.

**Repo:** the plugin ships from this skill's sibling repo (clone or vendor
`bridge/`, `plugin/`, `install.py`, `manage.py` from wherever this skill package
was distributed — e.g. a GitHub repo named `Plugin-For-Hermes` or
`Hermes-Antigravity-OAuth-Plugin`).

## Install

```bash
python install.py
```

This copies:
- `plugin/` → `$HERMES_HOME/plugins/model-providers/antigravity/` (registers the
  `antigravity` provider with Hermes — model picker, `--provider antigravity`, etc.)
- `bridge/` → `$HERMES_HOME/bridge/antigravity/tools/antigravity_bridge/` (the
  runtime engine: OAuth, request/response translation, HTTP server)
- `manage.py` → `$HERMES_HOME/bridge/antigravity/manage.py` (CLI to control it)

If run from inside a hermes-agent git checkout, it also syncs into that repo's
`plugins/model-providers/antigravity/` and `tools/antigravity_bridge/` so a local
dev build picks it up too.

## Login (single or multiple Google accounts)

```bash
python "$HERMES_HOME/bridge/antigravity/manage.py" login
```

Opens a browser for Google OAuth PKCE. **Run `login` again for each additional
Google account** — pick "Use another account" in the browser each time. Every
successful login is appended (keyed by email) to
`$HERMES_HOME/auth/antigravity_tokens.json` under an `accounts` map; nothing is
overwritten. Two or three accounts is a good pool size for personal use.

```bash
python "$HERMES_HOME/bridge/antigravity/manage.py" status   # shows the primary account + token health
python "$HERMES_HOME/bridge/antigravity/manage.py" start    # starts the bridge daemon on :8100
python "$HERMES_HOME/bridge/antigravity/manage.py" stop
```

Hermes auto-wakes the bridge on first use via
`ensure_antigravity_bridge_running()` in the plugin's `build_extra_body` hook, so
`start` is mostly for manual testing.

## Multi-account failover (how it behaves)

`bridge/auth.py`'s `AntigravityAuthManager` and `bridge/client.py`'s
`AntigravityClient` implement account rotation:

- `resolve_credential_candidates()` returns every stored account NOT currently in
  cooldown, refreshing expired access tokens on the way (refresh failure cools
  that account for 5 min and moves on — never raises past a usable account).
- A bearer token passed to the bridge (e.g. a specific `Authorization: Bearer
  <email-or-token-prefix>`) is tried first if present, then the rest.
- On `401`/`402`/`403`/`429`, or a `200`-status body containing
  `RESOURCE_EXHAUSTED`/quota/invalid_grant markers, the current account is
  cooled down (`mark_account_unavailable`) and the **next** account is tried —
  for both non-streaming `create_chat_completion` and streaming
  `stream_chat_completion` (streaming fails over before the first SSE chunk is
  emitted, so a client never sees a half-started then aborted stream).
- On a primary-endpoint `5xx`, the SAME account retries the documented Google
  fallback host (`cloudcode-pa.googleapis.com`) before rotating accounts — a
  transient regional outage does not burn every account's cooldown.
- Cooldown durations: 401 → 5 min, 402/403/429 → 1 hour (or the server's
  `Retry-After` header if present, capped to that value), everything else → 60s.
  Cooldowns persist to disk (`unavailable_until` in each account's record) and
  survive a bridge restart.
- When every account is cooling down, the bridge raises a clear error naming the
  soonest retry window instead of a bare 429.

Credentials created with a **custom auth_file** (e.g. in unit tests via
`AntigravityAuthManager(auth_file=<tmp path>)`) never sync to the global
`$HERMES_HOME/auth.json` credential pool — only the default (no `auth_file`
override) manager does, so tests can't clobber a real user's stored accounts.

## Verifying it works

```bash
export ANTIGRAVITY_API_KEY=antigravity-local-token   # any non-empty value; the bridge
                                                        # itself does the real Google auth
hermes chat -q "Reply with exactly: OK" --provider antigravity -m gemini-3.7-flash
```

Or check the bridge directly:

```bash
curl http://127.0.0.1:8100/health
curl http://127.0.0.1:8100/v1/models       # 9 models
curl http://127.0.0.1:8100/auth/status     # logged_in, email, expires_at
```

## Model catalog (9 IDs — matches the real Antigravity IDE)

`gemini-3.7-flash`, `gemini-3.7-flash-medium`, `gemini-3.7-flash-low`,
`gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.1-pro`, `claude-sonnet-4-6`,
`claude-opus-4-6`, `gpt-oss-120b`. There is no `gemini-3.7-pro` — it doesn't
exist in the real IDE catalog and was deliberately removed.

## Pitfalls

- **Windows daemon start needs the right import path.** `manage.py start` must
  detect whether it's running from the installed layout
  (`tools/antigravity_bridge/`) or the source layout (`bridge/`) and pick the
  matching import string — otherwise the spawned daemon dies immediately with
  `ModuleNotFoundError: No module named 'bridge'` (check
  `$HERMES_HOME/logs/antigravity_bridge.log` first if `start` reports a
  healthcheck timeout).
- `AntigravityCredentials.is_expired` is a **property**, not a method — call it
  without `()`.
- Registering the provider so Hermes' CLI/runtime/model-picker all pick it up
  requires `auth_type="api_key"` with a placeholder `env_vars=("ANTIGRAVITY_API_KEY",)`
  on the `ProviderProfile`, even though the real auth is Google OAuth handled
  entirely inside the bridge — Hermes only auto-wires `api_key`-type profiles
  into `PROVIDER_REGISTRY`/`CANONICAL_PROVIDERS`/`resolve_runtime_provider`.
- This is a third-party plugin using Google's internal (non-public)
  `v1internal:generateContent` Code Assist API with IDE-simulating headers.
  Treat it as best-effort and subject to breakage if Google changes that
  internal API; usage volume risk applies for 24/7 heavy use through a gateway.
