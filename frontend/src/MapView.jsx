import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

export default function MapView({ data, dataset, metric }) {
  const [timeIndex, setTimeIndex] = useState(0);

  if (!data || data.length === 0) return <p>Loading data...</p>;

  const valueField = dataset === "covid19" ? metric : "value";

  const dates = useMemo(() => [...new Set(data.map((d) => d.date))].sort(), [data]);
  const currentDate = dates[timeIndex];

  const currentData = useMemo(
    () => data.filter((d) => d.date === currentDate),
    [data, currentDate]
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2>Disease Map - {dataset.toUpperCase()}</h2>

      <MapContainer center={[37.8, -96]} zoom={4} style={{ flex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {currentData.map((d, i) => {
          const val = d.value ?? 0;
          return (
            <CircleMarker
              key={i}
              center={[d.lat, d.lon]}
              radius={Math.sqrt(val) / 100 + 5}
              fillColor={dataset === "covid19" ? "red" : "blue"}
              fillOpacity={0.5}
              stroke={false}
            >
              <Tooltip>
                {`${d.state} | ${dataset}: ${val} | Date: ${d.date}`}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

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
