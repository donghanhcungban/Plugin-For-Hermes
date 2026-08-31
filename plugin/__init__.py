"""Antigravity (OAuth Bridge) provider profile for Hermes Agent."""

from __future__ import annotations

from typing import Any

from providers import register_provider
from providers.base import ProviderProfile


class AntigravityProfile(ProviderProfile):
    """Antigravity OAuth Bridge provider profile."""

    def build_extra_body(
        self, *, session_id: str | None = None, **context: Any
    ) -> dict[str, Any]:
        """Support reasoning/thinking config forwarding and auto-wake bridge daemon."""
        try:
            from tools.antigravity_bridge.server import ensure_antigravity_bridge_running
            ensure_antigravity_bridge_running()
        except Exception:
            pass
        reasoning_config = context.get("reasoning_config")
        if not reasoning_config:
            return {}
        return {"thinking_config": reasoning_config}


antigravity = AntigravityProfile(
    name="antigravity",
    aliases=("google-antigravity", "antigravity-oauth"),
    display_name="Google Antigravity (OAuth)",
    description="Google Gemini & Claude models via Antigravity OAuth local bridge",
    signup_url="https://antigravity.google",
    env_vars=(),
    base_url="http://127.0.0.1:8100/v1",
    auth_type="oauth_external",
    default_aux_model="gemini-3.7-flash",
    supports_vision=True,
)

register_provider(antigravity)
