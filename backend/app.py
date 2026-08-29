from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")

    if not question.strip():
        return jsonify({"error": "Question is required"}), 400

    answer = f"Bhai tune pucha: '{question}' 😄"

    return jsonify({"answer": answer})

if __name__ == "__main__":
    app.run(port=5000)