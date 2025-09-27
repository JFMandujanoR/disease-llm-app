// frontend/src/QABox.jsx
import React, { useState } from "react";

export default function QABox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const ask = async () => {
    setAnswer("Thinking...");
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
  };

  return (
    <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
      <h3>Ask about the dataset</h3>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g., Which state had the most cases in April 2020?"
        style={{ width: "80%", marginRight: "0.5rem" }}
      />
      <button onClick={ask}>Ask</button>
      {answer && (
        <div style={{ marginTop: "1rem" }}>
          <strong>Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
