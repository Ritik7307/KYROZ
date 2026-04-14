import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const API_BASE_URL = "http://localhost:8000/v1";
const NAV_ITEMS = ["Home", "SOP Library", "Chatbot", "Login"];

function App() {
  const [activePage, setActivePage] = useState("Home");
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem("kyroz-session");
    return raw ? JSON.parse(raw) : null;
  });
  const [sopList, setSopList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [authError, setAuthError] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste Chef! Ask SOP, recipe, timing, or substitution questions." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const quickPrompts = ["Jalfrezi consistency kaise maintain karein?", "Veg Handi ka final garnish?", "Dish dry ho jaye to kya karein?"];

  const deviceId = useMemo(() => {
    const key = "kyroz-device-id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const generated = `device_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, generated);
    return generated;
  }, []);

  const supportVoiceInput = useMemo(
    () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  const supportSpeechOutput = useMemo(() => Boolean(window.speechSynthesis), []);

  const speakText = (text) => {
    if (!supportSpeechOutput || !text) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert("Mic input is not supported in this browser.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setChatInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const persistSession = (data) => {
    localStorage.setItem("kyroz-session", JSON.stringify(data));
    setSession(data);
  };

  const handleAuth = async () => {
    const route = mode === "login" ? "login" : "signup";
    setAuthError("");
    setIsLoading(true);
    try {
      const payload =
        mode === "login"
          ? { email: authForm.email, password: authForm.password }
          : { name: authForm.name, email: authForm.email, password: authForm.password };
      const response = await fetch(`${API_BASE_URL}/auth/${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication failed");
      persistSession(data);
      setActivePage("Home");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSops = async () => {
    if (!session?.accessToken) return;
    const response = await fetch(`${API_BASE_URL}/sops`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    const data = await response.json();
    if (response.ok) setSopList(data.items || []);
  };

  const sendMessage = async (forcedText) => {
    const text = (forcedText ?? chatInput).trim();
    if (!text || isLoading) return;
    if (!session?.accessToken) {
      setActivePage("Login");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text }]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/v1/chat/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
          "x-device-id": deviceId
        },
        body: JSON.stringify({
          tenantId: "t_1",
          userId: "public_visitor",
          planCode: "basic_999",
          deviceId,
          question: text
        })
      });
      const data = await response.json();
      const reply = response.ok ? data.answer : data.error || "Unable to process request";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      speakText(reply);
    } catch (_error) {
      const errorReply = "Server not reachable. Start api-core on port 8000.";
      setMessages((prev) => [...prev, { role: "assistant", text: errorReply }]);
      speakText(errorReply);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("kyroz-session");
    setSession(null);
    setActivePage("Login");
  };

  const renderHome = () => (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #dbe4f0", padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>KYROZ Member Dashboard</h1>
      <p>Single member dashboard with same navbar, secure login, SOP dataset chatbot, and backend DB integration.</p>
      <p>
        Logged in as: <strong>{session?.user?.email || "Guest"}</strong>
      </p>
    </div>
  );

  const renderSops = () => (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #dbe4f0", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>SOP Library</h2>
      <button onClick={fetchSops} style={{ marginBottom: 12 }}>
        Refresh SOP List
      </button>
      {sopList.length === 0 ? <p>No SOP loaded yet. Click refresh after login.</p> : null}
      {sopList.map((item) => (
        <div key={item.id} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 8 }}>
          <strong>{item.title}</strong>
        </div>
      ))}
    </div>
  );

  const renderChat = () => (
    <div
      style={{
        background: "#eaf2ff",
        borderRadius: 14,
        border: "2px solid #9cb6de",
        color: "#0b2b57",
        padding: 12,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 8 }}>KOSA AI Assistant</div>
      <div style={{ background: "#f8fbff", borderRadius: 10, border: "1px solid #c2d6f3", padding: 10, height: 260, overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={`${msg.role}-${idx}`} style={{ marginBottom: 8, textAlign: msg.role === "user" ? "right" : "left" }}>
            <span style={{ display: "inline-block", padding: "8px 10px", borderRadius: 8, background: msg.role === "user" ? "#0b2b57" : "#dde9fb", color: msg.role === "user" ? "#fff" : "#0b2b57", maxWidth: "90%", whiteSpace: "pre-wrap" }}>
              {msg.text}
            </span>
          </div>
        ))}
        {isLoading ? <div style={{ fontSize: 13 }}>Thinking...</div> : null}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask your kitchen SOP query..."
          style={{ flex: 1, borderRadius: 8, border: "1px solid #aac3e6", padding: "8px 10px" }}
        />
        <button onClick={() => sendMessage()} style={{ border: "none", borderRadius: 8, background: "#0b2b57", color: "#fff", fontWeight: 700, padding: "8px 12px", cursor: "pointer" }}>
          Send
        </button>
        <button
          onClick={startVoiceInput}
          disabled={!supportVoiceInput || isListening}
          style={{ border: "1px solid #0b2b57", borderRadius: 8, background: "#fff", color: "#0b2b57", fontWeight: 700, padding: "8px 12px", cursor: "pointer" }}
        >
          {isListening ? "Listening..." : "Mic"}
        </button>
        <span style={{ alignSelf: "center", color: supportSpeechOutput ? "#0b2b57" : "#64748b", fontWeight: 600 }}>
          {supportSpeechOutput ? "Speaker auto-reply enabled" : "Speaker not supported"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        {quickPrompts.map((prompt) => (
          <button key={prompt} onClick={() => sendMessage(prompt)} style={{ fontSize: 12, borderRadius: 999, border: "1px solid #b6cdee", background: "#fff", color: "#0b2b57", padding: "4px 8px", cursor: "pointer" }}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );

  const renderLogin = () => (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #dbe4f0", padding: 16, maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>{mode === "login" ? "Login" : "Create Account"}</h2>
      {mode === "signup" ? (
        <input placeholder="Full name" value={authForm.name} onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))} style={{ width: "100%", marginBottom: 8, padding: 10 }} />
      ) : null}
      <input placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))} style={{ width: "100%", marginBottom: 8, padding: 10 }} />
      <input type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))} style={{ width: "100%", marginBottom: 8, padding: 10 }} />
      {authError ? <p style={{ color: "#dc2626" }}>{authError}</p> : null}
      <button onClick={handleAuth} disabled={isLoading} style={{ padding: "10px 12px", borderRadius: 8 }}>
        {isLoading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
      </button>
      <button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ marginLeft: 8, padding: "10px 12px", borderRadius: 8 }}>
        {mode === "login" ? "Need account?" : "Have account?"}
      </button>
    </div>
  );

  return (
    <main
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
        background: "#f4f7fb",
        color: "#0f172a"
      }}
    >
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #dbe4f0",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            padding: "12px 16px",
            marginBottom: 16,
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "2px solid #0b2b57",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                color: "#0b2b57"
              }}
            >
              K
            </div>
            <strong style={{ fontSize: 22, color: "#0b2b57" }}>KYROZ</strong>
          </div>
          <nav style={{ display: "flex", gap: 18, color: "#1f2f48", fontWeight: 600, flexWrap: "wrap" }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setActivePage(item)}
                style={{ border: "none", background: "transparent", color: activePage === item ? "#0b2b57" : "#334155", fontWeight: 700, cursor: "pointer" }}
              >
                {item}
              </button>
            ))}
          </nav>
          {session ? <button onClick={logout}>Logout</button> : <span style={{ color: "#475569" }}>Guest mode</span>}
        </div>
        {activePage === "Home" ? renderHome() : null}
        {activePage === "SOP Library" ? renderSops() : null}
        {activePage === "Chatbot" ? renderChat() : null}
        {activePage === "Login" ? renderLogin() : null}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
