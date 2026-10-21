#!/usr/bin/env python3
"""
VerifyLens - Standalone TinyFish Smoke Test
Tests connection, authentication, and SSE streaming with TinyFish Web Agent API.
"""

import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend directory is in python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Load .env
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

from app.services.tinyfish_client import TinyFishClient  # noqa: E402


async def main():
    api_key = os.getenv("TINYFISH_API_KEY", "").strip()
    api_url = os.getenv("TINYFISH_API_URL", "https://agent.tinyfish.ai/v1/automation/run-sse").strip()

    print("==================================================")
    print("      VerifyLens - TinyFish Connection Smoke Test  ")
    print("==================================================")
    print(f"Target API Endpoint : {api_url}")
    print(f"API Key Configured  : {'YES (' + api_key[:6] + '...' + api_key[-4:] + ')' if api_key else 'NO (Missing)'}")
    print("--------------------------------------------------")

    if not api_key:
        print("[!] ERROR: TINYFISH_API_KEY is not set.")
        print(f"    Please edit '{env_path}' and set your key:")
        print("    TINYFISH_API_KEY=tf_live_xxxxxxxxxxxxxxxx")
        print("==================================================")
        sys.exit(1)

    test_entity = "TinyFish AI"
    test_url = "https://tinyfish.ai"

    print(f"[*] Dispatching test audit for '{test_entity}' ({test_url})...")
    print("[*] Listening for SSE events from TinyFish agent...\n")

    client = TinyFishClient(api_key=api_key, base_url=api_url)

    streaming_url_received = False
    result_received = False

    try:
        async for event in client.stream_audit(target_name=test_entity, target_url=test_url):
            event_type = event.get("event")
            data = event.get("data", {})

            if event_type == "status":
                print(f"[STATUS] {data.get('message')}")
            elif event_type == "streaming_url":
                streaming_url_received = True
                print(f"\n[LIVE STREAM URL] >>> {data.get('url')} <<<\n")
            elif event_type == "progress":
                msg = data.get("message") or data.get("raw") or str(data)
                print(f"[PROGRESS] {msg}")
            elif event_type == "result":
                result_received = True
                print("\n[AUDIT RESULT RECEIVED]")
                print(f"Trust Score : {data.get('trust_score')}/100 ({data.get('risk_tier')})")
                print(f"Summary     : {data.get('audit', {}).get('summary')}")
                print(f"Risk Flags  : {data.get('audit', {}).get('risk_flags')}")
            elif event_type == "error":
                print(f"[ERROR] {data.get('message')}")

    except Exception as exc:
        print(f"[!] Exception during smoke test: {exc}")
        sys.exit(1)

    print("\n--------------------------------------------------")
    print("Smoke Test Summary:")
    print(f"- Live Streaming URL captured: {'PASS' if streaming_url_received else 'PENDING/NOT_EMITTED'}")
    print(f"- Structured Result parsed   : {'PASS' if result_received else 'PENDING'}")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(main())
