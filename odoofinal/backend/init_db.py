import asyncio
from app.core.database import engine
from app.models import Base


async def init_tables():
    print("Connecting to PostgreSQL and creating all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("SUCCESS: All 13 module tables created successfully in PostgreSQL!")


if __name__ == "__main__":
    asyncio.run(init_tables())
