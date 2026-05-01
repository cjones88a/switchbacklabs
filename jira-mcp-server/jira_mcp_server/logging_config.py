"""Centralized logging: stderr only, never stdout (MCP STDIO uses stdout)."""

from __future__ import annotations

import logging
import sys


def configure_logging(level: int = logging.INFO) -> None:
    """Attach a single stderr handler; idempotent if root already configured."""
    root = logging.getLogger()
    if root.handlers:
        return
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s"),
    )
    root.addHandler(handler)
    root.setLevel(level)
