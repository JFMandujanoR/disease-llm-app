// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import MapView from "./MapView";
import QABox from "./QABox";
import { fetchDiseases, fetchData } from "./api";

export default function App() {
  const [disease, setDisease] = useState("cases");
  const [data, setData] = useState([]);
  const [diseases, setDiseases] = useState([]);

  // Load available metrics (currently only "cases" and "deaths")
  useEffect(() => {
    fetchDiseases().then((res) => setDiseases(res.diseases));
  }, []);

  // Fetch data whenever the selected metric changes
  useEffect(() => {
    fetchData(disease).then((res) => setData(res));
  }, [disease]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Disease LLM Explorer 🦠</h1>

      {/* Currently selecting metric: "cases" or "deaths" */}
      {/* In the future, this dropdown can select between multiple diseases */}
      <label style={{ display: "block", marginBottom: "1rem" }}>
        Select metric to visualize:
        <select
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        >
          {diseases.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          height: "80vh", // map/chat container height
        }}
      >
        {/* Map on the left */}
        <div style={{ flex: 2, border: "1px solid #ccc", borderRadius: "8px" }}>
          <MapView data={data} />
        </div>

        {/* Chat on the right */}
        <div style={{ flex: 1 }}>
          <QABox />
        </div>
      </div>
    </div>
  );
}
