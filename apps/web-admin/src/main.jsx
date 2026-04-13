import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  const cardStyle = {
    background: "#0f1d31",
    border: "1px solid #2c476f",
    borderRadius: 12,
    padding: 16
  };

  return (
    <main
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
        padding: 24,
        background: "linear-gradient(140deg, #08111f, #13233b)",
        color: "#e8eef9"
      }}
    >
      <section style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 6 }}>Smart Kitchen Admin Dashboard</h1>
        <p style={{ marginTop: 0, color: "#bdd0f6" }}>
          Monitor subscriptions, AI usage, and team performance.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 16
          }}
        >
          <div style={cardStyle}>
            <h3 style={{ margin: 0 }}>MRR</h3>
            <p style={{ marginBottom: 0 }}>Rs 2,34,000</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: 0 }}>Active Users</h3>
            <p style={{ marginBottom: 0 }}>182</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: 0 }}>AI Queries</h3>
            <p style={{ marginBottom: 0 }}>14,920 this month</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: 0 }}>SOP Retrieval</h3>
            <p style={{ marginBottom: 0 }}>92.7% hit-rate</p>
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            marginTop: 14
          }}
        >
          <h3 style={{ marginTop: 0 }}>Plan Matrix</h3>
          <ul style={{ marginBottom: 0 }}>
            <li>Basic 999: 1 device, 1 chatbot query/day</li>
            <li>Pro 2999: 2 devices, unlimited chatbot usage</li>
            <li>Premium 4999: unlimited all features</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
