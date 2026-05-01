"""Typed Jira Cloud REST / Agile API client (httpx, basic auth)."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from jira_mcp_server.config import Settings

logger = logging.getLogger(__name__)


class JiraAPIError(Exception):
    """Raised when Jira returns an error response or the payload is unexpected."""

    def __init__(self, message: str, *, status_code: int | None = None, body: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.body = body


class JiraClient:
    """Minimal Jira Cloud client for agile boards, sprints, search, and issue create."""

    def __init__(self, settings: Settings):
        self._settings = settings
        self._auth = (settings.jira_email, settings.jira_api_token)
        self._base = settings.jira_url.rstrip("/")
        self._story_points_field_id: str | None = settings.story_points_field_id
        self._client = httpx.Client(
            base_url=self._base,
            auth=self._auth,
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=httpx.Timeout(60.0),
        )

    def close(self) -> None:
        self._client.close()

    def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | None = None,
    ) -> Any:
        url = path if path.startswith("/") else f"/{path}"
        try:
            r = self._client.request(method, url, params=params, json=json)
        except httpx.RequestError as exc:
            raise JiraAPIError(
                f"Network error talking to Jira ({self._base}): {exc}",
            ) from exc

        if r.status_code >= 400:
            raise JiraAPIError(
                _friendly_http_error(r.status_code, r.text),
                status_code=r.status_code,
                body=r.text,
            )

        if not r.content:
            return None
        ctype = r.headers.get("content-type", "")
        if "application/json" in ctype:
            return r.json()
        return r.text

    def get_story_points_field_id(self) -> str | None:
        """Resolve Story Points custom field id once and cache."""
        if self._story_points_field_id:
            return self._story_points_field_id
        fields = self._request("GET", "/rest/api/3/field")
        if not isinstance(fields, list):
            return None
        for f in fields:
            name = (f.get("name") or "").lower()
            if "story point" in name or name == "story points":
                cid = f.get("id")
                if isinstance(cid, str):
                    self._story_points_field_id = cid
                    logger.info("Detected story points field: %s", cid)
                    return cid
        return None

    def get_project(self, project_key: str) -> dict[str, Any]:
        data = self._request("GET", f"/rest/api/3/project/{project_key}")
        if not isinstance(data, dict):
            raise JiraAPIError("Unexpected project response from Jira.")
        return data

    def list_boards_for_project(self, project_key: str) -> list[dict[str, Any]]:
        data = self._request(
            "GET",
            "/rest/agile/1.0/board",
            params={"projectKeyOrId": project_key},
        )
        values = (data or {}).get("values") or []
        if not isinstance(values, list):
            return []
        return [v for v in values if isinstance(v, dict)]

    def get_primary_scrum_board_id(self, project_key: str) -> int:
        boards = self.list_boards_for_project(project_key)
        for b in boards:
            if b.get("type") == "scrum":
                bid = b.get("id")
                if isinstance(bid, int):
                    return bid
        if boards:
            bid = boards[0].get("id")
            if isinstance(bid, int):
                logger.warning(
                    "No scrum board for %s; using first board id=%s type=%s",
                    project_key,
                    bid,
                    boards[0].get("type"),
                )
                return bid
        raise JiraAPIError(
            f"No Jira board found for project {project_key!r}. "
            "Create a board or check the project key.",
        )

    def get_active_sprint(self, board_id: int) -> dict[str, Any] | None:
        data = self._request(
            "GET",
            f"/rest/agile/1.0/board/{board_id}/sprint",
            params={"state": "active"},
        )
        values = (data or {}).get("values") or []
        if not values:
            return None
        first = values[0]
        return first if isinstance(first, dict) else None

    def get_sprint_issues(
        self,
        sprint_id: int,
        *,
        max_results: int = 100,
        fields: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        field_list = fields or [
            "summary",
            "status",
            "issuetype",
            "assignee",
            "priority",
            "labels",
        ]
        sp_id = self.get_story_points_field_id()
        if sp_id and sp_id not in field_list:
            field_list = [*field_list, sp_id]

        out: list[dict[str, Any]] = []
        start_at = 0
        while True:
            data = self._request(
                "GET",
                f"/rest/agile/1.0/sprint/{sprint_id}/issue",
                params={
                    "startAt": start_at,
                    "maxResults": min(100, max_results - len(out)),
                    "fields": ",".join(field_list),
                },
            )
            issues = (data or {}).get("issues") or []
            if not isinstance(issues, list):
                break
            for issue in issues:
                if isinstance(issue, dict):
                    out.append(issue)
            total = (data or {}).get("total")
            start_at = (data or {}).get("startAt", 0) + len(issues)
            if not issues or (isinstance(total, int) and start_at >= total):
                break
            if len(out) >= max_results:
                break
        return out[:max_results]

    def get_backlog_issues(
        self,
        board_id: int,
        *,
        max_results: int = 15,
    ) -> list[dict[str, Any]]:
        fields = [
            "summary",
            "status",
            "issuetype",
            "priority",
            "labels",
            "assignee",
        ]
        sp_id = self.get_story_points_field_id()
        if sp_id:
            fields.append(sp_id)

        data = self._request(
            "GET",
            f"/rest/agile/1.0/board/{board_id}/backlog",
            params={
                "maxResults": max_results,
                "fields": ",".join(fields),
            },
        )
        issues = (data or {}).get("issues") or []
        if not isinstance(issues, list):
            return []
        return [i for i in issues if isinstance(i, dict)]

    def search_jql(
        self,
        jql: str,
        *,
        max_results: int = 50,
        fields: list[str] | None = None,
        next_page_token: str | None = None,
    ) -> dict[str, Any]:
        """Run JQL via GET /rest/api/3/search/jql (current Jira Cloud API)."""
        field_list = fields or [
            "summary",
            "status",
            "issuetype",
            "priority",
            "labels",
            "assignee",
            "created",
            "updated",
            "issuelinks",
            "description",
        ]
        params: dict[str, Any] = {
            "jql": jql,
            "maxResults": max_results,
            "fields": ",".join(field_list),
        }
        if next_page_token:
            params["nextPageToken"] = next_page_token
        return self._request("GET", "/rest/api/3/search/jql", params=params) or {}

    def search_issues_simple(
        self,
        jql: str,
        *,
        max_results: int = 50,
        fields: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Jira Cloud search/jql returns { issues: [...], isLast: bool, ... }."""
        data = self.search_jql(jql, max_results=max_results, fields=fields)
        issues = data.get("issues") or []
        if not isinstance(issues, list):
            return []
        return [i for i in issues if isinstance(i, dict)]

    def find_user_account_id(self, query: str) -> str | None:
        if not query or "@" not in query:
            return None
        users = self._request(
            "GET",
            "/rest/api/3/user/search",
            params={"query": query, "maxResults": 5},
        )
        if not isinstance(users, list) or not users:
            return None
        first = users[0]
        if isinstance(first, dict):
            aid = first.get("accountId")
            return aid if isinstance(aid, str) else None
        return None

    def create_issue(
        self,
        *,
        summary: str,
        description: str | None,
        project_key: str,
        issue_type: str,
        assignee: str | None,
        story_points: float | None,
        labels: list[str] | None,
    ) -> dict[str, Any]:
        fields: dict[str, Any] = {
            "project": {"key": project_key},
            "summary": summary,
            "issuetype": {"name": issue_type},
        }
        if description:
            fields["description"] = {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": description}],
                    },
                ],
            }
        if labels:
            fields["labels"] = labels

        if assignee:
            aid = assignee
            if "@" in assignee:
                resolved = self.find_user_account_id(assignee)
                if not resolved:
                    raise JiraAPIError(
                        f"Could not resolve assignee email {assignee!r} to a Jira accountId.",
                    )
                aid = resolved
            fields["assignee"] = {"accountId": aid}

        body: dict[str, Any] = {"fields": fields}
        if story_points is not None:
            sp_field = self.get_story_points_field_id()
            if not sp_field:
                raise JiraAPIError(
                    "Story points were set but no Story Points custom field was found. "
                    "Set JIRA_STORY_POINTS_FIELD_ID or ensure the field exists on the project.",
                )
            body["fields"][sp_field] = story_points

        return self._request("POST", "/rest/api/3/issue", json=body) or {}

    def list_closed_sprints(self, board_id: int, *, max_results: int = 30) -> list[dict[str, Any]]:
        data = self._request(
            "GET",
            f"/rest/agile/1.0/board/{board_id}/sprint",
            params={"state": "closed", "maxResults": max_results},
        )
        values = (data or {}).get("values") or []
        if not isinstance(values, list):
            return []
        closed = [v for v in values if isinstance(v, dict)]
        closed.sort(key=lambda s: s.get("completeDate") or s.get("endDate") or "", reverse=True)
        return closed


def _friendly_http_error(status: int, body: str) -> str:
    snippet = (body or "").strip().replace("\n", " ")
    if len(snippet) > 400:
        snippet = snippet[:400] + "…"
    if status == 401:
        return (
            "Jira returned 401 Unauthorized. Check JIRA_EMAIL and JIRA_API_TOKEN "
            f"and that the token is active. Details: {snippet}"
        )
    if status == 403:
        return (
            "Jira returned 403 Forbidden. The user may lack browse/create permissions "
            f"for the project. Details: {snippet}"
        )
    if status == 404:
        return f"Jira returned 404 Not Found. Check JIRA_URL and resource IDs. Details: {snippet}"
    return f"Jira HTTP {status}. Details: {snippet}"


def issue_points(issue: dict[str, Any], sp_field: str | None) -> float | None:
    if not sp_field:
        return None
    fields = issue.get("fields") or {}
    if not isinstance(fields, dict):
        return None
    raw = fields.get(sp_field)
    if raw is None:
        return None
    try:
        return float(raw)
    except (TypeError, ValueError):
        return None


def is_done(issue: dict[str, Any]) -> bool:
    fields = issue.get("fields") or {}
    if not isinstance(fields, dict):
        return False
    status = fields.get("status") or {}
    if not isinstance(status, dict):
        return False
    cat = status.get("statusCategory") or {}
    if isinstance(cat, dict) and cat.get("key") == "done":
        return True
    return False


def blocking_info(issue: dict[str, Any]) -> tuple[bool, str | None]:
    """
    Return (is_blocked, reason).

    Uses issue links: inward 'is blocked by' / names containing 'block'.
    """
    fields = issue.get("fields") or {}
    if not isinstance(fields, dict):
        return False, None
    links = fields.get("issuelinks") or []
    if not isinstance(links, list):
        return False, None

    reasons: list[str] = []
    for link in links:
        if not isinstance(link, dict):
            continue
        itype = link.get("type") or {}
        inward = (itype.get("inward") or "").lower()
        outward = (itype.get("outward") or "").lower()
        name = (itype.get("name") or "").lower()

        inward_issue = link.get("inwardIssue")
        outward_issue = link.get("outwardIssue")

        blocked_by_inward = inward_issue if "block" in inward else None
        if blocked_by_inward and isinstance(blocked_by_inward, dict):
            key = blocked_by_inward.get("key")
            summ = (blocked_by_inward.get("fields") or {}).get("summary")
            if isinstance(summ, dict):
                summ = None
            if key:
                reasons.append(f"Blocked by {key}" + (f": {summ}" if summ else ""))

        if "block" in name or "block" in inward or "block" in outward:
            if not reasons and (inward_issue or outward_issue):
                other = inward_issue or outward_issue
                if isinstance(other, dict) and other.get("key"):
                    reasons.append(f"Link ({name or inward or outward}): {other.get('key')}")

    if reasons:
        return True, "; ".join(dict.fromkeys(reasons))
    return False, None
