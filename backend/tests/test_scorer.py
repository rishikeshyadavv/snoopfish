from app.models import TinyFishAuditOutput, calculate_trust_score


def test_scorer_fresh_unverified_domain():
    """Fresh domain (< 30 days) + unverified status must produce score < 40."""
    audit = TinyFishAuditOutput(
        target_name="Suspicious Crypto Scheme",
        domain_age_days=12,
        registration_verified=False,
        registered_directors=[],
        risk_flags=["Brand new domain", "Anonymous registrar"],
        summary="Newly created domain with no legal registration."
    )
    # Calculation: 100 - 40 (age < 30) - 35 (unverified) - 20 (2 flags * 10) = 5
    report = calculate_trust_score(audit)
    assert report.trust_score < 40
    assert report.risk_tier == "SEVERE_DANGER"
    assert report.risk_color == "red"


def test_scorer_verified_aged_domain():
    """Verified domain (> 365 days) with 0 risk flags must produce score >= 85."""
    audit = TinyFishAuditOutput(
        target_name="Acme Corporation",
        domain_age_days=1250,
        registration_verified=True,
        registered_directors=["Jane Doe", "John Smith"],
        risk_flags=[],
        summary="Legitimate established enterprise."
    )
    # Calculation: 100 - 0 = 100
    report = calculate_trust_score(audit)
    assert report.trust_score >= 85
    assert report.risk_tier == "LOW_RISK"
    assert report.risk_color == "green"


def test_scorer_clamped_bounds():
    """Score must strictly clamp between 0 and 100 under extreme penalty inputs."""
    # Extreme penalties
    audit_worst = TinyFishAuditOutput(
        target_name="Malicious Phishing Portal",
        domain_age_days=2,
        registration_verified=False,
        registered_directors=[],
        risk_flags=["Malware detected", "Phishing report", "Fake address", "Blacklisted IP"],
        summary="Hostile entity."
    )
    report_worst = calculate_trust_score(audit_worst)
    assert report_worst.trust_score >= 0
    assert report_worst.trust_score <= 100

    # Max score
    audit_best = TinyFishAuditOutput(
        target_name="Google LLC",
        domain_age_days=9000,
        registration_verified=True,
        registered_directors=["Sundar Pichai"],
        risk_flags=[],
        summary="Major global corporation."
    )
    report_best = calculate_trust_score(audit_best)
    assert report_best.trust_score == 100


def test_scorer_moderate_risk():
    """Test 50-79 score range produces MODERATE_CAUTION."""
    audit = TinyFishAuditOutput(
        target_name="Startup Co",
        domain_age_days=60,  # -20
        registration_verified=True,  # 0
        risk_flags=["Limited company filings"],  # -10
        summary="Recent startup with valid registry."
    )
    # Score: 100 - 20 - 10 = 70
    report = calculate_trust_score(audit)
    assert report.trust_score == 70
    assert report.risk_tier == "MODERATE_CAUTION"
    assert report.risk_color == "orange"
