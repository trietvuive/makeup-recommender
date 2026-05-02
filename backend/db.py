import json
import sqlite3
from pathlib import Path
from products_seed import PRODUCTS

DB_PATH = Path(__file__).parent / "data.db"

CATEGORY_IMAGES = {
    "Blush": "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1000&h=1000&fit=crop",
    "Cleanser": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1000&h=1000&fit=crop",
    "Concealer": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&h=1000&fit=crop",
    "Essence": "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=1000&h=1000&fit=crop",
    "Exfoliant": "https://images.unsplash.com/photo-1617897903246-719242758050?w=1000&h=1000&fit=crop",
    "Eyeshadow": "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=1000&h=1000&fit=crop",
    "Foundation": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1000&h=1000&fit=crop",
    "Lip": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1000&h=1000&fit=crop",
    "Mascara": "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=1000&h=1000&fit=crop",
    "Mask": "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1000&h=1000&fit=crop",
    "Moisturizer": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1000&h=1000&fit=crop",
    "Primer": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1000&h=1000&fit=crop",
    "Retinol": "https://images.unsplash.com/photo-1617897903246-719242758050?w=1000&h=1000&fit=crop",
    "Serum": "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=1000&h=1000&fit=crop",
    "Setting Spray": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1000&h=1000&fit=crop",
    "Sunscreen": "https://images.unsplash.com/photo-1532947974-2e3966a7de28?w=1000&h=1000&fit=crop",
    "Toner": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1000&h=1000&fit=crop",
    "Treatment": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1000&h=1000&fit=crop",
}

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

        CREATE TABLE IF NOT EXISTS message_attachments (
            id              TEXT PRIMARY KEY,
            message_id      INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
            original_name   TEXT NOT NULL,
            stored_name     TEXT NOT NULL,
            mime_type       TEXT NOT NULL,
            size_bytes      INTEGER NOT NULL,
            created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id              TEXT PRIMARY KEY,
            name            TEXT NOT NULL,
            brand           TEXT NOT NULL,
            category        TEXT NOT NULL,
            type            TEXT NOT NULL,
            key_ingredients TEXT NOT NULL,
            price           TEXT NOT NULL,
            img             TEXT NOT NULL,
            updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
    seed_products(conn)
    conn.commit()
    conn.close()


def seed_products(conn: sqlite3.Connection):
    for product in PRODUCTS:
        conn.execute(
            """
            INSERT INTO products (
                id, name, brand, category, type, key_ingredients, price, img
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                brand = excluded.brand,
                category = excluded.category,
                type = excluded.type,
                key_ingredients = excluded.key_ingredients,
                price = excluded.price,
                img = excluded.img,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                product["id"],
                product["name"],
                product["brand"],
                product["category"],
                product["type"],
                product["keyIngredients"],
                product["price"],
                product["img"],
            ),
        )


def product_from_row(row: sqlite3.Row) -> dict:
    product = dict(row)
    product["keyIngredients"] = product.pop("key_ingredients")
    product.pop("updated_at", None)
    product["img"] = CATEGORY_IMAGES.get(product["category"], product["img"])
    return product


def list_products(query: str | None = None, limit: int = 20) -> list[dict]:
    conn = get_conn()
    max_limit = 50 if query else 500
    limit = max(1, min(limit, max_limit))
    if query:
        like = f"%{query.strip()}%"
        rows = conn.execute(
            """
            SELECT * FROM products
            WHERE name LIKE ?
               OR brand LIKE ?
               OR category LIKE ?
               OR type LIKE ?
               OR key_ingredients LIKE ?
            ORDER BY brand, name
            LIMIT ?
            """,
            (like, like, like, like, like, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM products ORDER BY brand, name LIMIT ?",
            (limit,),
        ).fetchall()
    conn.close()
    return [product_from_row(r) for r in rows]


def get_products_by_ids(product_ids: list[str]) -> list[dict]:
    if not product_ids:
        return []

    conn = get_conn()
    placeholders = ",".join("?" for _ in product_ids)
    rows = conn.execute(
        f"SELECT * FROM products WHERE id IN ({placeholders})",
        product_ids,
    ).fetchall()
    conn.close()

    by_id = {row["id"]: product_from_row(row) for row in rows}
    return [by_id[pid] for pid in product_ids if pid in by_id]


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
        "SELECT id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at",
        (conversation_id,)
    ).fetchall()
    messages = [dict(r) for r in rows]
    if messages:
        message_ids = [m["id"] for m in messages]
        placeholders = ",".join("?" for _ in message_ids)
        attachment_rows = conn.execute(
            f"""
            SELECT id, message_id, original_name, mime_type, size_bytes, created_at
            FROM message_attachments
            WHERE message_id IN ({placeholders})
            ORDER BY created_at
            """,
            message_ids,
        ).fetchall()
        by_message_id = {mid: [] for mid in message_ids}
        for row in attachment_rows:
            attachment = dict(row)
            attachment["url"] = f"/api/attachments/{attachment['id']}"
            by_message_id[attachment["message_id"]].append(attachment)
        for message in messages:
            message["attachments"] = by_message_id.get(message["id"], [])
    conn.close()
    return messages


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


def add_message_attachment(
    message_id: int,
    attachment_id: str,
    original_name: str,
    stored_name: str,
    mime_type: str,
    size_bytes: int,
) -> dict:
    conn = get_conn()
    conn.execute(
        """
        INSERT INTO message_attachments (
            id, message_id, original_name, stored_name, mime_type, size_bytes
        ) VALUES (?, ?, ?, ?, ?, ?)
        """,
        (attachment_id, message_id, original_name, stored_name, mime_type, size_bytes),
    )
    conn.commit()
    row = conn.execute(
        """
        SELECT id, message_id, original_name, stored_name, mime_type, size_bytes, created_at
        FROM message_attachments
        WHERE id = ?
        """,
        (attachment_id,),
    ).fetchone()
    conn.close()
    attachment = dict(row)
    attachment["url"] = f"/api/attachments/{attachment['id']}"
    return attachment


def get_attachment(attachment_id: str) -> dict | None:
    conn = get_conn()
    row = conn.execute(
        """
        SELECT id, message_id, original_name, stored_name, mime_type, size_bytes, created_at
        FROM message_attachments
        WHERE id = ?
        """,
        (attachment_id,),
    ).fetchone()
    conn.close()
    if not row:
        return None
    attachment = dict(row)
    attachment["url"] = f"/api/attachments/{attachment['id']}"
    return attachment


def delete_conversation(conversation_id: int):
    conn = get_conn()
    conn.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
    conn.commit()
    conn.close()
