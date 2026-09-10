import { useEffect, useRef, useState } from "react";
import "./App.css";

const quickQuestions = [
  "आधा और चौथाई कैसे समझें?",
  "गुणा पहाड़ा याद कैसे करें?",
  "भिन्न को रोटी से समझाओ",
];

const practiceQuestions = [
  {
    question: "आधा और चौथाई जोड़ने पर कितना होगा?",
    options: ["1/4", "2/4", "3/4", "1"],
    answer: "3/4",
    hint: "आधा = 2/4. अब 2/4 + 1/4 जोड़ो।",
  },
  {
    question: "6 × 4 का सही उत्तर क्या है?",
    options: ["10", "20", "24", "28"],
    answer: "24",
    hint: "6 को चार बार जोड़ो: 6 + 6 + 6 + 6।",
  },
  {
    question: "एक रुपये में कितने पैसे होते हैं?",
    options: ["10", "50", "80", "100"],
    answer: "100",
    hint: "एक रुपये को 100 बराबर हिस्सों में बाँट सकते हैं।",
  },
];

const fractionDiagnosticQuestions = [
  {
    question: "चार बराबर टुकड़ों में से एक टुकड़ा कितना है?",
    options: ["1/2", "1/3", "1/4", "4/1"],
    answer: "1/4",
  },
  {
    question: "2/4 किसके बराबर है?",
    options: ["1/2", "1/3", "2/3", "1"],
    answer: "1/2",
  },
  {
    question: "1/4 + 1/4 कितना होगा?",
    options: ["1/8", "1/2", "2/8", "1"],
    answer: "1/2",
  },
];

const upBoardSyllabus = {
  "कक्षा 3": {
    गणित: ["संख्याएँ", "जोड़ और घटाव", "गुणा और भाग", "भिन्न", "माप और समय"],
    "पर्यावरण अध्ययन": ["हमारा परिवार", "पानी", "पौधे", "जानवर", "हमारा मोहल्ला"],
    हिंदी: ["वर्णमाला", "मात्राएँ", "संज्ञा", "वाक्य", "कहानी पढ़ना"],
  },
  "कक्षा 4": {
    गणित: ["बड़ी संख्याएँ", "गुणा और भाग", "भिन्न", "आकृतियाँ", "माप और समय"],
    "पर्यावरण अध्ययन": ["परिवार और समुदाय", "पानी और स्वच्छता", "पौधे", "जीव-जंतु", "यात्रा और परिवहन"],
    हिंदी: ["शब्द और वाक्य", "संज्ञा और सर्वनाम", "क्रिया", "अनुच्छेद लेखन", "कहानी और कविता"],
  },
  "कक्षा 5": {
    गणित: ["संख्या पद्धति", "चार संक्रियाएँ", "भिन्न और दशमलव", "ज्यामितीय आकृतियाँ", "क्षेत्रफल और परिमाप"],
    "पर्यावरण अध्ययन": ["हमारा शरीर", "भोजन और स्वास्थ्य", "जल संरक्षण", "पौधे और पर्यावरण", "उत्तर प्रदेश"],
    हिंदी: ["भाषा और व्याकरण", "काल", "वचन और लिंग", "पत्र लेखन", "कहानी का सार"],
  },
};

const syllabusLevels = Object.keys(upBoardSyllabus);
const syllabusSubjects = Object.keys(upBoardSyllabus[syllabusLevels[0]]);

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

function PilotAccess({ onJoin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAccess = async (event) => {
    event.preventDefault();
    setError("");
    if (mode === "register" && !name.trim()) return;
    if (!email.trim() || password.length < 8) return;
    setIsSubmitting(true);
    const result = await onJoin({ name: name.trim(), email: email.trim(), password, role }, mode);
    if (result?.error) setError(result.error);
    setIsSubmitting(false);
  };

  return (
    <main className="access-shell">
      <div className="access-sun" aria-hidden="true" />
      <section className="access-card">
        <div className="access-brand"><span className="brand-icon">ज्ञा</span><strong>GyanMitra AI</strong></div>
        <p className="kicker">मथुरा • आगरा पायलट</p>
        <h1>सीखने की कक्षा में<br /><em>जुड़िए।</em></h1>
        <p className="access-copy">अपना account बनाकर GyanMitra AI की learning class में प्रवेश करें।</p>
        <div className="role-tabs" role="tablist" aria-label="लॉगिन या नया account">
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>लॉगिन</button>
          <button className={mode === "register" ? "active" : ""} type="button" onClick={() => setMode("register")}>नया account</button>
        </div>
        <div className="role-tabs" role="tablist" aria-label="भूमिका चुनें">
          <button className={role === "student" ? "active" : ""} type="button" onClick={() => setRole("student")}>विद्यार्थी</button>
          <button className={role === "teacher" ? "active" : ""} type="button" onClick={() => setRole("teacher")}>शिक्षक</button>
        </div>
        <form className="access-form" onSubmit={submitAccess}>
          {mode === "register" && <label><span>आपका नाम</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="जैसे: रीना" /></label>}
          <label><span>Email / ID</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" /></label>
          <label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="कम से कम 8 अक्षर" autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
          <button type="submit" disabled={isSubmitting || !email.trim() || password.length < 8}>{isSubmitting ? "जुड़ रहे हैं..." : mode === "login" ? "लॉगिन करें" : "account बनाएं"} <span>↗</span></button>
        </form>
        {error && <p className="access-error" role="alert">{error}</p>}
        <p className="access-note">Password सुरक्षित रूप से database में hash होकर save होगा।</p>
      </section>
    </main>
  );
}

function App() {
  const [profile, setProfile] = useState(() => {
    try {
      if (!localStorage.getItem("guruji-session-token")) return null;
      return JSON.parse(localStorage.getItem("guruji-pilot-profile")) || null;
    } catch {
      return null;
    }
  });
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [subject, setSubject] = useState("गणित");
  const [level, setLevel] = useState("कक्षा 3");
  const [chapter, setChapter] = useState(upBoardSyllabus["कक्षा 3"].गणित[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceChoice, setPracticeChoice] = useState("");
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceResult, setPracticeResult] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const recognitionRef = useRef(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState({});
  const [installPrompt, setInstallPrompt] = useState(null);
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [diagnosticChoice, setDiagnosticChoice] = useState("");
  const [diagnosticScore, setDiagnosticScore] = useState(0);
  const [diagnosticDone, setDiagnosticDone] = useState(false);
  const [diagnosticSaveMessage, setDiagnosticSaveMessage] = useState("");
  const [progressItems, setProgressItems] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  const loadProgress = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
    const token = localStorage.getItem("guruji-session-token");
    if (!token) return;
    setProgressLoading(true);
    try {
      const response = await fetch(`${apiUrl}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setProgressItems(data.progress || []);
    } finally {
      setProgressLoading(false);
    }
  };

  const joinPilot = async (credentials, mode) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
      const response = await fetch(`${apiUrl}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) return { error: data.error || "Login नहीं हो पाया" };
      localStorage.setItem("guruji-session-token", data.token);
      localStorage.setItem("guruji-pilot-profile", JSON.stringify(data.user));
      setProfile(data.user);
      return null;
    } catch {
      return { error: "Backend से connection नहीं हो पाया" };
    }
  };

  const leavePilot = () => {
    localStorage.removeItem("guruji-session-token");
    localStorage.removeItem("guruji-pilot-profile");
    setProfile(null);
  };

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  useEffect(() => {
    if (!profile) return undefined;
    const progressTimer = window.setTimeout(() => loadProgress(), 0);
    return () => window.clearTimeout(progressTimer);
  }, [profile]);

  const installApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const currentPractice = practiceQuestions[practiceIndex];

  const checkPracticeAnswer = () => {
    if (!practiceChoice) return;
    const isCorrect = practiceChoice === currentPractice.answer;
    if (isCorrect) setPracticeScore((score) => score + 1);
    setPracticeResult(isCorrect ? "सही जवाब! बहुत बढ़िया 👏" : `अभी थोड़ा और अभ्यास करो। सही जवाब ${currentPractice.answer} है।`);
  };

  const nextPracticeQuestion = () => {
    setPracticeIndex((index) => (index + 1) % practiceQuestions.length);
    setPracticeChoice("");
    setPracticeResult("");
  };

  const resetPractice = () => {
    setPracticeIndex(0);
    setPracticeChoice("");
    setPracticeScore(0);
    setPracticeResult("");
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceMessage("इस browser में आवाज़ से सवाल की सुविधा नहीं है। नीचे लिखकर पूछें।");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceMessage("सुन रहा हूँ... अपना सवाल बोलिए");
    };
    recognition.onresult = (event) => {
      setQuestion(event.results[0][0].transcript);
      setVoiceMessage("सवाल मिल गया। अब ‘जवाब दो’ दबाएँ।");
    };
    recognition.onerror = () => {
      setVoiceMessage("आवाज़ साफ़ नहीं मिली। फिर कोशिश करें या लिखकर पूछें।");
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const speakAnswer = (text, index) => {
    if (!window.speechSynthesis) return;
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text.replace(/```mermaid[\s\S]*?```/g, ""));
    speech.lang = "hi-IN";
    speech.rate = 0.9;
    speech.onend = () => setSpeakingIndex(null);
    speech.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(speech);
  };

  const giveFeedback = (index, value) => {
    setAnswerFeedback((current) => ({ ...current, [index]: value }));
  };

  const saveDiagnosticProgress = async (score) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
    const token = localStorage.getItem("guruji-session-token");
    try {
      const response = await fetch(`${apiUrl}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          grade: "कक्षा 5",
          subject: "गणित",
          topic: "भिन्न और दशमलव",
          skill: "भिन्न पहचानना और जोड़ना",
          attempts: fractionDiagnosticQuestions.length,
          correct: score,
        }),
      });
      setDiagnosticSaveMessage(response.ok ? "आपकी प्रगति सुरक्षित हो गई।" : "प्रगति अभी save नहीं हो पाई।");
      if (response.ok) loadProgress();
    } catch {
      setDiagnosticSaveMessage("प्रगति अभी save नहीं हो पाई।");
    }
  };

  const checkDiagnosticAnswer = () => {
    if (!diagnosticChoice) return;
    const currentQuestion = fractionDiagnosticQuestions[diagnosticIndex];
    const nextScore = diagnosticScore + (diagnosticChoice === currentQuestion.answer ? 1 : 0);
    if (diagnosticChoice === currentQuestion.answer) {
      setDiagnosticScore(nextScore);
    }
    if (diagnosticIndex === fractionDiagnosticQuestions.length - 1) {
      setDiagnosticDone(true);
      saveDiagnosticProgress(nextScore);
    } else {
      setDiagnosticIndex((index) => index + 1);
      setDiagnosticChoice("");
    }
  };

  const startFractionLesson = () => {
    setSubject("गणित");
    setLevel("कक्षा 5");
    setChapter("भिन्न और दशमलव");
    setQuestion("मुझे भिन्न और दशमलव को रोटी के उदाहरण से आसान हिंदी में समझाओ।");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          question: `Role: ${profile.role}. Learner: ${profile.name}. Subject: ${subject}. Chapter: ${chapter}. Level: ${level}. Question: ${trimmedQuestion}`,
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

  if (!profile) return <PilotAccess onJoin={joinPilot} />;

  return (
    <main className="app-shell">
      <div className="sun-mark" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="/" aria-label="GyanMitra AI होम">
          <span className="brand-icon">गु</span>
          <span>
            <strong>GyanMitra AI</strong>
            <small>AI से सीखो, अपने अंदाज़ में</small>
          </span>
        </a>
        <div className="topbar-actions">
          {installPrompt && <button className="install-button" type="button" onClick={installApp}>फोन में रखें</button>}
          <span className="profile-pill">{profile.role === "teacher" ? "शिक्षक" : "विद्यार्थी"}: {profile.name}</span>
          <button className="logout-button" type="button" onClick={leavePilot}>बाहर</button>
          <div className="trust-note"><span className="status-dot" /> मथुरा • आगरा पायलट</div>
        </div>
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

      <section className="pilot-strip" aria-label="GyanMitra AI कैसे मदद करता है">
        <div className="pilot-intro"><span className="section-number">GyanMitra AI</span><strong>पढ़ाई को आसान बनाने के तीन तरीके</strong></div>
        <div className="pilot-point"><span className="point-icon">01</span><span><strong>अपनी भाषा</strong><small>सरल हिंदी में समझो</small></span></div>
        <div className="pilot-point"><span className="point-icon">02</span><span><strong>अपनी रफ़्तार</strong><small>बार-बार पूछो, झिझको मत</small></span></div>
        <div className="pilot-point"><span className="point-icon">03</span><span><strong>अपना उदाहरण</strong><small>खेत, बाज़ार और घर से सीखो</small></span></div>
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
            <select value={subject} onChange={(event) => { const nextSubject = event.target.value; setSubject(nextSubject); setChapter(upBoardSyllabus[level][nextSubject][0]); }}>
              {syllabusSubjects.map((subjectName) => <option key={subjectName}>{subjectName}</option>)}
            </select>
          </label>
          <label>
            <span>आपकी कक्षा</span>
            <select value={level} onChange={(event) => { const nextLevel = event.target.value; setLevel(nextLevel); setChapter(upBoardSyllabus[nextLevel][subject][0]); }}>
              {syllabusLevels.map((levelName) => <option key={levelName}>{levelName}</option>)}
            </select>
          </label>
          <label>
            <span>अध्याय</span>
            <select value={chapter} onChange={(event) => setChapter(event.target.value)}>
              {upBoardSyllabus[level][subject].map((chapterName) => <option key={chapterName}>{chapterName}</option>)}
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
          <button className={`voice-button ${isListening ? "listening" : ""}`} type="button" onClick={toggleVoiceInput} aria-label="आवाज़ से सवाल पूछें">
            <span aria-hidden="true">{isListening ? "■" : "●"}</span>
            <small>{isListening ? "रुकें" : "बोलें"}</small>
          </button>
          <button type="submit" disabled={isLoading || !question.trim()}>
            {isLoading ? "सोच रहा है..." : "जवाब दो"}<span aria-hidden="true">↗</span>
          </button>
        </form>
        {voiceMessage && <p className="voice-message" aria-live="polite">{voiceMessage}</p>}

        <div className="quick-questions">
          <span>जल्दी पूछें:</span>
          {quickQuestions.map((prompt) => (
            <button key={prompt} type="button" onClick={() => setQuestion(prompt)}>{prompt}</button>
          ))}
        </div>
      </section>

      <section className="diagnostic-card" aria-label="भिन्नों की शुरुआती जाँच">
        <div className="practice-heading">
          <div><span className="section-number">02</span><h2>भिन्नों की छोटी जाँच</h2></div>
          <span className="score-badge">स्कोर: {diagnosticScore}/{fractionDiagnosticQuestions.length}</span>
        </div>
        {!diagnosticDone ? (
          <>
            <p className="practice-kicker">कक्षा 3–5 • गणित • भिन्न</p>
            <h3>{fractionDiagnosticQuestions[diagnosticIndex].question}</h3>
            <div className="practice-options">
              {fractionDiagnosticQuestions[diagnosticIndex].options.map((option) => (
                <button className={diagnosticChoice === option ? "selected" : ""} key={option} type="button" onClick={() => setDiagnosticChoice(option)}>{option}</button>
              ))}
            </div>
            <div className="practice-actions">
              <button className="check-button" type="button" onClick={checkDiagnosticAnswer} disabled={!diagnosticChoice}>जवाब जाँचें</button>
              <span className="hint">सवाल {diagnosticIndex + 1}/{fractionDiagnosticQuestions.length}</span>
            </div>
          </>
        ) : (
          <div className="diagnostic-result">
            <p>आपने शुरुआती जाँच पूरी कर ली। अब GyanMitra AI आपके लिए भिन्नों को आपके स्तर पर समझाएगा।</p>
            {diagnosticSaveMessage && <p className="practice-hint" role="status">{diagnosticSaveMessage}</p>}
            <button className="next-button" type="button" onClick={startFractionLesson}>भिन्न सीखना शुरू करें →</button>
          </div>
        )}
      </section>

      <section className="progress-section" aria-label="मेरी प्रगति">
        <div className="desk-heading">
          <div>
            <span className="section-number">04</span>
            <h2>मेरी प्रगति</h2>
          </div>
          <span className="hint">आपने क्या सीखा, यहाँ देखें</span>
        </div>
        {progressLoading ? <p className="progress-empty">प्रगति लोड हो रही है...</p> : progressItems.length === 0 ? (
          <p className="progress-empty">पहली diagnostic पूरी करें, आपकी प्रगति यहाँ दिखेगी।</p>
        ) : (
          <div className="progress-grid">
            {progressItems.map((item) => (
              <article className="progress-card" key={`${item.grade}-${item.topic}-${item.skill}`}>
                <div className="progress-card-heading"><strong>{item.topic}</strong><span>{item.mastery_status === "ready" ? "तैयार" : item.mastery_status === "developing" ? "अभ्यास जारी" : "शुरुआत"}</span></div>
                <p>{item.grade} • {item.subject}</p>
                <div className="progress-score"><b>{item.correct}/{item.attempts}</b><span>सही जवाब</span></div>
                <small>{item.skill}</small>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="practice-card" aria-label="गणित अभ्यास">
        <div className="practice-heading">
          <div><span className="section-number">03</span><h2>छोटा सा अभ्यास</h2></div>
          <span className="score-badge">स्कोर: {practiceScore}/{practiceQuestions.length}</span>
        </div>
        <p className="practice-kicker">कक्षा 3–5 • गणित</p>
        <h3>{currentPractice.question}</h3>
        <div className="practice-options">
          {currentPractice.options.map((option) => (
            <button
              className={practiceChoice === option ? "selected" : ""}
              key={option}
              type="button"
              onClick={() => { setPracticeChoice(option); setPracticeResult(""); }}
            >{option}</button>
          ))}
        </div>
        <div className="practice-actions">
          <button className="check-button" type="button" onClick={checkPracticeAnswer} disabled={!practiceChoice}>जवाब जाँचें</button>
          <button className="next-button" type="button" onClick={nextPracticeQuestion}>अगला सवाल →</button>
          <button className="reset-button" type="button" onClick={resetPractice}>फिर से शुरू</button>
        </div>
        {practiceResult && <p className={`practice-result ${practiceResult.startsWith("सही") ? "correct" : "try-again"}`}>{practiceResult}</p>}
        <p className="practice-hint">संकेत: {currentPractice.hint}</p>
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
            <p>ऊपर कोई सवाल लिखें। GyanMitra AI उसे आसान करके समझाएगा।</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message, index) => (
              <article className={`message ${message.type}`} key={`${message.type}-${index}`}>
                <span className="message-label">{message.type === "student" ? "आपने पूछा" : message.type === "error" ? "ध्यान दें" : "GyanMitra AI का जवाब"}</span>
                {message.type === "teacher" ? (
                  <>
                    <AnswerContent text={message.text} />
                    <button className="speak-button" type="button" onClick={() => speakAnswer(message.text, index)}>
                      <span aria-hidden="true">{speakingIndex === index ? "■" : "▶"}</span>
                      {speakingIndex === index ? "रोकें" : "सुनो"}
                    </button>
                    <div className="answer-feedback" aria-label="इस जवाब पर प्रतिक्रिया दें">
                      <span>जवाब काम आया?</span>
                      <button className={answerFeedback[index] === "helpful" ? "active" : ""} type="button" onClick={() => giveFeedback(index, "helpful")}>हाँ 👍</button>
                      <button className={answerFeedback[index] === "improve" ? "active" : ""} type="button" onClick={() => giveFeedback(index, "improve")}>सुधार चाहिए</button>
                    </div>
                  </>
                ) : <p>{message.text}</p>}
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

