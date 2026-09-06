import { useEffect, useState } from "react";
import "./App.css";

const quickQuestions = [
  "आधा और चौथाई कैसे समझें?",
  "गुणा पहाड़ा याद कैसे करें?",
  "भिन्न को रोटी से समझाओ",
];

function MermaidDiagram({ chart }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let isCurrent = true;
    const diagramId = `diagram-${Math.random().toString(36).slice(2)}`;
    import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        securityLevel: "strict",
        themeVariables: {
          primaryColor: "#fff2c9",
          primaryTextColor: "#183c3b",
          primaryBorderColor: "#197770",
          lineColor: "#c64b3f",
          secondaryColor: "#dceee7",
          tertiaryColor: "#fce7df",
        },
      });

      return mermaid.render(diagramId, chart.trim());
    }).then(({ svg: renderedSvg }) => {
      if (isCurrent) setSvg(renderedSvg);
    }).catch(() => {
      if (isCurrent) setSvg("");
    });

    return () => {
      isCurrent = false;
    };
  }, [chart]);

  return svg ? <div className="diagram" dangerouslySetInnerHTML={{ __html: svg }} /> : null;
}

function AnswerContent({ text }) {
  const diagramPattern = /```mermaid\s*([\s\S]*?)```/g;
  const content = [];
  let lastIndex = 0;
  let match;

  while ((match = diagramPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      content.push(<p className="answer-text" key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</p>);
    }
    content.push(<MermaidDiagram chart={match[1]} key={`diagram-${match.index}`} />);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    content.push(<p className="answer-text" key={`text-${lastIndex}`}>{text.slice(lastIndex)}</p>);
  }

  return <div className="answer-content">{content}</div>;
}

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [subject, setSubject] = useState("सामान्य ज्ञान");
  const [level, setLevel] = useState("कक्षा 6–8");
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = async (event) => {
    event?.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setMessages((current) => [
      ...current,
      { type: "student", text: trimmedQuestion },
    ]);
    setQuestion("");
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${apiUrl}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `Subject: ${subject}. Level: ${level}. Question: ${trimmedQuestion}`,
        }),
      });

      const data = await res.json();
      setMessages((current) => [
        ...current,
        { type: data.answer ? "teacher" : "error", text: data.answer || data.error },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { type: "error", text: "अभी कनेक्शन नहीं हो पाया। Backend चालू है?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="sun-mark" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="/" aria-label="गुरुजी होम">
          <span className="brand-icon">गु</span>
          <span>
            <strong>गुरुजी</strong>
            <small>AI से सीखो, अपने अंदाज़ में</small>
          </span>
        </a>
        <div className="trust-note"><span className="status-dot" /> मथुरा • आगरा पायलट</div>
      </header>

      <section className="welcome-grid">
        <div className="welcome-copy">
          <p className="kicker">मथुरा और आगरा के बच्चों के लिए <span>✦</span></p>
          <h1>सवाल छोटा हो या बड़ा,<br /><em>सीखना शुरू करो।</em></h1>
          <p className="intro">आपके सवाल का जवाब आसान हिंदी में, रोज़मर्रा के उदाहरण और छोटे-छोटे कदमों के साथ।</p>
          <div className="learning-route" aria-label="सीखने का तरीका">
            <span>पूछो</span><i>→</i><span>समझो</span><i>→</i><span>आगे बढ़ो</span>
          </div>
        </div>
        <div className="sun-illustration" aria-label="सूरज और खेत का चित्र" role="img">
          <div className="sun" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="crop crop-one" /><div className="crop crop-two" /><div className="crop crop-three" />
          <span className="bird bird-one">⌁</span><span className="bird bird-two">⌁</span>
        </div>
      </section>

      <section className="learning-desk" aria-label="सवाल पूछने का स्थान">
        <div className="desk-heading">
          <div>
            <span className="section-number">01</span>
            <h2>आज क्या जानना है?</h2>
          </div>
          <span className="hint">कक्षा 1–5 के लिए आसान जवाब</span>
        </div>

        <div className="controls">
          <label>
            <span>विषय</span>
            <select value={subject} onChange={(event) => setSubject(event.target.value)}>
              <option>गणित</option>
              <option>पर्यावरण अध्ययन</option>
              <option>हिंदी</option>
              <option>सामान्य ज्ञान</option>
              <option>विज्ञान</option>
              <option>अंग्रेज़ी</option>
            </select>
          </label>
          <label>
            <span>आपकी कक्षा</span>
            <select value={level} onChange={(event) => setLevel(event.target.value)}>
              <option>कक्षा 1–2</option>
              <option>कक्षा 3–5</option>
              <option>कक्षा 6–8</option>
              <option>कक्षा 9–12</option>
            </select>
          </label>
        </div>

        <form className="question-form" onSubmit={askQuestion}>
          <span className="question-icon" aria-hidden="true">?</span>
          <input
            type="text"
            placeholder="अपना सवाल यहाँ लिखें..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            aria-label="अपना सवाल यहाँ लिखें"
          />
          <button type="submit" disabled={isLoading || !question.trim()}>
            {isLoading ? "सोच रहा है..." : "जवाब दो"}<span aria-hidden="true">↗</span>
          </button>
        </form>

        <div className="quick-questions">
          <span>जल्दी पूछें:</span>
          {quickQuestions.map((prompt) => (
            <button key={prompt} type="button" onClick={() => setQuestion(prompt)}>{prompt}</button>
          ))}
        </div>
      </section>

      <section className="conversation" aria-live="polite" aria-label="बातचीत">
        <div className="conversation-header">
          <span className="section-number">02</span>
          <h2>हमारी पढ़ाई</h2>
          {messages.length > 0 && <span className="message-count">{messages.length} संदेश</span>}
        </div>
        {messages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✎</span>
            <strong>आपका पहला सवाल इंतज़ार कर रहा है</strong>
            <p>ऊपर कोई सवाल लिखें। गुरुजी उसे आसान करके समझाएंगे।</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message, index) => (
              <article className={`message ${message.type}`} key={`${message.type}-${index}`}>
                <span className="message-label">{message.type === "student" ? "आपने पूछा" : message.type === "error" ? "ध्यान दें" : "गुरुजी का जवाब"}</span>
                {message.type === "teacher" ? <AnswerContent text={message.text} /> : <p>{message.text}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer><span>मथुरा • आगरा</span><span className="footer-line" /> <span>सीखने की नई शुरुआत</span> <span>♥</span></footer>
    </main>
  );
}

export default App;

