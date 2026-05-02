import os
from openrouter import OpenRouter
from flask import Flask, request, jsonify
from flask_cors import CORS
import db

app = Flask(__name__)
CORS(app)

MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
]

SYSTEM_PROMPT = """\
You are a knowledgeable makeup and skincare advisor. You recommend specific, real products \
(brand + product name) based on the user's profile and concerns.

When recommending products:
- Always consider the user's skin type, allergies, climate, and existing routine
- Suggest 2-4 specific products per concern
- Include a brief explanation of WHY each product suits them
- Mention price range (drugstore / mid-range / luxury) when possible
- Warn about any ingredient conflicts with their allergies or current routine
- Be conversational and supportive

User profile:
{profile}
"""


def get_client() -> OpenRouter:
    return OpenRouter(
        api_key=os.environ.get("OPENROUTER_API_KEY", ""),
        http_referer="http://localhost:3000",
        x_open_router_title="Makeup Advisor",
    )


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


def try_chat(system_content: str, messages: list[dict]) -> dict:
    """Try each model in order until one succeeds."""
    full_messages = [{"role": "system", "content": system_content}, *messages]

    last_error = "No models available"
    for model in MODELS:
        try:
            with get_client() as client:
                response = client.chat.send(
                    model=model,
                    messages=full_messages,
                    max_tokens=1024,
                    temperature=0.7,
                )
            return {"reply": response.choices[0].message.content}
        except Exception as e:
            last_error = str(e)

    return {"error": last_error}


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
    return jsonify(msgs)


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    conversation_id = data.get("conversation_id")
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    profile = db.get_or_create_profile()

    if not conversation_id:
        title = user_message[:60] + ("..." if len(user_message) > 60 else "")
        convo = db.create_conversation(profile["id"], title)
        conversation_id = convo["id"]

    db.add_message(conversation_id, "user", user_message)

    history = db.get_conversation_messages(conversation_id)
    chat_messages = [{"role": m["role"], "content": m["content"]} for m in history]

    routine_products = None
    if profile.get("products"):
        routine_products = ", ".join(profile["products"])

    profile_data = dict(profile)
    profile_data["routine_products"] = routine_products
    system_content = build_system_message(profile_data)

    result = try_chat(system_content, chat_messages)

    if "reply" in result:
        db.add_message(conversation_id, "assistant", result["reply"])
        result["conversation_id"] = conversation_id
        return jsonify(result)
    else:
        result["conversation_id"] = conversation_id
        return jsonify(result), 502


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    db.init_db()
    app.run(debug=True, port=5000)
