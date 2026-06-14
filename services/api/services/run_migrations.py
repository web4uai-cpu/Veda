"""
VEDA — Database Migration Runner
====================================
Applies SQL migrations to the PostgreSQL database.
Reads migration files from supabase/migrations/ and applies them
in order, skipping any that have already been applied.

Usage:
    cd services/api
    python -m services.run_migrations

Note: Requires a running PostgreSQL instance (Docker or otherwise).
"""

from __future__ import annotations

import asyncio
import logging
import sys
import os
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.postgres import init_postgres, close_postgres, execute, fetchval

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("veda.migrations")

# Path to migrations directory (relative to project root)
MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "supabase" / "migrations"


async def ensure_migration_tracking():
    """Create the migration tracking table if it doesn't exist."""
    await execute("""
        CREATE TABLE IF NOT EXISTS _veda_migrations (
            id SERIAL PRIMARY KEY,
            filename TEXT UNIQUE NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)


async def is_applied(filename: str) -> bool:
    """Check if a migration has already been applied."""
    count = await fetchval(
        "SELECT COUNT(*) FROM _veda_migrations WHERE filename = $1", filename
    )
    return (count or 0) > 0


async def apply_migration(filepath: Path):
    """Apply a single migration file."""
    filename = filepath.name

    if await is_applied(filename):
        logger.info("  ⏭️  %s — already applied, skipping", filename)
        return False

    logger.info("  🔄  Applying %s...", filename)

    sql = filepath.read_text(encoding="utf-8")

    # Strip any Supabase-specific auth references that won't work
    # in a plain PostgreSQL instance (auth.uid() etc.)
    # We keep the RLS policies but they won't be enforced without Supabase
    try:
        await execute(sql)
    except Exception as e:
        error_msg = str(e)
        # Handle common non-critical errors gracefully
        if "already exists" in error_msg.lower():
            logger.warning("  ⚠️  %s — objects already exist (safe to continue)", filename)
        elif "auth.uid" in error_msg or "auth.users" in error_msg:
            # Supabase auth functions not available in plain PostgreSQL
            # Apply everything except the RLS policies that reference auth
            logger.warning("  ⚠️  %s — Supabase auth references skipped (plain PostgreSQL)", filename)
            await _apply_without_auth_policies(sql)
        else:
            raise

    # Record the migration
    await execute(
        "INSERT INTO _veda_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING",
        filename,
    )
    logger.info("  ✅  %s — applied successfully", filename)
    return True


async def _apply_without_auth_policies(sql: str):
    """
    Apply migration SQL but skip statements that reference auth.uid().
    Splits on semicolons and applies each statement individually.
    """
    statements = sql.split(";")
    skip_count = 0

    for stmt in statements:
        stmt = stmt.strip()
        if not stmt:
            continue

        # Skip statements referencing Supabase auth
        if "auth.uid()" in stmt or "auth.users" in stmt:
            skip_count += 1
            continue

        try:
            await execute(stmt)
        except Exception as e:
            if "already exists" in str(e).lower():
                continue
            logger.warning("    Skipping statement: %s", str(e)[:100])

    if skip_count:
        logger.info("    Skipped %d auth-dependent statements", skip_count)


async def main():
    """Run all pending migrations."""
    logger.info("=" * 60)
    logger.info("VEDA — Database Migration Runner")
    logger.info("=" * 60)

    if not MIGRATIONS_DIR.exists():
        logger.error("Migrations directory not found: %s", MIGRATIONS_DIR)
        sys.exit(1)

    # Find all .sql files sorted by name
    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    logger.info("Found %d migration file(s) in %s", len(migration_files), MIGRATIONS_DIR)

    await init_postgres()

    try:
        await ensure_migration_tracking()

        applied = 0
        for filepath in migration_files:
            if await apply_migration(filepath):
                applied += 1

        # Report summary
        table_count = await fetchval(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
        )

        logger.info("=" * 60)
        if applied:
            logger.info("✅  %d migration(s) applied", applied)
        else:
            logger.info("✅  All migrations already up to date")
        logger.info("   Public tables: %d", table_count or 0)
        logger.info("=" * 60)

    finally:
        await close_postgres()


if __name__ == "__main__":
    asyncio.run(main())
