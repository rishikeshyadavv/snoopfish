import json
import logging
from typing import AsyncGenerator, Optional, Dict, Any
import httpx

from app.config import settings
from app.models import (
    TinyFishAuditOutput,
    calculate_trust_score,
    TINYFISH_OUTPUT_SCHEMA
)

logger = logging.getLogger("verifylens.tinyfish")


class TinyFishClient:
    """Async client wrapper for TinyFish Web Agent API (/v1/automation/run-sse)."""

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or settings.TINYFISH_API_KEY
        self.base_url = base_url or settings.TINYFISH_API_URL

    def build_goal_prompt(self, target_name: str, target_url: Optional[str] = None) -> str:
        url_context = f" Target URL: {target_url}." if target_url else ""
        return (
            f"Perform a rapid, focused forensic background audit on '{target_name}'.{url_context} "
            f"EXECUTION LIMITS: Strictly limit your session to a maximum of 3 direct queries and no more "
            f"than 4 page navigations: "
            f"1. Query domain creation date and registrar via WHOIS tools to calculate domain_age_days. "
            f"2. Check official corporate registration status (CIN, legal status) on public registry portals. "
            f"3. Run a focused fraud/scam keyword search on consumer complaint databases and discussion boards. "
            f"Avoid deeply crawling secondary news links or general blog articles. Synthesize the output JSON "
            f"immediately once primary signals are captured."
        )

    def _headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        }
        if self.api_key:
            headers["X-API-Key"] = self.api_key
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def stream_audit(
        self,
        target_name: str,
        target_url: Optional[str] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream events from TinyFish API. Emits typed event dictionaries:
        - {"event": "status", "data": {"message": ...}}
        - {"event": "streaming_url", "data": {"url": ...}}
        - {"event": "progress", "data": {...}}
        - {"event": "result", "data": <AuditScoreReport dict>}
        - {"event": "error", "data": {"message": ...}}
        """
        if not self.api_key:
            yield {
                "event": "error",
                "data": {
                    "message": "TINYFISH_API_KEY is not configured in backend .env. Please set a valid API key."
                }
            }
            return

        starting_url = target_url if target_url and target_url.startswith("http") else "https://www.whois.com"
        goal = self.build_goal_prompt(target_name, target_url)

        payload = {
            "url": starting_url,
            "goal": goal,
            "output_schema": TINYFISH_OUTPUT_SCHEMA
        }

        yield {
            "event": "status",
            "data": {
                "message": f"Initiating TinyFish autonomous audit for '{target_name}'...",
                "target_name": target_name,
                "target_url": target_url
            }
        }

        captured_streaming_url: Optional[str] = None
        final_audit_raw: Optional[Dict[str, Any]] = None

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(180.0, connect=15.0)) as client:
                async with client.stream(
                    "POST",
                    self.base_url,
                    headers=self._headers(),
                    json=payload
                ) as response:
                    if response.status_code != 200:
                        error_body = await response.aread()
                        decoded_err = error_body.decode(errors='ignore')
                        error_msg = f"TinyFish API returned status {response.status_code}: {decoded_err}"
                        logger.error(error_msg)
                        yield {
                            "event": "error",
                            "data": {"message": error_msg, "status_code": response.status_code}
                        }
                        return

                    current_event_name = "message"
                    data_buffer = []

                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line:
                            if data_buffer:
                                full_data_str = "\n".join(data_buffer)
                                data_buffer = []
                                async for event in self._process_sse_chunk(current_event_name, full_data_str):
                                    if event.get("event") == "streaming_url":
                                        captured_streaming_url = event["data"].get("url")
                                    elif event.get("event") == "result":
                                        final_audit_raw = event["data"]
                                    yield event
                            current_event_name = "message"
                            continue

                        if line.startswith("event:"):
                            current_event_name = line[6:].strip()
                        elif line.startswith("data:"):
                            data_buffer.append(line[5:].strip())

                    # Process any remaining buffer at end of stream
                    if data_buffer:
                        full_data_str = "\n".join(data_buffer)
                        async for event in self._process_sse_chunk(current_event_name, full_data_str):
                            if event.get("event") == "result":
                                final_audit_raw = event["data"]
                            yield event

        except httpx.RequestError as exc:
            logger.exception("Network error connecting to TinyFish API")
            yield {
                "event": "error",
                "data": {"message": f"Network error contacting TinyFish API: {str(exc)}"}
            }
            return
        except Exception as exc:
            logger.exception("Unexpected error in TinyFish streaming client")
            yield {
                "event": "error",
                "data": {"message": f"Unexpected error: {str(exc)}"}
            }
            return

        # If we reached the end and did not yield a calculated result but have final data:
        if final_audit_raw and "trust_score" not in final_audit_raw:
            try:
                validated = TinyFishAuditOutput(**final_audit_raw)
                score_report = calculate_trust_score(validated)
                yield {
                    "event": "result",
                    "data": score_report.model_dump()
                }
            except Exception as e:
                logger.error(f"Failed to parse final audit output: {e}")

        yield {
            "event": "status",
            "data": {
                "message": "Audit execution completed.",
                "streaming_url": captured_streaming_url
            }
        }

    async def _process_sse_chunk(
        self,
        event_name: str,
        data_str: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Parse raw SSE chunks and normalize into typed VerifyLens events."""
        try:
            parsed = json.loads(data_str)
        except Exception:
            yield {
                "event": "progress",
                "data": {"raw": data_str, "type": event_name}
            }
            return

        if not isinstance(parsed, dict):
            yield {"event": "progress", "data": {"value": parsed}}
            return

        # 1. Detect streaming_url
        streaming_url = (
            parsed.get("streaming_url") or
            parsed.get("live_url") or
            parsed.get("browser_url") or
            (parsed.get("data", {}).get("streaming_url") if isinstance(parsed.get("data"), dict) else None)
        )
        if streaming_url:
            yield {
                "event": "streaming_url",
                "data": {"url": streaming_url}
            }

        # 2. Check for intermediate progress / status / thinking logs
        status_msg = parsed.get("message") or parsed.get("status") or parsed.get("thought") or parsed.get("action")
        if status_msg and isinstance(status_msg, str):
            yield {
                "event": "progress",
                "data": {
                    "message": status_msg,
                    "action": parsed.get("action"),
                    "step": parsed.get("step")
                }
            }

        # 3. Check for final result payload matching schema
        # TinyFish may return result in {"result": {...}} or directly in parsed object
        result_candidate = parsed.get("result") or parsed.get("output") or parsed.get("data")
        candidate_to_test = result_candidate if isinstance(result_candidate, dict) else parsed

        if (
            isinstance(candidate_to_test, dict) and
            "target_name" in candidate_to_test and
            ("domain_age_days" in candidate_to_test or "registration_verified" in candidate_to_test)
        ):
            try:
                validated_output = TinyFishAuditOutput(**candidate_to_test)
                report = calculate_trust_score(validated_output)
                yield {
                    "event": "result",
                    "data": report.model_dump()
                }
            except Exception as e:
                logger.warning(f"Extracted result candidate could not be validated: {e}")
                yield {
                    "event": "progress",
                    "data": {"candidate": candidate_to_test}
                }
