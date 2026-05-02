import json
import sqlite3
from pathlib import Path
from products_seed import PRODUCTS

DB_PATH = Path(__file__).parent / "data.db"
DEFAULT_USER_EXTERNAL_ID = "default"

PRODUCT_SELECT = """
    product_id AS productId,
    name,
    brand,
    category,
    type,
    key_ingredients AS keyIngredients,
    price_low AS priceLow,
    price_high AS priceHigh,
    img
"""

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id  TEXT NOT NULL UNIQUE,
            display_name TEXT,
            email        TEXT UNIQUE,
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS profiles (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
            product_id  INTEGER NOT NULL,
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
            product_id      INTEGER UNIQUE,
            id              TEXT PRIMARY KEY,
            name            TEXT NOT NULL,
            brand           TEXT NOT NULL,
            category        TEXT NOT NULL,
            type            TEXT NOT NULL,
            key_ingredients TEXT NOT NULL,
            price_low       INTEGER NOT NULL,
            price_high      INTEGER NOT NULL,
            img             TEXT NOT NULL,
            updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
    ensure_user_schema(conn)
    ensure_product_schema(conn)
    seed_products(conn)
    conn.commit()
    conn.close()


def ensure_user_schema(conn: sqlite3.Connection):
    profile_cols = {row["name"] for row in conn.execute("PRAGMA table_info(profiles)").fetchall()}
    if "user_id" not in profile_cols:
        conn.execute("ALTER TABLE profiles ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE")

    user = get_or_create_user(DEFAULT_USER_EXTERNAL_ID, "Default User", conn=conn)
    conn.execute(
        "UPDATE profiles SET user_id = ? WHERE user_id IS NULL",
        (user["id"],),
    )
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_name ON profiles(user_id, name)")


def ensure_product_schema(conn: sqlite3.Connection):
    product_cols = {row["name"] for row in conn.execute("PRAGMA table_info(products)").fetchall()}
    if "product_id" not in product_cols:
        conn.execute("ALTER TABLE products ADD COLUMN product_id INTEGER")
    if "price_low" not in product_cols:
        conn.execute("ALTER TABLE products ADD COLUMN price_low INTEGER")
    if "price_high" not in product_cols:
        conn.execute("ALTER TABLE products ADD COLUMN price_high INTEGER")
    if "price" in product_cols:
        conn.execute("ALTER TABLE products DROP COLUMN price")
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id)")


def seed_products(conn: sqlite3.Connection):
    for product_id, product in enumerate(PRODUCTS, start=1):
        conn.execute(
            """
            INSERT INTO products (
                product_id, id, name, brand, category, type, key_ingredients,
                price_low, price_high, img
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                product_id = excluded.product_id,
                name = excluded.name,
                brand = excluded.brand,
                category = excluded.category,
                type = excluded.type,
                key_ingredients = excluded.key_ingredients,
                price_low = excluded.price_low,
                price_high = excluded.price_high,
                img = excluded.img,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                product_id,
                product["id"],
                product["name"],
                product["brand"],
                product["category"],
                product["type"],
                product["keyIngredients"],
                product["priceLow"],
                product["priceHigh"],
                product["img"],
            ),
        )


def product_from_row(row: sqlite3.Row) -> dict:
    return dict(row)


def list_products(query: str | None = None, limit: int = 20) -> list[dict]:
    conn = get_conn()
    max_limit = 50 if query else 500
    limit = max(1, min(limit, max_limit))
    if query:
        like = f"%{query.strip()}%"
        rows = conn.execute(
            f"""
            SELECT {PRODUCT_SELECT}
            FROM products
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
            f"SELECT {PRODUCT_SELECT} FROM products ORDER BY brand, name LIMIT ?",
            (limit,),
        ).fetchall()
    conn.close()
    return [product_from_row(r) for r in rows]


def get_products_by_product_ids(product_ids: list[int]) -> list[dict]:
    if not product_ids:
        return []

    conn = get_conn()
    placeholders = ",".join("?" for _ in product_ids)
    rows = conn.execute(
        f"SELECT {PRODUCT_SELECT} FROM products WHERE product_id IN ({placeholders})",
        product_ids,
    ).fetchall()
    conn.close()

    by_id = {row["productId"]: product_from_row(row) for row in rows}
    return [by_id[pid] for pid in product_ids if pid in by_id]


# ── User/Profile CRUD ─────────────────────────────────────


def get_or_create_user(
    external_id: str = DEFAULT_USER_EXTERNAL_ID,
    display_name: str | None = None,
    email: str | None = None,
    conn: sqlite3.Connection | None = None,
) -> dict:
    owns_conn = conn is None
    conn = conn or get_conn()

    row = conn.execute("SELECT * FROM users WHERE external_id = ?", (external_id,)).fetchone()
    if not row:
        conn.execute(
            """
            INSERT INTO users (external_id, display_name, email)
            VALUES (?, ?, ?)
            """,
            (external_id, display_name, email),
        )
        if owns_conn:
            conn.commit()
        row = conn.execute("SELECT * FROM users WHERE external_id = ?", (external_id,)).fetchone()
    elif display_name or email:
        conn.execute(
            """
            UPDATE users
            SET display_name = COALESCE(?, display_name),
                email = COALESCE(?, email),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (display_name, email, row["id"]),
        )
        if owns_conn:
            conn.commit()
        row = conn.execute("SELECT * FROM users WHERE external_id = ?", (external_id,)).fetchone()

    user = dict(row)
    if owns_conn:
        conn.close()
    return user

PROFILE_COLS = ["age", "gender", "skin_type", "skin_tone", "undertone",
                "climate", "allergies", "budget", "extra"]


def profile_product_ids(conn: sqlite3.Connection, profile_id: int) -> list[int]:
    rows = conn.execute(
        "SELECT product_id FROM profile_products WHERE profile_id = ? ORDER BY added_at",
        (profile_id,)
    ).fetchall()
    if not rows:
        return []

    products = []
    for row in rows:
        value = row["product_id"]
        try:
            products.append(int(value))
            continue
        except (TypeError, ValueError):
            pass

        product_row = conn.execute(
            "SELECT product_id FROM products WHERE id = ?",
            (value,),
        ).fetchone()
        if product_row:
            products.append(product_row["product_id"])

    return products


def get_or_create_profile(
    name: str = "default",
    user_id: int | None = None,
    user_external_id: str = DEFAULT_USER_EXTERNAL_ID,
) -> dict:
    conn = get_conn()
    if user_id is None:
        user = get_or_create_user(user_external_id, "Default User", conn=conn)
        user_id = user["id"]

    row = conn.execute(
        "SELECT * FROM profiles WHERE user_id = ? AND name = ?",
        (user_id, name),
    ).fetchone()
    if row:
        profile = dict(row)
        profile["products"] = profile_product_ids(conn, profile["id"])
        conn.close()
        return profile

    conn.execute("INSERT INTO profiles (user_id, name) VALUES (?, ?)", (user_id, name))
    conn.commit()
    row = conn.execute(
        "SELECT * FROM profiles WHERE user_id = ? AND name = ?",
        (user_id, name),
    ).fetchone()
    profile = dict(row)
    profile["products"] = []
    conn.close()
    return profile


def update_profile(profile_id: int, data: dict) -> dict:
    conn = get_conn()
    profile_row = conn.execute("SELECT user_id, name FROM profiles WHERE id = ?", (profile_id,)).fetchone()
    user_id = profile_row["user_id"] if profile_row else None
    name = profile_row["name"] if profile_row else "default"
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
    return get_or_create_profile(name=name, user_id=user_id)


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
