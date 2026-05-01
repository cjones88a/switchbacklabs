"""FastMCP server exposing Jira tools for LLM clients."""

from __future__ import annotations

import logging
from typing import Any

from fastmcp import FastMCP

from jira_mcp_server.config import Settings
from jira_mcp_server.jira_client import (
    JiraAPIError,
    JiraClient,
    blocking_info,
    is_done,
    issue_points,
)

logger = logging.getLogger(__name__)

mcp = FastMCP(
    "jira-mcp-server",
    instructions=(
        "Jira Cloud tools: inspect sprints, backlog, velocity, blockers, and create issues. "
        "Always use a valid Jira project key (short code, e.g. PROJ). "
        "Prefer get_current_sprint and get_backlog_issues before creating work."
    ),
)

_jira: JiraClient | None = None


def get_jira() -> JiraClient:
    """Lazily construct a single Jira client per process."""
    global _jira
    if _jira is None:
        _jira = JiraClient(Settings.from_env())
    return _jira


def _tool_error(exc: Exception) -> dict[str, Any]:
    if isinstance(exc, JiraAPIError):
        return {"ok": False, "error": str(exc)}
    if isinstance(exc, ValueError):
        return {"ok": False, "error": str(exc)}
    logger.exception("Unexpected error in Jira MCP tool")
    return {
        "ok": False,
        "error": "Unexpected server error. Check logs on stderr.",
        "type": type(exc).__name__,
    }


def _get_current_sprint_impl(client: JiraClient, key: str) -> dict[str, Any]:
    board_id = client.get_primary_scrum_board_id(key)
    sprint = client.get_active_sprint(board_id)
    if not sprint:
        return {
            "ok": True,
            "project_key": key,
            "board_id": board_id,
            "active_sprint": None,
            "message": "No active sprint on this board (team may be between sprints).",
        }

    sprint_id = sprint.get("id")
    if not isinstance(sprint_id, int):
        raise JiraAPIError("Active sprint response missing numeric id.")

    issues = client.get_sprint_issues(sprint_id, max_results=200)
    sp_field = client.get_story_points_field_id()
    total = len(issues)
    done_n = sum(1 for i in issues if is_done(i))
    total_points = 0.0
    done_points = 0.0
    if sp_field:
        for i in issues:
            p = issue_points(i, sp_field)
            if p is not None:
                total_points += p
                if is_done(i):
                    done_points += p

    if total_points > 0:
        progress_pct = round(100.0 * done_points / total_points, 1)
        progress_basis = "story_points"
    elif total > 0:
        progress_pct = round(100.0 * done_n / total, 1)
        progress_basis = "issue_count"
    else:
        progress_pct = 0.0
        progress_basis = "none"

    return {
        "ok": True,
        "project_key": key,
        "board_id": board_id,
        "active_sprint": {
            "id": sprint_id,
            "name": sprint.get("name"),
            "state": sprint.get("state"),
            "goal": sprint.get("goal"),
            "start_date": sprint.get("startDate"),
            "end_date": sprint.get("endDate"),
        },
        "metrics": {
            "issues_in_sprint": total,
            "issues_done": done_n,
            "story_points_total": total_points or None,
            "story_points_done": done_points or None,
            "progress_percent": progress_pct,
            "progress_basis": progress_basis,
        },
    }


def _get_backlog_impl(client: JiraClient, key: str, max_results: int) -> dict[str, Any]:
    cap = max(1, min(int(max_results), 100))
    board_id = client.get_primary_scrum_board_id(key)
    raw = client.get_backlog_issues(board_id, max_results=cap)
    sp_field = client.get_story_points_field_id()
    issues: list[dict[str, Any]] = []
    for issue in raw:
        fields = issue.get("fields") or {}
        if not isinstance(fields, dict):
            continue
        assignee = fields.get("assignee") or {}
        display = assignee.get("displayName") if isinstance(assignee, dict) else None
        issues.append(
            {
                "key": issue.get("key"),
                "summary": fields.get("summary"),
                "status": (fields.get("status") or {}).get("name"),
                "issue_type": (fields.get("issuetype") or {}).get("name"),
                "priority": (fields.get("priority") or {}).get("name"),
                "labels": fields.get("labels") or [],
                "assignee": display,
                "story_points": issue_points(issue, sp_field),
            },
        )
    return {"ok": True, "project_key": key, "board_id": board_id, "issues": issues}


def _find_blocked_impl(client: JiraClient, key: str) -> dict[str, Any]:
    jql = f'project = {key} AND statusCategory != "Done" ORDER BY updated DESC'
    raw = client.search_issues_simple(
        jql,
        max_results=80,
        fields=["summary", "status", "issuetype", "issuelinks", "priority"],
    )
    out: list[dict[str, Any]] = []
    for issue in raw:
        blocked, reason = blocking_info(issue)
        if not blocked:
            continue
        fields = issue.get("fields") or {}
        out.append(
            {
                "key": issue.get("key"),
                "summary": fields.get("summary") if isinstance(fields, dict) else None,
                "status": (fields.get("status") or {}).get("name")
                if isinstance(fields, dict)
                else None,
                "priority": (fields.get("priority") or {}).get("name")
                if isinstance(fields, dict)
                else None,
                "blocking_reason": reason,
            },
        )
    return {"ok": True, "project_key": key, "issues": out, "count": len(out)}


def _get_team_velocity_impl(
    client: JiraClient,
    key: str,
    last_n_sprints: int,
) -> dict[str, Any]:
    n = max(1, min(int(last_n_sprints), 12))
    board_id = client.get_primary_scrum_board_id(key)
    closed = client.list_closed_sprints(board_id, max_results=n + 5)[:n]
    sp_field = client.get_story_points_field_id()
    series: list[dict[str, Any]] = []

    for sp in reversed(closed):
        sid = sp.get("id")
        if not isinstance(sid, int):
            continue
        issues = client.get_sprint_issues(sid, max_results=300, fields=None)
        done_issues = [i for i in issues if is_done(i)]
        points = 0.0
        if sp_field:
            for i in done_issues:
                p = issue_points(i, sp_field)
                if p is not None:
                    points += p
        metric_value = points if sp_field and points > 0 else float(len(done_issues))
        basis = "story_points" if sp_field and points > 0 else "done_issue_count"
        series.append(
            {
                "sprint_id": sid,
                "name": sp.get("name"),
                "complete_date": sp.get("completeDate") or sp.get("endDate"),
                "completed_issues": len(done_issues),
                "velocity": round(metric_value, 2),
                "velocity_basis": basis,
            },
        )

    trend = "flat"
    if len(series) >= 2:
        a = series[-2]["velocity"]
        b = series[-1]["velocity"]
        if b > a * 1.05:
            trend = "increasing"
        elif b < a * 0.95:
            trend = "declining"

    return {
        "ok": True,
        "project_key": key,
        "board_id": board_id,
        "last_n_sprints": n,
        "sprints": series,
        "trend": trend,
    }


@mcp.tool
def get_current_sprint(project_key: str) -> dict[str, Any]:
    """
    Return the active sprint for the project's primary Scrum board.

    Includes sprint metadata (name, goal, start/end when available), issue counts,
    optional story-point progress, and a coarse completion percentage.

    Args:
        project_key: Jira project key, e.g. ``PROJ`` (not the numeric id).

    Returns:
        A structured dict with ``ok`` and sprint metrics, or ``ok: false`` with ``error``.
    """
    try:
        client = get_jira()
        key = project_key.strip().upper()
        return _get_current_sprint_impl(client, key)
    except Exception as exc:  # noqa: BLE001 — surfaced to client
        return _tool_error(exc)


@mcp.tool
def get_backlog_issues(project_key: str, max_results: int = 15) -> dict[str, Any]:
    """
    Return the board backlog for the project in backlog ranking order.

    Each item includes key, summary, status, type, priority, labels, assignee,
    and story points when the Story Points field is available.

    Args:
        project_key: Jira project key.
        max_results: Maximum issues to return (default 15, max practical fetch 100).

    Returns:
        Dict with ``issues`` list or ``error``.
    """
    try:
        client = get_jira()
        key = project_key.strip().upper()
        return _get_backlog_impl(client, key, max_results)
    except Exception as exc:
        return _tool_error(exc)


@mcp.tool
def create_jira_task(
    summary: str,
    project_key: str,
    description: str | None = None,
    issue_type: str = "Story",
    assignee: str | None = None,
    story_points: float | None = None,
    labels: list[str] | None = None,
) -> dict[str, Any]:
    """
    Create a new Jira issue in the given project.

    Uses Jira REST ``/rest/api/3/issue``. Description is stored as Atlassian Document Format (ADF).

    Args:
        summary: Short title of the issue (required).
        description: Optional plain-text body; converted to a single ADF paragraph when provided.
        project_key: Target project key.
        issue_type: Jira issue type name as configured in the project (e.g. Story, Task, Bug).
        assignee: Optional ``accountId``, or an email address (resolved via user search).
        story_points: Numeric points when a Story Points custom field exists.
        labels: Optional list of label strings.

    Returns:
        Created issue ``key`` and ``id``, or ``error`` with a actionable message.
    """
    try:
        client = get_jira()
        key = project_key.strip().upper()
        created = client.create_issue(
            summary=summary.strip(),
            description=description.strip() if description and description.strip() else None,
            project_key=key,
            issue_type=issue_type.strip(),
            assignee=assignee.strip() if assignee else None,
            story_points=story_points,
            labels=[x.strip() for x in labels if x.strip()] if labels else None,
        )
        return {
            "ok": True,
            "key": created.get("key"),
            "id": created.get("id"),
            "self": created.get("self"),
        }
    except Exception as exc:
        return _tool_error(exc)


@mcp.tool
def summarize_project(project_key: str) -> dict[str, Any]:
    """
    Build a concise program-level snapshot for product and engineering review.

    Aggregates: project name/description, open issue load, blockers, in-progress vs todo,
    active sprint health (if any), recent velocity, and explicit risks/recommendations.

    Args:
        project_key: Jira project key.

    Returns:
        Nested dict suitable for LLM synthesis into a status report.
    """
    try:
        client = get_jira()
        key = project_key.strip().upper()
        proj = client.get_project(key)

        jql_todo = f'project = {key} AND statusCategory = "To Do"'
        jql_prog = f'project = {key} AND statusCategory = "In Progress"'
        todo_sample = client.search_issues_simple(jql_todo, max_results=50, fields=["summary"])
        prog_sample = client.search_issues_simple(jql_prog, max_results=50, fields=["summary"])

        jql_total = f"project = {key}"
        search_all = client.search_jql(jql_total, max_results=1, fields=["summary"])
        total_hint = search_all.get("total")
        if not isinstance(total_hint, int):
            total_hint = None

        blocked_result = _find_blocked_impl(client, key)
        blocked_issues = blocked_result.get("issues") or []

        sprint_tool = _get_current_sprint_impl(client, key)
        velocity_tool = _get_team_velocity_impl(client, key, 3)

        risks: list[str] = []
        if len(blocked_issues) > 3:
            risks.append(f"Multiple blocked issues ({len(blocked_issues)}); review dependencies.")
        m = (sprint_tool.get("metrics") or {}).get("progress_percent")
        if isinstance(m, (int, float)) and m < 25 and sprint_tool.get("active_sprint"):
            risks.append("Low sprint completion ratio mid-flight; scope or capacity risk.")
        if velocity_tool.get("trend") == "declining":
            risks.append("Velocity declining over recent sprints; check scope creep or interrupts.")

        recommendations: list[str] = []
        if blocked_issues:
            recommendations.append("Run a short blocker review: resolve or escalate top blocked items.")
        if not sprint_tool.get("active_sprint"):
            recommendations.append("No active sprint: align backlog and sprint boundaries with the team.")
        recommendations.append("Validate top backlog items have clear acceptance criteria and owners.")

        return {
            "ok": True,
            "project_key": key,
            "project": {
                "name": proj.get("name"),
                "project_type_key": proj.get("projectTypeKey"),
                "lead": (proj.get("lead") or {}).get("displayName")
                if isinstance(proj.get("lead"), dict)
                else None,
            },
            "counts": {
                "open_issues_reported_total": total_hint,
                "todo_sample_size": len(todo_sample),
                "in_progress_sample_size": len(prog_sample),
            },
            "active_sprint_summary": sprint_tool,
            "velocity_summary": velocity_tool,
            "blocked": {
                "count": len(blocked_issues),
                "sample": blocked_issues[:5],
            },
            "risks": risks,
            "recommendations": recommendations,
        }
    except Exception as exc:
        return _tool_error(exc)


@mcp.tool
def find_blocked_issues(project_key: str) -> dict[str, Any]:
    """
    List non-done issues that appear blocked via issue links.

    Detects inward links such as ``is blocked by`` / types containing ``block``.
    When present, includes a short human-readable blocking reason.

    Args:
        project_key: Jira project key.

    Returns:
        ``issues`` with ``key``, ``summary``, ``status``, ``blocking_reason``.
    """
    try:
        client = get_jira()
        key = project_key.strip().upper()
        return _find_blocked_impl(client, key)
    except Exception as exc:
        return _tool_error(exc)


@mcp.tool
def get_team_velocity(project_key: str, last_n_sprints: int = 3) -> dict[str, Any]:
    """
    Approximate team velocity from the last N *closed* sprints on the primary board.

    For each closed sprint, sums story points (when configured) for issues in the ``Done``
    status category within that sprint's issue set. If story points are unavailable,
    falls back to counting completed issues.

    Args:
        project_key: Jira project key.
        last_n_sprints: Number of recent closed sprints to include (default 3).

    Returns:
        Per-sprint breakdown and a simple ``trend`` label: ``increasing``, ``declining``,
        or ``flat`` based on linear comparison of the last two data points.
    """
    try:
        client = get_jira()
        key = project_key.strip().upper()
        return _get_team_velocity_impl(client, key, last_n_sprints)
    except Exception as exc:
        return _tool_error(exc)
