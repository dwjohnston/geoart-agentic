#!/usr/bin/env bash
set -euo pipefail

HEADLESS_SYSTEM_PROMPT="You are running in headless (non-interactive) mode via the project's bun claude script. Follow the headless agent instructions in CLAUDE.md exactly."

claude -p "$*" --append-system-prompt "$HEADLESS_SYSTEM_PROMPT"
