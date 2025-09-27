// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import MapView from "./MapView";
import QABox from "./QABox";
import { fetchDiseases, fetchData } from "./api";

export default function App() {
  const [disease, setDisease] = useState("cases"); // currently "cases" or "deaths"
  const [data, setData] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load available metrics (currently only "cases" and "deaths")
  useEffect(() => {
    fetchDiseases()
      .then((res) => {
        setDiseases(res.diseases || []);
        if (!res.diseases.includes(disease)) {
          setDisease(res.diseases[0] || "cases");
        }
      })
      .catch((err) => console.error("Error fetching diseases:", err));
  }, []);

  // Fetch data whenever the selected metric changes
  useEffect(() => {
    if (!disease) return;
    setLoading(true);
    fetchData(disease)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setData([]);
        setLoading(false);
      });
  }, [disease]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Disease LLM Explorer 🦠</h1>

      {/* Metric selector */}
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
        <div
          style={{
            flex: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <p style={{ textAlign: "center", marginTop: "1rem" }}>
              Loading data...
            </p>
          ) : data.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "1rem" }}>
              No data available.
            </p>
          ) : (
            <MapView data={data} disease={disease} />
          )}
        </div>

        {/* Chat on the right */}
        <div style={{ flex: 1 }}>
          <QABox />
        </div>
      </div>
    </div>
  );
}
