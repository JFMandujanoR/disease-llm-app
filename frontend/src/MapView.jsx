// frontend/src/MapView.jsx

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

export default function MapView() {
  const [disease, setDisease] = useState("cases");
  const [data, setData] = useState([]);
  const [timeIndex, setTimeIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/data?disease=${disease}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setTimeIndex(0);
      });
  }, [disease]);

  if (data.length === 0) return <p>Loading data...</p>;

  // extract unique dates in sorted order
  const dates = [...new Set(data.map((d) => d.date))].sort();
  const currentDate = dates[timeIndex];

  // filter records for selected date
  const currentData = data.filter((d) => d.date === currentDate);

  return (
    <div>
      <h2>Disease Map - {disease}</h2>

      <MapContainer center={[37.8, -96]} zoom={4} style={{ height: "500px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {currentData.map((d, i) => (
          <CircleMarker
            key={i}
            center={[d.lat, d.lon]}
            radius={Math.sqrt(d[disease]) / 100 + 5} // scale marker size
            fillColor="red"
            fillOpacity={0.5}
            stroke={false}
          >
            <Tooltip>
              {`${d.state} | ${disease}: ${d[disease]} | Date: ${d.date}`}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Time slider */}
      <div style={{ marginTop: "1rem" }}>
        <input
          type="range"
          min="0"
          max={dates.length - 1}
          value={timeIndex}
          onChange={(e) => setTimeIndex(Number(e.target.value))}
        />
        <p>{currentDate}</p>
      </div>

      {/* Buttons to switch dataset */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setDisease("cases")}>Cases</button>
        <button onClick={() => setDisease("deaths")}>Deaths</button>
      </div>
    </div>
  );
}
