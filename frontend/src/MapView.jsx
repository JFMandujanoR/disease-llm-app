// frontend/src/MapView.jsx
import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

export default function MapView({ data, disease, metric }) {
  const [timeIndex, setTimeIndex] = useState(0);

  if (!data || data.length === 0) return <p>Loading data...</p>;

  // Determine the field to visualize
  const valueField = disease === "covid19" ? metric : "value";

  // Extract unique dates in sorted order
  const dates = useMemo(() => [...new Set(data.map((d) => d.date))].sort(), [data]);
  const currentDate = dates[timeIndex];

  // Filter records for selected date
  const currentData = useMemo(
    () => data.filter((d) => d.date === currentDate),
    [data, currentDate]
  );

  // Optional: color scheme based on dataset
  const fillColor = disease === "covid19" ? "red" : "blue";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2>Disease Map - {disease.toUpperCase()}</h2>

      <MapContainer center={[37.8, -96]} zoom={4} style={{ flex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {currentData.map((d, i) => (
          <CircleMarker
            key={i}
            center={[d.lat, d.lon]}
            radius={Math.sqrt(d[valueField] || 0) / 100 + 5} // scale marker size
            fillColor={fillColor}
            fillOpacity={0.5}
            stroke={false}
          >
            <Tooltip>
              {`${d.state || d.location_name} | ${valueField}: ${d[valueField]} | Date: ${d.date}`}
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
