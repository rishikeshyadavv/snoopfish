import json
import logging
from contextlib import asynccontextmanager
from typing import Optional, AsyncGenerator
from fastapi import FastAPI, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.config import settings
from app.models import AuditRequest
from app.db import init_db, save_audit, get_recent_audits
from app.services.tinyfish_client import TinyFishClient
from app.services.demo_data import stream_demo_audit

logger = logging.getLogger("snoopfish.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure SQLite database and tables are created
    try:
        await init_db()
    except Exception as e:
        logger.error(f"Failed to initialize SQLite database: {e}")
    yield


app = FastAPI(
    title="SnoopFish API",
    description="Autonomous Forensic Due-Diligence & Background Auditor powered by TinyFish Web Agent",
    version="1.1.0",
    lifespan=lifespan
)

# Configure CORS
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "ok",
        "service": "snoopfish-backend",
        "environment": settings.ENVIRONMENT,
        "tinyfish_configured": bool(settings.TINYFISH_API_KEY)
    }


@app.get("/api/audits", tags=["Audits"])
async def list_recent_audits(limit: int = Query(10, ge=1, le=50)):
    """Retrieve recent forensic audits saved in SQLite."""
    audits = await get_recent_audits(limit=limit)
    return {"audits": audits, "count": len(audits)}


async def sse_event_generator(
    target_name: str,
    target_url: Optional[str] = None,
    demo: bool = False
) -> AsyncGenerator[str, None]:
    """Yield Server-Sent Events formatted strings and persist completed audit results."""
    if demo:
        generator = stream_demo_audit(target_name=target_name, target_url=target_url)
    else:
        client = TinyFishClient()
        generator = client.stream_audit(target_name=target_name, target_url=target_url)

    async for event in generator:
        event_name = event.get("event", "message")
        data = event.get("data", {})

        # When audit completes with a result payload, persist in SQLite
        if event_name == "result" and isinstance(data, dict):
            try:
                trust_score = data.get("trust_score", 0)
                risk_tier = data.get("risk_tier", "UNKNOWN")
                await save_audit(
                    target_name=target_name,
                    target_url=target_url,
                    score=trust_score,
                    risk_level=risk_tier,
                    report_dict=data
                )
            except Exception as exc:
                logger.error(f"Failed to persist audit to SQLite: {exc}")

        data_json = json.dumps(data)
        yield f"event: {event_name}\ndata: {data_json}\n\n"


@app.post("/api/audit/stream", tags=["Audit"])
async def stream_audit_post(request: AuditRequest):
    """
    Initiate audit stream via POST with JSON body.
    Supports live TinyFish streaming or offline demo simulation mode.
    """
    if not request.target_name.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="target_name cannot be empty."
        )

    return StreamingResponse(
        sse_event_generator(
            target_name=request.target_name.strip(),
            target_url=request.target_url,
            demo=request.demo
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/api/audit/stream", tags=["Audit"])
async def stream_audit_get(
    target_name: str = Query(..., min_length=1, description="Entity or company name to audit"),
    target_url: Optional[str] = Query(None, description="Optional website or job post URL"),
    demo: bool = Query(False, description="Enable simulated demo run for pitch resilience")
):
    """Initiate audit stream via GET with query parameters."""
    if not target_name.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="target_name cannot be empty."
        )

    return StreamingResponse(
        sse_event_generator(
            target_name=target_name.strip(),
            target_url=target_url,
            demo=demo
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
