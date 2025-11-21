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
    <div className="app">
      <h1>Disease LLM Explorer 🦠</h1>
      <p className="subtitle">Interactive map + LLM-powered Q&A over epidemiological time-series data</p>

      <div className="controls">
        <label className="control-label">
          Select dataset:
          <select value={dataset} onChange={(e) => setDataset(e.target.value)} className="select">
            <option value="covid19">covid19</option>
            <option value="measles">measles</option>
          </select>
        </label>

        {dataset === "covid19" && (
          <label className="control-label">
            Metric:
            <select value={metric} onChange={(e) => setMetric(e.target.value)} className="select">
              {metrics.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="main-grid">
        <div className="panel map-panel">
          {loading ? (
            <p className="small-muted">Loading data...</p>
          ) : data.length === 0 ? (
            <p className="small-muted">No data available.</p>
          ) : (
            <MapView data={data} dataset={dataset} metric={metric} />
          )}
        </div>

        <div className="panel qa-panel">
          <QABox dataset={dataset} metric={metric} />
        </div>
      </div>
    </div>
  );
}
