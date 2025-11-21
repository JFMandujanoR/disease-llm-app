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
    <div>
      <h3>Ask about the dataset</h3>

      <div className="qa-input-row" style={{ marginTop: "0.5rem" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Which state had the most cases in April 2020?"
        />
        <button className="btn" onClick={ask} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      <div className="chat-history" style={{ borderTop: "1px solid rgba(15,23,36,0.06)", marginTop: "0.6rem", paddingTop: "0.6rem" }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg ${msg.role === "user" ? "user" : "assistant"}`}>
            <div className={`bubble ${msg.role === "user" ? "user" : "assistant"}`}>{msg.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
