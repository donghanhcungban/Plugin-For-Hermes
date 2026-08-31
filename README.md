# Hermes Antigravity OAuth Plugin

Model-provider plugin + local OAuth bridge for [Hermes Agent](https://github.com/NousResearch/hermes-agent).
Lets Hermes call Gemini 3.7/3.6/3.5/3.1, Claude Sonnet/Opus 4.6, and GPT-OSS 120B
through a **Google Antigravity IDE** OAuth login, with automatic **multi-account
failover** (rotate to another Google account on rate limit / quota / auth
failure).

See [`README_DETAILED_VI.md`](README_DETAILED_VI.md) (Vietnamese, full walkthrough)
/ [`README_EN.md`](README_EN.md) (English, full walkthrough) for
full setup instructions, and [`skills/antigravity-oauth-bridge/SKILL.md`](skills/antigravity-oauth-bridge/SKILL.md)
for the Hermes Agent skill that documents how to install, log in, and operate
this plugin (drop it into `$HERMES_HOME/skills/` or a Hermes profile's
`skills/` directory).

## Quick start

```bash
python install.py
python "$HERMES_HOME/bridge/antigravity/manage.py" login    # first Google account
python "$HERMES_HOME/bridge/antigravity/manage.py" login    # optional: add more accounts
python "$HERMES_HOME/bridge/antigravity/manage.py" start
hermes chat -q "Reply with exactly: OK" --provider antigravity -m gemini-3.7-flash
```

## Layout

```
plugin/                    Hermes model-provider plugin (ProviderProfile)
bridge/                    Local OAuth + Code Assist translation bridge
tests/                     Unit + integration tests (unittest, no network)
skills/antigravity-oauth-bridge/  Hermes Agent skill describing this plugin
install.py                 One-shot installer into $HERMES_HOME
manage.py                  CLI: login / start / stop / status / install / setup
.hermes/environment.json   `hermes verify` recipe for this repo
```

## Testing

```bash
python -m unittest discover -s tests -p "test_*.py" -v
python tests/verify_integration.py
# or, if you have hermes on PATH:
hermes verify --json
```

## License

MIT — see [LICENSE](LICENSE).
