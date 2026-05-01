"""CLI entrypoint: validate config, configure logging, run FastMCP (stdio or HTTP)."""

from __future__ import annotations

import argparse
import logging
import sys

from jira_mcp_server.config import Settings
from jira_mcp_server.logging_config import configure_logging

logger = logging.getLogger(__name__)


def main() -> None:
    """
    Run the Jira MCP server.

    STDIO transport is the default and is appropriate for Claude Desktop, Cursor, and other
    local MCP hosts. HTTP transport exposes the Streamable HTTP endpoint for remote clients.
    """
    parser = argparse.ArgumentParser(
        description="Jira MCP Server (FastMCP). Logs go to stderr only.",
    )
    parser.add_argument(
        "--transport",
        choices=("stdio", "http"),
        default="stdio",
        help="MCP transport: stdio (default) or http (Streamable HTTP).",
    )
    parser.add_argument(
        "--host",
        default=None,
        help="HTTP host (default: JIRA_MCP_HTTP_HOST or 127.0.0.1).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=None,
        help="HTTP port (default: JIRA_MCP_HTTP_PORT or 8765).",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=("DEBUG", "INFO", "WARNING", "ERROR"),
        help="Server log level on stderr.",
    )
    args = parser.parse_args()

    configure_logging(getattr(logging, args.log_level))

    try:
        settings = Settings.from_env()
    except ValueError as exc:
        logger.error("%s", exc)
        sys.exit(1)

    # Import after env is validated so tool modules can safely build the Jira client.
    from jira_mcp_server.server import mcp

    if args.transport == "http":
        host = args.host or settings.http_host
        port = int(args.port) if args.port is not None else settings.http_port
        logger.info("Starting Jira MCP over HTTP on %s:%s (MCP path /mcp)", host, port)
        mcp.run(transport="http", host=host, port=port)
    else:
        logger.debug("Starting Jira MCP over STDIO")
        mcp.run()
