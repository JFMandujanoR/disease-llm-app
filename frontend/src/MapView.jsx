import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function MapView({ data }) {
  const center = [37.8, -96]; // USA center

  return (
    <MapContainer center={center} zoom={4} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {data.map((row, idx) => (
        <Marker key={idx} position={[row.lat, row.lon]}>
          <Popup>
            <strong>{row.state}</strong> <br />
            {row.date}: {row.cases ?? row.deaths}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
