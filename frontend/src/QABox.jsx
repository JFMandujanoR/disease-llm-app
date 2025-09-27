// frontend/src/QABox.jsx
import React, { useState } from "react";

export default function QABox() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // store conversation history
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;

    const newMessages = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Error: could not get answer" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", maxWidth: "600px" }}>
      <h3>Ask about the dataset</h3>
      <div style={{ display: "flex", marginBottom: "0.5rem" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Which state had the most cases in April 2020?"
          style={{ flex: 1, marginRight: "0.5rem" }}
        />
        <button onClick={ask} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      <div style={{ maxHeight: "300px", overflowY: "auto", borderTop: "1px solid #ddd", paddingTop: "0.5rem" }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "0.5rem",
              textAlign: msg.role === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                backgroundColor: msg.role === "user" ? "#DCF8C6" : "#F1F0F0",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
