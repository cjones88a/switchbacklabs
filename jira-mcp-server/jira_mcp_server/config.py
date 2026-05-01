"""Load configuration from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    """Jira and MCP runtime settings."""

    jira_url: str
    jira_email: str
    jira_api_token: str
    story_points_field_id: str | None
    http_host: str
    http_port: int

    @classmethod
    def from_env(cls) -> Settings:
        base = os.environ.get("JIRA_URL", "").strip().rstrip("/")
        email = os.environ.get("JIRA_EMAIL", "").strip()
        token = os.environ.get("JIRA_API_TOKEN", "").strip()
        sp = os.environ.get("JIRA_STORY_POINTS_FIELD_ID", "").strip() or None
        host = os.environ.get("JIRA_MCP_HTTP_HOST", "127.0.0.1").strip()
        port_s = os.environ.get("JIRA_MCP_HTTP_PORT", "8765").strip()
        try:
            port = int(port_s)
        except ValueError as exc:
            raise ValueError(
                f"JIRA_MCP_HTTP_PORT must be an integer, got {port_s!r}",
            ) from exc

        missing = []
        if not base:
            missing.append("JIRA_URL")
        if not email:
            missing.append("JIRA_EMAIL")
        if not token:
            missing.append("JIRA_API_TOKEN")
        if missing:
            raise ValueError(
                "Missing required environment variable(s): "
                + ", ".join(missing)
                + ". Copy .env.example to .env and fill in values.",
            )

        parsed = urlparse(base if "://" in base else f"https://{base}")
        if not parsed.scheme or not parsed.netloc:
            raise ValueError(
                "JIRA_URL must be a full URL like https://yourcompany.atlassian.net",
            )

        return cls(
            jira_url=base,
            jira_email=email,
            jira_api_token=token,
            story_points_field_id=sp,
            http_host=host,
            http_port=port,
        )
