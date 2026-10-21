import asyncio
from typing import AsyncGenerator, Dict, Any, Optional
from app.models import TinyFishAuditOutput, calculate_trust_score

DEMO_TARGETS = {
    "apex": {
        "name": "Apex Global Logistics",
        "url": "https://apex-globlogistics-track.live",
        "streaming_url": "/demo-feed/apex",
        "domain_age_days": 11,
        "registration_verified": False,
        "registered_directors": [],
        "risk_flags": [
            "Domain registered 11 days ago via anonymous privacy guard in Iceland",
            "Zero matching corporate CIN or GST registrations found in MCA database",
            "Multiple reports on Reddit r/Scams regarding advance freight fee requests",
            "Cloned HTML layout matching legitimate courier portals with spoofed WhatsApp contact"
        ],
        "summary": (
            "CRITICAL ALERT: Apex Global Logistics displays predatory indicators of an advance-fee courier scam. "
            "The domain was registered only 11 days ago under an anonymous privacy shield. Corporate registry "
            "queries in India, the UK, and US returned no legitimate entities under this trading name. "
            "Multiple consumer threads report victims being prompted for fake customs clearance fees."
        )
    },
    "infosys": {
        "name": "Infosys Technologies Ltd",
        "url": "https://www.infosys.com",
        "streaming_url": "/demo-feed/infosys",
        "domain_age_days": 9480,
        "registration_verified": True,
        "registered_directors": [
            "Salil Parekh (MD & CEO)",
            "Nandan Nilekani (Co-Founder & Chairman)",
            "Jayesh Sanghrajka (CFO)"
        ],
        "risk_flags": [],
        "summary": (
            "HIGH CONFIDENCE: Verified Tier-1 publicly listed enterprise (BSE: 500209, NSE: INFY). "
            "The domain infosys.com has been continuously registered for over 25 years. Active Ministry of "
            "Corporate Affairs (MCA) filings confirm valid CIN L85110KA1981PLC013115 with accredited board "
            "members and clear regulatory history."
        )
    }
}


async def stream_demo_audit(
    target_name: str,
    target_url: Optional[str] = None
) -> AsyncGenerator[Dict[str, Any], None]:
    """Simulate a realistic timed SSE investigation stream for offline demo pitches."""
    lower_target = target_name.lower()
    if "info" in lower_target:
        profile = DEMO_TARGETS["infosys"]
    else:
        profile = DEMO_TARGETS["apex"]

    resolved_name = target_name if target_name.strip() else profile["name"]
    resolved_url = target_url or profile["url"]

    yield {
        "event": "status",
        "data": {
            "message": f"Dispatching SnoopFish autonomous agent to inspect '{resolved_name}'...",
            "target_name": resolved_name,
            "target_url": resolved_url,
            "mode": "demo_fallback"
        }
    }
    await asyncio.sleep(0.3)

    # 1. Stream the remote browser URL
    yield {
        "event": "streaming_url",
        "data": {
            "url": profile["streaming_url"]
        }
    }
    await asyncio.sleep(0.4)

    # 2. DNS & Domain inspection
    yield {
        "event": "progress",
        "data": {
            "action": "WHOIS & DNS Inspection",
            "message": (
                f"Querying global registrar for {resolved_url} (Domain age: {profile['domain_age_days']} days)..."
            ),
            "step": 1
        }
    }
    await asyncio.sleep(0.5)

    # 3. Corporate Registry Search
    yield {
        "event": "progress",
        "data": {
            "action": "MCA / Corporate Registry Query",
            "message": "Querying Ministry of Corporate Affairs, SEC, and public director databases...",
            "step": 2
        }
    }
    await asyncio.sleep(0.5)

    # 4. Scam & Negative Sentiment Scan
    yield {
        "event": "progress",
        "data": {
            "action": "Forum & Threat Intelligence Scan",
            "message": "Scouring BBB, Trustpilot, Reddit fraud archives, and blacklist databases...",
            "step": 3
        }
    }
    await asyncio.sleep(0.5)

    # 5. Build and emit final result
    audit_output = TinyFishAuditOutput(
        target_name=resolved_name,
        domain_age_days=profile["domain_age_days"],
        registration_verified=profile["registration_verified"],
        registered_directors=profile["registered_directors"],
        risk_flags=profile["risk_flags"],
        summary=profile["summary"]
    )
    score_report = calculate_trust_score(audit_output)

    yield {
        "event": "result",
        "data": score_report.model_dump()
    }
    await asyncio.sleep(0.2)

    yield {
        "event": "status",
        "data": {
            "message": "Audit execution complete. Forensic report compiled.",
            "streaming_url": profile["streaming_url"]
        }
    }
