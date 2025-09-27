// frontend/src/MapView.jsx
import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

export default function MapView({ data, disease }) {
  const [timeIndex, setTimeIndex] = useState(0);

  if (!data || data.length === 0) return <p>Loading data...</p>;

  // extract unique dates in sorted order
  const dates = useMemo(() => [...new Set(data.map((d) => d.date))].sort(), [data]);
  const currentDate = dates[timeIndex];

  // filter records for selected date
  const currentData = useMemo(
    () => data.filter((d) => d.date === currentDate),
    [data, currentDate]
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2>Disease Map - {disease}</h2>

      <MapContainer center={[37.8, -96]} zoom={4} style={{ flex: 1 }}>
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
          style={{ width: "100%" }}
        />
        <p style={{ textAlign: "center" }}>{currentDate}</p>
      </div>
    </div>
  );
}
