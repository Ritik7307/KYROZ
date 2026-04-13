import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste Chef! Ask SOP, recipe, timing, or substitution questions." }
  ]);
  const navItems = ["How it Works", "SOP Library", "KOSA AI Assistant", "POS & Inventory", "Pricing"];
  const featureCards = [
    {
      title: "KOSA AI Troubleshooter",
      desc: "Ask SOP-based questions, get recipe help, substitutions, and instant cooking guidance."
    },
    {
      title: "Digital SOP Library",
      desc: "Browse bakery, grill, and beverage SOPs with search-ready structured knowledge."
    },
    {
      title: "POS & Inventory Sync",
      desc: "Get inventory-aware suggestions and reduce wastage with kitchen intelligence."
    }
  ];
  const quickPrompts = [
    "How to fix gravy thickness?",
    "Substitute for buttermilk in tandoori marinade",
    "5-step SOP for cold coffee prep"
  ];
  const deviceId = useMemo(() => {
    const key = "kyroz-public-device-id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const generated = `device_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, generated);
    return generated;
  }, []);

  const sendMessage = async (forcedText) => {
    const text = (forcedText ?? chatInput).trim();
    if (!text || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/v1/chat/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Server not reachable. Start api-core on port 8000." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
            {navItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </nav>
          <button
            style={{
              background: "#e0bf61",
              color: "#1f2937",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              padding: "10px 14px",
              cursor: "pointer"
            }}
          >
            GET STARTED
          </button>
        </div>

        <div
          style={{
            background: "#082a5c",
            color: "#f8fbff",
            borderRadius: 16,
            padding: 24,
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 18,
            alignItems: "center"
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.08 }}>
              AB AAPKA KITCHEN
              <br />
              CHALEGA AAPKE HISAAB SE,
              <br />
              <span style={{ color: "#e0bf61" }}>CHEF KE MOOD SE NAHI!</span>
            </h1>
            <p style={{ marginTop: 16, color: "#d7e6ff", fontSize: 20 }}>
              KYROZ helps kitchens maintain taste consistency, reduce wastage, and improve speed.
            </p>
            <button
              style={{
                marginTop: 12,
                background: "#e0bf61",
                color: "#1f2937",
                border: "none",
                borderRadius: 12,
                fontWeight: 700,
                padding: "12px 18px",
                cursor: "pointer"
              }}
            >
              Book a Free AI Demo Now
            </button>
          </div>
          <div
            style={{
              background: "#eaf2ff",
              borderRadius: 14,
              minHeight: 280,
              border: "2px solid #9cb6de",
              color: "#0b2b57",
              padding: 12,
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8 }}>KOSA AI Assistant</div>
            <div
              style={{
                background: "#f8fbff",
                borderRadius: 10,
                border: "1px solid #c2d6f3",
                padding: 10,
                height: 190,
                overflowY: "auto"
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  style={{
                    marginBottom: 8,
                    textAlign: msg.role === "user" ? "right" : "left"
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: msg.role === "user" ? "#0b2b57" : "#dde9fb",
                      color: msg.role === "user" ? "#fff" : "#0b2b57",
                      maxWidth: "90%"
                    }}
                  >
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
                placeholder="Ask your kitchen query..."
                style={{
                  flex: 1,
                  borderRadius: 8,
                  border: "1px solid #aac3e6",
                  padding: "8px 10px"
                }}
              />
              <button
                onClick={() => sendMessage()}
                style={{
                  border: "none",
                  borderRadius: 8,
                  background: "#0b2b57",
                  color: "#fff",
                  fontWeight: 700,
                  padding: "8px 12px",
                  cursor: "pointer"
                }}
              >
                Send
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  style={{
                    fontSize: 12,
                    borderRadius: 999,
                    border: "1px solid #b6cdee",
                    background: "#fff",
                    color: "#0b2b57",
                    padding: "4px 8px",
                    cursor: "pointer"
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <h2 style={{ marginTop: 24 }}>Explore Features (Visible but Locked)</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14
          }}
        >
          {featureCards.map((card) => (
            <article
              key={card.title}
              style={{
                borderRadius: 12,
                border: "1px solid #d3deed",
                background: "#ffffff",
                padding: 16,
                position: "relative",
                minHeight: 180
              }}
            >
              <h3 style={{ marginTop: 0 }}>{card.title}</h3>
              <p style={{ color: "#334155", marginBottom: 44 }}>{card.desc}</p>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  background: "rgba(15, 23, 42, 0.52)",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  fontWeight: 700
                }}
              >
                Locked - Login Required
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            background: "#ffffff",
            border: "1px solid #dbe4f0",
            borderRadius: 12,
            padding: 14,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10
          }}
        >
          <p style={{ margin: 0 }}>
            Home page is public. All modules are shown but remain locked until user authentication.
          </p>
          <button
            style={{
              background: "#0b2b57",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              padding: "10px 14px",
              cursor: "pointer"
            }}
          >
            Login to Unlock
          </button>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
