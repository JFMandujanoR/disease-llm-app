import React, { useState } from "react";
import MapView from "./MapView.jsx";
import axios from "axios";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");

  const askLLM = async () => {
    const res = await axios.get(`/api/answer`, { params: { query } });
    setAnswer(res.data.answer);
  };

  return (
    <div>
      <h1>Disease LLM Explorer</h1>
      <MapView />
      <div>
        <input
          type="text"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Ask about COVID trends..."
        />
        <button onClick={askLLM}>Ask</button>
        <p>{answer}</p>
      </div>
    </div>
  );
}
