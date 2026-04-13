import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const API_BASE_URL = "http://localhost:8000/v1";

const PLAN_OPTIONS = [
  { code: "basic_999", label: "Basic 999 (1 device, 1 query/day)" },
  { code: "pro_2999", label: "Pro 2999 (2 devices, unlimited chat)" },
  { code: "premium_4999", label: "Premium 4999 (all unlimited)" }
];

function App() {
  const [planCode, setPlanCode] = useState("pro_2999");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi chef, ask anything about SOPs, recipes, or substitutions." }
  ]);

  const supportVoiceInput = useMemo(
    () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  const deviceId = useMemo(() => {
    const key = "smart-kitchen-device-id";
    const existing = localStorage.getItem(key);
    if (existing) {
      return existing;
    }
    const generated = `device_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(key, generated);
    return generated;
  }, []);

  const speak = (text) => {
    if (!window.speechSynthesis || !text) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const sendQuestion = async () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");

    try {
      const response = await fetch(`${API_BASE_URL}/chat/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId
        },
        body: JSON.stringify({
          tenantId: "t_1",
          userId: "u_chef_1",
          planCode,
          deviceId,
          question: trimmed
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to get AI response");
      }

      const answer = `${data.answer}${data?.usage?.remainingToday === null || data?.usage?.remainingToday === undefined ? "" : ` (Remaining today: ${data.usage.remainingToday})`}`;
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
      speak(data.answer);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setQuestion(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <main
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
        padding: "24px",
        background: "linear-gradient(140deg, #08111f, #13233b)",
        color: "#e8eef9"
      }}
    >
      <section
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          background: "rgba(13, 25, 44, 0.8)",
          border: "1px solid #2e456e",
          borderRadius: 16,
          padding: 20
        }}
      >
        <h1 style={{ margin: 0 }}>Smart Kitchen AI Assistant</h1>
        <p style={{ color: "#bdd0f6", marginTop: 8 }}>
          Voice-enabled chef copilot with plan-based chatbot access.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="plan">Active Subscription Plan</label>
          <select
            id="plan"
            value={planCode}
            onChange={(e) => setPlanCode(e.target.value)}
            style={{
              display: "block",
              marginTop: 8,
              width: "100%",
              borderRadius: 10,
              border: "1px solid #35517f",
              background: "#0f1d31",
              color: "#fff",
              padding: "10px 12px"
            }}
          >
            {PLAN_OPTIONS.map((plan) => (
              <option key={plan.code} value={plan.code}>
                {plan.label}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            minHeight: 320,
            maxHeight: 420,
            overflowY: "auto",
            background: "#0b1728",
            border: "1px solid #2a4368",
            borderRadius: 12,
            padding: 12,
            marginBottom: 16
          }}
        >
          {messages.map((message, idx) => (
            <div
              key={`${message.role}-${idx}`}
              style={{
                marginBottom: 10,
                textAlign: message.role === "user" ? "right" : "left"
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  borderRadius: 10,
                  padding: "10px 12px",
                  maxWidth: "85%",
                  background: message.role === "user" ? "#204e9b" : "#1f2f48"
                }}
              >
                {message.text}
              </span>
            </div>
          ))}
          {isLoading ? <p style={{ color: "#9cb6e5" }}>AI is thinking...</p> : null}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendQuestion();
              }
            }}
            placeholder="Ask SOP, recipe, timing, or substitution query"
            style={{
              flex: 1,
              borderRadius: 10,
              border: "1px solid #35517f",
              background: "#0f1d31",
              color: "#fff",
              padding: "10px 12px"
            }}
          />
          <button
            onClick={sendQuestion}
            disabled={isLoading}
            style={{
              borderRadius: 10,
              border: "none",
              background: "#2f7df4",
              color: "#fff",
              padding: "10px 16px",
              cursor: "pointer"
            }}
          >
            Send
          </button>
          <button
            onClick={startVoiceInput}
            disabled={!supportVoiceInput || isListening}
            style={{
              borderRadius: 10,
              border: "1px solid #4f6890",
              background: "#193053",
              color: "#fff",
              padding: "10px 16px",
              cursor: "pointer"
            }}
          >
            {isListening ? "Listening..." : "Voice"}
          </button>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
