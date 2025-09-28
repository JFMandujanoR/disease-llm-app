// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import MapView from "./MapView";
import QABox from "./QABox";
import { fetchDiseases, fetchData } from "./api";

export default function App() {
  const [dataset, setDataset] = useState("covid19"); // covid19 or measles
  const [metric, setMetric] = useState("cases"); // cases/deaths for covid19, value for measles
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState([]); // available metrics for covid19
  const [loading, setLoading] = useState(false);

  // Load available metrics for covid19 from backend
  useEffect(() => {
    fetchDiseases()
      .then((res) => {
        // backend returns { diseases: ["cases","deaths"] } meaning metrics
        setMetrics(res.diseases || []);
      })
      .catch((err) => console.error("Error fetching metrics:", err));
  }, []);

  // Update metric when dataset changes
  useEffect(() => {
    if (dataset === "measles") {
      setMetric("value"); // measles only has one metric
    } else {
      setMetric("cases"); // default covid19 metric
    }
  }, [dataset]);

  // Fetch data whenever dataset/metric changes
  useEffect(() => {
    if (!dataset) return;
    setLoading(true);

    fetchData(dataset, metric)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setData([]);
        setLoading(false);
      });
  }, [dataset, metric]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Disease LLM Explorer 🦠</h1>

      {/* Dataset selector */}
      <label style={{ display: "block", marginBottom: "1rem" }}>
        Select disease dataset:
        <select
          value={dataset}
          onChange={(e) => setDataset(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="covid19">covid19</option>
          <option value="measles">measles</option>
        </select>
      </label>

      {/* Metric selector (only if covid19 is chosen) */}
      {dataset === "covid19" && (
        <label style={{ display: "block", marginBottom: "1rem" }}>
          Select metric to visualize:
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            {metrics.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      )}

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
            <MapView data={data} dataset={dataset} metric={metric} />
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
