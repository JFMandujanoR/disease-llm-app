// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import MapView from "./MapView";
import { fetchDiseases, fetchData } from "./api";
import QABox from "./QABox";

export default function App() {
  const [disease, setDisease] = useState("cases");
  const [data, setData] = useState([]);
  const [diseases, setDiseases] = useState([]);

  useEffect(() => {
    fetchDiseases().then((res) => setDiseases(res.diseases));
  }, []);

  useEffect(() => {
    fetchData(disease).then((res) => setData(res));
  }, [disease]);

  return (
    <div className="app">
      <h1>Disease LLM Explorer 🦠</h1>

      <label>
        Select disease:
        <select value={disease} onChange={(e) => setDisease(e.target.value)}>
          {diseases.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <MapView data={data} />
      <QABox />
    </div>
  );
}
