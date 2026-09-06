import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askQuestion = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer || data.error);
    } catch {
      setAnswer("Backend se connect nahi ho paaya ❌");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>AI Teacher 🚀</h1>

      <input
        type="text"
        placeholder="Ask your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />

      <br /><br />

      <button onClick={askQuestion}>
        Ask
      </button>

      <p><b>Answer:</b> {answer}</p>
    </div>
  );
}

export default App;

