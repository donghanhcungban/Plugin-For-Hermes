"""Tests for enabling Claude Code subscription CLI in Hermes."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from tests.test_manage_setup import manage


class ClaudeCodeSetupTests(unittest.TestCase):
    def test_configure_sets_local_cli_provider_and_preserves_other_fallbacks(self) -> None:
        import yaml
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            (home / "config.yaml").write_text(
                yaml.dump({"fallback_providers": [{"provider": "claude-code-cli", "model": "haiku"}, {"provider": "anthropic", "model": "x"}]}),
                encoding="utf-8",
            )
            manage.configure_claude_code_cli(home, model="opus", port=8100)
            config = yaml.safe_load((home / "config.yaml").read_text(encoding="utf-8"))
            self.assertEqual(config["model"], {"provider": "claude-code-cli", "default": "opus", "base_url": "http://127.0.0.1:8100/v1/claude-code"})
            self.assertEqual(config["fallback_providers"], [{"provider": "anthropic", "model": "x"}])


if __name__ == "__main__":
    unittest.main()
