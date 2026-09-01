"""Claude Code subscription CLI adapter with an OpenAI-compatible response.

The adapter intentionally disables Claude Code's own tools. Hermes remains the
only process that may execute a requested Hermes tool call.
"""

from __future__ import annotations

import asyncio
import json
import os
import time
import uuid
from collections.abc import Awaitable, Callable
from typing import Any


CLI_MODEL_ALIASES = {
    "sonnet": "sonnet",
    "opus": "opus",
    "haiku": "haiku",
    "claude-sonnet-4-6": "sonnet",
    "claude-opus-4-6": "opus",
    "claude-haiku-4-5": "haiku",
}

Runner = Callable[[list[str], str], Awaitable[tuple[int, str, str]]]


class ClaudeCodeCliError(RuntimeError):
    """An actionable failure from the local Claude Code CLI."""

    def __init__(self, message: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.status_code = status_code


async def _run_cli(command: list[str], prompt: str) -> tuple[int, str, str]:
    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
    except FileNotFoundError as exc:
        raise ClaudeCodeCliError(
            "Claude Code CLI was not found. Install it, then run `claude auth login`.", 503
        ) from exc

    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(prompt.encode("utf-8")), timeout=300)
    except TimeoutError as exc:
        process.kill()
        await process.wait()
        raise ClaudeCodeCliError("Claude Code CLI timed out after 300 seconds.", 504) from exc
    return process.returncode or 0, stdout.decode("utf-8", "replace"), stderr.decode("utf-8", "replace")


def _content_to_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(
            str(part.get("text", ""))
            for part in content
            if isinstance(part, dict) and part.get("type") in {"text", "input_text"}
        )
    return ""


def _tool_specs(payload: dict[str, Any]) -> list[dict[str, Any]]:
    tools: list[dict[str, Any]] = []
    for item in payload.get("tools") or []:
        function = item.get("function") if isinstance(item, dict) else None
        if not isinstance(function, dict) or not isinstance(function.get("name"), str):
            continue
        tools.append(
            {
                "name": function["name"],
                "description": str(function.get("description") or ""),
                "parameters": function.get("parameters") or {"type": "object"},
            }
        )
    return tools


def _build_prompt(messages: Any, tools: list[dict[str, Any]]) -> str:
    if not isinstance(messages, list) or not messages:
        raise ClaudeCodeCliError("Request must include at least one chat message.", 400)

    transcript: list[str] = []
    for message in messages:
        if not isinstance(message, dict):
            continue
        role = str(message.get("role") or "user").upper()
        content = _content_to_text(message.get("content"))
        if message.get("tool_calls"):
            content += "\nRequested tool calls: " + json.dumps(message["tool_calls"], ensure_ascii=False)
        if message.get("tool_call_id"):
            content = f"Tool result ({message['tool_call_id']}): {content}"
        transcript.append(f"[{role}]\n{content}")

    tool_instructions = "No Hermes tools are available; answer directly."
    if tools:
        tool_instructions = (
            "You may either answer directly or request Hermes tools. Only request a tool from "
            "the supplied list, with JSON-object arguments that match its parameters. Hermes, not "
            "you, executes those tool calls."
        )

    return "\n\n".join(
        [
            "You are the model in a Hermes Agent conversation.",
            tool_instructions,
            "Do not claim to have executed a tool. Give a concise helpful answer in the user's language.",
            "Conversation:",
            "\n\n".join(transcript),
            "Available Hermes tools:",
            json.dumps(tools, ensure_ascii=False),
        ]
    )


def _output_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["content", "tool_calls"],
        "properties": {
            "content": {"type": "string"},
            "tool_calls": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["name", "arguments"],
                    "properties": {
                        "name": {"type": "string"},
                        "arguments": {"type": "object", "additionalProperties": True},
                    },
                },
            },
        },
    }


class ClaudeCodeCliClient:
    """Maps an OpenAI chat-completions payload onto `claude -p` safely."""

    def __init__(self, runner: Runner | None = None, cli_path: str | None = None) -> None:
        self._runner = runner or _run_cli
        self._cli_path = cli_path or os.environ.get("CLAUDE_CODE_CLI_PATH") or "claude"

    async def create_chat_completion(self, payload: dict[str, Any]) -> dict[str, Any]:
        tools = _tool_specs(payload)
        prompt = _build_prompt(payload.get("messages"), tools)
        requested_model = str(payload.get("model") or "sonnet").lower()
        model = CLI_MODEL_ALIASES.get(requested_model, requested_model)
        command = [
            self._cli_path,
            "-p",
            "--tools",
            "",
            "--no-session-persistence",
            "--output-format",
            "json",
            "--json-schema",
            json.dumps(_output_schema(), separators=(",", ":")),
            "--model",
            model,
        ]
        try:
            returncode, stdout, stderr = await self._runner(command, prompt)
        except FileNotFoundError as exc:
            raise ClaudeCodeCliError(
                "Claude Code CLI was not found. Install it, then run `claude auth login`.", 503
            ) from exc

        if returncode != 0:
            detail = (stderr or stdout or "Claude Code CLI failed.").strip()
            try:
                cli_error = json.loads(stdout)
                detail = str(cli_error.get("result") or detail)
            except (TypeError, json.JSONDecodeError):
                pass
            detail_lower = detail.lower()
            if "not logged in" in detail_lower:
                raise ClaudeCodeCliError("Claude Code is not logged in. Run `claude auth login`.", 401)
            status = 429 if "rate limit" in detail_lower else 502
            raise ClaudeCodeCliError(detail, status)
        try:
            output = json.loads(stdout)
            structured = output["structured_output"]
            content = structured["content"]
            tool_calls = structured["tool_calls"]
        except (KeyError, TypeError, json.JSONDecodeError) as exc:
            raise ClaudeCodeCliError("Claude Code returned an invalid structured response.", 502) from exc
        if not isinstance(content, str) or not isinstance(tool_calls, list):
            raise ClaudeCodeCliError("Claude Code returned an invalid structured response.", 502)

        allowed_tools = {tool["name"] for tool in tools}
        openai_tool_calls: list[dict[str, Any]] = []
        for tool_call in tool_calls:
            if not isinstance(tool_call, dict):
                raise ClaudeCodeCliError("Claude Code returned an invalid tool call.", 502)
            name, arguments = tool_call.get("name"), tool_call.get("arguments")
            if name not in allowed_tools:
                raise ClaudeCodeCliError(f"Claude Code requested tool `{name}` not offered by Hermes.", 502)
            if not isinstance(arguments, dict):
                raise ClaudeCodeCliError("Claude Code returned non-object tool arguments.", 502)
            openai_tool_calls.append(
                {
                    "id": f"call_{uuid.uuid4().hex}",
                    "type": "function",
                    "function": {"name": name, "arguments": json.dumps(arguments, ensure_ascii=False)},
                }
            )

        message: dict[str, Any] = {"role": "assistant", "content": content or None}
        if openai_tool_calls:
            message["tool_calls"] = openai_tool_calls
        return {
            "id": f"chatcmpl-{uuid.uuid4().hex}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": requested_model,
            "choices": [
                {
                    "index": 0,
                    "message": message,
                    "finish_reason": "tool_calls" if openai_tool_calls else "stop",
                }
            ],
        }
