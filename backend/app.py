import os
import re

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash

try:
    from supabase import create_client
except ImportError:
    create_client = None

app = Flask(__name__)
CORS(app)
load_dotenv()


def get_database():
    if create_client is None:
        return None
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key) if url and key else None


def get_session_serializer():
    return URLSafeTimedSerializer(os.getenv("SESSION_SECRET", "change-me"))


def issue_session(user):
    return get_session_serializer().dumps({"user_id": user["id"]})


def valid_email(email):
    return re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) is not None


@app.post("/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    role = str(data.get("role", "student")).strip().lower()

    if not name or not valid_email(email) or len(password) < 8:
        return jsonify({"error": "Name, valid email, and 8-character password are required"}), 400
    if role not in {"teacher", "student"}:
        return jsonify({"error": "Invalid role"}), 400

    database = get_database()
    if database is None:
        return jsonify({"error": "Database is not configured"}), 503

    try:
        existing = database.table("users").select("id").eq("email", email).execute()
        if existing.data:
            return jsonify({"error": "An account with this email already exists"}), 409
        result = database.table("users").insert({
            "name": name,
            "email": email,
            "role": role,
            "password_hash": generate_password_hash(password),
        }).execute()
        user = result.data[0]
        return jsonify({"user": {"id": user["id"], "name": name, "email": email, "role": role}, "token": issue_session(user)}), 201
    except Exception:
        return jsonify({"error": "Could not create the account"}), 500


@app.post("/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    database = get_database()

    if not valid_email(email) or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if database is None:
        return jsonify({"error": "Database is not configured"}), 503

    try:
        result = database.table("users").select("id,name,email,role,password_hash").eq("email", email).limit(1).execute()
        user = result.data[0] if result.data else None
        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Email or password is incorrect"}), 401
        return jsonify({"user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}, "token": issue_session(user)})
    except Exception:
        return jsonify({"error": "Could not sign in right now"}), 500


@app.get("/auth/me")
def current_user():
    authorization = request.headers.get("Authorization", "")
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        return jsonify({"error": "Sign-in required"}), 401
    try:
        session = get_session_serializer().loads(token, max_age=60 * 60 * 24 * 30)
    except (BadSignature, SignatureExpired):
        return jsonify({"error": "Session expired"}), 401
    database = get_database()
    if database is None:
        return jsonify({"error": "Database is not configured"}), 503
    result = database.table("users").select("id,name,email,role").eq("id", session["user_id"]).limit(1).execute()
    if not result.data:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": result.data[0]})

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json(silent=True) or {}
    question = data.get("question", "")

    if not isinstance(question, str) or not question.strip():
        return jsonify({"error": "Question is required"}), 400

    if os.getenv("MOCK_AI", "false").lower() == "true":
        return jsonify({
            "answer": (
                f"Demo answer: you asked '{question.strip()}'. "
                "Mock mode is working; no Gemini request was made."
            )
        })

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_key_here":
        return jsonify({"error": "GEMINI_API_KEY is not configured"}), 503

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
            contents=(
                "You are a helpful AI teacher. Explain concepts clearly, "
                "use simple examples, and adapt to the student's question. "
                "For science, processes, or how-to questions, add one small "
                "Mermaid flowchart in a fenced ```mermaid block when it helps. "
                "Keep diagrams under 6 nodes; skip them when they do not help.\n\n"
                f"Student question: {question.strip()}"
            ),
        )
    except Exception:
        return jsonify({"error": "The AI service could not answer right now"}), 502

    return jsonify({"answer": response.text or "The AI returned an empty answer"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))