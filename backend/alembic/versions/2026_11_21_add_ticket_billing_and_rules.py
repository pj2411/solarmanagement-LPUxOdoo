"""Add service-ticket billing + customer-confirmation columns.

PS compliance update:
  - in_warranty / parts_cost / labour_cost / billable_amount -> automatic billing
  - customer_confirmed / closed_at -> ticket stays open until customer signs off

These ADD COLUMN statements are idempotent (IF NOT EXISTS) because the demo
database was originally created with Base.metadata.create_all().
"""
from alembic import op

revision = "a1b2c3d4e5f6"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE service_tickets "
        "ADD COLUMN IF NOT EXISTS in_warranty BOOLEAN NOT NULL DEFAULT false"
    )
    op.execute(
        "ALTER TABLE service_tickets "
        "ADD COLUMN IF NOT EXISTS parts_cost DOUBLE PRECISION NOT NULL DEFAULT 0"
    )
    op.execute(
        "ALTER TABLE service_tickets "
        "ADD COLUMN IF NOT EXISTS labour_cost DOUBLE PRECISION NOT NULL DEFAULT 0"
    )
    op.execute(
        "ALTER TABLE service_tickets "
        "ADD COLUMN IF NOT EXISTS billable_amount DOUBLE PRECISION NOT NULL DEFAULT 0"
    )
    op.execute(
        "ALTER TABLE service_tickets "
        "ADD COLUMN IF NOT EXISTS customer_confirmed BOOLEAN NOT NULL DEFAULT false"
    )
    op.execute(
        "ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ NULL"
    )


def downgrade() -> None:
    for column in (
        "closed_at",
        "customer_confirmed",
        "billable_amount",
        "labour_cost",
        "parts_cost",
        "in_warranty",
    ):
        op.execute(f"ALTER TABLE service_tickets DROP COLUMN IF EXISTS {column}")
