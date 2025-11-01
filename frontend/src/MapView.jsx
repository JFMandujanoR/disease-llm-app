import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

export default function MapView({ data, dataset, metric }) {
  const [timeIndex, setTimeIndex] = useState(0);

  if (!data || data.length === 0) return <p>Loading data...</p>;

  const valueField = dataset === "covid19" ? metric : "value";

  // Build a list of valid dates (filter out null/undefined/NaT/invalid)
  const dates = useMemo(() => {
    const raw = data
      .map((d) => d.date)
      .filter((dt) => dt !== null && dt !== undefined && dt !== "NaT" && dt !== "NaN");

    // Keep only dates that parse as valid JS dates
    const valid = raw.filter((dt) => {
      // If it's already a Date-ish ISO string this will work; fall back to string check
      const parsed = new Date(dt);
      return !Number.isNaN(parsed.getTime());
    });

    const uniq = Array.from(new Set(valid));
    uniq.sort((a, b) => new Date(a) - new Date(b));
    return uniq;
  }, [data]);

  // If timeIndex is out of range (e.g. after filtering), clamp it
  const safeTimeIndex = Math.max(0, Math.min(timeIndex, Math.max(0, dates.length - 1)));
  const currentDate = dates.length > 0 ? dates[safeTimeIndex] : null;

  const currentData = useMemo(() => {
    if (!currentDate) return [];
    return data.filter((d) => d.date === currentDate);
  }, [data, currentDate]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2>Disease Map - {dataset.toUpperCase()}</h2>

      <MapContainer center={[37.8, -96]} zoom={4} style={{ flex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {currentData.map((d, i) => {
          // Ensure numeric value; skip invalid numbers
          const rawVal = d.value ?? d[valueField] ?? 0;
          const val = Number(rawVal);
          const displayVal = Number.isFinite(val) ? val : 0;
          return (
            <CircleMarker
              key={i}
              center={[d.lat, d.lon]}
              radius={Math.sqrt(displayVal) / 100 + 5}
              fillColor={dataset === "covid19" ? "red" : "blue"}
              fillOpacity={0.5}
              stroke={false}
            >
              <Tooltip>
                {`${d.state} | ${dataset}: ${displayVal} | Date: ${d.date}`}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div style={{ marginTop: "1rem" }}>
        {dates.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "0.5rem" }}>No valid dates available.</p>
        ) : (
          <>
            <input
              type="range"
              min="0"
              max={dates.length - 1}
              value={safeTimeIndex}
              onChange={(e) => setTimeIndex(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <p style={{ textAlign: "center" }}>{currentDate}</p>
          </>
        )}
      </div>
    </div>
  );
}
