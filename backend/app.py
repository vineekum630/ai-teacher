import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai

app = Flask(__name__)
CORS(app)
load_dotenv()

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
                "use simple examples, and adapt to the student's question.\n\n"
                f"Student question: {question.strip()}"
            ),
        )
    except Exception:
        return jsonify({"error": "The AI service could not answer right now"}), 502

    return jsonify({"answer": response.text or "The AI returned an empty answer"})

if __name__ == "__main__":
    app.run(port=5000)