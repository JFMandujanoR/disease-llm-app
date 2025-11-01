import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

export default function MapView({ data, dataset, metric }) {
  const [timeIndex, setTimeIndex] = useState(0);

  if (!data || data.length === 0) return <p>Loading data...</p>;

  const valueField = dataset === "covid19" ? metric : "value";

  // Normalize dates and group records by ISO date string. This avoids showing invalid
  // values like "NaT" in the slider and ensures comparisons are consistent.
  const { dates, grouped } = useMemo(() => {
    const normalize = (dt) => {
      if (dt === null || dt === undefined) return null;
      // Raw strings like "NaT" or strings containing NaT
      if (typeof dt === "string") {
        const s = dt.trim();
        if (!s) return null;
        if (/nat/i.test(s) || s.toLowerCase() === "nan") return null;
      }
      // Try to parse into a Date
      const parsed = new Date(dt);
      if (Number.isNaN(parsed.getTime())) return null;
      // Use full ISO so grouping is unambiguous
      return parsed.toISOString();
    };

    const map = {};
    for (const rec of data) {
      const iso = normalize(rec.date);
      if (!iso) continue;
      if (!map[iso]) map[iso] = [];
      map[iso].push(rec);
    }

    const ds = Object.keys(map).sort((a, b) => new Date(a) - new Date(b));
    return { dates: ds, grouped: map };
  }, [data]);

  // If timeIndex is out of range (e.g. after filtering), clamp it
  const safeTimeIndex = Math.max(0, Math.min(timeIndex, Math.max(0, dates.length - 1)));
  const currentDate = dates.length > 0 ? dates[safeTimeIndex] : null;

  const currentData = useMemo(() => {
    if (!currentDate) return [];
    return grouped[currentDate] || [];
  }, [grouped, currentDate]);

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
                {`${d.state} | ${dataset}: ${displayVal} | Date: ${currentDate ? new Date(currentDate).toLocaleString() : "unknown"}`}
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
            <p style={{ textAlign: "center" }}>{currentDate ? new Date(currentDate).toLocaleString() : ""}</p>
          </>
        )}
      </div>
    </div>
  );
}
