import os
import asyncpg

pool = None

async def init_pool():
    url = os.getenv('SUPABASE_DB_URL') or os.getenv('DATABASE_URL')
    if not url:
        raise RuntimeError('Missing SUPABASE_DB_URL or DATABASE_URL')
    global pool
    pool = await asyncpg.create_pool(dsn=url, min_size=1, max_size=10)

def get_pool():
    return pool
