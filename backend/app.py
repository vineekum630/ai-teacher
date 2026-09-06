import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI, OpenAIError

app = Flask(__name__)
CORS(app)
load_dotenv()

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json(silent=True) or {}
    question = data.get("question", "")

    if not isinstance(question, str) or not question.strip():
        return jsonify({"error": "Question is required"}), 400

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        return jsonify({"error": "OPENAI_API_KEY is not configured"}), 503

    try:
        client = OpenAI(api_key=api_key)
        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            instructions=(
                "You are a helpful AI teacher. Explain concepts clearly, "
                "use simple examples, and adapt to the student's question."
            ),
            input=question.strip(),
        )
    except OpenAIError:
        return jsonify({"error": "The AI service could not answer right now"}), 502

    return jsonify({"answer": response.output_text})

if __name__ == "__main__":
    app.run(port=5000)