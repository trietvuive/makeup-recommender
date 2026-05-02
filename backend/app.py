import os
import re
import json
import base64
import uuid
from pathlib import Path
from openrouter import OpenRouter
from flask import Flask, Response, abort, request, jsonify, send_file, stream_with_context
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
import db

app = Flask(__name__)
CORS(app)

MODELS = [
    # Strong free instruction models first; OpenRouter free model availability can vary.
    "google/gemma-4-31b-it:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "openai/gpt-oss-120b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "minimax/minimax-m2.5:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "openrouter/free",
]

VISION_MODELS = [
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-3-27b-it:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "openrouter/free",
]

UPLOAD_DIR = Path(__file__).parent / "uploads"
MAX_IMAGE_BYTES = 4 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

SYSTEM_PROMPT = """\
You are a knowledgeable makeup and skincare advisor. You recommend specific, real products \
(brand + product name) based on the user's profile and concerns.

Response rules:
- Write directly to the user using "you" and "your"
- Do NOT reveal internal reasoning, analysis, scratchpad notes, or step-by-step thinking
- Do NOT restate the user's full profile, age, gender, skin tone, or routine unless it is needed for a specific product warning
- Do NOT start with phrases like "Okay, the user..." or "Let's unpack..."
- Keep the answer concise and complete; do not trail off mid-sentence

When recommending products:
- Always consider the user's skin type, allergies, climate, and existing routine
- Suggest 2-4 specific products per concern
- Include a brief explanation of WHY each product suits them
- Mention price range (drugstore / mid-range / luxury) when possible
- Warn about any ingredient conflicts with their allergies or current routine
- Be conversational and supportive
- Use Markdown with short sections:
  1. A one-sentence answer
  2. 2-4 product bullets
  3. A short "How to use it" note when relevant

User profile:
{profile}
"""


def hide_thinking(content: str) -> str:
    """Remove model reasoning blocks from providers that expose them in text."""
    content = re.sub(
        r"<(?:think|thinking)>.*?(?:</(?:think|thinking)>|$)",
        "",
        content,
        flags=re.DOTALL | re.IGNORECASE,
    )
    return content.strip()


def looks_like_reasoning_leak(content: str) -> bool:
    text = content.strip().lower()
    if text.startswith(("okay, the user", "the user is", "first, let's", "let's unpack")):
        return True

    markers = [
        "current routine",
        "key concerns",
        "scanning my knowledge",
        "need to consider",
        "why it fits:",
        "her skin",
        "his skin",
        "their skin",
    ]
    return sum(marker in text for marker in markers) >= 3


def rewrite_as_final_answer(model: str, draft: str) -> str:
    """Turn a leaked reasoning draft into a concise user-facing response."""
    with get_client() as client:
        response = client.chat.send(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Rewrite the draft into a concise final answer for the user. "
                        "Remove all internal reasoning, analysis, and profile recap. "
                        "Speak directly to the user. Use Markdown bullets. "
                        "Keep only useful recommendations and usage notes."
                    ),
                },
                {"role": "user", "content": draft},
            ],
            max_tokens=900,
            reasoning={"exclude": True},
            temperature=0.2,
        )
    return hide_thinking(response.choices[0].message.content)


def get_chunk_delta(chunk) -> str:
    """Extract streamed content from OpenAI-compatible chunk objects."""
    if isinstance(chunk, dict):
        choices = chunk.get("choices") or []
        if not choices:
            return ""
        delta = choices[0].get("delta") or {}
        return delta.get("content") or ""

    choices = getattr(chunk, "choices", None) or []
    if not choices:
        return ""

    delta = getattr(choices[0], "delta", None)
    return getattr(delta, "content", None) or ""


def get_client() -> OpenRouter:
    return OpenRouter(
        api_key=os.environ.get("OPENROUTER_API_KEY", ""),
        http_referer="http://localhost:3000",
        x_open_router_title="Makeup Advisor",
    )


def save_image_attachment(file: FileStorage, message_id: int) -> tuple[dict, str]:
    mime_type = file.mimetype
    if mime_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError("Please attach a JPEG, PNG, or WebP image.")

    data = file.read()
    if not data:
        raise ValueError("The attached image is empty.")
    if len(data) > MAX_IMAGE_BYTES:
        raise ValueError("Please attach an image smaller than 4 MB.")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    attachment_id = uuid.uuid4().hex
    original_name = secure_filename(file.filename or "image") or "image"
    stored_name = f"{attachment_id}{ALLOWED_IMAGE_TYPES[mime_type]}"
    path = UPLOAD_DIR / stored_name
    path.write_bytes(data)

    attachment = db.add_message_attachment(
        message_id=message_id,
        attachment_id=attachment_id,
        original_name=original_name,
        stored_name=stored_name,
        mime_type=mime_type,
        size_bytes=len(data),
    )
    data_url = f"data:{mime_type};base64,{base64.b64encode(data).decode('ascii')}"
    return attachment, data_url


def multimodal_user_content(text: str, image_data_url: str | None):
    if not image_data_url:
        return text

    return [
        {"type": "text", "text": text},
        {"type": "image_url", "image_url": {"url": image_data_url}},
    ]


def build_system_message(profile: dict) -> str:
    label_map = {
        "age": "Age", "gender": "Gender", "skin_type": "Skin Type",
        "skin_tone": "Skin Tone", "undertone": "Undertone",
        "climate": "Living Climate", "allergies": "Allergies / Sensitivities",
        "budget": "Budget Preference", "extra": "Additional Preferences",
    }
    lines = []
    for col, label in label_map.items():
        val = profile.get(col)
        if val:
            lines.append(f"- {label}: {val}")

    routine_products = profile.get("routine_products")
    if routine_products:
        lines.append(f"- Current Routine Products: {routine_products}")

    profile_text = "\n".join(lines) if lines else "No profile information provided yet."
    return SYSTEM_PROMPT.format(profile=profile_text)


def try_chat(system_content: str, messages: list[dict], models: list[str] | None = None) -> dict:
    """Try each model in order until one succeeds."""
    full_messages = [{"role": "system", "content": system_content}, *messages]

    last_error = "No models available"
    for model in models or MODELS:
        try:
            with get_client() as client:
                response = client.chat.send(
                    model=model,
                    messages=full_messages,
                    max_tokens=1400,
                    reasoning={"exclude": True},
                    temperature=0.35,
                )
            reply = hide_thinking(response.choices[0].message.content)
            if looks_like_reasoning_leak(reply):
                reply = rewrite_as_final_answer(model, reply)
            return {"reply": reply}
        except Exception as e:
            last_error = str(e)

    return {"error": last_error}


def prepare_chat(
    conversation_id: int | None,
    user_message: str,
    image_file: FileStorage | None = None,
) -> tuple[int, str, list[dict], list[dict], bool]:
    profile = db.get_or_create_profile()

    if not conversation_id:
        title = user_message[:60] + ("..." if len(user_message) > 60 else "")
        convo = db.create_conversation(profile["id"], title)
        conversation_id = convo["id"]

    user_db_message = db.add_message(conversation_id, "user", user_message)
    image_data_url = None
    attachments = []
    if image_file and image_file.filename:
        attachment, image_data_url = save_image_attachment(image_file, user_db_message["id"])
        attachments = [attachment]

    history = db.get_conversation_messages(conversation_id)
    chat_messages = []
    for m in history:
        content = m["content"]
        if m["id"] == user_db_message["id"]:
            content = multimodal_user_content(content, image_data_url)
        chat_messages.append({"role": m["role"], "content": content})

    routine_products = None
    if profile.get("products"):
        products = db.get_products_by_ids(profile["products"])
        routine_products = ", ".join(
            f"{p['brand']} {p['name']}" for p in products
        )

    profile_data = dict(profile)
    profile_data["routine_products"] = routine_products
    system_content = build_system_message(profile_data)
    return conversation_id, system_content, chat_messages, attachments, bool(image_data_url)


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def stream_chat_reply(system_content: str, messages: list[dict], models: list[str] | None = None):
    """Yield model deltas and return the full assistant response."""
    full_messages = [{"role": "system", "content": system_content}, *messages]
    last_error = "No models available"

    for model in models or MODELS:
        try:
            parts = []
            with get_client() as client:
                stream = client.chat.send(
                    model=model,
                    messages=full_messages,
                    max_tokens=1400,
                    reasoning={"exclude": True},
                    stream=True,
                    temperature=0.35,
                )

                for chunk in stream:
                    delta = get_chunk_delta(chunk)
                    if not delta:
                        continue
                    parts.append(delta)
                    yield {"delta": delta}

            reply = hide_thinking("".join(parts))
            yield {"done": reply, "model": model}
            return
        except Exception as e:
            last_error = str(e)

    yield {"error": last_error}


@app.route("/api/profile", methods=["GET"])
def get_profile():
    profile = db.get_or_create_profile()
    return jsonify(profile)


@app.route("/api/profile", methods=["PUT"])
def update_profile():
    data = request.json
    profile = db.get_or_create_profile()
    updated = db.update_profile(profile["id"], data)
    return jsonify(updated)


@app.route("/api/products", methods=["GET"])
def list_products():
    ids = request.args.get("ids", "").strip()
    if ids:
        products = db.get_products_by_ids([pid for pid in ids.split(",") if pid])
        return jsonify(products)

    query = request.args.get("q", "").strip()
    limit = request.args.get("limit", 20, type=int)
    products = db.list_products(query=query or None, limit=limit)
    return jsonify(products)


@app.route("/api/attachments/<attachment_id>", methods=["GET"])
def get_attachment(attachment_id):
    attachment = db.get_attachment(attachment_id)
    if not attachment:
        abort(404)

    path = UPLOAD_DIR / attachment["stored_name"]
    if not path.exists():
        abort(404)

    return send_file(
        path,
        mimetype=attachment["mime_type"],
        download_name=attachment["original_name"],
    )


@app.route("/api/conversations", methods=["GET"])
def list_conversations():
    profile = db.get_or_create_profile()
    convos = db.list_conversations(profile["id"])
    return jsonify(convos)


@app.route("/api/conversations", methods=["POST"])
def create_conversation():
    profile = db.get_or_create_profile()
    title = (request.json or {}).get("title")
    convo = db.create_conversation(profile["id"], title)
    return jsonify(convo), 201


@app.route("/api/conversations/<int:cid>", methods=["DELETE"])
def delete_conversation(cid):
    db.delete_conversation(cid)
    return jsonify({"ok": True})


@app.route("/api/conversations/<int:cid>/messages", methods=["GET"])
def get_messages(cid):
    msgs = db.get_conversation_messages(cid)
    for msg in msgs:
        if msg["role"] == "assistant":
            msg["content"] = hide_thinking(msg["content"])
    return jsonify(msgs)


@app.route("/api/chat", methods=["POST"])
def chat():
    if request.content_type and request.content_type.startswith("multipart/form-data"):
        data = request.form
        image_file = request.files.get("image")
        conversation_id_raw = data.get("conversation_id")
        conversation_id = int(conversation_id_raw) if conversation_id_raw else None
        user_message = data.get("message", "").strip()
        should_stream = data.get("stream") == "true"
    else:
        data = request.json or {}
        image_file = None
        conversation_id = data.get("conversation_id")
        user_message = data.get("message", "").strip()
        should_stream = bool(data.get("stream"))

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        conversation_id, system_content, chat_messages, attachments, has_image = prepare_chat(
            conversation_id,
            user_message,
            image_file,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    models = VISION_MODELS if has_image else MODELS

    if should_stream:
        @stream_with_context
        def generate():
            yield sse("meta", {"conversation_id": conversation_id, "attachments": attachments})
            for item in stream_chat_reply(system_content, chat_messages, models=models):
                if "delta" in item:
                    yield sse("delta", {"content": item["delta"]})
                elif "done" in item:
                    reply = item["done"]
                    if looks_like_reasoning_leak(reply):
                        reply = rewrite_as_final_answer(item["model"], reply)
                    db.add_message(conversation_id, "assistant", reply)
                    yield sse("done", {"reply": reply, "conversation_id": conversation_id})
                elif "error" in item:
                    yield sse("error", {"error": item["error"], "conversation_id": conversation_id})

        return Response(
            generate(),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    result = try_chat(system_content, chat_messages, models=models)

    if "reply" in result:
        result["reply"] = hide_thinking(result["reply"])
        db.add_message(conversation_id, "assistant", result["reply"])
        result["conversation_id"] = conversation_id
        result["attachments"] = attachments
        return jsonify(result)
    else:
        result["conversation_id"] = conversation_id
        return jsonify(result), 502


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    db.init_db()
    app.run(debug=True, port=5000)
