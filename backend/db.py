import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "data.db"

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS profiles (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL DEFAULT 'default',
            age         TEXT,
            gender      TEXT,
            skin_type   TEXT,
            skin_tone   TEXT,
            undertone   TEXT,
            climate     TEXT,
            allergies   TEXT,
            budget      TEXT,
            extra       TEXT,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS profile_products (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id  INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            product_id  TEXT NOT NULL,
            added_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(profile_id, product_id)
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id  INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            title       TEXT,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            role            TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
            content         TEXT NOT NULL,
            created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()


# ── Profile CRUD ──────────────────────────────────────────

PROFILE_COLS = ["age", "gender", "skin_type", "skin_tone", "undertone",
                "climate", "allergies", "budget", "extra"]

def get_or_create_profile(name: str = "default") -> dict:
    conn = get_conn()
    row = conn.execute("SELECT * FROM profiles WHERE name = ?", (name,)).fetchone()
    if row:
        profile = dict(row)
        products = [r["product_id"] for r in conn.execute(
            "SELECT product_id FROM profile_products WHERE profile_id = ? ORDER BY added_at",
            (profile["id"],)
        ).fetchall()]
        profile["products"] = products
        conn.close()
        return profile

    conn.execute("INSERT INTO profiles (name) VALUES (?)", (name,))
    conn.commit()
    row = conn.execute("SELECT * FROM profiles WHERE name = ?", (name,)).fetchone()
    profile = dict(row)
    profile["products"] = []
    conn.close()
    return profile


def update_profile(profile_id: int, data: dict) -> dict:
    conn = get_conn()
    sets = []
    vals = []
    for col in PROFILE_COLS:
        if col in data:
            sets.append(f"{col} = ?")
            vals.append(data[col] or None)
    if sets:
        sets.append("updated_at = CURRENT_TIMESTAMP")
        vals.append(profile_id)
        conn.execute(f"UPDATE profiles SET {', '.join(sets)} WHERE id = ?", vals)

    if "products" in data:
        conn.execute("DELETE FROM profile_products WHERE profile_id = ?", (profile_id,))
        for pid in data["products"]:
            conn.execute(
                "INSERT OR IGNORE INTO profile_products (profile_id, product_id) VALUES (?, ?)",
                (profile_id, pid)
            )

    conn.commit()
    conn.close()
    return get_or_create_profile()


# ── Conversation CRUD ─────────────────────────────────────

def create_conversation(profile_id: int, title: str | None = None) -> dict:
    conn = get_conn()
    conn.execute(
        "INSERT INTO conversations (profile_id, title) VALUES (?, ?)",
        (profile_id, title)
    )
    conn.commit()
    cid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    row = conn.execute("SELECT * FROM conversations WHERE id = ?", (cid,)).fetchone()
    conn.close()
    return dict(row)


def list_conversations(profile_id: int) -> list[dict]:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM conversations WHERE profile_id = ? ORDER BY created_at DESC",
        (profile_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_conversation_messages(conversation_id: int) -> list[dict]:
    conn = get_conn()
    rows = conn.execute(
        "SELECT role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at",
        (conversation_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def add_message(conversation_id: int, role: str, content: str) -> dict:
    conn = get_conn()
    conn.execute(
        "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
        (conversation_id, role, content)
    )
    conn.commit()
    mid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    row = conn.execute("SELECT * FROM messages WHERE id = ?", (mid,)).fetchone()
    conn.close()
    return dict(row)


def delete_conversation(conversation_id: int):
    conn = get_conn()
    conn.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
    conn.commit()
    conn.close()
