from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class AuditRequest(BaseModel):
    """Incoming request to audit an entity or URL."""
    target_name: str = Field(..., description="Target company, recruiter, or entity name", min_length=1)
    target_url: Optional[str] = Field(None, description="Optional target domain or listing URL")
    demo: bool = Field(default=False, description="Enable simulated demo run for offline pitch resilience")


class TinyFishAuditOutput(BaseModel):
    """Structured forensic report parsed from TinyFish execution matching the output schema."""
    target_name: str
    domain_age_days: int = Field(default=0, ge=0)
    registration_verified: bool = False
    registered_directors: List[str] = Field(default_factory=list)
    risk_flags: List[str] = Field(default_factory=list)
    summary: str = ""


class AuditScoreReport(BaseModel):
    """Composite risk score and tier derived from audit output."""
    trust_score: int
    risk_tier: str  # "LOW_RISK", "MODERATE_CAUTION", "SEVERE_DANGER"
    risk_color: str  # "green", "orange", "red"
    deductions: List[Dict[str, Any]] = Field(default_factory=list)
    audit: TinyFishAuditOutput


class AuditStreamEvent(BaseModel):
    """Normalized SSE event payload emitted to the frontend."""
    event_type: str  # "status", "streaming_url", "progress", "result", "error"
    data: Any


def calculate_trust_score(audit: TinyFishAuditOutput) -> AuditScoreReport:
    """
    Calculate composite trust score (0 - 100) per specification:
    Base Score = 100
    - If domain_age_days < 30: Deduct 40 points
    - Else if domain_age_days < 90: Deduct 20 points
    - If registration_verified is False: Deduct 35 points
    - Each risk flag: Deduct 10 points (max deduction 30)
    Clamped strictly between 0 and 100.
    """
    score = 100
    deductions = []

    if audit.domain_age_days < 30:
        deductions.append({"reason": "New domain age (< 30 days)", "points": -40})
        score -= 40
    elif audit.domain_age_days < 90:
        deductions.append({"reason": "Fresh domain age (< 90 days)", "points": -20})
        score -= 20

    if not audit.registration_verified:
        deductions.append({"reason": "Corporate registration unverified", "points": -35})
        score -= 35

    flag_count = len(audit.risk_flags)
    if flag_count > 0:
        flag_deduction = min(flag_count * 10, 30)
        deductions.append({
            "reason": f"{flag_count} risk flag(s) identified (capped at 30 pts)",
            "points": -flag_deduction
        })
        score -= flag_deduction

    score = max(0, min(100, score))

    if score >= 80:
        risk_tier = "LOW_RISK"
        risk_color = "green"
    elif score >= 50:
        risk_tier = "MODERATE_CAUTION"
        risk_color = "orange"
    else:
        risk_tier = "SEVERE_DANGER"
        risk_color = "red"

    return AuditScoreReport(
        trust_score=score,
        risk_tier=risk_tier,
        risk_color=risk_color,
        deductions=deductions,
        audit=audit
    )


TINYFISH_OUTPUT_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "target_name": {"type": "string"},
        "domain_age_days": {"type": "integer"},
        "registration_verified": {"type": "boolean"},
        "registered_directors": {
            "type": "array",
            "items": {"type": "string"}
        },
        "risk_flags": {
            "type": "array",
            "items": {"type": "string"}
        },
        "summary": {"type": "string"}
    },
    "required": [
        "target_name",
        "domain_age_days",
        "registration_verified",
        "risk_flags",
        "summary"
    ]
}
