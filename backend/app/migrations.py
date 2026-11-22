"""Small additive schema migrations for databases created before new ERP fields.

`Base.metadata.create_all()` creates missing tables but never alters existing
ones. Running this after `create_all()` keeps an already-seeded PostgreSQL
database compatible with the current models without destroying data.
"""

from __future__ import annotations

import logging

from sqlalchemy import text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

# (table, column) -> SQL type for a Postgres ADD COLUMN clause.
NEW_COLUMNS: dict[tuple[str, str], str] = {
    ("leads", "follow_up_notes"): "TEXT",
    ("leads", "grid_suitable"): "BOOLEAN DEFAULT TRUE NOT NULL",
    ("inventory_items", "unit_cost_inr"): "NUMERIC(12,2) DEFAULT 0 NOT NULL",
    ("orders", "bom_deducted"): "BOOLEAN DEFAULT FALSE NOT NULL",
    ("employees", "hourly_rate"): "NUMERIC(10,2) DEFAULT 0 NOT NULL",
    ("employees", "leave_status"): "VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL",
    ("installations", "progress_pct"): "INTEGER DEFAULT 0 NOT NULL",
    ("installations", "hours_logged"): "NUMERIC(6,2) DEFAULT 0 NOT NULL",
    ("installations", "verified_kw"): "NUMERIC(6,2) DEFAULT 0 NOT NULL",
    ("installations", "system_tested_ok"): "BOOLEAN DEFAULT FALSE NOT NULL",
    ("installations", "voc_voltage"): "NUMERIC(8,2) DEFAULT 0 NOT NULL",
    ("installations", "isc_current"): "NUMERIC(8,2) DEFAULT 0 NOT NULL",
    ("installations", "earth_resistance_ohms"): "NUMERIC(8,2) DEFAULT 0 NOT NULL",
    ("installations", "install_photo_url"): "VARCHAR(500)",
    ("tickets", "assigned_technician_id"): "INTEGER",
    ("tickets", "resolution_type"): "VARCHAR(30) DEFAULT 'REPAIR' NOT NULL",
}


def ensure_schema(engine: Engine) -> None:
    """Add columns introduced after the first database was seeded."""
    with engine.begin() as connection:
        tables = {row[0] for row in connection.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))}
        for (table, column), column_type in NEW_COLUMNS.items():
            if table not in tables:
                continue
            exists = connection.execute(
                text(
                    "SELECT 1 FROM information_schema.columns "
                    "WHERE table_schema = 'public' AND table_name = :table AND column_name = :column"
                ),
                {"table": table, "column": column},
            ).first()
            if exists:
                continue
            logger.info("Adding column %s.%s", table, column)
            connection.execute(
                text(f"ALTER TABLE {table} ADD COLUMN {column} {column_type}")
            )
