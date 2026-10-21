import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import aiosqlite

logger = logging.getLogger("snoopfish.db")

DB_PATH = Path(__file__).resolve().parent.parent / "snoopfish.db"

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_name TEXT NOT NULL,
    target_url TEXT,
    score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    report_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""


async def init_db(db_path: Optional[str] = None) -> None:
    """Initialize the SQLite database schema if not already present."""
    target_path = db_path or str(DB_PATH)
    async with aiosqlite.connect(target_path) as db:
        await db.execute(CREATE_TABLE_SQL)
        await db.commit()
    logger.info(f"Database initialized at {target_path}")


async def save_audit(
    target_name: str,
    target_url: Optional[str],
    score: int,
    risk_level: str,
    report_dict: Dict[str, Any],
    db_path: Optional[str] = None
) -> int:
    """Save an audit run report to SQLite database and return the inserted row id."""
    target_path = db_path or str(DB_PATH)
    report_json = json.dumps(report_dict)
    async with aiosqlite.connect(target_path) as db:
        await db.execute(CREATE_TABLE_SQL)
        cursor = await db.execute(
            """
            INSERT INTO audits (target_name, target_url, score, risk_level, report_json)
            VALUES (?, ?, ?, ?, ?)
            """,
            (target_name, target_url or "", score, risk_level, report_json)
        )
        await db.commit()
        inserted_id = cursor.lastrowid or 0
        return inserted_id


async def get_recent_audits(limit: int = 10, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve recent audits ordered by created_at DESC."""
    target_path = db_path or str(DB_PATH)
    async with aiosqlite.connect(target_path) as db:
        await db.execute(CREATE_TABLE_SQL)
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """
            SELECT id, target_name, target_url, score, risk_level, report_json, created_at
            FROM audits
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            results = []
            for row in rows:
                try:
                    report = json.loads(row["report_json"])
                except Exception:
                    report = {}
                results.append({
                    "id": row["id"],
                    "target_name": row["target_name"],
                    "target_url": row["target_url"],
                    "score": row["score"],
                    "risk_level": row["risk_level"],
                    "report": report,
                    "created_at": row["created_at"]
                })
            return results
